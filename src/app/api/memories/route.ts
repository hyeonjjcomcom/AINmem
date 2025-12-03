// app/api/memories/route.ts

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';

async function getMemoriesData(request: NextRequest) {
  try {
    // 쿼리 파라미터에서 userName, ids 추출
    const { searchParams } = new URL(request.url);
    const userName = searchParams.get("userName");
    const idsParam = searchParams.get("ids"); // Comma-separated ObjectIds
    console.log("Fetching memories - userName:", userName, "ids:", idsParam);

    // 쿼리 구성
    let query: any = {};

    // ids 파라미터가 있으면 특정 ObjectIds로 필터링
    if (idsParam) {
      const ids = idsParam.split(',').map(id => id.trim()).filter(id => id);
      // ObjectId 형식으로 변환
      const objectIds = ids.map(id => {
        try {
          return new mongoose.Types.ObjectId(id);
        } catch (e) {
          console.warn(`Invalid ObjectId: ${id}`);
          return null;
        }
      }).filter(id => id !== null);

      query._id = { $in: objectIds };
    }

    // userName이 있으면 user_id 기준으로도 필터링
    if (userName) {
      query.user_id = userName;
    }

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

// DELETE 메서드는 /api/memories/[memoryId]/route.ts로 이동되었습니다