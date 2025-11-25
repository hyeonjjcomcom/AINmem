// app/api/facts/route.ts

import { NextResponse, NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';

// --- GET (조회) 로직 ---
async function getFacts(userId: string) {
  try {
    const data = await mongoose.connection.collection('facts').find({ user_id: userId }).toArray();
    console.log(`📊 Fetched facts for user ${userId}:`, data.length, 'items');
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching facts:', error);
    throw error;
  }
}

// ✅ /api/facts 경로의 GET 요청 처리
// ⚠️ Deprecated: 하위 호환성을 위해 유지. 새 코드는 /api/users/[userId]/facts 사용
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // URL에서 userId 쿼리 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    // userId 필수 검증 (전체 조회는 향후 관리자 기능용으로 예약)
    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required. Use /api/users/[userId]/facts for RESTful access.' },
        { status: 400 }
      );
    }

    return await getFacts(userId);
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// --- DELETE (삭제) 로직 ---
async function deleteFacts(userId: string) {
  try {
    console.log(`🗑️ Deleting facts for user ${userId}...`);

    const result = await mongoose.connection.collection('facts').deleteMany({ user_id: userId });

    console.log(`✅ Successfully deleted ${result.deletedCount} facts`);
    return NextResponse.json({
      message: `Facts for user ${userId} deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Error deleting facts:', error);
    throw error;
  }
}

// ✅ /api/facts 경로의 DELETE 요청 처리
// ⚠️ Deprecated: 하위 호환성을 위해 유지. 새 코드는 /api/users/[userId]/facts 사용
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    // URL에서 userId 쿼리 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    // userId 필수 검증 (전체 삭제는 향후 관리자 기능용으로 예약)
    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required. Use /api/users/[userId]/facts for RESTful access.' },
        { status: 400 }
      );
    }

    return await deleteFacts(userId);
  } catch (error) {
    console.error('❌ DELETE API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}