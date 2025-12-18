import { NextRequest, NextResponse } from 'next/server';
import {
  FolBuilder,
  GeminiAdapter,
  createFolClient
} from 'fol-sdk';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { getFolStore } from '@/lib/folStore';
import ChatLog from '@/models/chatLogs';
import BuildHistory from '@/models/buildHistory';

/**
 * POST /api/users/[userId]/graph/full-build
 *
 * Full rebuild: 모든 FOL 데이터 삭제 후 전체 메모리 재빌드
 *
 * 청크 기반 빌드 전략:
 * 1. 기존 FOL 데이터(facts, constants, predicates) 삭제
 * 2. 모든 메모리의 build_at 초기화
 * 3. 전체 메모리를 메시지 10개 또는 10000 토큰 단위로 청크를 만든다
 * 4. 각 청크를 FOL build하고 저장
 * 5. 성공한 청크의 메모리들만 build_at 업데이트 (_id 기반)
 * 6. 실패한 청크는 build_at이 없어서 incremental build에서 자동 재처리됨
 */

// 토큰 수 추정 함수 (token_count 필드가 없을 경우 사용)
function estimateTokens(text: string): number {
  // 간단한 추정: 평균적으로 1 토큰 ≈ 4 글자
  return Math.ceil(text.length / 4);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    console.log('🔄 Starting full rebuild for user:', userId);

    // Step 1: 기존 FOL 데이터 삭제
    const [factsResult, constantsResult, predicatesResult] = await Promise.all([
      mongoose.connection.collection('facts').deleteMany({ user_id: userId }),
      mongoose.connection.collection('constants').deleteMany({ user_id: userId }),
      mongoose.connection.collection('predicates').deleteMany({ user_id: userId })
    ]);

    console.log(`🗑️ Deleted: ${factsResult.deletedCount} facts, ${constantsResult.deletedCount} constants, ${predicatesResult.deletedCount} predicates`);

    // Step 2: 모든 메모리의 build_at 초기화
    const resetResult = await ChatLog.updateMany(
      { user_id: userId },
      { $unset: { build_at: "" } }
    );
    console.log(`🔄 Reset build_at for ${resetResult.modifiedCount} memories`);

    // Step 3: 전체 메모리 가져오기
    const allMemories = await ChatLog.find({ user_id: userId }).sort({ createdAt: 1 }); // 시간순 정렬

    if (allMemories.length === 0) {
      console.log('📊 No memories to build');
      return NextResponse.json({
        success: true,
        message: 'No memories to build',
        builtMemories: 0,
        deletedData: {
          facts: factsResult.deletedCount,
          constants: constantsResult.deletedCount,
          predicates: predicatesResult.deletedCount
        }
      });
    }

    console.log(`📦 Found ${allMemories.length} memories for full rebuild`);

    // Step 4: FOL 빌드 설정
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    const llmAdapter = new GeminiAdapter(geminiApiKey, 'gemini-2.5-pro');
    const store = getFolStore();
    const builder = new FolBuilder({ llm: llmAdapter });
    const client = createFolClient(builder, store);

    // Step 5: 청크 기반 빌드
    const CHUNK_SIZE = 10; // 메시지 개수 권장치
    const PREFERRED_MAX_TOKENS = 10000; // 선호하는 토큰 상한

    let totalBuiltMemories = 0;
    let chunkIndex = 0;

    for (let i = 0; i < allMemories.length; ) {
      chunkIndex++;
      let chunkMemories = [];
      let totalTokens = 0;

      // 최소 1개 메시지는 무조건 포함
      const firstMemory = allMemories[i];
      const firstTokens = firstMemory.token_count || estimateTokens(firstMemory.input_text);

      chunkMemories.push(firstMemory);
      totalTokens += firstTokens;
      i++;

      // 추가 메시지들을 청크에 추가
      while (i < allMemories.length && chunkMemories.length < CHUNK_SIZE) {
        const memory = allMemories[i];
        const memoryTokens = memory.token_count || estimateTokens(memory.input_text);

        // 다음 메시지를 추가하면 선호 토큰을 초과하는 경우
        if (totalTokens + memoryTokens > PREFERRED_MAX_TOKENS) {
          break;
        }

        chunkMemories.push(memory);
        totalTokens += memoryTokens;
        i++;
      }

      console.log(`📦 Processing chunk ${chunkIndex}: ${chunkMemories.length} messages, ~${totalTokens} tokens`);

      const chunkIds = chunkMemories.map(m => m._id);
      const document = chunkMemories.map(m => m.input_text).join(' ').trim();
      const buildStartTime = Date.now();

      try {
        // 빌드 전 FOL ID 목록 가져오기
        const [constantsBeforeList, factsBeforeList, predicatesBeforeList] = await Promise.all([
          mongoose.connection.collection('constants').find({ user_id: userId }).project({ _id: 1 }).toArray(),
          mongoose.connection.collection('facts').find({ user_id: userId }).project({ _id: 1 }).toArray(),
          mongoose.connection.collection('predicates').find({ user_id: userId }).project({ _id: 1 }).toArray()
        ]);

        const constantIdsBefore = new Set(constantsBeforeList.map(c => c._id.toString()));
        const factIdsBefore = new Set(factsBeforeList.map(f => f._id.toString()));
        const predicateIdsBefore = new Set(predicatesBeforeList.map(p => p._id.toString()));

        // FOL 빌드 및 저장
        await client.buildAndSave(document, userId);
        console.log(`✅ Chunk ${chunkIndex} built successfully`);

        // 빌드 후 FOL ID 목록 가져오기
        const [constantsAfterList, factsAfterList, predicatesAfterList] = await Promise.all([
          mongoose.connection.collection('constants').find({ user_id: userId }).project({ _id: 1 }).toArray(),
          mongoose.connection.collection('facts').find({ user_id: userId }).project({ _id: 1 }).toArray(),
          mongoose.connection.collection('predicates').find({ user_id: userId }).project({ _id: 1 }).toArray()
        ]);

        // 새로 생성된 FOL ID 필터링
        const newConstantIds = constantsAfterList
          .filter(c => !constantIdsBefore.has(c._id.toString()))
          .map(c => c._id);
        const newFactIds = factsAfterList
          .filter(f => !factIdsBefore.has(f._id.toString()))
          .map(f => f._id);
        const newPredicateIds = predicatesAfterList
          .filter(p => !predicateIdsBefore.has(p._id.toString()))
          .map(p => p._id);

        const buildDuration = Date.now() - buildStartTime;

        // BuildHistory 저장
        await BuildHistory.create({
          user_id: userId,
          chunk_index: chunkIndex,
          document,
          memory_ids: chunkIds,
          token_count: totalTokens,
          message_count: chunkMemories.length,
          build_type: 'full',
          status: 'success',
          generated_constants_count: newConstantIds.length,
          generated_facts_count: newFactIds.length,
          generated_predicates_count: newPredicateIds.length,
          generated_constant_ids: newConstantIds,
          generated_fact_ids: newFactIds,
          generated_predicate_ids: newPredicateIds,
          build_duration_ms: buildDuration
        });

        // 성공한 청크의 메모리들만 build_at 업데이트 (_id 기반)
        const updateResult = await ChatLog.updateMany(
          { _id: { $in: chunkIds } },
          { $set: { build_at: new Date() } }
        );

        totalBuiltMemories += updateResult.modifiedCount;
        console.log(`✅ Updated build_at for ${updateResult.modifiedCount} memories in chunk ${chunkIndex}`);
      } catch (chunkError: any) {
        console.error(`❌ Error building chunk ${chunkIndex}:`, chunkError.message);

        // 실패한 청크도 BuildHistory에 기록
        try {
          await BuildHistory.create({
            user_id: userId,
            chunk_index: chunkIndex,
            document,
            memory_ids: chunkIds,
            token_count: totalTokens,
            message_count: chunkMemories.length,
            build_type: 'full',
            status: 'failed',
            error_message: chunkError.message,
            generated_constants_count: 0,
            generated_facts_count: 0,
            generated_predicates_count: 0,
            generated_constant_ids: [],
            generated_fact_ids: [],
            generated_predicate_ids: [],
            build_duration_ms: Date.now() - buildStartTime
          });
        } catch (historyError) {
          console.error(`❌ Error saving build history for chunk ${chunkIndex}:`, historyError);
        }

        // 실패한 청크는 build_at이 없으므로 incremental build에서 자동 재처리됨
        console.log(`⚠️ Chunk ${chunkIndex} will be retried in incremental build`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Full rebuild completed successfully',
      builtMemories: totalBuiltMemories,
      totalChunks: chunkIndex,
      deletedData: {
        facts: factsResult.deletedCount,
        constants: constantsResult.deletedCount,
        predicates: predicatesResult.deletedCount
      }
    });
  } catch (error: any) {
    console.error('❌ Error in full rebuild:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
