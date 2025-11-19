// app/api/constants/route.ts

import { NextResponse, NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/app/lib/mongodb';
import { getFolStore } from '../lib/utils'; // 💡 공통 함수 임포트

// --- GET (조회) 로직 ---
async function getConstants() {
  try {
    const store = getFolStore();
    const data = (await store.getAllFols()).constants;
    
    console.log('📊 Fetched constants data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching constants:', error);
    throw error;
  }
}

// ✅ /api/constants 경로의 GET 요청 처리
export async function GET() {
  try {
    await connectDB();
    return await getConstants();
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

// --- DELETE (삭제) 로직 ---
async function deleteConstants() {
  try {
    console.log('🗑️ Deleting all constants...');
    const result = await mongoose.connection.collection('constants').deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} constants`);
    return NextResponse.json({
      message: 'All constants deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Error deleting constants:', error);
    throw error;
  }
}

// ✅ /api/constants 경로의 DELETE 요청 처리
export async function DELETE() {
  try {
    await connectDB();
    return await deleteConstants();
  } catch (error) {
    console.error('❌ DELETE API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}