import { NextRequest, NextResponse } from 'next/server';
import { saveMemoryId, getMemoryIds, deleteBatchMemoryIds } from '@/lib/web3';
import {
  Web3ValidationError,
  Web3TransactionError,
  Web3NetworkError
} from '@/errors/web3Errors';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * POST /api/users/[userId]/blockchain-memories
 *
 * Save memory ObjectId to user's blockchain storage on AIN Network
 *
 * Request body:
 * {
 *   memory_id: string      // MongoDB ObjectId from ChatLog
 * }
 *
 * Response:
 * {
 *   success: true,
 *   txHash: "0x..."
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: user_address } = await params;
    const data = await request.json();
    const { memory_id } = data;

    // Validate required fields
    if (!memory_id) {
      return NextResponse.json(
        { error: 'memory_id is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate Ethereum address format (basic check)
    if (!/^0x[a-fA-F0-9]{40}$/.test(user_address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate MongoDB ObjectId format (basic check - 24 hex characters)
    if (!/^[a-fA-F0-9]{24}$/.test(memory_id)) {
      return NextResponse.json(
        { error: 'Invalid MongoDB ObjectId format' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`📝 Blockchain API: Saving memory for user=${user_address}, id=${memory_id}`);

    try {
      // Save to blockchain (idempotent operation)
      const result = await saveMemoryId(user_address, memory_id);

      // If memory already exists, return 200 OK instead of 201 Created
      if (result.alreadyExists) {
        return NextResponse.json(
          {
            success: true,
            message: 'Memory already exists on blockchain',
            created: false
          },
          { status: 200, headers: corsHeaders }
        );
      }

      // New memory created, return 201 Created
      return NextResponse.json(
        {
          success: true,
          txHash: result.txHash,
          message: 'Memory ID saved to blockchain successfully',
          created: true
        },
        { status: 201, headers: corsHeaders }
      );
    } catch (error) {
      if (error instanceof Web3ValidationError) {
        return NextResponse.json(
          { error: error.message },
          { status: 400, headers: corsHeaders }
        );
      }

      if (error instanceof Web3TransactionError) {
        console.error(`❌ Blockchain transaction failed: code=${error.code}, message=${error.message}`);
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
            txHash: error.txHash
          },
          { status: 500, headers: corsHeaders }
        );
      }

      if (error instanceof Web3NetworkError) {
        console.error(`❌ Blockchain network error: ${error.message}`);
        return NextResponse.json(
          { error: `Network error: ${error.message}` },
          { status: 503, headers: corsHeaders }
        );
      }

      // Unexpected error
      console.error('❌ Blockchain API: Unexpected error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500, headers: corsHeaders }
      );
    }
  } catch (err: any) {
    console.error('❌ Blockchain API: Parsing error:', err);
    return NextResponse.json(
      { error: err.message || 'Invalid request format' },
      { status: 400, headers: corsHeaders }
    );
  }
}

/**
 * GET /api/users/[userId]/blockchain-memories
 *
 * Fetch all memory ObjectIds for a user from blockchain
 *
 * Response:
 * {
 *   success: true,
 *   memory_ids: ["507f1f77bcf86cd799439011", ...],
 *   count: 2
 * }
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: user_address } = await params;

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(user_address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`🔍 Blockchain API: Fetching memory IDs for user=${user_address}`);

    // Fetch from blockchain
    const memoryIds = await getMemoryIds(user_address);

    return NextResponse.json(
      {
        success: true,
        memory_ids: memoryIds,
        count: memoryIds.length
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('❌ Blockchain API: Error fetching memory IDs:', err);
    return NextResponse.json(
      {
        error: err.message || 'Internal server error',
        memory_ids: [] // Return empty array on error for graceful degradation
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * DELETE /api/users/[userId]/blockchain-memories
 *
 * Batch delete multiple memories from blockchain
 *
 * ⚠️  Note on DELETE with Request Body:
 * While DELETE with body is valid per RFC 7231, some legacy proxies
 * or client libraries may strip the body. This is a pragmatic REST
 * approach used by modern APIs (e.g., Elasticsearch _bulk).
 *
 * Alternative designs if needed:
 * - Query params: DELETE ?ids=a,b,c (limited by URL length ~2KB)
 * - Individual calls: Loop DELETE /[id] (higher network overhead)
 * - POST endpoint: POST /batch-delete (breaks REST principles)
 *
 * Request body:
 * {
 *   memory_ids: string[]  // Array of memory IDs to delete (required)
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: "Successfully deleted N memories",
 *   deletedCount: N,
 *   txHash: "0x..."
 * }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: user_address } = await params;

    // Validate user_address
    if (!user_address || !/^0x[a-fA-F0-9]{40}$/.test(user_address)) {
      return NextResponse.json(
        { error: 'Valid user address (Ethereum address) is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if this is a batch delete or delete all
    let body;
    try {
      body = await request.json();
    } catch {
      // No body = delete all
      body = {};
    }

    const { memory_ids } = body;

    // Batch delete specific memories
    if (memory_ids && Array.isArray(memory_ids) && memory_ids.length > 0) {
      console.log(`🗑️ [API] Batch deleting ${memory_ids.length} memories: user=${user_address}`);

      try {
        const result = await deleteBatchMemoryIds(user_address, memory_ids);

        return NextResponse.json(
          {
            success: true,
            message: `Successfully deleted ${result.deletedCount} memories`,
            user_address,
            deletedCount: result.deletedCount,
            txHash: result.txHash
          },
          { status: 200, headers: corsHeaders }
        );
      } catch (error) {
        if (error instanceof Web3ValidationError) {
          return NextResponse.json(
            { error: error.message },
            { status: 400, headers: corsHeaders }
          );
        }

        if (error instanceof Web3TransactionError) {
          console.error(`❌ Blockchain transaction failed: code=${error.code}, message=${error.message}`);
          return NextResponse.json(
            {
              error: error.message,
              code: error.code,
              txHash: error.txHash
            },
            { status: 500, headers: corsHeaders }
          );
        }

        if (error instanceof Web3NetworkError) {
          console.error(`❌ Blockchain network error: ${error.message}`);
          return NextResponse.json(
            { error: `Network error: ${error.message}` },
            { status: 503, headers: corsHeaders }
          );
        }

        // Unexpected error
        console.error('❌ Batch delete API: Unexpected error:', error);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // If no memory_ids provided, this would delete all
    // For safety, we don't implement delete all here
    // Use a separate endpoint or require explicit confirmation
    return NextResponse.json(
      { error: 'memory_ids array is required for batch deletion' },
      { status: 400, headers: corsHeaders }
    );

  } catch (err: any) {
    console.error('❌ [API] Request parsing error:', err);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400, headers: corsHeaders }
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
