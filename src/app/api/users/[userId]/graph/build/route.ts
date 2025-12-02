import { NextRequest, NextResponse } from 'next/server';
import {
  FolBuilder,
  GeminiAdapter,
  createFolClient
} from 'fol-sdk';
import connectDB from '@/lib/mongodb';
import { getFolStore } from '@/lib/folStore';
import ChatLog from '@/models/chatLogs';

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

    // Step 3: 청크 기반 빌드
    const CHUNK_SIZE = 10; // 메시지 개수 권장치
    const PREFERRED_MAX_TOKENS = 10000; // 선호하는 토큰 상한

    let totalBuiltMemories = 0;
    let chunkIndex = 0;

    for (let i = 0; i < unbuildMemories.length; ) {
      chunkIndex++;
      let chunkMemories = [];
      let totalTokens = 0;

      // 최소 1개 메시지는 무조건 포함
      const firstMemory = unbuildMemories[i];
      const firstTokens = firstMemory.token_count || estimateTokens(firstMemory.input_text);

      chunkMemories.push(firstMemory);
      totalTokens += firstTokens;
      i++;

      // 추가 메시지들을 청크에 추가
      while (i < unbuildMemories.length && chunkMemories.length < CHUNK_SIZE) {
        const memory = unbuildMemories[i];
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

      try {
        // 청크 문서 생성
        const document = chunkMemories.map(m => m.input_text).join(' ').trim();

        // FOL 빌드 및 저장
        await client.buildAndSave(document, userId);
        console.log(`✅ Chunk ${chunkIndex} built successfully`);

        // 성공한 청크의 메모리들만 build_at 업데이트 (_id 기반)
        const chunkIds = chunkMemories.map(m => m._id);
        const updateResult = await ChatLog.updateMany(
          { _id: { $in: chunkIds } },
          { $set: { build_at: new Date() } }
        );

        totalBuiltMemories += updateResult.modifiedCount;
        console.log(`✅ Updated build_at for ${updateResult.modifiedCount} memories in chunk ${chunkIndex}`);
      } catch (chunkError: any) {
        console.error(`❌ Error building chunk ${chunkIndex}:`, chunkError.message);
        // 실패한 청크는 build_at이 없으므로 다음 빌드에서 자동 재처리됨
        console.log(`⚠️ Chunk ${chunkIndex} will be retried in next build`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Graph built successfully',
      builtMemories: totalBuiltMemories,
      totalChunks: chunkIndex
    });
  } catch (error: any) {
    console.error('❌ Error building graph:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
