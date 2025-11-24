// app/api/memories/route.ts

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/app/lib/mongodb';

async function getMemoriesData(request: NextRequest) {
  try {
    // 쿼리 파라미터에서 userName 추출
    const { searchParams } = new URL(request.url);
    const userName = searchParams.get("userName");
    console.log(userName);

    // userName이 있으면 user_id 기준으로 필터링, 없으면 전체
    const query = userName ? { user_id: userName } : {};

    const data = await mongoose.connection
      .collection("chatlogs")
      .find(query)
      .sort({ createdAt: 1 })
      .toArray();

    const memories = data.map((item, index) => {
      const doc = item.toObject ? item.toObject() : item;
      return {
        id: doc._id || index,
        title: doc.title || `Memory ${index + 1}`,
        content: doc.content || doc.message || JSON.stringify(doc, null, 2),
        tags: doc.tags || ["general"],
        category: doc.category || "notes",
        date: doc.createdAt
          ? new Date(doc.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        createdAt: doc.createdAt || new Date(),
      };
    });

    //console.log("📊 Fetched memories data:", memories);
    return NextResponse.json(memories.reverse());
  } catch (error) {
    console.error("❌ Error fetching memories data:", error);
    throw error;
  }
}

// ✅ /api/memories 경로의 GET 요청 처리
export async function GET(request: NextRequest) {
  try {
    // connectDB는 여기에서 처리
    await connectDB();
    return await getMemoriesData(request);
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// ✅ /api/memories 경로의 DELETE 요청 처리
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Memory ID is required' },
        { status: 400 }
      );
    }

    const result = await mongoose.connection
      .collection('chatlogs')
      .deleteOne({ _id: new mongoose.Types.ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Memory not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Successfully deleted memory with id: ${id}`);
    return NextResponse.json({
      message: 'Memory deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ DELETE API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}