# FAQ

Frequently Asked Questions about Money Race.

---

## 🌟 General Questions

### What is Money Race?

Money Race is a **gamified group savings protocol** on Sui blockchain where users join savings rooms, make periodic deposits (daily or weekly), and earn DeFi yield based on consistency. Think of it as a social savings challenge with real financial rewards.

**Key Features:**
- 🔐 Principal always protected 100%
- 🆓 Zero gas fees (fully gasless)
- 🤖 AI-powered strategy recommendations
- 💰 Real yield from Sui DeFi protocols

---

### How do I get started?

**Simple 4-step process:**

1. **Connect** — Visit Money Race app and sign in with:
   - Google account (zkLogin) — No wallet needed! ✅
   - Sui wallet — Any compatible wallet
2. **Browse** — Explore available savings rooms
3. **Get AI Recommendation** — Let EigenAI suggest optimal strategy (optional)
4. **Join & Deposit** — Make your first deposit (gasless!)

---

### Is my money safe?

**Yes, your funds are 100% secure.**

- ✅ **Non-custodial** — You control your funds via smart contract
- ✅ **Principal protected** — Your deposits are always returned 100%
- ✅ **Audited contracts** — Sui Move smart contracts on-chain
- ✅ **Transparent** — All transactions visible on Sui blockchain
- ✅ **Stablecoin** — USDC minimizes volatility risk

**What you risk:** Only missing out on yield share if you skip deposits. Your principal is NEVER at risk.

---

### What tokens do I need?

**Only USDC is required.**

- ✅ **USDC** — For your savings deposits
- ❌ **NO SUI needed** — All transactions are **gasless!**

Backend sponsors all gas fees. You only need USDC to participate.

---

### What does "gasless" mean?

**Zero transaction fees for all user actions.**

Every action is sponsored by the backend:
- Join room → **Gasless** ✅
- Periodic deposits → **Gasless** ✅
- Claim rewards → **Gasless** ✅

**How it works:** You sign the transaction, backend adds sponsor signature and pays gas in SUI. You never spend SUI.

---

## 🏠 Savings Rooms

### How do I join a room?

**Two ways:**

1. **Browse Public Rooms:**
   - Go to Dashboard
   - Filter by duration, deposit amount, strategy
   - Click "Join" on any room
   - Make initial deposit (gasless!)

2. **Private Rooms:**
   - Get link or password from creator
   - Join via direct link
   - Same mechanics as public rooms

---

### Can I create my own room?

**Yes!** Anyone can create a room.

**Steps:**
1. Dashboard → "Create Room"
2. Set parameters:
   - Duration (minimum 7 days)
   - Deposit amount (USDC per period)
   - Period length (Daily or Weekly)
   - Strategy (Conservative/Balanced/Aggressive)
   - Privacy (Public or Password-protected)
3. Get AI recommendation (optional)
4. Confirm creation (gasless!)

**Note:** Creating a room does NOT automatically join it. You must join separately.

---

### What happens if I miss a deposit?

**No penalties, just less yield share.**

- ✅ **Principal safe** — Your deposited funds remain 100% intact
- ⚠️ **Less yield** — You get smaller share of reward pool
- ❌ **NO penalty fees** — We don't punish missed deposits

**Example:** Room with 5 periods
- Alice deposits 5/5 → Gets 45.5% of yield
- Bob deposits 3/5 → Gets 27.3% of yield
- Carol deposits 2/5 → Gets 18.2% of yield

Everyone gets their principal back. Yield is shared proportionally.

---

### Can I leave a room early?

**Depends on room status:**

- **OPEN** (not started) → ✅ Yes, you can leave anytime
- **ACTIVE** (in progress) → ❌ Committed for the duration
- **FINISHED** → Claim your rewards

**Why commit?** This ensures fairness for all participants and enables accurate yield distribution.

---

### What's the difference between Daily and Weekly periods?

**Period length determines deposit frequency:**

**Daily Periods:**
```
Duration: 7 days → 7 deposits (1 per day)
Duration: 30 days → 30 deposits (1 per day)
```

**Weekly Periods:**
```
Duration: 7 days → 1 deposit (1 week)
Duration: 14 days → 2 deposits (2 weeks)
Duration: 28 days → 4 deposits (4 weeks)
```

Choose based on your savings habit and commitment level.

---

## 💰 Rewards & Yield

### How are rewards calculated?

**Proportional to your consistency:**

```
Your yield = (your_deposits / total_deposits) × total_yield
Your principal = (your_deposits / total_deposits) × total_principal
```

**Yield source (Mainnet):** Real DeFi protocols on Sui
- Conservative → Scallop, Navi (Lending) → ~4% APY
- Balanced → Scallop, Cetus, Turbos → ~8% APY
- Aggressive → Cetus, Kriya, Turbos → ~15% APY

**Current (Testnet):** Simulated yield for demo purposes.

---

### Where does the yield come from?

**From external DeFi protocols, NOT from other players.**

Money Race deploys your funds to real Sui DeFi protocols:
- **Lending** (Scallop, Navi) → Interest from borrowers
- **DEX/AMM** (Cetus, Turbos, Kriya) → Trading fees + liquidity rewards
- **Liquid Staking** (Aftermath) → SUI staking rewards

**This is NOT a zero-sum game.** Yield is generated externally and added to the reward pool.

---

### When do I receive rewards?

**After the room is finalized:**

1. Admin finalizes room when duration ends
2. Room status changes to FINISHED
3. You can claim principal + yield anytime
4. Claim is gasless!

**How to claim:**
- Go to Room Details
- Click "Claim Rewards"
- Receive USDC instantly to your wallet

---

### Are there any fees?

**Zero fees for users during testnet.**

Current testnet has:
- ❌ No deposit fees
- ❌ No withdrawal fees
- ❌ No protocol fees
- ✅ Gasless transactions

**Mainnet:** Fee structure TBD, but will remain competitive and transparent.

---

### What's the difference between Testnet and Mainnet?

| Aspect | Testnet (Current) | Mainnet (Coming) |
|--------|------------------|------------------|
| **Yield Source** | Simulated (from principal) | Real (from DeFi protocols) |
| **Principal** | Reduced by simulation | **100% intact** |
| **Protocols** | None | Scallop, Navi, Cetus, etc. |
| **APY** | Fixed (4%/8%/15%) | Variable (market rates) |
| **Gasless** | ✅ Yes | ✅ Yes |

---

## 🤖 AI Strategy

### What is EigenAI?

**EigenAI (deepseek-v31-terminus)** is our intelligent assistant that recommends optimal DeFi strategies based on your savings goals.

**Features:**
- 🌐 Bilingual (English & Indonesian)
- 📊 Protocol-specific recommendations
- 💡 Explains WHY a strategy suits you
- 🧠 Trained on DeFi data (mainnet)

---

### How does AI recommendation work?

**3-step process:**

1. **Input Your Goal**
   ```
   "I want to save for vacation in 3 months, low risk"
   "Saya butuh dana darurat, aman saja"
   ```

2. **AI Analysis**
   - Analyzes risk tolerance, time horizon, goal type
   - Considers current protocol performance
   - Matches you to optimal strategy

3. **Get Recommendations**
   - 3 tailored strategies
   - Expected APY for each
   - Detailed reasoning

---

### Can I change my strategy later?

**Not after joining a room.**

Strategy is set when you join and stays fixed for that room. This ensures:
- Fair yield calculation
- Consistent protocol allocation
- Predictable returns

**Solution:** Join a different room with your preferred strategy.

---

## 🔐 Technical

### Which wallets are supported?

**Any Sui-compatible wallet:**

Popular options:
- Sui Wallet (Official)
- Ethos Wallet
- Suiet
- Martian Wallet

**OR use Google sign-in** via zkLogin (no wallet needed!).

---

### What is zkLogin?

**zkLogin = Web2 login for Web3.**

Sui's technology that lets you sign in with:
- Google account ✅
- No crypto wallet needed
- Keys generated automatically
- Fully secure (zero-knowledge proofs)

Perfect for users new to crypto.

---

### Is the code open source?

**Yes!**

- ✅ Smart contracts — Open source on GitHub
- ✅ Frontend — Open source
- ✅ Documentation — Public

Check our GitHub for full transparency.

---

### What blockchain is Money Race on?

**Sui blockchain** (currently Testnet).

**Why Sui?**
- Fast finality (~400ms)
- Low transaction costs
- Powerful Move language
- Native zkLogin support
- Growing DeFi ecosystem

---

## 🎮 Gamification

### What are leaderboards?

**Real-time ranking of participants by consistency.**

Tracks:
- Rank (by deposits made)
- Total deposited
- Consistency percentage
- Projected yield

**Purpose:** Social accountability and friendly competition.

---

### Do I get anything for ranking high?

**Currently, no bonus for ranking.**

Rewards are purely proportional to consistency:
- 100% consistency → Maximum yield share
- 50% consistency → Half yield share

**Future:** Badges, NFT achievements, and rank bonuses planned (see Roadmap).

---

## 📱 Account & Support

### Can I have multiple accounts?

**Technically yes, but not recommended.**

Each wallet/Google account is separate. However:
- Better to focus on one account
- Build consistent savings history
- Track your progress accurately

---

### How do I contact support?

**Multiple channels:**

- Discord: [Coming Soon]
- Twitter/X: [Coming Soon]
- GitHub Issues: For bug reports
- Email: [Coming Soon]

---

### Where can I learn more?

**Comprehensive documentation available:**

- [Overview](../introduction/overview.md) — High-level intro
- [How It Works](../how-it-works/README.md) — Step-by-step guide
- [Smart Contracts](../developers/smart-contracts.md) — Technical docs
- [Roadmap](../mission/roadmap.md) — Future plans

---

## 🚀 Getting Started Now

Ready to start your savings journey?

1. Visit [Money Race App] (Coming Soon)
2. Connect with Google or Sui wallet
3. Browse rooms and join one
4. Start earning yield through consistency!

---

[Back to Resources →](README.md)
