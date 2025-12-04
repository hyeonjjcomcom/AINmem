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
 * POST /api/users/[userId]/graph/build
 *
 * Incremental build: build_at이 없는 chatlog들만 가져와서 FOL 빌드
 *
 * 청크 기반 빌드 전략:
 * 1. build_at이 없는 chatlog들을 가져온다
 * 2. 메시지 10개 또는 10000 토큰 단위로 청크를 만든다
 * 3. 각 청크를 FOL build하고 저장
 * 4. 성공한 청크의 메모리들만 build_at 업데이트 (_id 기반)
 * 5. 실패한 청크는 build_at이 없어서 다음 빌드에서 자동 재처리됨
 */

// 토큰 수 추정 함수 (token_count 필드가 없을 경우 사용)
function estimateTokens(text: string): number {
  // 간단한 추정: 평균적으로 1 토큰 ≈ 4 글자
  return Math.ceil(text.length / 4);
}

// 청크 인터페이스
interface Chunk {
  memories: any[];
  totalTokens: number;
  memoryIds: mongoose.Types.ObjectId[];
  document: string;
}

// 청크 생성 함수
function createChunks(
  unbuildMemories: any[],
  chunkSize: number,
  maxTokens: number
): Chunk[] {
  const chunks: Chunk[] = [];
  let currentChunk: any[] = [];
  let currentTokens = 0;

  for (const memory of unbuildMemories) {
    const tokens = memory.token_count ?? estimateTokens(memory.input_text);

    // 청크가 이미 있고, 추가 시 제한 초과하면 청크 완성
    if (currentChunk.length > 0 &&
        (currentChunk.length >= chunkSize ||
         currentTokens + tokens > maxTokens)) {
      chunks.push({
        memories: currentChunk,
        totalTokens: currentTokens,
        memoryIds: currentChunk.map(m => m._id),
        document: currentChunk.map(m => m.input_text).join(' ').trim()
      });
      currentChunk = [];
      currentTokens = 0;
    }

    currentChunk.push(memory);
    currentTokens += tokens;
  }

  // 마지막 청크 추가
  if (currentChunk.length > 0) {
    chunks.push({
      memories: currentChunk,
      totalTokens: currentTokens,
      memoryIds: currentChunk.map(m => m._id),
      document: currentChunk.map(m => m.input_text).join(' ').trim()
    });
  }

  return chunks;
}

// 청크 빌드 함수
async function buildChunk(
  chunk: Chunk,
  userId: string,
  client: any
): Promise<{ success: boolean; error?: string }> {
  const buildStartTime = Date.now();

  try {
    // 빌드 전 FOL ID 목록 가져오기
    const [constantsBeforeList, factsBeforeList, predicatesBeforeList] =
      await Promise.all([
        mongoose.connection.collection('constants')
          .find({ user_id: userId }).project({ _id: 1 }).toArray(),
        mongoose.connection.collection('facts')
          .find({ user_id: userId }).project({ _id: 1 }).toArray(),
        mongoose.connection.collection('predicates')
          .find({ user_id: userId }).project({ _id: 1 }).toArray()
      ]);

    const constantIdsBefore = new Set(constantsBeforeList.map(c => c._id.toString()));
    const factIdsBefore = new Set(factsBeforeList.map(f => f._id.toString()));
    const predicateIdsBefore = new Set(predicatesBeforeList.map(p => p._id.toString()));

    // FOL 빌드 및 저장
    await client.buildAndSave(chunk.document, userId);

    // 빌드 후 FOL ID 목록 가져오기
    const [constantsAfterList, factsAfterList, predicatesAfterList] =
      await Promise.all([
        mongoose.connection.collection('constants')
          .find({ user_id: userId }).project({ _id: 1 }).toArray(),
        mongoose.connection.collection('facts')
          .find({ user_id: userId }).project({ _id: 1 }).toArray(),
        mongoose.connection.collection('predicates')
          .find({ user_id: userId }).project({ _id: 1 }).toArray()
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

    // BuildHistory 저장 (chunk_index 제거)
    await BuildHistory.create({
      user_id: userId,
      document: chunk.document,
      memory_ids: chunk.memoryIds,
      token_count: chunk.totalTokens,
      message_count: chunk.memories.length,
      build_type: 'incremental',
      status: 'success',
      generated_constants_count: newConstantIds.length,
      generated_facts_count: newFactIds.length,
      generated_predicates_count: newPredicateIds.length,
      generated_constant_ids: newConstantIds,
      generated_fact_ids: newFactIds,
      generated_predicate_ids: newPredicateIds,
      build_duration_ms: buildDuration
    });

    // 성공한 청크의 메모리들만 build_at 업데이트
    await ChatLog.updateMany(
      { _id: { $in: chunk.memoryIds } },
      { $set: { build_at: new Date() } }
    );

    console.log(`✅ Chunk built successfully: ${chunk.memories.length} memories`);
    return { success: true };
  } catch (error: any) {
    console.error(`❌ Error building chunk:`, error.message);

    // 실패한 청크도 BuildHistory에 기록
    try {
      await BuildHistory.create({
        user_id: userId,
        document: chunk.document,
        memory_ids: chunk.memoryIds,
        token_count: chunk.totalTokens,
        message_count: chunk.memories.length,
        build_type: 'incremental',
        status: 'failed',
        error_message: error.message,
        generated_constants_count: 0,
        generated_facts_count: 0,
        generated_predicates_count: 0,
        generated_constant_ids: [],
        generated_fact_ids: [],
        generated_predicate_ids: [],
        build_duration_ms: Date.now() - buildStartTime
      });
    } catch (historyError) {
      console.error(`❌ Error saving build history:`, historyError);
    }

    // 실패한 청크는 build_at이 없으므로 다음 빌드에서 자동 재처리됨
    console.log(`⚠️ ${chunk.memories.length} memories will be retried in next build`);
    return { success: false, error: error.message };
  }
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

    console.log('🔧 Starting incremental build for user:', userId);

    // Step 1: build_at이 없는 메모리 가져오기
    const unbuildMemories = await ChatLog.find({
      user_id: userId,
      build_at: { $exists: false }
    }).sort({ createdAt: 1 }); // 시간순 정렬

    // 빌드할 새로운 메모리가 없으면 스킵
    if (unbuildMemories.length === 0) {
      console.log('📊 No new memories to build');
      return NextResponse.json({
        success: true,
        message: 'No new memories to build',
        builtMemories: 0
      });
    }

    console.log(`📦 Found ${unbuildMemories.length} unbuilt memories`);

    // Step 2: FOL 빌드 설정
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    const llmAdapter = new GeminiAdapter(geminiApiKey);
    const store = getFolStore();
    const builder = new FolBuilder({ llm: llmAdapter });
    const client = createFolClient(builder, store);

    // Step 3: 청크 생성
    const CHUNK_SIZE = 10;
    const PREFERRED_MAX_TOKENS = 10000;
    const chunks = createChunks(unbuildMemories, CHUNK_SIZE, PREFERRED_MAX_TOKENS);

    console.log(`📦 Created ${chunks.length} chunks`);

    // Step 4: 제한적 병렬 처리 (3개씩)
    const CONCURRENT_LIMIT = 3;
    let totalBuiltMemories = 0;
    let successfulChunks = 0;
    let failedChunks = 0;

    for (let i = 0; i < chunks.length; i += CONCURRENT_LIMIT) {
      const batch = chunks.slice(i, i + CONCURRENT_LIMIT);
      console.log(`🔄 Processing batch ${Math.floor(i / CONCURRENT_LIMIT) + 1}: ${batch.length} chunks`);

      // 배치 내 청크들을 병렬 처리
      const results = await Promise.allSettled(
        batch.map(chunk => buildChunk(chunk, userId, client))
      );

      // 결과 집계
      for (let j = 0; j < results.length; j++) {
        const result = results[j];
        const chunk = batch[j];

        if (result.status === 'fulfilled' && result.value.success) {
          successfulChunks++;
          totalBuiltMemories += chunk.memories.length;
        } else {
          failedChunks++;
          const errorMsg = result.status === 'rejected'
            ? result.reason?.message
            : result.value.error;
          console.log(`❌ Chunk failed: ${errorMsg}`);
        }
      }
    }

    console.log(`✅ Build complete: ${successfulChunks} success, ${failedChunks} failed`);

    return NextResponse.json({
      success: true,
      message: 'Graph built successfully',
      builtMemories: totalBuiltMemories,
      totalChunks: chunks.length,
      successfulChunks,
      failedChunks
    });
  } catch (error: any) {
    console.error('❌ Error building graph:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
