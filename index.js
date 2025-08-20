//ain 정의부
const Ain = require('@ainblockchain/ain-js').default;
const { AinWalletSigner } = require('@ainblockchain/ain-js/lib/signer/ain-wallet-signer');
const ain = new Ain('https://testnet-api.ainetwork.ai', 'wss://testnet-event.ainetwork.ai', 0);


require('dotenv').config();
const {
  FolBuilder,
  GeminiAdapter,
  MongoDbFolStore,
  createFolClient
} = require('fol-sdk');
const express = require('express');
const { MongoClient } = require('mongodb'); //데이터 디스플레이 용도
const mongoose = require('mongoose');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');  // UUID 생성
const { encoding_for_model } = require('@dqbd/tiktoken'); // 백엔드용 tiktoken
const enc = encoding_for_model('gpt-4'); // 또는 'gpt-3.5-turbo'
const path = require('path');
//for login
const { ethers } = require("ethers");
const crypto = require("crypto");

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

//몽고디비 연결
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB 연결됨"))
  .catch(err => console.error("MongoDB 연결 실패", err));

// log-count 라우트 추가
app.get('/log-count/:session_id', async (req, res) => {
  const { session_id } = req.params;

  try {
    const count = await ChatLog.countDocuments({ session_id });
    res.json({ count });
  } catch (err) {
    console.error("카운트 조회 오류:", err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

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
        title: doc.title || `Memory ${index + 1}`, // 이제 순서대로 붙음
        content: doc.content || doc.message || JSON.stringify(doc, null, 2),
        tags: doc.tags || ['general'],
        category: doc.category || 'notes',
        date: doc.createdAt ? new Date(doc.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        createdAt: doc.createdAt || new Date()
      };
    });
    res.render('memories', {
      memories: JSON.stringify(memories.reverse()), // 프론트에서는 최신순으로 표시
      dbName: 'chatDB',
      collectionName: 'chatlogs'
    });
  } catch (error) {
    // error handling...
  }
});

// Graph 라우트
app.get('/graph', async (req, res) => {
    try {
        res.render('graph', {});
    } catch (error) {
        // 오류가 발생하면 콘솔에 로그를 남기고 500 상태 코드를 응답합니다.
        console.error('Error rendering graph:', error);
        res.status(500).send('그래프를 렌더링하는 중 오류가 발생했습니다.');
    }
});

// Request 라우트
app.get('/request', async (req, res) => {
    try {
        res.render('request', {});
    } catch (error) {
        // 오류가 발생하면 콘솔에 로그를 남기고 500 상태 코드를 응답합니다.
        console.error('Error rendering request:', error);
        res.status(500).send('리퀘스트를 렌더링하는 중 오류가 발생했습니다.');
    }
});

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

app.get('/memoriesDocument', async (req, res) => {
  //완결된 문장인지, 확인하는 로직 필요. 이용자는 실수로 완결되지 않은 문장이나, fol을 구성하기 어려운 문장을 입력할 수 있음.
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

// Constants Get API with MongoDbFolStore
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

// Facts Get API with MongoDbFolStore
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

// Predicates Get API with MongoDbFolStore
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

// 1. Facts 삭제 API
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

// 2. Constants 삭제 API
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

// 3. Predicates 삭제 API
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

// ChatLog의 모든 input_text 값을 합쳐서 document로 반환하는 API
app.get('/chatlogs/input-text', async (req, res) => {
  try {
    // 모든 ChatLog 문서에서 input_text 필드만 조회 (성능 최적화)
    const chatlogs = await ChatLog.find({}, 'input_text').sort({ timestamp: 1 });
    
    // input_text 값들을 배열로 추출
    const inputTexts = chatlogs
      .map(log => log.input_text)
      .filter(text => text && text.trim()) // null, undefined, 빈 문자열 제외
      .map(text => text.trim()); // 앞뒤 공백 제거
    
    // 모든 input_text를 하나의 문자열로 합치기 (줄바꿈으로 구분)
    const combinedText = inputTexts.join('\n');
    
    console.log(`📊 Found ${inputTexts.length} input_text entries, combined length: ${combinedText.length} characters`);
    
    res.status(200).json({
      status: 'success',
      count: inputTexts.length,
      combined_text: combinedText,
      individual_texts: inputTexts // 개별 텍스트도 배열로 제공
    });
    
  } catch (err) {
    console.error('❌ Error fetching input_text from chatlogs:', err);
    res.status(500).json({ 
      status: 'error', 
      error: err.message 
    });
  }
});

// --
app.get("/api/getAddress", (req, res) => {
  const returnMsg = ain.signer.signMessage("d97wfbef8vs0age943sdva3rg4x","0xF15C53fD6B5A997d719eb421b88BcB2921ddEaA2");
  res.json({ address: returnMsg });

  /*const { address } = req.params;
  const nonce = crypto.randomBytes(16).toString("hex");
  nonces[address.toLowerCase()] = nonce;
  res.json({ nonce });*/
});

// 2. 클라이언트가 서명해서 보낸 값 검증
app.post("/api/login", (req, res) => {
  const { address, signature } = req.body;
  const nonce = nonces[address.toLowerCase()];
  if (!nonce) return res.status(400).json({ error: "No nonce" });

  try {
    const recovered = ethers.verifyMessage(nonce, signature);
    if (recovered.toLowerCase() === address.toLowerCase()) {
      // 로그인 성공
      delete nonces[address.toLowerCase()]; // 재사용 방지
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

