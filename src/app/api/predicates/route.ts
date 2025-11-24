// app/api/predicates/route.ts

import { NextResponse, NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/app/lib/mongodb';
import { getFolStore } from '../lib/utils'; // 💡 공통 함수 임포트

// --- GET (조회) 로직 ---
async function getPredicates(userId?: string | null) {
  try {
    // userId가 있으면 MongoDB에서 직접 필터링
    let data;
    if (userId) {
      const query = { user_id: userId };
      data = await mongoose.connection.collection('predicates').find(query).toArray();
      console.log(`📊 Fetched predicates for user ${userId}:`, data.length, 'items');
    } else {
      const store = getFolStore();
      data = (await store.getAllFols()).predicates;
      console.log('📊 Fetched all predicates:', data.length, 'items');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching predicates:', error);
    throw error;
  }
}

// ✅ /api/predicates 경로의 GET 요청 처리
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // URL에서 userId 쿼리 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    return await getPredicates(userId);
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// --- DELETE (삭제) 로직 ---
async function deletePredicates() {
  try {
    console.log('🗑️ Deleting all predicates...');
    const result = await mongoose.connection.collection('predicates').deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} predicates`);
    return NextResponse.json({
      message: 'All predicates deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Error deleting predicates:', error);
    throw error;
  }
}

// ✅ /api/predicates 경로의 DELETE 요청 처리
export async function DELETE() {
  try {
    await connectDB();
    return await deletePredicates();
  } catch (error) {
    console.error('❌ DELETE API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}