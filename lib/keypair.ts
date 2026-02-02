/**
 * Deterministic Keypair Management for Simplified zkLogin
 * 
 * Keypair is derived deterministically from Google sub (user ID).
 * Same Google account = Same Sui address, always.
 * 
 * NOTE: This is a simplified version. Real zkLogin would involve:
 * - zkProof generation
 * - Salt service from Mysten
 * - Proper zkLogin address derivation
 */

import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

const KEYPAIR_STORAGE_KEY = 'ephemeral_keypair';
const USER_SUB_STORAGE_KEY = 'current_user_sub';

export interface StoredKeypair {
  secretKey: string; // Base64 encoded
  publicKey: string; // Base64 encoded
  address: string;   // Sui address derived from keypair
  createdAt: number; // Timestamp
  userSub: string;   // Google sub this keypair belongs to
}

/**
 * Clear stored keypair
 */
export function clearKeypair(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYPAIR_STORAGE_KEY);
}

/**
 * Hash string using SHA-256 (browser native)
 */
async function hashString(input: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer);
}

/**
 * Generate deterministic keypair from Google sub
 * Same sub = Same keypair = Same address
 */
export async function generateDeterministicKeypair(googleSub: string): Promise<Ed25519Keypair> {
  // Create a deterministic seed from Google sub
  // Add a salt to make it unique to this app
  const salt = 'money-race-sui-wallet-v1';
  const seedInput = `${salt}:${googleSub}`;
  
  // Hash to get 32 bytes for Ed25519 seed
  const seed = await hashString(seedInput);
  
  // Create keypair from seed
  const keypair = Ed25519Keypair.fromSecretKey(seed);
  
  console.log('Generated deterministic keypair for sub:', googleSub.slice(0, 8) + '...');
  return keypair;
}

/**
 * Generate a new ephemeral keypair (random - legacy)
 */
export function generateEphemeralKeypair(): Ed25519Keypair {
  return new Ed25519Keypair();
}

/**
 * Save keypair to localStorage with user sub
 */
export function saveKeypair(keypair: Ed25519Keypair, userSub?: string): void {
  if (typeof window === 'undefined') return;
  
  // getSecretKey() returns base64 string in SDK v2
  const secretKeyBase64 = keypair.getSecretKey();
  
  const stored: StoredKeypair = {
    secretKey: secretKeyBase64,
    publicKey: keypair.getPublicKey().toBase64(),
    address: keypair.getPublicKey().toSuiAddress(),
    createdAt: Date.now(),
    userSub: userSub || '',
  };
  
  localStorage.setItem(KEYPAIR_STORAGE_KEY, JSON.stringify(stored));
  if (userSub) {
    localStorage.setItem(USER_SUB_STORAGE_KEY, userSub);
  }
  console.log('Keypair saved, address:', stored.address);
}

/**
 * Load keypair from localStorage
 */
export function loadKeypair(): Ed25519Keypair | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(KEYPAIR_STORAGE_KEY);
  if (!stored) return null;
  
  try {
    const data: StoredKeypair = JSON.parse(stored);
    // In SDK v2, getSecretKey() returns base64 string
    // fromSecretKey expects the base64 string directly
    const keypair = Ed25519Keypair.fromSecretKey(data.secretKey);
    
    // Verify the keypair matches stored address
    const derivedAddress = keypair.getPublicKey().toSuiAddress();
    if (derivedAddress !== data.address) {
      console.warn('Keypair address mismatch, clearing...');
      clearKeypair();
      return null;
    }
    
    return keypair;
  } catch (error) {
    console.error('Failed to load keypair, clearing corrupted data:', error);
    // Clear corrupted keypair data
    clearKeypair();
    return null;
  }
}

/**
 * Get stored keypair info without loading full keypair
 */
export function getStoredKeypairInfo(): StoredKeypair | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(KEYPAIR_STORAGE_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Get stored user sub
 */
export function getStoredUserSub(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_SUB_STORAGE_KEY);
}

/**
 * Get or create deterministic keypair for a Google user
 * If user changed (different sub), generate new keypair
 */
export async function getOrCreateKeypairForUser(googleSub: string): Promise<Ed25519Keypair> {
  const storedInfo = getStoredKeypairInfo();
  const storedSub = getStoredUserSub();
  
  // Check if we have a keypair for this user
  if (storedInfo && storedSub === googleSub) {
    const keypair = loadKeypair();
    if (keypair) {
      console.log('Loaded existing keypair for user');
      return keypair;
    }
  }
  
  // Different user or no keypair - generate new deterministic one
  console.log('Generating new deterministic keypair for user');
  const keypair = await generateDeterministicKeypair(googleSub);
  saveKeypair(keypair, googleSub);
  return keypair;
}

/**
 * Get or create ephemeral keypair (legacy - random)
 * Returns existing keypair if available, otherwise creates new one
 */
export function getOrCreateKeypair(): Ed25519Keypair {
  let keypair = loadKeypair();
  
  if (!keypair) {
    keypair = generateEphemeralKeypair();
    saveKeypair(keypair);
    console.log('Created new ephemeral keypair');
  } else {
    console.log('Loaded existing ephemeral keypair');
  }
  
  return keypair;
}

/**
 * Get the Sui address from stored keypair
 */
export function getKeypairAddress(): string | null {
  const info = getStoredKeypairInfo();
  return info?.address ?? null;
}
