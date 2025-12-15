// Web3 utility module for AIN Network integration
// Handles memory ID storage on AIN blockchain

import {
  Web3Error,
  Web3TransactionError,
  Web3NetworkError,
  Web3ValidationError
} from '@/errors/web3Errors';

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
 * Timeout wrapper for promises
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

/**
 * Save memory ObjectId to user's Web3 storage with retry logic and idempotency
 * Path: /apps/ain_mem_1/wallets/{userAddress}/{memoryId}
 *
 * Idempotent: If memory already exists, returns without creating new transaction
 *
 * @param userAddress - User's wallet address
 * @param memoryId - MongoDB ObjectId to store (used as key)
 * @param retries - Number of retry attempts (default: 2)
 * @returns Object with txHash and alreadyExists flag
 * @throws {Web3ValidationError} When input validation fails
 * @throws {Web3TransactionError} When blockchain transaction fails
 * @throws {Web3NetworkError} When network/timeout occurs
 */
export async function saveMemoryId(
  userAddress: string,
  memoryId: string,
  retries: number = 2
): Promise<{ txHash: string; alreadyExists: boolean }> {
  // Validate inputs
  if (!userAddress || !memoryId) {
    throw new Web3ValidationError('userAddress and memoryId are required');
  }

  // Validate Ethereum address format (basic check)
  if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
    throw new Web3ValidationError('Invalid Ethereum address format', 'userAddress');
  }

  const ain = await initAinClient();

  // Construct path: /apps/ain_mem_1/wallets/{userAddress}/{memoryId}
  const appName = 'ain_mem_1';
  const path = `/apps/${appName}/wallets/${userAddress}/${memoryId}`;

  console.log(`📝 Saving memory to Web3: ${path}`);

  // 🔍 Check if memory already exists (idempotency)
  try {
    const existingValue = await ain.db.ref(path).getValue();
    if (existingValue && existingValue.value === 1) {
      console.log(`ℹ️  Memory already exists, skipping transaction: ${path}`);
      return {
        txHash: 'already-exists',
        alreadyExists: true
      };
    }
  } catch (checkError) {
    console.warn(`⚠️  Could not check existing value, proceeding with save: ${checkError}`);
    // Continue with save if check fails
  }

  // Retry loop with exponential backoff
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt + 1}/${retries + 1} to save to AIN Network`);

      // Write to AIN Network with 60 second timeout
      // Use minimal value (1) to save space - the key itself is the memoryId
      const result: any = await withTimeout(
        ain.db.ref(path).setValue({
          value: 1,
          nonce: -1,
        }),
        60000 // 60 second timeout (blockchain transactions can be slow)
      );

      // Check if transaction was successful (code: 0 means success)
      if (result && result.tx_hash && result.result && result.result.code === 0) {
        console.log(`✅ Memory saved to Web3: txHash=${result.tx_hash} (attempt ${attempt + 1})`);
        return {
          txHash: result.tx_hash,
          alreadyExists: false
        };
      } else {
        const errorMsg = result?.result?.message || 'Transaction failed';
        const code = result?.result?.code || -1;
        console.error(`❌ Transaction failed: code=${code}, message=${errorMsg}`);
        throw new Web3TransactionError(errorMsg, code, result?.tx_hash);
      }
    } catch (attemptError: any) {
      console.error(`❌ Attempt ${attempt + 1} failed:`, attemptError.message);

      // If this was the last retry, throw the appropriate error
      if (attempt === retries) {
        // Re-throw if it's already our custom error
        if (attemptError instanceof Web3Error) {
          throw attemptError;
        }

        // Timeout errors
        if (attemptError.message?.includes('Timeout')) {
          throw new Web3NetworkError(`Network timeout after ${retries + 1} attempts`, attemptError);
        }

        // Generic network errors
        throw new Web3NetworkError(`Network error after ${retries + 1} attempts: ${attemptError.message}`, attemptError);
      }

      // Exponential backoff: wait 1s, 2s, 4s, etc.
      const backoffMs = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Waiting ${backoffMs}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }

  // This should never be reached due to the throw in the last retry
  throw new Web3NetworkError('All retry attempts failed');
}

/**
 * Fetch all memory ObjectIds for a user from Web3
 * Path: /apps/ain_mem_1/wallets/{userAddress}
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
    const path = `/apps/${appName}/wallets/${userAddress}`;

    console.log(`🔍 Fetching memory IDs from Web3: ${path}`);

    // Fetch from AIN Network
    const data = await ain.db.ref(path).getValue();

    // If no data exists, return empty array
    if (!data || typeof data !== 'object') {
      console.log('📭 No memories found on Web3 for user:', userAddress);
      return [];
    }

    // Keys are the memoryIds themselves
    const memoryIds = Object.keys(data);

    console.log(`✅ Found ${memoryIds.length} memory IDs on Web3`);
    return memoryIds;
  } catch (error: any) {
    console.error('❌ Failed to fetch memory IDs from Web3:', error);
    // Return empty array on error to allow graceful degradation
    return [];
  }
}

/**
 * Delete memory data from Web3 storage with retry logic
 * Path: /apps/ain_mem_1/wallets/{userAddress}/{memoryId}
 *
 * @param userAddress - User's wallet address
 * @param memoryId - MongoDB ObjectId to delete
 * @param retries - Number of retry attempts (default: 2)
 * @returns Transaction hash on success
 */
export async function deleteMemoryId(
  userAddress: string,
  memoryId: string,
  retries: number = 2
): Promise<string> {
  // Validate inputs
  if (!userAddress || !memoryId) {
    throw new Web3ValidationError('userAddress and memoryId are required');
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
    throw new Web3ValidationError('Invalid Ethereum address format', 'userAddress');
  }

  const ain = await initAinClient();

  // Construct path: /apps/ain_mem_1/wallets/{userAddress}/{memoryId}
  const appName = 'ain_mem_1';
  const path = `/apps/${appName}/wallets/${userAddress}/${memoryId}`;

  console.log(`🗑️ Deleting memory from Web3: ${path}`);

  // Retry loop with exponential backoff
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Delete attempt ${attempt + 1}/${retries + 1}`);

      // Delete from AIN Network by setting value to null
      const result: any = await withTimeout(
        ain.db.ref(path).setValue({
          value: null,
          nonce: -1,
        }),
        60000 // 60 second timeout
      );

      // Check if transaction was successful (code: 0 means success)
      if (result && result.tx_hash && result.result && result.result.code === 0) {
        console.log(`✅ Memory deleted from Web3: txHash=${result.tx_hash} (attempt ${attempt + 1})`);
        return result.tx_hash;
      } else {
        const errorMsg = result?.result?.message || 'Delete transaction failed';
        const code = result?.result?.code || -1;
        console.error(`❌ Delete failed: code=${code}, message=${errorMsg}`);
        throw new Web3TransactionError(errorMsg, code, result?.tx_hash);
      }
    } catch (attemptError: any) {
      console.error(`❌ Delete attempt ${attempt + 1} failed:`, attemptError.message);

      // If this was the last retry, throw the appropriate error
      if (attempt === retries) {
        // Re-throw if it's already our custom error
        if (attemptError instanceof Web3Error) {
          throw attemptError;
        }

        // Timeout errors
        if (attemptError.message?.includes('Timeout')) {
          throw new Web3NetworkError(`Network timeout after ${retries + 1} attempts`, attemptError);
        }

        // Generic network errors
        throw new Web3NetworkError(`Network error after ${retries + 1} attempts: ${attemptError.message}`, attemptError);
      }

      // Exponential backoff: wait 1s, 2s, 4s, etc.
      const backoffMs = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Waiting ${backoffMs}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }

  // This should never be reached due to the throw in the last retry
  throw new Web3NetworkError('All delete retry attempts failed');
}

/**
 * In-memory cache to prevent duplicate saves
 * Key: memoryId, Value: Promise<void> (ongoing save operation)
 */
const savingInProgress = new Map<string, Promise<void>>();

/**
 * In-memory cache to prevent duplicate deletes
 * Key: memoryId, Value: Promise<void> (ongoing delete operation)
 */
const deletingInProgress = new Map<string, Promise<void>>();

/**
 * Async wrapper for saveMemoryId with deduplication
 * Fire-and-forget pattern: logs errors but doesn't throw
 * Updates MongoDB with web3_key after successful save
 * Used for non-blocking Web3 saves
 *
 * @param userAddress - User's wallet address
 * @param memoryId - MongoDB ObjectId to store
 */
export async function saveMemoryToWeb3Async(
  userAddress: string,
  memoryId: string
): Promise<void> {
  // Check if this memory is already being saved (thread-safe check)
  const existingPromise = savingInProgress.get(memoryId);
  if (existingPromise) {
    console.log(`⏭️ [Async] Memory ${memoryId} is already being saved, skipping duplicate`);
    return existingPromise;
  }

  console.log(`🔵 [Async] saveMemoryToWeb3Async CALLED: user=${userAddress}, id=${memoryId}`);

  // Create a promise for this save operation
  const savePromise = (async () => {
    try {
      console.log(`🔵 [Async] Calling saveMemoryId...`);
      const result = await saveMemoryId(userAddress, memoryId);
      if (result.alreadyExists) {
        console.log(`ℹ️  [Async] Memory already exists: user=${userAddress}, id=${memoryId}`);
      } else {
        console.log(`✅ [Async] Memory saved to Web3: user=${userAddress}, id=${memoryId}, txHash=${result.txHash}`);
      }
    } catch (error: any) {
      if (error instanceof Web3ValidationError) {
        console.error(`❌ [Async] Validation error: ${error.message}`);
      } else if (error instanceof Web3TransactionError) {
        console.error(`❌ [Async] Transaction failed: ${error.message} (code: ${error.code})`);
      } else if (error instanceof Web3NetworkError) {
        console.error(`❌ [Async] Network error: ${error.message}`);
      } else {
        console.error(`❌ [Async] Unexpected error: ${error.message}`);
      }
      // Don't throw - this is fire-and-forget
    } finally {
      // Clean up after save completes (success or failure)
      savingInProgress.delete(memoryId);
      console.log(`🔵 [Async] saveMemoryToWeb3Async COMPLETED`);
    }
  })();

  // Store the promise to prevent duplicates BEFORE starting execution
  // This is critical: set the promise immediately to prevent race conditions
  savingInProgress.set(memoryId, savePromise);

  return savePromise;
}

/**
 * Async wrapper for deleteMemoryId with deduplication
 * Fire-and-forget pattern: logs errors but doesn't throw
 * Used for non-blocking Web3 deletes
 *
 * @param userAddress - User's wallet address
 * @param memoryId - MongoDB ObjectId to delete
 */
export async function deleteMemoryFromWeb3Async(
  userAddress: string,
  memoryId: string
): Promise<void> {
  // Check if this memory is already being deleted (thread-safe check)
  const existingPromise = deletingInProgress.get(memoryId);
  if (existingPromise) {
    console.log(`⏭️ [Async] Memory ${memoryId} is already being deleted, skipping duplicate`);
    return existingPromise;
  }

  console.log(`🔵 [Async] deleteMemoryFromWeb3Async CALLED: user=${userAddress}, id=${memoryId}`);

  // Create a promise for this delete operation
  const deletePromise = (async () => {
    try {
      console.log(`🔵 [Async] Calling deleteMemoryId...`);
      const txHash = await deleteMemoryId(userAddress, memoryId);
      console.log(`✅ [Async] Memory deleted from Web3: user=${userAddress}, id=${memoryId}, txHash=${txHash}`);
    } catch (error: any) {
      if (error instanceof Web3ValidationError) {
        console.error(`❌ [Async] Validation error: ${error.message}`);
      } else if (error instanceof Web3TransactionError) {
        console.error(`❌ [Async] Transaction failed: ${error.message} (code: ${error.code})`);
      } else if (error instanceof Web3NetworkError) {
        console.error(`❌ [Async] Network error: ${error.message}`);
      } else {
        console.error(`❌ [Async] Unexpected error: ${error.message}`);
      }
      // Don't throw - this is fire-and-forget
    } finally {
      // Clean up after delete completes (success or failure)
      deletingInProgress.delete(memoryId);
      console.log(`🔵 [Async] deleteMemoryFromWeb3Async COMPLETED`);
    }
  })();

  // Store the promise to prevent duplicates BEFORE starting execution
  deletingInProgress.set(memoryId, deletePromise);

  return deletePromise;
}

/**
 * Batch delete multiple memory IDs using Read-Modify-Write pattern
 * More efficient than deleting individually (1 transaction vs N transactions)
 * Path: /apps/ain_mem_1/wallets/{userAddress}
 *
 * @param userAddress - User's wallet address
 * @param memoryIds - Array of MongoDB ObjectIds to delete
 * @param retries - Number of retry attempts (default: 2)
 * @returns Object with txHash and deletedCount
 * @throws {Web3ValidationError} When input validation fails
 * @throws {Web3TransactionError} When blockchain transaction fails
 * @throws {Web3NetworkError} When network/timeout occurs
 */
export async function deleteBatchMemoryIds(
  userAddress: string,
  memoryIds: string[],
  retries: number = 2
): Promise<{ txHash: string; deletedCount: number }> {
  // Validate inputs
  if (!userAddress || !memoryIds || memoryIds.length === 0) {
    throw new Web3ValidationError('userAddress and memoryIds array are required');
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
    throw new Web3ValidationError('Invalid Ethereum address format', 'userAddress');
  }

  const ain = await initAinClient();

  // Construct path: /apps/ain_mem_1/wallets/{userAddress}
  const appName = 'ain_mem_1';
  const path = `/apps/${appName}/wallets/${userAddress}`;

  console.log(`🗑️ [Batch Delete] Deleting ${memoryIds.length} memories from Web3: ${path}`);

  // Retry loop with exponential backoff
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Batch delete attempt ${attempt + 1}/${retries + 1}`);

      // Step 1: Read current data
      const currentData = await ain.db.ref(path).getValue();

      if (!currentData || typeof currentData !== 'object') {
        console.log('📭 No data found to delete');
        return {
          txHash: '',
          deletedCount: 0
        };
      }

      // Step 2: Modify - remove specified memoryIds
      const newData = { ...currentData };
      let deletedCount = 0;

      memoryIds.forEach(id => {
        if (newData[id]) {
          delete newData[id];
          deletedCount++;
        }
      });

      console.log(`📝 [Batch Delete] Removing ${deletedCount} IDs from ${Object.keys(currentData).length} total`);

      // Step 3: Write back the modified data (1 transaction for all deletions!)
      const result: any = await withTimeout(
        ain.db.ref(path).setValue({
          value: Object.keys(newData).length > 0 ? newData : null, // null if empty
          nonce: -1,
        }),
        60000 // 60 second timeout
      );

      // Check if transaction was successful
      if (result && result.tx_hash && result.result && result.result.code === 0) {
        console.log(`✅ [Batch Delete] ${deletedCount} memories deleted: txHash=${result.tx_hash} (attempt ${attempt + 1})`);
        return {
          txHash: result.tx_hash,
          deletedCount
        };
      } else {
        const errorMsg = result?.result?.message || 'Batch delete transaction failed';
        const code = result?.result?.code || -1;
        console.error(`❌ Batch delete failed: code=${code}, message=${errorMsg}`);
        throw new Web3TransactionError(errorMsg, code, result?.tx_hash);
      }
    } catch (attemptError: any) {
      console.error(`❌ Batch delete attempt ${attempt + 1} failed:`, attemptError.message);

      // If this was the last retry, throw the appropriate error
      if (attempt === retries) {
        // Re-throw if it's already our custom error
        if (attemptError instanceof Web3Error) {
          throw attemptError;
        }

        // Timeout errors
        if (attemptError.message?.includes('Timeout')) {
          throw new Web3NetworkError(`Network timeout after ${retries + 1} attempts`, attemptError);
        }

        // Generic network errors
        throw new Web3NetworkError(`Network error after ${retries + 1} attempts: ${attemptError.message}`, attemptError);
      }

      // Exponential backoff: wait 1s, 2s, 4s, etc.
      const backoffMs = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Waiting ${backoffMs}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }

  // This should never be reached due to the throw in the last retry
  throw new Web3NetworkError('All batch delete retry attempts failed');
}

/**
 * Delete ALL memories for a user (entire wallet path)
 * WARNING: This is a destructive operation!
 * Path: /apps/ain_mem_1/wallets/{userAddress}
 *
 * @param userAddress - User's wallet address
 * @param retries - Number of retry attempts (default: 2)
 * @returns Transaction hash
 * @throws {Web3ValidationError} When input validation fails
 * @throws {Web3TransactionError} When blockchain transaction fails
 * @throws {Web3NetworkError} When network/timeout occurs
 */
export async function deleteAllMemoryIds(
  userAddress: string,
  retries: number = 2
): Promise<string> {
  // Validate inputs
  if (!userAddress) {
    throw new Web3ValidationError('userAddress is required');
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
    throw new Web3ValidationError('Invalid Ethereum address format', 'userAddress');
  }

  const ain = await initAinClient();

  // Construct path: /apps/ain_mem_1/wallets/{userAddress}
  const appName = 'ain_mem_1';
  const path = `/apps/${appName}/wallets/${userAddress}`;

  console.log(`⚠️ [Delete All] Deleting ALL memories from Web3: ${path}`);

  // Retry loop with exponential backoff
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Delete all attempt ${attempt + 1}/${retries + 1}`);

      // Delete entire wallet path by setting to null
      const result: any = await withTimeout(
        ain.db.ref(path).setValue({
          value: null,
          nonce: -1,
        }),
        60000 // 60 second timeout
      );

      // Check if transaction was successful
      if (result && result.tx_hash && result.result && result.result.code === 0) {
        console.log(`✅ [Delete All] All memories deleted: txHash=${result.tx_hash} (attempt ${attempt + 1})`);
        return result.tx_hash;
      } else {
        const errorMsg = result?.result?.message || 'Delete all transaction failed';
        const code = result?.result?.code || -1;
        console.error(`❌ Delete all failed: code=${code}, message=${errorMsg}`);
        throw new Web3TransactionError(errorMsg, code, result?.tx_hash);
      }
    } catch (attemptError: any) {
      console.error(`❌ Delete all attempt ${attempt + 1} failed:`, attemptError.message);

      // If this was the last retry, throw the appropriate error
      if (attempt === retries) {
        // Re-throw if it's already our custom error
        if (attemptError instanceof Web3Error) {
          throw attemptError;
        }

        // Timeout errors
        if (attemptError.message?.includes('Timeout')) {
          throw new Web3NetworkError(`Network timeout after ${retries + 1} attempts`, attemptError);
        }

        // Generic network errors
        throw new Web3NetworkError(`Network error after ${retries + 1} attempts: ${attemptError.message}`, attemptError);
      }

      // Exponential backoff: wait 1s, 2s, 4s, etc.
      const backoffMs = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Waiting ${backoffMs}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }

  // This should never be reached due to the throw in the last retry
  throw new Web3NetworkError('All delete all retry attempts failed');
}

/**
 * Get all data from ain_mem_1 app (for debugging)
 * Path: /apps/ain_mem_1
 *
 * @returns All data stored in ain_mem_1 app
 */
export async function getAllWeb3Data(): Promise<any> {
  try {
    const ain = await initAinClient();

    const appName = 'ain_mem_1';
    const path = `/apps/${appName}`;

    console.log(`🔍 Fetching ALL data from Web3: ${path}`);

    const data = await ain.db.ref(path).getValue();

    console.log(`✅ Web3 full data:`, JSON.stringify(data, null, 2));

    return data;
  } catch (error: any) {
    console.error('❌ Failed to fetch all Web3 data:', error);
    throw error;
  }
}
