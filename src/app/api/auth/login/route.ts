// app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import connectDB from '@/app/lib/mongodb';
import { nonces } from '../../lib/utils'; // 💡 공통 함수 임포트

// --- POST (서명 기반 로그인) 로직 ---
async function loginWithSignature(body: { address: string; signature: string }) {
  try {
    const { address, signature } = body;
    const nonce = nonces[address.toLowerCase()];
    
    if (!nonce) {
      return NextResponse.json(
        { error: "No nonce" }, 
        { status: 400 }
      );
    }

    const recovered = ethers.verifyMessage(nonce, signature);
    
    if (recovered.toLowerCase() === address.toLowerCase()) {
      delete nonces[address.toLowerCase()];
      return NextResponse.json({ success: true, address });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid signature" }, 
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('❌ Login error:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 400 }
    );
  }
}

// ✅ /api/auth/login 경로의 POST 요청 처리
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    return await loginWithSignature(body);
  } catch (error) {
    console.error('❌ POST API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}