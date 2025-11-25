// app/api/memories/document/route.ts

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';

async function getMemoriesDocument(user_id: string | null) {
  try {
    let document = "";
    
    // user_id 조건을 추가한 쿼리
    const query = user_id ? { user_id: user_id } : {};
    
    const data = await mongoose.connection.collection('chatlogs').find(query).toArray();
    
    for (const item of data) {
      document += item.input_text + " ";
    }
    
    console.log('Complete generation document:', document);
    return new NextResponse(document, {
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    console.error('❌ Error fetching memories document data:', error);
    throw error;
  }
}

// ✅ /api/memories/document 경로의 GET 요청 처리
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get('user_id');

  try {
    await connectDB();
    return await getMemoriesDocument(user_id);
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}