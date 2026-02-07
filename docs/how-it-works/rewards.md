# Rewards System

## Overview

Money Race rewards consistent savers through **proportional yield distribution**. Your share of the reward pool depends on how many times you deposit compared to total deposits from all players.

**The more consistently you save, the bigger your share of rewards.**

---

## How Rewards Work (Mainnet)

### 1. Funds Deployed to DeFi Protocols

When you join a room and deposit USDC, your funds are automatically deployed to real Sui DeFi protocols based on the room's strategy:

| Strategy | Protocol Allocation | Target APY |
|----------|-------------------|-----------|
| **Conservative** | Scallop (50%), Navi (30%), Aftermath (20%) | ~4% |
| **Balanced** | Scallop (35%), Cetus (35%), Turbos (20%), Navi (10%) | ~8% |
| **Aggressive** | Cetus (40%), Kriya (30%), Turbos (20%), Aftermath (10%) | ~15% |

### 2. Yield Generated from External Protocols

Throughout the room's duration, these protocols generate real yield:
- **Lending protocols** (Scallop, Navi) → Interest from borrowers
- **AMM/DEX** (Cetus, Turbos, Kriya) → Trading fees + liquidity rewards
- **Liquid staking** (Aftermath) → SUI staking rewards

The yield accumulates in the reward pool **without touching your principal**.

### 3. Room Finalization

When the room ends, the smart contract:
1. Withdraws all funds from DeFi protocols
2. Collects the generated yield
3. Separates principal (intact) and rewards (yield earned)

```
vault.principal = Total deposits (unchanged)
vault.reward = Total yield from protocols (added from outside)
```

### 4. Proportional Distribution

Each player claims their share based on consistency:

```
Your reward = (your_deposits / total_deposits) × total_yield
Your principal = (your_deposits / total_deposits) × total_principal
```

---

## Example: 5-Week Room (Mainnet)

### Setup

- **Duration:** 5 weeks
- **Deposit amount:** 100 USDC per week
- **Strategy:** Balanced (~8% APY)

### Participants

| Player | Week 1 | Week 2 | Week 3 | Week 4 | Week 5 | Total | deposited_count |
|--------|--------|--------|--------|--------|--------|-------|----------------|
| Alice  | ✅ 100 | ✅ 100 | ✅ 100 | ✅ 100 | ✅ 100 | 500   | **5** |
| Bob    | ✅ 100 | ✅ 100 | ✅ 100 | ✅ 100 | ❌     | 400   | **4** |
| Carol  | ✅ 100 | ✅ 100 | ❌     | ❌     | ❌     | 200   | **2** |

```
Total deposited: 1100 USDC
Total weight: 5 + 4 + 2 = 11
```

### Yield Generation

Funds deployed to protocols (Balanced strategy):
- **35%** to Scallop (lending) → 385 USDC → Earns 2.96 USDC
- **35%** to Cetus (LP pool) → 385 USDC → Earns 3.34 USDC
- **20%** to Turbos (AMM) → 220 USDC → Earns 2.12 USDC
- **10%** to Navi (lending) → 110 USDC → Earns 0.74 USDC

**Total yield earned: 10 USDC** (from external protocols)

### Vault After Finalize

```
vault.principal = 1100 USDC (intact ✅)
vault.reward = 10 USDC (from protocols ✅)
Total available: 1110 USDC
```

---

## Claim Calculation

### Alice (deposited 5x)

```
Reward share:
= (5 × 10) / 11
= 4.545 USDC

Principal share:
= (5 × 1100) / 11
= 500 USDC

Total payout: 500 + 4.545 = 504.545 USDC ✅
Profit: +4.545 USDC
```

### Bob (deposited 4x)

```
Reward share:
= (4 × 10) / 11
= 3.636 USDC

Principal share:
= (4 × 1100) / 11
= 400 USDC

Total payout: 400 + 3.636 = 403.636 USDC ✅
Profit: +3.636 USDC
```

### Carol (deposited 2x)

```
Reward share:
= (2 × 10) / 11
= 1.818 USDC

Principal share:
= (2 × 1100) / 11
= 200 USDC

Total payout: 200 + 1.818 = 201.818 USDC ✅
Profit: +1.818 USDC
```

---

## Final Summary

| Player | Deposited | deposited_count | Share Ratio | Yield Earned | Total Payout | Profit |
|--------|-----------|-----------------|-------------|--------------|-------------|--------|
| Alice  | 500 USDC  | 5               | 45.5%       | 4.545 USDC   | **504.545** | **+4.545** |
| Bob    | 400 USDC  | 4               | 36.4%       | 3.636 USDC   | **403.636** | **+3.636** |
| Carol  | 200 USDC  | 2               | 18.2%       | 1.818 USDC   | **201.818** | **+1.818** |
| **Total** | **1100** | **11**       | **100%**    | **10.00**    | **1110**    | **+10** |

---

## Key Insights

### 1. Everyone Profits

All players get their principal back **plus** yield. Nobody loses money.

### 2. Consistency Pays More

- Alice (100% consistent) → Earned 4.545 USDC
- Bob (80% consistent) → Earned 3.636 USDC
- Carol (40% consistent) → Earned 1.818 USDC

**The more consistent you are, the larger your share of rewards.**

### 3. Principal Protected

Your deposited funds remain **100% intact**. Yield comes from external DeFi protocols, not from cutting your principal.

### 4. Proportional Fairness

Your reward share equals your contribution share:
```
Alice deposited 5/11 of total → Gets 5/11 of yield
Bob deposited 4/11 of total → Gets 4/11 of yield
Carol deposited 2/11 of total → Gets 2/11 of yield
```

---

## Claim Process

After room finalization:

1. Navigate to **Room Details**
2. Click **"Claim Rewards"**
3. Review your breakdown:
   - Principal to receive
   - Yield earned
   - Total payout
4. Click **"Confirm Claim"**
5. Funds sent to your wallet instantly

**Each player can only claim once.** After claiming, your `PlayerPosition` is marked as `claimed = true`.

---

## Testnet vs Mainnet

| Aspect | Testnet (Current) | Mainnet (Coming) |
|--------|------------------|------------------|
| Yield source | Simulated (cuts from principal) | Real (from DeFi protocols) |
| Principal | Reduced by yield | **Stays intact** |
| Total payout | = Total deposited | = Deposited + Real yield |
| Protocols | None (simulation) | Scallop, Cetus, Navi, etc. |
| APY | Fixed (4%/8%/15%) | **Variable** (market rates) |

> **Note:** Current testnet simulates yield by splitting principal into reward pool. Mainnet will use real DeFi integration where yield comes from external sources, so your principal remains untouched.

---

[Back to How It Works →](README.md)
