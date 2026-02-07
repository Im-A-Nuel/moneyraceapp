# Key Features

## Core Features

### 🏠 Savings Rooms

Create or join savings rooms with flexible parameters:

| Parameter | Options | Description |
|-----------|---------|-------------|
| **Duration** | Minimum 7 days | Challenge length (flexible periods) |
| **Deposit Amount** | Custom (USDC) | Amount per period |
| **Period Length** | Daily or Weekly | Deposit frequency (e.g., 7 days = 7 periods daily, or 1 period weekly) |
| **Strategy** | Conservative / Balanced / Aggressive | Risk & yield profile |
| **Privacy** | Public or Password-protected | Room accessibility |

Rooms have three lifecycle stages:
- **OPEN** → Accepting participants
- **ACTIVE** → Challenge in progress
- **FINISHED** → Ready for claims

---

### 🤖 AI-Powered Strategy (EigenAI)

Our intelligent AI assistant powered by **EigenAI (deepseek-v31-terminus)** analyzes your goals and recommends the optimal strategy:

**How it works:**
1. Enter your savings goal in plain language (English or Indonesian)
2. AI analyzes risk tolerance, timeline, and objectives
3. Get 3 strategy recommendations with detailed reasoning
4. Each strategy includes specific Sui DeFi protocol allocations

**Strategy Options:**

| Strategy | Target APY | Protocols | Risk Level |
|----------|-----------|-----------|-----------|
| **Conservative** | ~4% | Scallop (50%), Navi (30%), Aftermath (20%) | Low |
| **Balanced** | ~8% | Scallop (35%), Cetus (35%), Turbos (20%), Navi (10%) | Medium |
| **Aggressive** | ~15% | Cetus (40%), Kriya (30%), Turbos (20%), Aftermath (10%) | High |

**AI explains WHY** a strategy suits you, not just WHAT to choose.

---

### 💰 Proportional Yield Distribution

Rewards are distributed fairly based on consistency — **not speculation, not penalties**.

**How it works:**
```
Your reward = (your_deposits / total_deposits) × total_yield
```

**Example:** 5-period room (weekly or daily), 10 USDC total yield
- Alice deposits 5/5 times → Gets 45.45% of yield (4.5 USDC)
- Bob deposits 4/5 times → Gets 36.36% of yield (3.6 USDC)
- Carol deposits 2/5 times → Gets 18.18% of yield (1.8 USDC)

**Key principles:**
- ✅ Principal always returned 100%
- ✅ Yield shared proportionally
- ✅ No penalties or slashing
- ✅ Miss deposits = less yield, not lost capital

---

### 🆓 Gasless Transactions

**Zero gas fees for all user actions.**

Backend sponsors all transaction costs:
- Join room → Gasless ✅
- Periodic deposits (daily/weekly) → Gasless ✅
- Claim rewards → Gasless ✅

Users only need USDC to participate. No SUI required.

**How?** Multi-signature sponsorship — user signs transaction, backend adds sponsor signature and pays gas.

---

### 👥 Group Savings Advantage

**Mathematical benefit of saving together:**

Larger vaults generate better yields in DeFi protocols. Even if you get a smaller percentage of the yield pool, the absolute amount is often higher.

**Example:** Alice saves 500 USDC over 5 periods

| Scenario | Vault Size | Total Yield | Alice Gets | ROI |
|----------|-----------|-------------|-----------|-----|
| Solo | 500 USDC | 4.2 USDC | 4.2 USDC (100%) | +0.84% |
| With Friends | 1100 USDC | 10 USDC | 4.5 USDC (45%) | **+0.91%** ✅ |

*Period can be daily or weekly based on room configuration.*

**Result:** You earn MORE by saving together, plus gain community accountability.

---

### 🔐 Secure & Transparent

All funds secured by Sui Move smart contracts:

- **Non-custodial** — You control your funds
- **Transparent** — All transactions on-chain
- **Auditable** — Smart contract code is open source
- **USDC stablecoin** — No volatility risk
- **Real DeFi integration** — Funds deployed to battle-tested Sui protocols

**Deployed protocols:**
- Scallop (Lending)
- Navi Protocol (Lending)
- Cetus (DEX & LP)
- Turbos Finance (AMM)
- Kriya (DEX)
- Aftermath Finance (Liquid staking)

---

### 📊 Progress Tracking

Comprehensive dashboard to monitor your journey:

- **Room overview** — Active and completed rooms
- **Deposit history** — Track consistency
- **Position tracking** — See your rank
- **Yield projection** — Estimated rewards
- **Claim interface** — Simple reward withdrawal

---

### 🔑 Web2-Friendly Authentication

**Two login options:**

1. **Google OAuth (zkLogin)** — Sign in with Google, no wallet needed
2. **Sui Wallet** — Connect Sui wallet directly (dapp-kit integration)

**Simplified onboarding:**
- No seed phrases to remember
- No blockchain knowledge required
- One-click login for Web2 users

---

## Technical Features

| Feature | Technology |
|---------|------------|
| **Smart Contracts** | Sui Move (testnet deployed) |
| **Frontend** | Next.js 16 + React 18 + TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Wallet Integration** | @mysten/dapp-kit |
| **Auth** | zkLogin (Google OAuth) |
| **AI Engine** | EigenAI (deepseek-v31-terminus) |
| **Backend** | Node.js + Express.js + TypeScript |
| **Database** | SQLite + Prisma ORM |
| **State Management** | Zustand |
| **Gas Sponsorship** | Multi-sig transaction relay |

---

## Testnet vs Mainnet

| Feature | Testnet (Current) | Mainnet (Planned) |
|---------|------------------|-------------------|
| **Yield source** | Simulated (on-chain) | Real DeFi protocols |
| **Principal protection** | ✅ Yes | ✅ Yes |
| **Gasless UX** | ✅ Yes | ✅ Yes |
| **AI recommendations** | ✅ Yes (EigenAI) | ✅ Yes (EigenAI) |
| **Protocol integration** | Simulated APY rates | Live Scallop/Navi/Cetus |
| **APY** | Fixed (4%/8%/15%) | Variable (market-dependent) |

> **Note:** Current testnet uses simulated yield. Mainnet will deploy funds to real Sui DeFi protocols for genuine yield generation.

---

[Next: How It Works →](../how-it-works/README.md)
