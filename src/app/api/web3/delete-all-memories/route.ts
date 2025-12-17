// app/api/web3/delete-all-memories/route.ts
// ⚠️ WARNING: Deletes ALL memories for a user

import { NextRequest, NextResponse } from 'next/server';
import { deleteAllMemoryIds } from '@/lib/web3';
import {
  Web3ValidationError,
  Web3TransactionError,
  Web3NetworkError
} from '@/errors/web3Errors';

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

    try {
      // Execute delete all
      const txHash = await deleteAllMemoryIds(userAddress);

      return NextResponse.json({
        success: true,
        message: 'All memories deleted successfully',
        userAddress,
        txHash
      });
    } catch (error) {
      if (error instanceof Web3ValidationError) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      if (error instanceof Web3TransactionError) {
        console.error(`❌ Web3 transaction failed: code=${error.code}, message=${error.message}`);
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
            txHash: error.txHash
          },
          { status: 500 }
        );
      }

      if (error instanceof Web3NetworkError) {
        console.error(`❌ Web3 network error: ${error.message}`);
        return NextResponse.json(
          { error: `Network error: ${error.message}` },
          { status: 503 }
        );
      }

      // Unexpected error
      console.error('❌ Delete all API: Unexpected error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error('❌ [API] Request parsing error:', err);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}
