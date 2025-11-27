import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { ethers } from 'ethers';
import crypto from 'crypto';
import {
  FolBuilder,
  GeminiAdapter,
  MongoDbFolStore,
  createFolClient
} from 'fol-sdk';
import connectDB from '@/lib/mongodb';
import { getFolStore, nonces } from '@/lib/folStore';
import { use } from 'react';

export async function GET(request: NextRequest) {
  const { searchParams, pathname } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  
  try {
    await connectDB;

    switch (endpoint) {
      case 'memories':
        return await getMemoriesData(request); // ✅ userName만 넘김
      
      case 'memoriesDocument': {
        const user_id = searchParams.get('user_id');
        return await getMemoriesDocument(user_id);
      }
      
      case 'constants':
        return await getConstants();
      
      case 'facts':
        return await getFacts();
      
      case 'predicates':
        return await getPredicates();
      
      default:
        return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  
  try {
    await connectDB();
    const body = await request.json();
    console.log('📥 POST request body:', body);
    switch (endpoint) {
      case 'buildFols':
        return await buildFols(body, body.user_id); // ✅ user_id 추가
      
      case 'login':
        return await loginWithSignature(body);
      
      case 'nonce':
        return await getNonce(body);
      
      default:
        return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ POST API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  
  try {
    await connectDB();

    switch (endpoint) {
      case 'facts':
        return await deleteFacts();
      
      case 'constants':
        return await deleteConstants();
      
      case 'predicates':
        return await deletePredicates();
      
      default:
        return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ DELETE API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

// API 함수들
async function getMemoriesData(request: Request) {
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

    console.log("📊 Fetched memories data:", memories);
    return NextResponse.json(memories.reverse());
  } catch (error) {
    console.error("❌ Error fetching memories data:", error);
    throw error;
  }
}


async function getMemoriesDocument(user_id:any) {
  try {
    let document = "";

    // user_id 조건 + build_at이 없는 메모리만 가져오기 (incremental build)
    const data = await mongoose.connection.collection('chatlogs').find({
      user_id: user_id,
      build_at: { $exists: false }
    }).toArray();
    
    for (const item of data) {
      document += item.input_text + " ";
    }
    
    console.log('Complete generation document:', document);
    return new NextResponse(document, {
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    console.error('❌ Error fetching memories document data:', error);
    throw error;
  }
}

async function getConstants() {
  try {
    // ✅ 재사용 가능한 FolStore 인스턴스 사용
    const store = getFolStore();
    const data = (await store.getAllFols()).constants;
    
    console.log('📊 Fetched constants data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching constants:', error);
    throw error;
  }
}

async function getFacts() {
  try {
    // ✅ 재사용 가능한 FolStore 인스턴스 사용
    const store = getFolStore();
    const data = (await store.getAllFols()).facts;
    
    console.log('📊 Fetched facts data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching facts:', error);
    throw error;
  }
}

async function getPredicates() {
  try {
    // ✅ 재사용 가능한 FolStore 인스턴스 사용
    const store = getFolStore();
    const data = (await store.getAllFols()).predicates;
    
    console.log('📊 Fetched predicates data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching predicates:', error);
    throw error;
  }
}

async function buildFols(body: { document: string }, user_id: string) {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;

    console.log('🔧 Setting up FOL-SDK components...');

    const llmAdapter = new GeminiAdapter(geminiApiKey!);
    // ✅ 재사용 가능한 FolStore 인스턴스 사용
    const store = getFolStore();
    const builder = new FolBuilder({ llm: llmAdapter });
    const client = createFolClient(builder, store);

    console.log('📥 User ID:', user_id);

    await client.buildAndSave(body.document, user_id);
    console.log('✅ Document built and saved successfully.');

    // ✅ 빌드 성공 후 build_at 타임스탬프 업데이트 (incremental build)
    const updateResult = await mongoose.connection.collection('chatlogs').updateMany(
      { user_id: user_id, build_at: { $exists: false } },
      { $set: { build_at: new Date() } }
    );
    console.log(`✅ Updated build_at for ${updateResult.modifiedCount} memories`);

    return NextResponse.json({
      success: true,
      message: 'Document built and saved successfully',
      updatedMemories: updateResult.modifiedCount
    });
  } catch (error: any) {
    console.error('❌ Error building and saving document:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function deleteFacts() {
  try {
    console.log('🗑️ Deleting all facts...');
    const result = await mongoose.connection.collection('facts').deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} facts`);
    return NextResponse.json({
      message: 'All facts deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Error deleting facts:', error);
    throw error;
  }
}

async function deleteConstants() {
  try {
    console.log('🗑️ Deleting all constants...');
    const result = await mongoose.connection.collection('constants').deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} constants`);
    return NextResponse.json({
      message: 'All constants deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Error deleting constants:', error);
    throw error;
  }
}

async function deletePredicates() {
  try {
    console.log('🗑️ Deleting all predicates...');
    const result = await mongoose.connection.collection('predicates').deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} predicates`);
    return NextResponse.json({
      message: 'All predicates deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Error deleting predicates:', error);
    throw error;
  }
}

async function getNonce(body: { address: string }) {
  try {
    const { address } = body;
    const nonce = crypto.randomBytes(16).toString("hex");
    nonces[address.toLowerCase()] = nonce;
    
    return NextResponse.json({ nonce });
  } catch (error) {
    console.error('❌ Error generating nonce:', error);
    return NextResponse.json(
      { error: 'Failed to generate nonce' }, 
      { status: 500 }
    );
  }
}

async function loginWithSignature(body: { address: string; signature: string }) {
  try {
    const { address, signature } = body;
    const nonce = nonces[address.toLowerCase()];
    
    if (!nonce) {
      return NextResponse.json(
        { error: "No nonce" }, 
        { status: 400 }
      );
    }

    const recovered = ethers.verifyMessage(nonce, signature);
    
    if (recovered.toLowerCase() === address.toLowerCase()) {
      delete nonces[address.toLowerCase()];
      return NextResponse.json({ success: true, address });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid signature" }, 
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('❌ Login error:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 400 }
    );
  }
}