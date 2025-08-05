import { MongoClient } from 'mongodb';

const MONGODB_URI=process.env.MONGODB_URI

const client = new MongoClient(MONGODB_URI);

async function fetchData() {
  try {
    await client.connect();

    const db = client.db('fol-visualizer-test'); // URI에서 DB명 이미 포함됨
    const collection = db.collection('constants'); // 컬렉션명은 필요에 따라 변경

    const data = await collection.find({}).limit(100).toArray();

    if (data.length === 0) {
      console.log('📭 데이터가 없습니다.');
    } else {
      console.log('📦 가져온 문서:', data);
    }

  } catch (err) {
    console.error('❌ 오류 발생:', err);
  } finally {
    await client.close();
  }
}

fetchData();
