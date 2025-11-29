import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChatLog from '@/models/chatLogs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();
    const { userId } = await params;

    // 빌드 시작 시점 기록
    const buildStartTime = new Date();

    console.log('📄 Fetching document for user:', userId);

    // user_id 조건 + build_at이 없는 메모리만 가져오기 (incremental build)
    const data = await ChatLog.find({
      user_id: userId,
      build_at: { $exists: false }
    });

    let document = "";
    for (const item of data) {
      document += item.input_text + " ";
    }

    console.log('Complete generation document:', document);

    return NextResponse.json({
      document: document.trim(),
      buildStartTime: buildStartTime.toISOString()
    });
  } catch (error: any) {
    console.error('❌ Error fetching memories document:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
