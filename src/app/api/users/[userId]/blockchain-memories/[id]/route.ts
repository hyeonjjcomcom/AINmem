// app/api/users/[userId]/blockchain-memories/[id]/route.ts
// Single memory deletion from blockchain (fire-and-forget)

import { NextRequest, NextResponse } from 'next/server';
import { deleteMemoryFromWeb3Async } from '@/lib/web3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * DELETE /api/users/[userId]/blockchain-memories/[id]
 *
 * Delete a single memory from blockchain (fire-and-forget)
 * This endpoint returns immediately without waiting for blockchain confirmation
 *
 * Response:
 * {
 *   message: "Blockchain deletion initiated",
 *   user_address: "0x...",
 *   memory_id: "...",
 *   status: "in_progress"
 * }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; id: string }> }
) {
  try {
    const { userId: user_address, id: memoryId } = await params;

    // Validate user_address
    if (!user_address || !/^0x[a-fA-F0-9]{40}$/.test(user_address)) {
      return NextResponse.json(
        { error: 'Valid user address (Ethereum address) is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate memoryId
    if (!memoryId) {
      return NextResponse.json(
        { error: 'memory_id is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`🗑️ [API] Deleting from blockchain: user=${user_address}, id=${memoryId}`);

    // Fire-and-forget deletion
    deleteMemoryFromWeb3Async(user_address, memoryId).catch((error) => {
      console.error(`❌ [API] Blockchain deletion failed: user=${user_address}, id=${memoryId}`, error);
    });

    return NextResponse.json(
      {
        message: 'Blockchain deletion initiated',
        user_address,
        memory_id: memoryId,
        status: 'in_progress'
      },
      { status: 202, headers: corsHeaders }  // 202 Accepted for async operations
    );
  } catch (error: any) {
    console.error('❌ [API] Blockchain delete API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// CORS preflight (OPTIONS request)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
