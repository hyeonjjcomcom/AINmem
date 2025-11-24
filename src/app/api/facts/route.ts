// app/api/facts/route.ts

import { NextResponse, NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/app/lib/mongodb';

// --- GET (조회) 로직 ---
async function getFacts(userId?: string | null) {
  try {
    // MongoDB에서 직접 조회 (userId가 있으면 필터링, 없으면 전체)
    const query = userId ? { user_id: userId } : {};
    const data = await mongoose.connection.collection('facts').find(query).toArray();

    if (userId) {
      console.log(`📊 Fetched facts for user ${userId}:`, data.length, 'items');
    } else {
      console.log('📊 Fetched all facts:', data.length, 'items');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching facts:', error);
    throw error;
  }
}

// ✅ /api/facts 경로의 GET 요청 처리
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // URL에서 userId 쿼리 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

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
async function deleteFacts(userId?: string | null) {
  try {
    const query = userId ? { user_id: userId } : {};

    if (userId) {
      console.log(`🗑️ Deleting facts for user ${userId}...`);
    } else {
      console.log('🗑️ Deleting all facts...');
    }

    const result = await mongoose.connection.collection('facts').deleteMany(query);

    console.log(`✅ Successfully deleted ${result.deletedCount} facts`);
    return NextResponse.json({
      message: userId ? `Facts for user ${userId} deleted successfully` : 'All facts deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Error deleting facts:', error);
    throw error;
  }
}

// ✅ /api/facts 경로의 DELETE 요청 처리
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    // URL에서 userId 쿼리 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    return await deleteFacts(userId);
  } catch (error) {
    console.error('❌ DELETE API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}