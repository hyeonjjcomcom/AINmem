import 'dotenv/config';
import { FolBuilder, GeminiAdapter, MongoDbFolStore, createFolClient } from 'fol-sdk';

async function main() {
  console.log('🚀 FOL-SDK Basic Usage Example');
  console.log('================================');
  
  // 1. Setup components
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/fol-sdk';

  console.log('🔧 Setting up FOL-SDK components...');

  const llmAdapter = new GeminiAdapter(geminiApiKey);
  const store = new MongoDbFolStore(mongoUrl);
  const builder = new FolBuilder({ llm: llmAdapter });
  const client = createFolClient(builder, store);

  try {
    // 2. Connect to database
    await store.connect();
    console.log('✅ Connected to MongoDB successfully');

    // 3. Build and save knowledge from natural language
    const document = "사과는 빨갛다.";
    // const document = "John is a person. John likes pizza. Mary is also a person. Mary likes books.";
    
    console.log('\n📝 Converting natural language to FOL...');
    console.log(`Input: "${document}"`);
    const result = await client.buildAndSave(document);
    
    console.log('\n🎯 Generated FOL Knowledge:');
    console.log(`📦 Constants (${result.constants.length}):`);
    result.constants.forEach(c => console.log(`   - ${c.value}: ${c.description}`));
    
    console.log(`⚡ Predicates (${result.predicates.length}):`);
    result.predicates.forEach(p => console.log(`   - ${p.value}: ${p.description}`));
    
    console.log(`📋 Facts (${result.facts.length}):`);
    result.facts.forEach(f => console.log(`   - ${f.value}: ${f.description}`));

    // 4. Query the knowledge base
    console.log('\n🔍 Querying the knowledge base...');
    console.log('Query: "person"');
    const queryResult = await client.query('person');
    
    console.log('\n📊 Query Results:');
    console.log(`   Constants: ${queryResult.constants.length} found`);
    console.log(`   Predicates: ${queryResult.predicates.length} found`);
    console.log(`   Facts: ${queryResult.facts.length} found`);
    
    if (queryResult.facts.length > 0) {
      console.log('\n📝 Matching Facts:');
      queryResult.facts.forEach(f => console.log(`   - ${f.value}`));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // 5. Cleanup
    console.log('\n🔌 Disconnecting from MongoDB...');
    await store.disconnect();
    console.log('✅ Disconnected successfully');
    console.log('\n🎉 Basic usage example completed!');
  }
}

main().catch(console.error);