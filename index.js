import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ethers } from 'ethers';
import crypto from 'crypto';

import {
  FolBuilder,
  GeminiAdapter,
  MongoDbFolStore,
  createFolClient
} from 'fol-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 메모리 저장소 (실제로는 Redis나 MongoDB TTL 컬렉션 사용)
const nonces = {};

app.set('view engine', 'ejs');

console.log('🔧 Setting up FOL-SDK components...', process.env.MONGODB_URI);

// 몽고디비 연결
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB 연결됨"))
  .catch(err => console.error("MongoDB 연결 실패", err));

// Memories 라우트
app.get('/memories', async (req, res) => {
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
    res.render('memories', {
      memories: JSON.stringify(memories.reverse()),
      dbName: 'chatDB',
      collectionName: 'chatlogs'
    });
  } catch (error) {
    console.error('❌ Error rendering memories:', error);
    res.status(500).send('Memories 렌더링 오류');
  }
});

// Graph 라우트
app.get('/graph', async (req, res) => {
    try {
        res.render('graph', {});
    } catch (error) {
        console.error('Error rendering graph:', error);
        res.status(500).send('그래프를 렌더링하는 중 오류가 발생했습니다.');
    }
});

// Request 라우트
app.get('/request', async (req, res) => {
    try {
        res.render('request', {});
    } catch (error) {
        console.error('Error rendering request:', error);
        res.status(500).send('리퀘스트를 렌더링하는 중 오류가 발생했습니다.');
    }
});

//Rest APIs
// fol 빌드 API
app.post('/buildFols', async (req, res) => {
  try { 
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/fol-sdk';

    console.log('🔧 Setting up FOL-SDK components...');

    const llmAdapter = new GeminiAdapter(geminiApiKey);
    const store = new MongoDbFolStore(mongoUrl);
    const builder = new FolBuilder({ llm: llmAdapter });
    const client = createFolClient(builder, store);

    console.log('📥 Received request body:', req.body.document);

    const result = await client.buildAndSave(req.body.document);
    console.log('✅ Document built and saved successfully.');
    res.status(200).json({ success: true, message: 'Document built and saved successfully' });
  } catch (error) {
    console.error('❌ Error building and saving document:', error);
    res.status(500).json({ success: false, error: error.message });
  } 
});
// memories 데이터를 가져오는 API
app.get('/memoriesData', async (req, res) => {
  try {
    const data = await mongoose.connection.collection('chatlogs').find({}).toArray();
    res.json(data);
    console.log('📊 Fetched memories data:', data);
  } catch (error) {
    console.error('❌ Error fetching memories data:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
}); 
// Memories To Document API
app.get('/memoriesDocument', async (req, res) => {
  try {
    let document = "";
    const data = await mongoose.connection.collection('chatlogs').find({}).toArray();
    for (const item of data){
      document += item.input_text + " ";
    }
    res.json(document);
    console.log('Complete generation document:', document);
  } catch (error) {
    console.error('❌ Error fetching memories document data:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});        
// Constants Get API
app.get('/constants', async (req, res) => {
  const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/fol-sdk';
  const store = new MongoDbFolStore(mongoUrl);
  try {
    const data = (await store.getAllFols()).constants;
    res.json(data);
    console.log('📊 Fetched constants data:', data);
  } catch (err) {
    console.error('❌ Error fetching constants:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});
// Facts Get API
app.get('/facts', async (req, res) => {
  const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/fol-sdk';
  const store = new MongoDbFolStore(mongoUrl);
  try {
    const data = (await store.getAllFols()).facts;
    console.log('📊 Fetched facts data:', data);
    res.json(data);
  } catch (err) {
    console.error('❌ Error fetching facts:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});
// Predicates Get API
app.get('/predicates', async (req, res) => {
  const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/fol-sdk';
  const store = new MongoDbFolStore(mongoUrl);
  try {
    const data = (await store.getAllFols()).predicates;
    res.json(data);
    console.log('📊 Fetched predicates data:', data)
  } catch (err) {
    console.error('❌ Error fetching predicates:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});
// Facts 삭제 API
app.delete('/facts', async (req, res) => {
  console.log('🗑️ Deleting all facts...');
  try {
    const result = await mongoose.connection.collection('facts').deleteMany({});
    res.status(200).json({
      message: 'All facts deleted successfully',
      deletedCount: result.deletedCount
    });
    console.log(`✅ Successfully deleted ${result.deletedCount} facts`);
  } catch (error) {
    console.error('❌ Error deleting facts:', error);
    res.status(500).json({ error: 'Failed to delete facts' });
  }
});
// Constants 삭제 API
app.delete('/constants', async (req, res) => {
  console.log('🗑️ Deleting all constants...');
  try {
    const result = await mongoose.connection.collection('constants').deleteMany({});
    res.status(200).json({
      message: 'All constants deleted successfully',
      deletedCount: result.deletedCount
    });
    console.log(`✅ Successfully deleted ${result.deletedCount} constants`);
  } catch (error) {
    console.error('❌ Error deleting constants:', error);
    res.status(500).json({ error: 'Failed to delete constants' });
  }
});
// Predicates 삭제 API
app.delete('/predicates', async (req, res) => {
  console.log('🗑️ Deleting all predicates...');
  try {
    const result = await mongoose.connection.collection('predicates').deleteMany({});
    res.status(200).json({
      message: 'All predicates deleted successfully',
      deletedCount: result.deletedCount
    });
    console.log(`✅ Successfully deleted ${result.deletedCount} predicates`);
  } catch (error) {
    console.error('❌ Error deleting predicates:', error);
    res.status(500).json({ error: 'Failed to delete predicates' });
  }
});

// 이하 개발 필요
// Nonce 발급
app.get("/api/nonce/:address", (req, res) => {
  const { address } = req.params;
  const nonce = crypto.randomBytes(16).toString("hex");
  nonces[address.toLowerCase()] = nonce;
  res.json({ nonce });
});

// 로그인 서명 검증
app.post("/api/login", (req, res) => {
  const { address, signature } = req.body;
  const nonce = nonces[address.toLowerCase()];
  if (!nonce) return res.status(400).json({ error: "No nonce" });

  try {
    const recovered = ethers.verifyMessage(nonce, signature);
    if (recovered.toLowerCase() === address.toLowerCase()) {
      delete nonces[address.toLowerCase()];
      res.json({ success: true, address });
    } else {
      res.status(401).json({ success: false, error: "Invalid signature" });
    }
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.listen(port, () => {
  console.log(`서버 실행 중: http://localhost:${port}`);
  console.log(`다른 디자인: http://localhost:${port}/memories`);
  console.log(`그래프: http://localhost:${port}/graph`);
});