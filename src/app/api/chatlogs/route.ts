// app/api/log/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';

// import { enc } from 'your-token-encoder'; // 실제 토큰 인코더 import
import { encoding_for_model } from '@dqbd/tiktoken';
const enc = encoding_for_model('gpt-4'); // 또는 'gpt-3.5-turbo'

import ChatLog from '@/app/models/chatLogs'; // 실제 MongoDB 모델 import


export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();

    const { user_id, timestamp, session_id, input_text } = data;
    
    // 필수 필드 검증
    if (!user_id || !timestamp || !input_text) {
      return NextResponse.json(
        { status: 'error', error: '필수 필드 누락' }, 
        { status: 400 }
      );
    }

    // UUID 없으면 생성
    if (!data.id) {
      data.id = uuidv4();
    }

    // input_text 문자열화 + 토큰 수 계산
    const safeInputText = typeof input_text === 'string' ? input_text : String(input_text || '');
    const inputTokens = enc.encode(safeInputText);
    data.tokens_input = inputTokens.length;

    // 🔥 turn_number 설정
    const count = await ChatLog.countDocuments({ session_id: data.session_id });
    data.turn_number = count + 1;

    // 멱등성 판단 기준 (초 단위 timestamp 사용)
    const filter = {
      user_id,
      session_id,
      timestamp,
      input_text
    };

    const update = {
      ...data
    };

    const options = { upsert: true, new: true, setDefaultsOnInsert: true };

    const log = await ChatLog.findOneAndUpdate(filter, update, options);

    return NextResponse.json({ status: 'ok', id: log.id }, { status: 200 });

  } catch (err: any) {
    console.error("❌ DB 저장 오류:", err);
    return NextResponse.json(
      { status: 'error', error: err.message }, 
      { status: 500 }
    );
  }
}