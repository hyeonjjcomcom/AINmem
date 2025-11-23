// app/api/facts/route.ts

import { NextResponse, NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/app/lib/mongodb';
import { getFolStore } from '../lib/utils'; // 💡 공통 함수 임포트

// --- GET (조회) 로직 ---
async function getFacts() {
  try {
    const store = getFolStore();
    const data = (await store.getAllFols()).facts;
    
    console.log('📊 Fetched facts data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching facts:', error);
    throw error;
  }
}

// ✅ /api/facts 경로의 GET 요청 처리
export async function GET() {
  try {
    await connectDB();
    return await getFacts();
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

// --- DELETE (삭제) 로직 ---
async function deleteFacts() {
  try {
    console.log('🗑️ Deleting all facts...');
    const result = await mongoose.connection.collection('facts').deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} facts`);
    return NextResponse.json({
      message: 'All facts deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Error deleting facts:', error);
    throw error;
  }
}

// ✅ /api/facts 경로의 DELETE 요청 처리
export async function DELETE() {
  try {
    await connectDB();
    return await deleteFacts();
  } catch (error) {
    console.error('❌ DELETE API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}