# Savings Rooms

## What are Savings Rooms?

Savings Rooms are the core unit of Money Race. Each room is a **group savings challenge** where participants commit to periodic deposits (daily or weekly) and earn yield based on consistency.

**Key Principles:**
- 🔐 **Principal Protected** — Your deposits are always returned 100%
- 🆓 **Gasless** — All transactions sponsored by backend
- 📊 **Proportional Yield** — Rewards based on consistency, not penalties
- 👥 **Group Advantage** — Larger vaults generate better yields

---

## Room Parameters

When creating or joining a room, you'll see these configurable parameters:

| Parameter | Options | Description |
|-----------|---------|-------------|
| **Duration** | Minimum 7 days | Total challenge length |
| **Deposit Amount** | Custom (USDC) | Amount per period (e.g., 10 USDC) |
| **Period Length** | Daily or Weekly | How often deposits are made |
| **Strategy** | Conservative / Balanced / Aggressive | Risk & yield profile (4%/8%/15% APY) |
| **Privacy** | Public or Password-protected | Room accessibility |

**Examples:**

```
Room A: 7 days duration, 10 USDC per day → 7 daily deposits
Room B: 14 days duration, 50 USDC per week → 2 weekly deposits
Room C: 30 days duration, 20 USDC per day → 30 daily deposits
```

---

## Creating a Room

### Steps:

1. **Navigate** to Dashboard → "Create Room"
2. **Set Parameters:**

```
Room Name: [e.g., "Emergency Fund Challenge"]
Duration: [Minimum 7 days]
Deposit Amount: [e.g., 10 USDC]
Period Length: [Daily or Weekly]
Max Participants: [e.g., 20]
Strategy: [Conservative/Balanced/Aggressive]
Privacy: [Public or Password-protected]
```

3. **Get AI Recommendation** (Optional)
   - Describe your goal to EigenAI
   - AI suggests optimal strategy and parameters

4. **Review Summary:**
   - Total periods calculated automatically
   - Expected yield projection shown
   - Gasless transaction confirmed

5. **Confirm Creation**
   - Room is created on-chain
   - Shareable link generated
   - Room enters OPEN status

**Note:** Creating a room does NOT automatically join it. You must join separately with your first deposit.

---

## Joining a Room

### Requirements:

✅ Connected account (Sui wallet or Google via zkLogin)
✅ Sufficient USDC for initial deposit
✅ Room has available spots
✅ Room is in OPEN status (not started yet)

### Steps:

1. **Browse Rooms** — Explore available rooms on dashboard
2. **Review Details** — Check duration, deposit amount, strategy
3. **Make First Deposit** — Deposit exact amount (gasless!)
4. **Receive Confirmation** — PlayerPosition NFT created for you
5. **Track Progress** — Monitor your consistency on leaderboard

**Gasless:** You only need USDC. Backend sponsors all gas fees in SUI.

---

## Room Lifecycle

Rooms have **3 states** defined in the smart contract:

### 1. OPEN 🟢

```
Status: Accepting participants
- Room is visible on dashboard
- Users can join with initial deposit
- Admin hasn't started the room yet
- No time limit on OPEN state
```

**What you can do:**
- Join the room
- Review room parameters
- Invite friends

---

### 2. ACTIVE 🟡

```
Status: Challenge in progress
- Room has been started by admin
- Periodic deposits are active
- Users can deposit each period
- Consistency is being tracked
```

**What you can do:**
- Make periodic deposits (daily/weekly)
- View your position on leaderboard
- Track your deposit history
- Monitor yield accrual

**Important:**
- You can only deposit once per period
- Missing a deposit = less yield share (NOT penalized on principal)
- Period is determined by start time + period length

---

### 3. FINISHED ✅

```
Status: Challenge complete, rewards ready
- Room has been finalized by admin
- All yield has been calculated
- Principal + rewards ready to claim
- No more deposits accepted
```

**What you can do:**
- Claim your principal + yield
- View final statistics
- Check your rank
- Claim is gasless!

---

## How Deposits Work

### Period Calculation

```
Current Period = (now - start_time) / period_length
```

**Example (Daily):**
- Start time: Jan 1, 00:00
- Period length: 24 hours
- Jan 1 → Period 0
- Jan 2 → Period 1
- Jan 3 → Period 2

**Example (Weekly):**
- Start time: Jan 1, 00:00
- Period length: 7 days
- Jan 1-7 → Period 0
- Jan 8-14 → Period 1

### Deposit Rules

✅ **Can deposit:**
- During your assigned period
- Exact deposit amount only
- Once per period maximum
- Gasless transaction

❌ **Cannot deposit:**
- Before room starts
- After room is finalized
- In a period you already deposited
- Wrong amount

---

## Yield Distribution

Money Race uses **proportional distribution** — NOT penalties.

### Formula:

```
Your yield share = (your_deposits / total_deposits) × total_yield
Your principal share = (your_deposits / total_deposits) × total_principal
```

### Example:

**Room:** 5 periods, 10 USDC deposit/period, Balanced strategy (~8% APY)

| Player | Deposits Made | deposited_count | Yield Share | Principal | Total Payout |
|--------|--------------|-----------------|-------------|-----------|--------------|
| Alice  | 5/5 (100%)   | 5               | 4.545 USDC  | 50 USDC   | **54.545 USDC** |
| Bob    | 4/5 (80%)    | 4               | 3.636 USDC  | 40 USDC   | **43.636 USDC** |
| Carol  | 2/5 (40%)    | 2               | 1.818 USDC  | 20 USDC   | **21.818 USDC** |

**Key Insights:**
- Everyone gets their principal back 100%
- Yield shared proportionally by consistency
- No penalties for missing deposits
- Missing deposits only reduces your yield share, not capital

---

## Room Discovery

### Finding Rooms:

**Public Rooms:**
- Browse all available rooms on dashboard
- Filter by duration, deposit amount, strategy
- Sort by participants, APY, time remaining

**Private Rooms:**
- Need password or direct link
- Perfect for friends/community groups
- Same mechanics as public rooms

---

## Advanced Features

### Leaderboard

Track your position in real-time:
- **Rank** — Based on consistency (deposits made)
- **Total Deposited** — Your cumulative deposits
- **Consistency %** — Deposits made / Total periods
- **Projected Yield** — Estimated rewards

### Room Analytics

View comprehensive stats:
- Total participants
- Total deposits (vault size)
- Current yield accrued
- Room progress %
- Strategy performance

---

## Testnet vs Mainnet

| Aspect | Testnet (Current) | Mainnet (Coming) |
|--------|------------------|------------------|
| Yield Source | Simulated (cuts from principal) | Real (from DeFi protocols) |
| Principal | Reduced by simulated yield | **Stays 100% intact** |
| Protocols | None (simulation) | Scallop, Navi, Cetus, etc. |
| APY | Fixed (4%/8%/15%) | Variable (market rates) |

> **Note:** Current testnet simulates yield by moving principal to reward pool. Mainnet will deploy funds to real Sui DeFi protocols, so your principal remains untouched and yield comes from external sources.

---

## Tips for Success

1. **Choose Realistic Duration** — Don't commit to periods you can't fulfill
2. **Set Reminders** — Mark deposit days on calendar
3. **Join with Friends** — Social accountability increases consistency
4. **Start Conservative** — Begin with shorter durations, lower amounts
5. **Use AI Recommendation** — Let EigenAI suggest optimal parameters

---

[Next: AI Strategy →](ai-strategy.md)
