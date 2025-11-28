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
 * 이 3가지 스텝이 원자적으로 실행됨:
 * 1. build_at이 없는 chatlog들을 가져온다
 * 2. FOL build하고 저장
 * 3. build_at 업데이트
 */
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

    // Step 1: 빌드 시작 시점 기록 & build_at이 없는 메모리 가져오기
    const buildStartTime = new Date();

    const unbuildMemories = await ChatLog.find({
      user_id: userId,
      build_at: { $exists: false }
    });

    // 빌드할 새로운 메모리가 없으면 스킵
    if (unbuildMemories.length === 0) {
      console.log('📊 No new memories to build');
      return NextResponse.json({
        success: true,
        message: 'No new memories to build',
        builtMemories: 0
      });
    }

    // 문서 생성
    let document = "";
    for (const item of unbuildMemories) {
      document += item.input_text + " ";
    }
    document = document.trim();

    console.log('📄 Document to build:', document.substring(0, 100) + '...');

    // Step 2: FOL 빌드 및 저장
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

    await client.buildAndSave(document, userId);
    console.log('✅ Document built and saved successfully.');

    // Step 3: build_at 타임스탬프 업데이트
    // buildStartTime 이전에 생성된 메모리만 업데이트 (TOCTOU 방지)
    const updateResult = await ChatLog.updateMany(
      {
        user_id: userId,
        build_at: { $exists: false },
        createdAt: { $lt: buildStartTime }
      },
      { $set: { build_at: new Date() } }
    );
    console.log(`✅ Updated build_at for ${updateResult.modifiedCount} memories`);

    return NextResponse.json({
      success: true,
      message: 'Graph built successfully',
      builtMemories: updateResult.modifiedCount
    });
  } catch (error: any) {
    console.error('❌ Error building graph:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
