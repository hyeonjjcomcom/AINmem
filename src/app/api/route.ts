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

// MongoDB 연결 함수
async function connectMongo() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("MongoDB 연결됨");
  }
}

// 메모리 저장소 (실제로는 Redis 사용 권장)
const nonces: { [key: string]: string } = {};

export async function GET(request: NextRequest) {
  const { searchParams, pathname } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  
  try {
    await connectMongo();

    switch (endpoint) {
      case 'memories':
        return await getMemoriesData();
      
      case 'memoriesDocument':
        return await getMemoriesDocument();
      
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
    await connectMongo();
    const body = await request.json();

    switch (endpoint) {
      case 'buildFols':
        return await buildFols(body);
      
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
    await connectMongo();

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
async function getMemoriesData() {
  try {
    const data = await mongoose.connection
      .collection('chatlogs')
      .find({})
      .sort({ createdAt: 1 })
      .toArray();
    
    const memories = data.map((item, index) => {
      const doc = item.toObject ? item.toObject() : item;
      return {
        id: doc._id || index,
        title: doc.title || `Memory ${index + 1}`,
        content: doc.content || doc.message || JSON.stringify(doc, null, 2),
        tags: doc.tags || ['general'],
        category: doc.category || 'notes',
        date: doc.createdAt ? new Date(doc.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        createdAt: doc.createdAt || new Date()
      };
    });
    
    console.log('📊 Fetched memories data:', memories);
    return NextResponse.json(memories.reverse());
  } catch (error) {
    console.error('❌ Error fetching memories data:', error);
    throw error;
  }
}

async function getMemoriesDocument() {
  try {
    let document = "";
    const data = await mongoose.connection.collection('chatlogs').find({}).toArray();
    
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
    const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/fol-sdk';
    const store = new MongoDbFolStore(mongoUrl);
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
    const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/fol-sdk';
    const store = new MongoDbFolStore(mongoUrl);
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
    const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/fol-sdk';
    const store = new MongoDbFolStore(mongoUrl);
    const data = (await store.getAllFols()).predicates;
    
    console.log('📊 Fetched predicates data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching predicates:', error);
    throw error;
  }
}

async function buildFols(body: { document: string }) {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/fol-sdk';

    console.log('🔧 Setting up FOL-SDK components...');

    const llmAdapter = new GeminiAdapter(geminiApiKey!);
    const store = new MongoDbFolStore(mongoUrl);
    const builder = new FolBuilder({ llm: llmAdapter });
    const client = createFolClient(builder, store);

    console.log('📥 Received request body:', body.document);

    const result = await client.buildAndSave(body.document);
    console.log('✅ Document built and saved successfully.');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Document built and saved successfully' 
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