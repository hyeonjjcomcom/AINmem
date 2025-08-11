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

  const document = "과일 사과의 재배 품종 중 하나. 정식 명칭은 쓰가루(つがる). 일본의 아오모리 사과 시험장에서 골든 딜리셔스 품종에 홍옥을 교배하여 만든 품종으로, 처음에는 아오리 2호(あおり2号)라는 임시 명칭을 붙였으나, 1975년에 쓰가루로 최종 등록 하였다. 교배 당시에는 라벨을 잃어버리는 사고로 교배시킨 품종이 홍옥인 줄을 몰랐으나, 유전자 검사로 사실을 확인하였다. 대한민국에서는 최종 등록 전에 임시 명칭으로 불리던 1973년에 처음 도입하여 1976년에 선발하였기에 쓰가루보다는 아오리로 더 유명하다.";


  const result = await client.buildAndSave(document);

  console.log('✅ Document built and saved successfully.');
}

main().catch(console.error);