import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { encode } from 'gpt-tokenizer';
import ChatLog from '@/models/chatLogs';
import { classifyAndUpdateTags } from '@/lib/classifyTags';
import { saveMemoryToWeb3Async } from '@/lib/web3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",  // 또는 특정 도메인
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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

    // input_text 문자열화 + 토큰 수 계산
    const safeInputText = typeof input_text === 'string' ? input_text : String(input_text || '');
    const inputTokens = encode(safeInputText);
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

    // Fire-and-forget: Web3에 memory_id 저장 (응답 지연 없음)
    saveMemoryToWeb3Async(user_id, log._id.toString()).catch((error) => {
      console.error(`❌ Web3 저장 실패: user=${user_id}, id=${log._id}`, error);
    });

    // Fire-and-forget: 태그 분류를 백그라운드에서 실행 (응답 지연 없음)
    classifyAndUpdateTags(log._id.toString(), safeInputText);

    return NextResponse.json({ ok: true }, { headers: corsHeaders });

  } catch (err: any) {
    console.error("❌ DB 저장 오류:", err);
    return NextResponse.json(
      { status: 'error', error: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// 👉 CORS preflight (OPTIONS 요청 처리)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}