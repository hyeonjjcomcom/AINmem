// app/api/fols/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { FolBuilder, GeminiAdapter, createFolClient } from 'fol-sdk';
import connectDB from '@/lib/mongodb';
import { getFolStore } from '@/lib/folStore'; // 💡 공통 함수 임포트

// --- POST (FOL 빌드) 로직 ---
async function buildFols(body: { document: string, user_id: string }) {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;

    console.log('🔧 Setting up FOL-SDK components...');

    const llmAdapter = new GeminiAdapter(geminiApiKey!);
    const store = getFolStore(); // ✅ 재사용 가능한 FolStore 인스턴스 사용
    const builder = new FolBuilder({ llm: llmAdapter });
    const client = createFolClient(builder, store);

    console.log('📥 User ID:', body.user_id);

    const result = await client.buildAndSave(body.document, body.user_id);
    console.log('✅ Document built and saved successfully.');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Document built and saved successfully' 
    });
  } catch (error: any) {
    console.error('❌ Error building and saving document:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}

// ✅ /api/fols 경로의 POST 요청 처리
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    console.log('📥 POST request body:', body);

    // buildFols 함수에 필요한 body와 user_id를 바로 전달
    if (!body.document || !body.user_id) {
        return NextResponse.json({ error: 'Missing document or user_id in body' }, { status: 400 });
    }
    
    return await buildFols(body);
  } catch (error) {
    console.error('❌ POST API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}