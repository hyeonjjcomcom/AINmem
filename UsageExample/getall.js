import 'dotenv/config';
import { MongoDbFolStore } from 'fol-sdk';

async function getData() {
  console.log('🚀 FOL-SDK Basic Usage Example');
  console.log('================================');
  const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/fol-sdk';
  console.log('🔧 Setting up FOL-SDK components...');
  const store = new MongoDbFolStore(mongoUrl);
  try {
    await store.connect();
    console.log('✅ Connected to MongoDB successfully');
    const data = (await store.getAllFols()).facts;
    console.log(data);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

getData().catch(console.error);