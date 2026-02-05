/**
 * Transaction Builder Utilities
 * Build Move transactions on the frontend for user signing
 */

import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';
import { keccak_256 } from '@noble/hashes/sha3';

// Contract Package ID
const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || '';

/**
 * Build join_room transaction
 * User signs this tx, so tx_context::sender(ctx) will be the user's address
 * Merges coins if needed, then splits to exact deposit amount before calling join_room
 */
export function buildJoinRoomTx(params: {
  roomId: string;
  vaultId: string;
  coinObjectId: string;
  coinsToMerge?: string[]; // Additional coins to merge into primary coin
  clockId: string;
  depositAmount: number; // Amount to deposit (from room config)
}): Transaction {
  const tx = new Transaction();

  // Start with primary coin
  let primaryCoin = tx.object(params.coinObjectId);

  // Merge additional coins into primary if provided
  if (params.coinsToMerge && params.coinsToMerge.length > 0) {
    const coinsToMergeObjects = params.coinsToMerge.map(id => tx.object(id));
    tx.mergeCoins(primaryCoin, coinsToMergeObjects);
  }

  // Split exact amount from the (potentially merged) coin
  const [depositCoin] = tx.splitCoins(primaryCoin, [params.depositAmount]);

  // Contract signature: join_room(room, vault, clock, coin)
  tx.moveCall({
    target: `${PACKAGE_ID}::money_race_v2::join_room`,
    arguments: [
      tx.object(params.roomId),
      tx.object(params.vaultId),
      tx.object(params.clockId),
      depositCoin,
    ],
  });

  return tx;
}

/**
 * Build deposit transaction
 * Matches: deposit(room, vault, player, clock, coin)
 * Merges coins if needed, then splits to exact deposit amount before calling deposit
 */
export function buildDepositTx(params: {
  roomId: string;
  vaultId: string;
  playerPositionId: string;
  coinObjectId: string;
  coinsToMerge?: string[]; // Additional coins to merge into primary coin
  clockId: string;
  depositAmount: number; // Amount to deposit (from room config)
}): Transaction {
  const tx = new Transaction();

  // Start with primary coin
  let primaryCoin = tx.object(params.coinObjectId);

  // Merge additional coins into primary if provided
  if (params.coinsToMerge && params.coinsToMerge.length > 0) {
    const coinsToMergeObjects = params.coinsToMerge.map(id => tx.object(id));
    tx.mergeCoins(primaryCoin, coinsToMergeObjects);
  }

  // Split exact amount from the (potentially merged) coin
  const [depositCoin] = tx.splitCoins(primaryCoin, [params.depositAmount]);

  tx.moveCall({
    target: `${PACKAGE_ID}::money_race_v2::deposit`,
    arguments: [
      tx.object(params.roomId),
      tx.object(params.vaultId),
      tx.object(params.playerPositionId),
      tx.object(params.clockId),
      depositCoin,
    ],
  });

  return tx;
}

/**
 * Build claim transaction
 * Matches: claim_all(room, vault, player, ctx)
 */
export function buildClaimTx(params: {
  roomId: string;
  vaultId: string;
  playerPositionId: string;
}): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${PACKAGE_ID}::money_race_v2::claim_all`,
    arguments: [
      tx.object(params.roomId),
      tx.object(params.vaultId),
      tx.object(params.playerPositionId),
    ],
  });

  return tx;
}
