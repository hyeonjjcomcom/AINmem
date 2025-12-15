// app/api/memories/route.ts

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';

async function getMemoriesData(
  userName?: string,
  validIds?: mongoose.Types.ObjectId[]
) {
  console.log("Fetching memories - userName:", userName, "ids:", validIds);

  // 쿼리 구성
  let query: any = {};

  // validIds가 있으면 특정 ObjectIds로 필터링
  if (validIds && validIds.length > 0) {
    query._id = { $in: validIds };
  }

  // userName이 있으면 user_id 기준으로도 필터링
  if (userName) {
    query.user_id = userName;
  }

  const data = await mongoose.connection
    .collection("chatlogs")
    .find(query)
    .sort({ createdAt: -1 })
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
      session_id: doc.session_id,
      model_version: doc.model_version,
      tokens_input: doc.tokens_input,
      user_id: doc.user_id,
    };
  });

  return memories;
}

// ✅ /api/memories 경로의 GET 요청 처리
export async function GET(request: NextRequest) {
  try {
    // connectDB는 여기에서 처리
    await connectDB();

    // 1️⃣ Query param 파싱
    const { searchParams } = new URL(request.url);
    const userName = searchParams.get("userName");
    const idsParam = searchParams.get("ids"); // Comma-separated ObjectIds

    // 2️⃣ ObjectId 타입 변환
    const validIds = idsParam
      ?.split(',')
      .map(id => id.trim())
      .filter(id => id)
      .map(id => new mongoose.Types.ObjectId(id));

    // 3️⃣ 파라미터 전달
    const memories = await getMemoriesData(userName || undefined, validIds);

    // 4️⃣ Response 생성
    return NextResponse.json(memories);
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}