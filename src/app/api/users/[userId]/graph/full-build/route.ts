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

/**
 * POST /api/users/[userId]/graph/full-build
 *
 * Full rebuild: 모든 FOL 데이터 삭제 후 전체 메모리 재빌드
 *
 * 이 스텝들이 원자적으로 실행됨:
 * 1. 기존 FOL 데이터(facts, constants, predicates) 삭제
 * 2. 모든 메모리의 build_at 초기화
 * 3. 전체 메모리 가져오기
 * 4. FOL build하고 저장
 * 5. build_at 업데이트
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

    // Step 3: 빌드 시작 시점 기록 & 전체 메모리 가져오기
    const buildStartTime = new Date();

    const allMemories = await ChatLog.find({ user_id: userId });

    if (allMemories.length === 0) {
      console.log('📊 No memories to build');
      return NextResponse.json({
        success: true,
        message: 'No memories to build',
        builtMemories: 0
      });
    }

    // 문서 생성
    let document = "";
    for (const item of allMemories) {
      document += item.input_text + " ";
    }
    document = document.trim();

    console.log('📄 Full document to build:', document.substring(0, 100) + '...');

    // Step 4: FOL 빌드 및 저장
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

    // Step 5: build_at 타임스탬프 업데이트
    const updateResult = await ChatLog.updateMany(
      {
        user_id: userId,
        createdAt: { $lt: buildStartTime }
      },
      { $set: { build_at: new Date() } }
    );
    console.log(`✅ Updated build_at for ${updateResult.modifiedCount} memories`);

    return NextResponse.json({
      success: true,
      message: 'Full rebuild completed successfully',
      builtMemories: updateResult.modifiedCount,
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
