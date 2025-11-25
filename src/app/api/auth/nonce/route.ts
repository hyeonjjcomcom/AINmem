// app/api/auth/nonce/route.ts

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import { nonces } from '@/lib/folStore'; // 💡 공통 함수 임포트

// --- POST (Nonce 생성) 로직 ---
async function getNonce(body: { address: string }) {
  try {
    const { address } = body;
    const nonce = crypto.randomBytes(16).toString("hex");
    nonces[address.toLowerCase()] = nonce;
    
    return NextResponse.json({ nonce });
  } catch (error) {
    console.error('❌ Error generating nonce:', error);
    return NextResponse.json(
      { error: 'Failed to generate nonce' }, 
      { status: 500 }
    );
  }
}

// ✅ /api/auth/nonce 경로의 POST 요청 처리
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    return await getNonce(body);
  } catch (error) {
    console.error('❌ POST API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}