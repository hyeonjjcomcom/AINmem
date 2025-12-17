// app/api/web3/delete-memories/route.ts
// Batch delete multiple memories using Read-Modify-Write pattern

import { NextRequest, NextResponse } from 'next/server';
import { deleteBatchMemoryIds } from '@/lib/web3';
import {
  Web3ValidationError,
  Web3TransactionError,
  Web3NetworkError
} from '@/errors/web3Errors';

/**
 * DELETE /api/web3/delete-memories
 *
 * Batch delete multiple memories from AIN blockchain
 * Uses Read-Modify-Write pattern for efficiency (1 transaction for N deletions)
 *
 * Body: {
 *   userAddress: "0x...",
 *   memoryIds: ["id1", "id2", "id3"]
 * }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress, memoryIds } = body;

    // Validate userAddress
    if (!userAddress || !/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return NextResponse.json(
        { error: 'Valid userAddress (Ethereum address) is required' },
        { status: 400 }
      );
    }

    // Validate memoryIds array
    if (!memoryIds || !Array.isArray(memoryIds) || memoryIds.length === 0) {
      return NextResponse.json(
        { error: 'memoryIds array is required and must not be empty' },
        { status: 400 }
      );
    }

    console.log(`🗑️ [API] Batch deleting ${memoryIds.length} memories from Web3: user=${userAddress}`);

    try {
      // Execute batch delete
      const result = await deleteBatchMemoryIds(userAddress, memoryIds);

      return NextResponse.json({
        success: true,
        message: `Successfully deleted ${result.deletedCount} memories`,
        userAddress,
        deletedCount: result.deletedCount,
        txHash: result.txHash
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
      console.error('❌ Batch delete API: Unexpected error:', error);
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
