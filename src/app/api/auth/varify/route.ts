// localhost:3000/api/auth/varify
import Ain from '@ainblockchain/ain-js';
import { NextRequest } from 'next/server';


export async function GET(request: NextRequest) {
  const ain = new Ain('https://testnet-api.ainetwork.ai', 'wss://testnet-event.ainetwork.ai', 0);
  //시그니처 받은 걸 콘솔에 출력!
  const { searchParams } = new URL(request.url);
  const signedTestMessage = searchParams.get('signedTestMessage');
  console.log('API에서 받은 값 : ',signedTestMessage);

  return Response.json({
    ok: true,
    received: signedTestMessage,
  });
}