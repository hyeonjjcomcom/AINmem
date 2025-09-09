// pages/api/ain-data.ts
import type { NextApiRequest, NextApiResponse } from 'next';

// AIN.js를 동적으로 import (서버 사이드에서만 실행)
async function getAinData() {
  try {
    // 동적 import를 사용하여 서버에서만 실행되도록 함
    const { default: Ain } = await import('@ainblockchain/ain-js');
    
    const ain = new Ain(
      'https://testnet-api.ainetwork.ai', 
      'wss://testnet-event.ainetwork.ai', 
      0
    );

    // 계정 추가 (실제 사용 시에는 환경변수로 관리하세요!)
    const address = ain.wallet.addAndSetDefaultAccount(
      '8f9db3642a70aac232dff6b5bc482f836521e3d93fdf7ddff681ac5f2e8d144c'
    );

    const appName = 'ain_mem_1';
    const appPath = `/apps/${appName}`;

    // 데이터 가져오기
    const data = await ain.db.ref(appPath).getValue();
    
    return {
      success: true,
      data: data,
      address: address,
      appPath: appPath,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('AIN Network Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GET 요청만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await getAinData();
    
    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(500).json({ 
        error: 'Failed to fetch AIN data', 
        details: result.error 
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}