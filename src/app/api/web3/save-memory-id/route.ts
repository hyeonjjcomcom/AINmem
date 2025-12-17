import { NextRequest, NextResponse } from 'next/server';
import { saveMemoryId, getMemoryIds, getAllWeb3Data } from '@/lib/web3';
import {
  Web3ValidationError,
  Web3TransactionError,
  Web3NetworkError
} from '@/errors/web3Errors';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * POST /api/web3/save-memory-id
 *
 * Save memory ObjectId to user's Web3 storage on AIN Network
 * This endpoint ensures atomic Web3 write operations
 *
 * Request body:
 * {
 *   user_address: string,  // User's wallet address (Ethereum format)
 *   memory_id: string      // MongoDB ObjectId from ChatLog
 * }
 *
 * Response:
 * {
 *   success: true,
 *   txHash: "0x...",
 *   key: "msg_1234567890"
 * }
 *
 * OR
 *
 * {
 *   success: false,
 *   error: "Error message"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const { user_address, memory_id } = data;

    // Validate required fields
    if (!user_address || !memory_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'user_address and memory_id are required'
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate Ethereum address format (basic check)
    if (!/^0x[a-fA-F0-9]{40}$/.test(user_address)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Ethereum address format'
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate MongoDB ObjectId format (basic check - 24 hex characters)
    if (!/^[a-fA-F0-9]{24}$/.test(memory_id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid MongoDB ObjectId format'
        },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`📝 Web3 API: Saving memory for user=${user_address}, id=${memory_id}`);

    try {
      // Save to Web3
      const txHash = await saveMemoryId(user_address, memory_id);

      return NextResponse.json(
        {
          success: true,
          txHash,
          message: 'Memory ID saved to Web3 successfully'
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
        console.error(`❌ Web3 transaction failed: code=${error.code}, message=${error.message}`);
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
        console.error(`❌ Web3 network error: ${error.message}`);
        return NextResponse.json(
          { error: `Network error: ${error.message}` },
          { status: 503, headers: corsHeaders }
        );
      }

      // Unexpected error
      console.error('❌ Web3 API: Unexpected error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500, headers: corsHeaders }
      );
    }
  } catch (err: any) {
    console.error('❌ Web3 API: Parsing error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Invalid request format'
      },
      { status: 400, headers: corsHeaders }
    );
  }
}

/**
 * GET /api/web3/save-memory-id?user_address={address}
 *
 * Fetch all memory ObjectIds for a user from Web3
 *
 * Query params:
 *   user_address: string  // User's wallet address
 *
 * Response:
 * {
 *   success: true,
 *   memory_ids: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const user_address = searchParams.get('user_address');
    const debug = searchParams.get('debug'); // 🔍 디버그 모드

    // 🔍 디버그 모드: 전체 ain_mem_1 데이터 조회
    if (debug === 'true') {
      console.log(`🔍 Web3 API: Debug mode - fetching ALL data`);
      const allData = await getAllWeb3Data();
      return NextResponse.json(
        {
          success: true,
          debug: true,
          data: allData
        },
        { status: 200, headers: corsHeaders }
      );
    }

    // Validate required parameter
    if (!user_address) {
      return NextResponse.json(
        {
          success: false,
          error: 'user_address query parameter is required'
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(user_address)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Ethereum address format'
        },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`🔍 Web3 API: Fetching memory IDs for user=${user_address}`);

    // Fetch from Web3
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
    console.error('❌ Web3 API: Error fetching memory IDs:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Internal server error',
        memory_ids: [] // Return empty array on error for graceful degradation
      },
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
