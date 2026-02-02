/**
 * zkLogin Sponsored Transaction Utilities
 * Handles signing transactions with ephemeral keypair and sending to backend for sponsorship
 */

import { Transaction } from '@mysten/sui/transactions';
import { suiClient } from './sui';
import { api, getSponsorAddress } from './api';
import { loadKeypair } from './keypair';
import { toBase64 } from '@mysten/sui/utils';

/**
 * Sign and execute a sponsored transaction
 *
 * Flow:
 * 1. Get sponsor address from backend
 * 2. Build transaction with user as sender, sponsor as gas owner
 * 3. User signs the transaction with ephemeral keypair
 * 4. Send txBytes + signature to backend
 * 5. Backend adds sponsor signature and executes
 *
 * @param tx - Transaction to execute
 * @param userAddress - User's address (from ephemeral keypair)
 * @returns Transaction result
 */
export async function signAndExecuteSponsoredTx(
  tx: Transaction,
  userAddress: string
): Promise<any> {
  try {
    // Load ephemeral keypair
    const keypair = loadKeypair();
    if (!keypair) {
      throw new Error('No ephemeral keypair found. Please login again.');
    }

    // Verify the keypair matches the user address
    const keypairAddress = keypair.getPublicKey().toSuiAddress();
    if (keypairAddress !== userAddress) {
      throw new Error('Keypair address mismatch. Please login again.');
    }

    // Get sponsor address from backend
    const sponsorAddress = await getSponsorAddress();
    console.log('Sponsor address:', sponsorAddress);

    // Set sender to user's address
    tx.setSender(userAddress);
    
    // Set gas owner to sponsor (backend will pay gas)
    tx.setGasOwner(sponsorAddress);

    // Set gas budget
    tx.setGasBudget(100000000); // 0.1 SUI

    // Build transaction bytes using imported suiClient
    const txBytes = await tx.build({ client: suiClient });

    // Sign with ephemeral keypair
    const { signature } = await keypair.signTransaction(txBytes);
    console.log('Transaction signed by user');

    // Convert txBytes to base64
    const txBytesBase64 = toBase64(txBytes);

    // Send to backend for sponsor signature and execution
    const response = await api.post('/room/execute-sponsored', {
      txBytes: txBytesBase64,
      userSignature: signature,
    });

    return response.data;
  } catch (error: any) {
    console.error('Sponsored transaction failed:', error);
    throw new Error(error.response?.data?.error || error.message || 'Transaction failed');
  }
}

/**
 * Build a sponsored transaction (without executing)
 * Returns txBytes and user signature for manual submission
 */
export async function buildSponsoredTx(
  tx: Transaction,
  userAddress: string
): Promise<{ txBytes: string; userSignature: string }> {
  // Load ephemeral keypair
  const keypair = loadKeypair();
  if (!keypair) {
    throw new Error('No ephemeral keypair found. Please login again.');
  }

  // Get sponsor address from backend
  const sponsorAddress = await getSponsorAddress();

  // Set sender and gas owner
  tx.setSender(userAddress);
  tx.setGasOwner(sponsorAddress);
  tx.setGasBudget(100000000);

  // Build and sign using imported suiClient
  const txBytes = await tx.build({ client: suiClient });
  const { signature } = await keypair.signTransaction(txBytes);

  return {
    txBytes: toBase64(txBytes),
    userSignature: signature,
  };
}

/**
 * Helper to check if ephemeral keypair is available
 */
export function hasKeypair(): boolean {
  return loadKeypair() !== null;
}
