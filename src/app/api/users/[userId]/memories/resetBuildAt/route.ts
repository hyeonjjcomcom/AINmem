import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();
    const { userId } = await params;

    console.log('🔄 Resetting buildAt for user:', userId);

    // 해당 유저의 모든 메모리의 buildAt 필드 제거
    const result = await mongoose.connection.collection('chatlogs').updateMany(
      { user_id: userId },
      { $unset: { buildAt: "" } }
    );

    console.log(`✅ Reset buildAt for ${result.modifiedCount} memories`);

    return NextResponse.json({
      success: true,
      message: 'BuildAt reset successfully',
      modifiedCount: result.modifiedCount
    });
  } catch (error: any) {
    console.error('❌ Error resetting buildAt:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
