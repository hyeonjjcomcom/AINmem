// app/api/web3/delete-memories/route.ts
// Batch delete multiple memories using Read-Modify-Write pattern

import { NextRequest, NextResponse } from 'next/server';
import { deleteBatchMemoryIds } from '@/lib/web3';

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

    // Execute batch delete
    const result = await deleteBatchMemoryIds(userAddress, memoryIds);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully deleted ${result.deletedCount} memories`,
        userAddress,
        deletedCount: result.deletedCount,
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
    console.error('❌ [API] Batch delete API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
