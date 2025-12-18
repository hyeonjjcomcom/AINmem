// scripts/stake-ain.js
// Stake AIN tokens to ain_mem_1 app for increased data capacity

const Ain = require('@ainblockchain/ain-js').default;
require('dotenv').config();

async function stakeAIN() {
  try {
    // Initialize AIN client (testnet)
    const ain = new Ain(
      'https://testnet-api.ainetwork.ai',
      'wss://testnet-event.ainetwork.ai',
      0
    );

    // Get private key from environment variable
    const privateKey = process.env.SERVICE_ACCOUNT_PRIVATE_KEY;

    if (!privateKey) {
      throw new Error('SERVICE_ACCOUNT_PRIVATE_KEY not found in environment variables');
    }

    // Add account
    const address = ain.wallet.addAndSetDefaultAccount(privateKey);
    console.log(`🔑 Using account: ${address}`);

    // App configuration
    const appName = 'ain_mem_1';
    const stakeAmount = 1000; // 1000 test AIN

    console.log(`\n📊 Staking ${stakeAmount} AIN to app: ${appName}`);
    console.log(`⏳ Processing transaction...\n`);

    // Stake AIN to the app
    const stakePath = `/staking/${appName}/${address}/0/stake/${Date.now()}/value`;

    const result = await ain.db.ref(stakePath).setValue({
      value: stakeAmount,
      nonce: -1,
    });

    // Check result
    if (result && result.tx_hash && result.result && result.result.code === 0) {
      console.log('✅ Staking successful!');
      console.log(`📝 Transaction Hash: ${result.tx_hash}`);
      console.log(`💰 Staked Amount: ${stakeAmount} AIN`);
      console.log(`🎯 App Name: ${appName}`);
      console.log(`👤 Account: ${address}`);
      console.log(`\n🔗 View on explorer: https://testnet-insight.ainetwork.ai/transactions/${result.tx_hash}`);
    } else {
      console.error('❌ Staking failed!');
      console.error('Code:', result?.result?.code);
      console.error('Message:', result?.result?.message);
    }

  } catch (error) {
    console.error('❌ Error during staking:', error.message);
    process.exit(1);
  }
}

// Run staking
stakeAIN();
