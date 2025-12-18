// scripts/get-all-blockchain-data.js
// Fetch all data from ain_mem_1 blockchain app for debugging

const Ain = require('@ainblockchain/ain-js').default;
require('dotenv').config();

async function getAllBlockchainData() {
  try {
    const serviceAccountPrivateKey = process.env.SERVICE_ACCOUNT_PRIVATE_KEY;
    const ainNetworkEndpoint = process.env.AIN_NETWORK_ENDPOINT || 'https://testnet-api.ainetwork.ai';
    const ainEventEndpoint = process.env.AIN_EVENT_ENDPOINT || 'wss://testnet-event.ainetwork.ai';

    if (!serviceAccountPrivateKey) {
      throw new Error('SERVICE_ACCOUNT_PRIVATE_KEY not configured in .env');
    }

    // Initialize AIN client
    const ain = new Ain(ainNetworkEndpoint, ainEventEndpoint, 0);
    const address = ain.wallet.addAndSetDefaultAccount(serviceAccountPrivateKey);
    console.log(`🔑 Using account: ${address}`);

    const appName = 'ain_mem_1';
    const path = `/apps/${appName}`;

    console.log(`\n🔍 Fetching ALL data from blockchain: ${path}`);
    console.log(`⏳ Please wait...\n`);

    // Fetch all data
    const data = await ain.db.ref(path).getValue();

    if (!data) {
      console.log('📭 No data found on blockchain');
      return;
    }

    // Pretty print the data
    console.log('✅ Blockchain data retrieved successfully:\n');
    console.log(JSON.stringify(data, null, 2));

    // Summary statistics
    console.log('\n📊 Summary:');
    if (data.wallets) {
      const walletAddresses = Object.keys(data.wallets);
      console.log(`   Total users: ${walletAddresses.length}`);

      let totalMemories = 0;
      walletAddresses.forEach(addr => {
        const memories = data.wallets[addr];
        const count = memories ? Object.keys(memories).length : 0;
        totalMemories += count;
        console.log(`   - ${addr}: ${count} memories`);
      });

      console.log(`   Total memories: ${totalMemories}`);
    }

  } catch (error) {
    console.error('❌ Error fetching blockchain data:', error.message);
    process.exit(1);
  }
}

// Run the script
getAllBlockchainData();