// app/api/web3/reset-all/route.ts
// ⚠️ DANGER: This is a one-time reset API - deletes ALL data in ain_mem_1

import { NextRequest, NextResponse } from 'next/server';

/**
 * DELETE /api/web3/reset-all
 *
 * ⚠️ WARNING: Deletes ALL data in /apps/ain_mem_1
 * One-time use only to migrate from old structure to new structure
 *
 * Body: { confirm: "RESET_ALL_DATA" }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    // Safety check: require explicit confirmation
    if (body.confirm !== 'RESET_ALL_DATA') {
      return NextResponse.json(
        { error: 'Confirmation required. Send { confirm: "RESET_ALL_DATA" }' },
        { status: 400 }
      );
    }

    console.log('⚠️ [RESET] Starting complete data reset of ain_mem_1...');

    // Dynamic import to avoid loading in production builds
    const { default: Ain } = await import('@ainblockchain/ain-js');

    const serviceAccountPrivateKey = process.env.SERVICE_ACCOUNT_PRIVATE_KEY;
    const ainNetworkEndpoint = process.env.AIN_NETWORK_ENDPOINT || 'https://testnet-api.ainetwork.ai';
    const ainEventEndpoint = process.env.AIN_EVENT_ENDPOINT || 'wss://testnet-event.ainetwork.ai';

    if (!serviceAccountPrivateKey) {
      throw new Error('SERVICE_ACCOUNT_PRIVATE_KEY not configured');
    }

    const ain = new Ain(ainNetworkEndpoint, ainEventEndpoint, 0);
    ain.wallet.addAndSetDefaultAccount(serviceAccountPrivateKey);

    const path = '/apps/ain_mem_1';

    console.log(`🗑️ [RESET] Deleting all data at: ${path}`);

    // Set entire app data to null
    const result: any = await ain.db.ref(path).setValue({
      value: null,
      nonce: -1,
    });

    if (result && result.tx_hash && result.result && result.result.code === 0) {
      console.log(`✅ [RESET] Complete! txHash=${result.tx_hash}`);
      return NextResponse.json({
        success: true,
        message: 'All data in ain_mem_1 has been deleted',
        txHash: result.tx_hash,
        path
      });
    } else {
      const errorMsg = result?.result?.message || 'Reset failed';
      const code = result?.result?.code;
      console.error(`❌ [RESET] Failed: code=${code}, message=${errorMsg}`);

      return NextResponse.json({
        success: false,
        error: errorMsg,
        code
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ [RESET] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
