require('dotenv').config();
const { MongoDbFolStore } = require('fol-sdk');
const express = require('express');
const { MongoClient } = require('mongodb'); //데이터 디스플레이 용도
const mongoose = require('mongoose');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');  // UUID 생성
const { encoding_for_model } = require('@dqbd/tiktoken'); // 백엔드용 tiktoken
const enc = encoding_for_model('gpt-4'); // 또는 'gpt-3.5-turbo'
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


app.set('view engine', 'ejs');

console.log('🔧 Setting up FOL-SDK components...', process.env.MONGODB_URI);

//몽고디비 연결
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB 연결됨"))
  .catch(err => console.error("MongoDB 연결 실패", err));

// 스키마 정의
const chatLogSchema = new mongoose.Schema({
  id: { type: String, required: true }, // UUID
  user_id: String,
  session_id: String,
  turn_number: Number,
  timestamp: { type: Date, default: Date.now },
  input_text: String,
  input_metadata: mongoose.Schema.Types.Mixed,
  input_type: String,
  model_response: String,
  response_type: String,
  model_version: String,
  latency: Number,
  is_successful: Boolean,
  error_message: String,
  feedback: String,
  tags: [String],
  tokens_input: Number,
  tokens_output: Number
});

const ChatLog = mongoose.model('ChatLog', chatLogSchema);

const testSchema = new mongoose.Schema({
  input_text: String
});

app.post('/log', async (req, res) => {
  try {
    const data = req.body;

    const { user_id, timestamp, session_id, input_text } = data;
    if (!user_id || !timestamp || !input_text) {
      return res.status(400).json({ status: 'error', error: '필수 필드 누락' });
    }

    // UUID 없으면 생성
    if (!data.id) {
      data.id = uuidv4();
    }

    // input_text 문자열화 + 토큰 수 계산
    const safeInputText = typeof input_text === 'string' ? input_text : String(input_text || '');
    const inputTokens = enc.encode(safeInputText);
    data.tokens_input = inputTokens.length;

        // 🔥 turn_number 설정
    const count = await ChatLog.countDocuments({ session_id: data.session_id });
    data.turn_number = count + 1;

    // 멱등성 판단 기준 (초 단위 timestamp 사용)
    const filter = {
      user_id,
      session_id,
      timestamp,
      input_text
    };

    const update = {
      ...data
    };

    const options = { upsert: true, new: true, setDefaultsOnInsert: true };

    const log = await ChatLog.findOneAndUpdate(filter, update, options);

    res.status(200).json({ status: 'ok', id: log.id });

  } catch (err) {
    console.error("❌ DB 저장 오류:", err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

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

app.get('/showdatas/:dbVer/:dbName/:collectionName', async (req, res) => {

  const { dbVer, dbName, collectionName } = req.params;

  const mongoUrl =
    dbVer === 'origin'
      ? 'mongodb://localhost:27017'  // 기존 URL
      : dbVer === 'new'
        ? process.env.MONGODB_URI // 새 URL
        : null;

  const client = new MongoClient(mongoUrl);
  
  try {
    await client.connect();


    let db;
    let collection;

    if (dbVer === 'origin') {
      db = client.db(dbName);
      collection = db.collection(collectionName);
    } else if (dbVer === 'new') {
      db = client.db(); // URL 내 기본 DB 사용
      collection = db.collection('fol-visualizer-test'); // 고정 컬렉션명
    }

    // 컬렉션에서 최대 100개 문서 조회 (필요 시 조절)
    const data = await collection.find({}).limit(100).toArray();

    if (data.length === 0) {
      return res.send(`<h2>데이터가 없습니다: ${dbName} / ${collectionName}</h2>`);
    }

    // 데이터의 키(컬럼명) 추출 (첫 번째 문서 기준)
    const columns = Object.keys(data[0]);

    res.render('showdatas', { columns, data, dbName, collectionName });

  } catch (err) {
    console.error(err);
    res.status(500).send('서버 오류가 발생했습니다.');
  } finally {
    await client.close();
  }
});

app.get('/memories', async (req, res) => {
  try {
    const data = await ChatLog.find({}).sort({ createdAt: 1 }); // 오래된 순으로 변경
    
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

    res.render('memoriesV1', {
      memories: JSON.stringify(memories.reverse()), // 프론트에서는 최신순으로 표시
      dbName: 'chatDB',
      collectionName: 'chatlogs'
    });
  } catch (error) {
    // error handling...
  }
});

app.get('/graph', async (req, res) => {
  
    try {

        res.render('graph', {});

    } catch (error) {
        // 오류가 발생하면 콘솔에 로그를 남기고 500 상태 코드를 응답합니다.
        console.error('Error rendering graph:', error);
        res.status(500).send('그래프를 렌더링하는 중 오류가 발생했습니다.');
    }
});

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

app.get('/facts', async (req, res) => {
  const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/fol-sdk';
  const store = new MongoDbFolStore(mongoUrl);
  try {
    const data = (await store.getAllFols()).facts;
    res.json(data);
  } catch (err) {
    console.error('❌ Error fetching facts:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

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

// ChatLog의 모든 input_text 값을 합쳐서 반환하는 API
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

app.listen(port, () => {
  console.log(`서버 실행 중: http://localhost:${port}`);
  console.log(`데이터 확인하기: http://localhost:${port}/showdatas/origin/chatDB/chatlogs`);
  console.log(`다른 디자인: http://localhost:${port}/memories`);
  console.log(`그래프: http://localhost:${port}/graph`);
  console.log(`Fol: http://localhost:${port}/showdatas/new/none/none`);
});

