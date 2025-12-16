// app/api/web3/delete-all-memories/route.ts
// ⚠️ WARNING: Deletes ALL memories for a user

import { NextRequest, NextResponse } from 'next/server';
import { deleteAllMemoryIds } from '@/lib/web3';

/**
 * DELETE /api/web3/delete-all-memories
 *
 * ⚠️ WARNING: Deletes ALL memories for a user from AIN blockchain
 * This is a destructive operation and requires explicit confirmation
 *
 * Body: {
 *   userAddress: "0x...",
 *   confirm: "DELETE_ALL"
 * }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress, confirm } = body;

    // Validate userAddress
    if (!userAddress || !/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return NextResponse.json(
        { error: 'Valid userAddress (Ethereum address) is required' },
        { status: 400 }
      );
    }

    // Safety check: require explicit confirmation
    if (confirm !== 'DELETE_ALL') {
      return NextResponse.json(
        { error: 'Confirmation required. Send { confirm: "DELETE_ALL" }' },
        { status: 400 }
      );
    }

    console.log(`⚠️ [API] Deleting ALL memories from Web3: user=${userAddress}`);

    // Execute delete all
    const result = await deleteAllMemoryIds(userAddress);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'All memories deleted successfully',
        userAddress,
        txHash: result.txHash
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        userAddress
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('❌ [API] Delete all API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
