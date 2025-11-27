import { NextRequest, NextResponse } from 'next/server';
import {
  FolBuilder,
  GeminiAdapter,
  createFolClient
} from 'fol-sdk';
import connectDB from '@/lib/mongodb';
import { getFolStore } from '@/lib/folStore';
import ChatLog from '@/models/chatLogs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { document, user_id } = body;

    if (!document || !user_id) {
      return NextResponse.json(
        { success: false, error: 'document and user_id are required' },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    console.log('🔧 Setting up FOL-SDK components...');

    const llmAdapter = new GeminiAdapter(geminiApiKey!);
    const store = getFolStore();
    const builder = new FolBuilder({ llm: llmAdapter });
    const client = createFolClient(builder, store);

    console.log('📥 User ID:', user_id);

    await client.buildAndSave(document, user_id);
    console.log('✅ Document built and saved successfully.');

    // ✅ 빌드 성공 후 build_at 타임스탬프 업데이트 (incremental build)
    const updateResult = await ChatLog.updateMany(
      { user_id: user_id, build_at: { $exists: false } },
      { $set: { build_at: new Date() } }
    );
    console.log(`✅ Updated build_at for ${updateResult.modifiedCount} memories`);

    return NextResponse.json({
      success: true,
      message: 'Document built and saved successfully',
      updatedMemories: updateResult.modifiedCount
    });
  } catch (error: any) {
    console.error('❌ Error building and saving document:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
