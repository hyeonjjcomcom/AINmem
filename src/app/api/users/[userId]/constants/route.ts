// app/api/users/[userId]/constants/route.ts

import { NextResponse, NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';

// --- GET (조회) 로직 ---
async function getConstants(userId: string) {
  try {
    const data = await mongoose.connection.collection('constants').find({ user_id: userId }).toArray();
    console.log(`📊 Fetched constants for user ${userId}:`, data.length, 'items');
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching constants:', error);
    throw error;
  }
}

// ✅ /api/users/[userId]/constants 경로의 GET 요청 처리
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await connectDB();

    const { userId } = params;

    // userId 유효성 검증
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    return await getConstants(userId);
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// --- DELETE (삭제) 로직 ---
async function deleteConstants(userId: string) {
  try {
    console.log(`🗑️ Deleting constants for user ${userId}...`);

    const result = await mongoose.connection.collection('constants').deleteMany({ user_id: userId });

    console.log(`✅ Successfully deleted ${result.deletedCount} constants`);
    return NextResponse.json({
      message: `Constants for user ${userId} deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Error deleting constants:', error);
    throw error;
  }
}

// ✅ /api/users/[userId]/constants 경로의 DELETE 요청 처리
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await connectDB();

    const { userId } = params;

    // userId 유효성 검증
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    return await deleteConstants(userId);
  } catch (error) {
    console.error('❌ DELETE API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
