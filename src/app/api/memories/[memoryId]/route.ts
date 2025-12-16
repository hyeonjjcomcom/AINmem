// app/api/memories/[memoryId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';

/**
 * DELETE /api/memories/[memoryId]
 *
 * Delete memory from MongoDB and trigger Web3 deletion
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ memoryId: string }> }
) {
  try {
    await connectDB();

    const { memoryId } = await params;

    // ID 유효성 검증
    if (!memoryId || !mongoose.Types.ObjectId.isValid(memoryId)) {
      return NextResponse.json(
        { error: 'Invalid memory ID' },
        { status: 400 }
      );
    }

    // 삭제 전에 문서를 조회하여 user_id 가져오기 (Web3 삭제에 필요)
    const document = await mongoose.connection
      .collection('chatlogs')
      .findOne({
        _id: new mongoose.Types.ObjectId(memoryId)
      });

    if (!document) {
      return NextResponse.json(
        { error: 'Memory not found' },
        { status: 404 }
      );
    }

    // MongoDB에서 메모리 삭제
    const result = await mongoose.connection
      .collection('chatlogs')
      .deleteOne({
        _id: new mongoose.Types.ObjectId(memoryId)
      });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to delete memory from MongoDB' },
        { status: 500 }
      );
    }

    console.log(`✅ Successfully deleted memory from MongoDB: ${memoryId}`);

    // Trigger Web3 deletion (fire-and-forget via separate API call)
    if (document.user_id) {
      triggerWeb3Deletion(document.user_id, memoryId);
    }

    return NextResponse.json({
      message: 'Memory deleted successfully from MongoDB',
      deletedCount: result.deletedCount,
      web3DeletionTriggered: !!document.user_id
    });
  } catch (error) {
    console.error('❌ DELETE API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * Trigger Web3 deletion via internal API call (fire-and-forget)
 */
function triggerWeb3Deletion(
  userAddress: string,
  memoryId: string
): void {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const body = { userAddress, memoryId };

  console.log(`🔗 Triggering Web3 deletion API:`, body);

  fetch(`${apiUrl}/api/web3/delete-memory`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
    .then((res) => {
      if (res.ok) {
        console.log(`✅ Web3 deletion API called successfully`);
      } else {
        console.error(`❌ Web3 deletion API returned status: ${res.status}`);
      }
    })
    .catch((error) => {
      console.error(`❌ Failed to call Web3 deletion API:`, error);
    });
}
