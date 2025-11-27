import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChatLog from '@/models/chatLogs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();
    const { userId } = await params;

    console.log('🔄 Resetting build_at for user:', userId);

    // 해당 유저의 모든 메모리의 build_at 필드 제거
    const result = await ChatLog.updateMany(
      { user_id: userId },
      { $unset: { build_at: "" } }
    );

    console.log(`✅ Reset build_at for ${result.modifiedCount} memories`);

    return NextResponse.json({
      success: true,
      message: 'Build_at reset successfully',
      modifiedCount: result.modifiedCount
    });
  } catch (error: any) {
    console.error('❌ Error resetting build_at:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
