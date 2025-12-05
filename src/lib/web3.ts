// Web3 utility module for AIN Network integration
// Handles memory ID storage on AIN blockchain

interface AinClient {
  db: any;
  wallet: any;
}

interface AinCache {
  client: AinClient | null;
  promise: Promise<AinClient> | null;
}

// Global caching for Next.js development mode
declare global {
  var ainClient: AinCache | undefined;
}

let cached = global.ainClient;

if (!cached) {
  cached = global.ainClient = { client: null, promise: null };
}

/**
 * Initialize AIN.js client with service account credentials
 * Cached globally to avoid re-initialization
 */
async function initAinClient(): Promise<AinClient> {
  // Return cached instance if exists
  if (cached!.client) {
    return cached!.client;
  }

  // If already initializing, wait for it
  if (!cached!.promise) {
    cached!.promise = (async () => {
      try {
        // Dynamic import for server-side only
        const { default: Ain } = await import('@ainblockchain/ain-js');

        // Get credentials from environment variables
        const serviceAccountPrivateKey = process.env.SERVICE_ACCOUNT_PRIVATE_KEY;
        const ainNetworkEndpoint = process.env.AIN_NETWORK_ENDPOINT || 'https://testnet-api.ainetwork.ai';
        const ainEventEndpoint = process.env.AIN_EVENT_ENDPOINT || 'wss://testnet-event.ainetwork.ai';

        if (!serviceAccountPrivateKey) {
          throw new Error('SERVICE_ACCOUNT_PRIVATE_KEY environment variable is required');
        }

        // Initialize AIN client
        const ain = new Ain(ainNetworkEndpoint, ainEventEndpoint, 0);

        // Add service account
        const address = ain.wallet.addAndSetDefaultAccount(serviceAccountPrivateKey);

        console.log('✅ AIN Network client initialized with service account:', address);

        return ain;
      } catch (error) {
        console.error('❌ Failed to initialize AIN client:', error);
        throw error;
      }
    })();
  }

  try {
    cached!.client = await cached!.promise;
    return cached!.client;
  } catch (error) {
    cached!.promise = null;
    throw error;
  }
}

/**
 * Save memory ObjectId to user's Web3 storage
 * Path: /apps/ain_mem_1/messages/{userAddress}/msg_{timestamp}
 *
 * @param userAddress - User's wallet address
 * @param memoryId - MongoDB ObjectId to store
 * @returns Transaction hash and timestamp key
 */
export async function saveMemoryId(
  userAddress: string,
  memoryId: string
): Promise<{ success: boolean; txHash?: string; key?: string; error?: string }> {
  try {
    // Validate inputs
    if (!userAddress || !memoryId) {
      throw new Error('userAddress and memoryId are required');
    }

    // Validate Ethereum address format (basic check)
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      throw new Error('Invalid Ethereum address format');
    }

    const ain = await initAinClient();

    // Generate unique key using timestamp
    const timestamp = Date.now();
    const key = `msg_${timestamp}`;

    // Construct path: /apps/ain_mem_1/messages/{userAddress}/{key}
    const appName = 'ain_mem_1';
    const path = `/apps/${appName}/messages/${userAddress}/${key}`;

    // Store only the MongoDB _id (timestamp available in MongoDB's createdAt)
    const value = memoryId;

    console.log(`📝 Saving memory to Web3: ${path} = ${value}`);

    // Write to AIN Network
    const result = await ain.db.ref(path).setValue({
      value,
      nonce: -1 // Let AIN handle nonce
    });

    if (result && result.tx_hash) {
      console.log(`✅ Memory saved to Web3: txHash=${result.tx_hash}`);
      return {
        success: true,
        txHash: result.tx_hash,
        key
      };
    } else {
      throw new Error('Transaction failed or no tx_hash returned');
    }
  } catch (error: any) {
    console.error('❌ Web3 save failed:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
}

/**
 * Fetch all memory ObjectIds for a user from Web3
 * Path: /apps/ain_mem_1/messages/{userAddress}
 *
 * @param userAddress - User's wallet address
 * @returns Array of MongoDB ObjectIds
 */
export async function getMemoryIds(userAddress: string): Promise<string[]> {
  try {
    // Validate input
    if (!userAddress) {
      throw new Error('userAddress is required');
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      throw new Error('Invalid Ethereum address format');
    }

    const ain = await initAinClient();

    // Construct path
    const appName = 'ain_mem_1';
    const path = `/apps/${appName}/messages/${userAddress}`;

    console.log(`🔍 Fetching memory IDs from Web3: ${path}`);

    // Fetch from AIN Network
    const data = await ain.db.ref(path).getValue();

    // If no data exists, return empty array
    if (!data || typeof data !== 'object') {
      console.log('📭 No memories found on Web3 for user:', userAddress);
      return [];
    }

    // Extract mongodb_id values (stored directly as strings)
    const memoryIds: string[] = [];
    for (const key in data) {
      const memoryId = data[key];
      // Handle both old format (object with mongodb_id) and new format (string)
      if (typeof memoryId === 'string') {
        memoryIds.push(memoryId);
      } else if (memoryId && memoryId.mongodb_id) {
        memoryIds.push(memoryId.mongodb_id);
      }
    }

    console.log(`✅ Found ${memoryIds.length} memory IDs on Web3`);
    return memoryIds;
  } catch (error: any) {
    console.error('❌ Failed to fetch memory IDs from Web3:', error);
    // Return empty array on error to allow graceful degradation
    return [];
  }
}

/**
 * Async wrapper for saveMemoryId
 * Fire-and-forget pattern: logs errors but doesn't throw
 * Used for non-blocking Web3 saves
 *
 * @param userAddress - User's wallet address
 * @param memoryId - MongoDB ObjectId to store
 */
export async function saveMemoryToWeb3Async(
  userAddress: string,
  memoryId: string
): Promise<void> {
  console.log(`🔵 [Async] saveMemoryToWeb3Async CALLED: user=${userAddress}, id=${memoryId}`);

  try {
    console.log(`🔵 [Async] Calling saveMemoryId...`);
    const result = await saveMemoryId(userAddress, memoryId);
    console.log(`🔵 [Async] saveMemoryId returned:`, result);

    if (result.success) {
      console.log(`✅ [Async] Memory saved to Web3: user=${userAddress}, id=${memoryId}, txHash=${result.txHash}`);
    } else {
      console.error(`❌ [Async] Web3 save failed: user=${userAddress}, id=${memoryId}, error=${result.error}`);
    }
  } catch (error: any) {
    console.error(`❌ [Async] Unexpected error in Web3 save: user=${userAddress}, id=${memoryId}`, error);
    console.error(`❌ [Async] Error stack:`, error.stack);
    // Don't throw - this is fire-and-forget
  }

  console.log(`🔵 [Async] saveMemoryToWeb3Async COMPLETED`);
}
