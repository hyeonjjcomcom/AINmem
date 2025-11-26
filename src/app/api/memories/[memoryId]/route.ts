// app/api/memories/[memoryId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';

// ✅ /api/memories/[memoryId] 경로의 DELETE 요청 처리
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ memoryId: string }> }
) {
  try {
    await connectDB();

    const { memoryId } = await params;

    // ID 유효성 검증
    if (!memoryId || !mongoose.Types.ObjectId.isValid(memoryId)) {
      return NextResponse.json(
        { error: 'Invalid memory ID' },
        { status: 400 }
      );
    }

    // 메모리 삭제
    const result = await mongoose.connection
      .collection('chatlogs')
      .deleteOne({
        _id: new mongoose.Types.ObjectId(memoryId)
      });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Memory not found or unauthorized' },
        { status: 404 }
      );
    }

    console.log(`✅ Successfully deleted memory with id: ${memoryId}`);
    return NextResponse.json({
      message: 'Memory deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ DELETE API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
