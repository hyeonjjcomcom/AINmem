// app/api/web3/delete-memory/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { deleteMemoryFromWeb3Async } from '@/lib/web3';

/**
 * DELETE /api/web3/delete-memory
 *
 * Delete memory data from AIN blockchain
 *
 * Body: { userAddress, memoryId }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress, memoryId } = body;

    // Validate userAddress
    if (!userAddress || !/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return NextResponse.json(
        { error: 'Valid userAddress (Ethereum address) is required' },
        { status: 400 }
      );
    }

    // Validate memoryId
    if (!memoryId) {
      return NextResponse.json(
        { error: 'memoryId is required' },
        { status: 400 }
      );
    }

    console.log(`🗑️ [API] Deleting from Web3: user=${userAddress}, id=${memoryId}`);

    // Fire-and-forget deletion
    deleteMemoryFromWeb3Async(userAddress, memoryId).catch((error) => {
      console.error(`❌ [API] Web3 deletion failed: user=${userAddress}, id=${memoryId}`, error);
    });

    return NextResponse.json({
      message: 'Web3 deletion initiated',
      userAddress,
      memoryId,
      status: 'in_progress'
    });
  } catch (error: any) {
    console.error('❌ [API] Web3 delete API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
