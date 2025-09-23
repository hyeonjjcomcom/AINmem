// localhost:3000/api/auth/varify
import Ain from '@ainblockchain/ain-js';
import { NextRequest } from 'next/server';
import ainUtil from '@ainblockchain/ain-util';
import { ecVerifySig } from '@ainblockchain/ain-util';

interface VerifyPayload {
  message: any, 
  signature: string, 
  address: string,
  chainID: number
}

export async function POST(request: NextRequest) {
  try {
    // JSON body에서 데이터 추출 (query params가 아닌)
    const body: VerifyPayload = await request.json();
    const { address, signature, message, chainID } = body;
    
    console.log('API에서 받은 값들:');
    console.log('address:', address);
    console.log('signature:', signature); 
    console.log('message:', message);
    
    const ain = new Ain('https://testnet-api.ainetwork.ai', 'wss://testnet-event.ainetwork.ai', 0);
    
    // 여기서 실제 검증 로직 수행
    // const isValid = await verifySignature(message, signature, address);
    const isValid = await ainUtil.ecVerifySig(message, signature, address,chainID);
    return Response.json({
      isValid
    });
    
  } catch (error) {
    console.error('API 에러:', error);
    return Response.json({
      isValid: false,
      error: 'Invalid request'
    }, { status: 400 });
  }
}