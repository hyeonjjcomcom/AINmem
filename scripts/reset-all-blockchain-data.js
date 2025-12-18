// scripts/reset-all-blockchain-data.js
// ⚠️ DANGER: Deletes ALL data in ain_mem_1 - Use with extreme caution!

const Ain = require('@ainblockchain/ain-js').default;
require('dotenv').config();

async function resetAllData() {
  try {
    console.log('⚠️  [RESET] Starting complete data reset of ain_mem_1...');
    console.log('⚠️  [RESET] This will DELETE ALL DATA. Press Ctrl+C to cancel.\n');

    // Wait 3 seconds to allow user to cancel
    await new Promise(resolve => setTimeout(resolve, 3000));

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

    const path = '/apps/ain_mem_1';

    console.log(`🗑️  [RESET] Deleting all data at: ${path}`);
    console.log(`⏳ Processing transaction...\n`);

    // Set entire app data to null
    const result = await ain.db.ref(path).setValue({
      value: null,
      nonce: -1,
    });

    // Check result
    if (result && result.tx_hash && result.result && result.result.code === 0) {
      console.log('✅ [RESET] Complete!');
      console.log(`📝 Transaction Hash: ${result.tx_hash}`);
      console.log(`📂 Path: ${path}`);
      console.log(`\n🔗 View on explorer: https://testnet-insight.ainetwork.ai/transactions/${result.tx_hash}`);
    } else {
      const errorMsg = result?.result?.message || 'Reset failed';
      const code = result?.result?.code;
      console.error('❌ [RESET] Failed!');
      console.error('Code:', code);
      console.error('Message:', errorMsg);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ [RESET] Error:', error.message);
    process.exit(1);
  }
}

// Run reset
resetAllData();
