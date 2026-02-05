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
 *
 * @param tx - Transaction to build and sign
 * @param userAddress - User's Sui address
 * @param loginMethod - Login method ('google' for zkLogin, 'wallet' for wallet)
 * @param walletSignFn - Optional wallet sign function (required for wallet login)
 */
export async function buildSponsoredTx(
  tx: Transaction,
  userAddress: string,
  loginMethod?: 'google' | 'wallet',
  walletSignFn?: (args: any) => Promise<any>
): Promise<{ txBytes: string; userSignature: string; executeDirectly?: boolean }> {
  // Debug logging
  console.log('buildSponsoredTx called with:', {
    userAddress,
    loginMethod,
    hasWalletSignFn: !!walletSignFn
  });

  // Sign based on login method
  if (loginMethod === 'wallet') {
    // Wallet login: Execute directly WITHOUT sponsored transaction
    // Wallet pays gas itself
    if (!walletSignFn) {
      throw new Error('Wallet sign function is required for wallet login. Please reconnect your wallet.');
    }

    // Set sender only (no gasOwner for wallet)
    tx.setSender(userAddress);
    tx.setGasBudget(100000000);

    try {
      // Sign and execute with wallet directly
      const result = await walletSignFn({
        transaction: tx,
        chain: 'sui:testnet'
      });

      console.log('✅ Wallet execution result:', result);

      // Extract digest from signAndExecuteTransaction result
      // The result structure should be: { digest: string, effects: {...}, ... }
      const digest = result.digest || result.transactionDigest || result.effects?.transactionDigest || result.effects?.digest || '';

      console.log('Extracted digest:', digest);

      if (!digest) {
        console.error('Full result object:', JSON.stringify(result, null, 2));
        throw new Error('Transaction executed but no digest found in wallet response. Check console for full result.');
      }

      console.log('✅ Transaction executed successfully with digest:', digest);

      // Return digest in txBytes field (reuse for simplicity)
      // Caller checks executeDirectly flag
      return {
        txBytes: digest,
        userSignature: '',
        executeDirectly: true,
      };
    } catch (error: any) {
      console.error('Wallet execute error:', error);
      throw new Error(`Failed to execute with wallet: ${error.message}`);
    }
  } else {
    // Google/zkLogin: Use sponsored transaction
    const sponsorAddress = await getSponsorAddress();

    // Set sender and gas owner for sponsored tx
    tx.setSender(userAddress);
    tx.setGasOwner(sponsorAddress);
    tx.setGasBudget(100000000);

    const keypair = loadKeypair();
    if (!keypair) {
      throw new Error('No ephemeral keypair found. Please login again with Google.');
    }

    const txBytes = await tx.build({ client: suiClient });
    const result = await keypair.signTransaction(txBytes);

    return {
      txBytes: toBase64(txBytes),
      userSignature: result.signature,
      executeDirectly: false,
    };
  }
}

/**
 * Helper to check if ephemeral keypair is available
 */
export function hasKeypair(): boolean {
  return loadKeypair() !== null;
}
