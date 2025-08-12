require('dotenv/config');
const {
  FolBuilder,
  GeminiAdapter,
  MongoDbFolStore,
  createFolClient
} = require('fol-sdk');

async function main() {
  console.log('🚀 FOL-SDK Basic Usage Example');
  console.log('================================');

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/fol-sdk';

  console.log('🔧 Setting up FOL-SDK components...');

  const llmAdapter = new GeminiAdapter(geminiApiKey);
  const store = new MongoDbFolStore(mongoUrl);
  const builder = new FolBuilder({ llm: llmAdapter });
  const client = createFolClient(builder, store);

  const document = "호 호 안녕하세요 좋은 아침입니다 아니야. 공개됐어";


  const result = await client.buildAndSave(document);

  console.log('✅ Document built and saved successfully.');
}

main().catch(console.error);