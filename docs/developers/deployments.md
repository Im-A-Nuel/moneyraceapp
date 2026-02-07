# Deployments

## Contract Addresses

All Money Race smart contracts are deployed on the Sui blockchain.

---

## Mainnet

> ⚠️ **Coming Soon** – Mainnet deployment pending audit completion.

| Contract | Address | Status |
|----------|---------|--------|
| Registry | `0x...` | Pending |
| Room Factory | `0x...` | Pending |
| Rewards | `0x...` | Pending |

---

## Testnet

> ✅ **Active** – Use testnet for development and testing.

| Component | Address | Status |
|-----------|---------|--------|
| **Package ID** | `0x0e5bb307c15081e2159f2a3a4d4aa509bd0ed1cda6338accf4189e734c5f122c` | ✅ Active |
| **Admin Cap** | `0xf2c1b1af23b32aab0ea2efa2c2483adf90321c19e77f204199e0ca5211a1887b` | ✅ Active |
| **USDC Faucet** | `0x9baa4f323d403060c13bfe280b0fef3f95a4f7c0bc23fb393660b7ef946e4cfe` | ✅ Active |

**Network:** Sui Testnet
**RPC:** https://fullnode.testnet.sui.io
**Explorer:** [Sui Explorer (Testnet)](https://suiexplorer.com/?network=testnet)

---

## Package Details

### Money Race Package

```
Package ID: 0x0e5bb307c15081e2159f2a3a4d4aa509bd0ed1cda6338accf4189e734c5f122c
Module: money_race_v2
```

**View on Explorer:**
[https://suiexplorer.com/object/0x0e5bb307c15081e2159f2a3a4d4aa509bd0ed1cda6338accf4189e734c5f122c?network=testnet](https://suiexplorer.com/object/0x0e5bb307c15081e2159f2a3a4d4aa509bd0ed1cda6338accf4189e734c5f122c?network=testnet)

---

## Verification

Verify contract source code:

```bash
# Clone repository
git clone https://github.com/[ORG]/money-race-contracts

# Build
sui move build

# Test
sui move test
```

---

## Integration

### Install Dependencies

```bash
npm install @mysten/sui.js
```

### Connect to Contracts

```typescript
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';

const client = new SuiClient({
  url: 'https://fullnode.testnet.sui.io',
});

// Package ID
const PACKAGE_ID = '0x0e5bb307c15081e2159f2a3a4d4aa509bd0ed1cda6338accf4189e734c5f122c';

// USDC Coin Type
const USDC_TYPE = `${PACKAGE_ID}::usdc::USDC`;

// Create a room
const tx = new TransactionBlock();
tx.moveCall({
  target: `${PACKAGE_ID}::money_race_v2::create_room`,
  arguments: [
    tx.pure(5), // total_periods
    tx.pure(10_000_000), // 10 USDC (6 decimals)
    tx.pure(2), // strategy_id (Balanced)
    tx.pure(Date.now()), // start_time_ms
    tx.pure(86400000), // period_length_ms (1 day)
  ],
});
```

---

## USDC Token

| Network | Coin Type | Decimals |
|---------|-----------|----------|
| **Testnet** | `0x0e5bb307c15081e2159f2a3a4d4aa509bd0ed1cda6338accf4189e734c5f122c::usdc::USDC` | 6 |
| **Mainnet** | Official USDC (TBD) | 6 |

### Get Test USDC

Use the USDC faucet to get testnet USDC:

```typescript
// Faucet ID
const USDC_FAUCET_ID = '0x9baa4f323d403060c13bfe280b0fef3f95a4f7c0bc23fb393660b7ef946e4cfe';

// Call faucet to get test USDC
const tx = new TransactionBlock();
tx.moveCall({
  target: `${PACKAGE_ID}::usdc_faucet::mint`,
  arguments: [tx.object(USDC_FAUCET_ID)],
});
```

---

## Faucet

Get testnet SUI for development:

```bash
sui client faucet
```

Or visit: [Sui Faucet](https://faucet.testnet.sui.io/)

---

[Back to Developers →](README.md)
