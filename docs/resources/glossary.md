# Glossary

Key terms and definitions for Money Race.

---

## A

### Aggressive Strategy
High-risk savings approach targeting ~15% APY through DEX/AMM protocols (Cetus, Kriya, Turbos). Higher impermanent loss risk but maximum growth potential. Best for experienced DeFi users.

### AI Strategy
Intelligent recommendation system powered by EigenAI that analyzes user goals and suggests optimal DeFi strategies (Conservative, Balanced, or Aggressive) with protocol-specific allocations.

### APY (Annual Percentage Yield)
The annualized rate of return on deposits including compound interest. Money Race offers ~4% (Conservative), ~8% (Balanced), or ~15% (Aggressive) depending on strategy.

---

## B

### Balanced Strategy
Medium-risk savings approach targeting ~8% APY through diversified protocols (Scallop, Cetus, Turbos, Navi). Good risk-reward balance. Recommended for most users.

---

## C

### Claim
The action of withdrawing your principal + yield after a room is finalized. Process is gasless and instant to your wallet.

### Conservative Strategy
Low-risk savings approach targeting ~4% APY through lending protocols (Scallop, Navi, Aftermath). Maximum capital protection with stable, predictable growth.

### Consistency
The measure of how regularly a participant makes periodic deposits. Higher consistency = larger share of yield. Formula: `deposits_made / total_periods`.

---

## D

### DeFi (Decentralized Finance)
Financial services built on blockchain without intermediaries. Money Race deploys funds to Sui DeFi protocols (Scallop, Navi, Cetus, etc.) to generate yield.

### Deposit Amount
The fixed USDC amount required per period in a room (e.g., 10 USDC per period). Set when room is created and applies to all participants.

### deposited_count
Smart contract variable tracking how many times a player has successfully deposited. Used to calculate proportional yield share.

---

## E

### EigenAI
The AI assistant powered by deepseek-v31-terminus that recommends optimal DeFi strategies. Supports English and Indonesian prompts. Production version will use fine-tuned models trained on Sui DeFi datasets.

---

## F

### Finalize
Admin action to complete a room and calculate final yield distribution. After finalization, participants can claim their rewards.

---

## G

### Gasless Transactions
Zero gas fee operations sponsored by Money Race backend. Users only need USDC—no SUI required. Backend adds sponsor signature and pays all gas costs.

---

## L

### Leaderboard
Real-time ranking of room participants by consistency (deposits made). Shows rank, total deposited, consistency %, and projected yield. Provides social accountability and friendly competition.

---

## M

### Mainnet
Production deployment on Sui blockchain where funds are deployed to real DeFi protocols. Yield comes from external sources (lending interest, trading fees, staking rewards). Principal stays 100% intact.

### Move
Smart contract programming language used on Sui blockchain. Known for safety and formal verification capabilities.

---

## P

### Period
Time interval between required deposits. Can be Daily (e.g., 7 days = 7 periods) or Weekly (e.g., 14 days = 2 periods). Determined by period_length_ms in room parameters.

### period_length_ms
Smart contract parameter defining period duration in milliseconds. Daily = 86,400,000ms (24 hours), Weekly = 604,800,000ms (7 days).

### PlayerPosition
Smart contract object (NFT) created when you join a room. Tracks your deposited_count, last_period, and claimed status. Owned by your wallet address.

### Principal
Your deposited funds that are always returned 100%. In mainnet, principal remains intact as yield comes from external DeFi protocols. In testnet, simulated yield reduces principal temporarily.

### Proportional Distribution
Fair reward system where yield is shared based on consistency: `your_yield = (your_deposits / total_deposits) × total_yield`. No penalties—only proportional sharing.

---

## R

### Reward Pool
Collection of yield earned from DeFi protocols (mainnet) or simulated yield (testnet). Distributed proportionally to participants based on consistency.

### Room
A group savings challenge with defined parameters (duration, deposit amount, strategy, period length). Has 3 states: OPEN (accepting participants), ACTIVE (in progress), FINISHED (ready for claims).

### Room Status
Current state of a room:
- **OPEN** (0) — Accepting new participants
- **ACTIVE** (1) — Challenge in progress, deposits active
- **FINISHED** (2) — Complete, rewards ready to claim

---

## S

### Scallop
Lending protocol on Sui where users can lend USDC and earn interest from borrowers. Used in Conservative and Balanced strategies.

### Strategy
Risk and yield profile for room funds. Three options:
- **Conservative** (~4% APY) — Scallop, Navi, Aftermath
- **Balanced** (~8% APY) — Scallop, Cetus, Turbos, Navi
- **Aggressive** (~15% APY) — Cetus, Kriya, Turbos, Aftermath

### Streak
Number of consecutive periods a participant has made on-time deposits. Longer streaks indicate higher consistency.

### Sui
Layer 1 blockchain that Money Race is built on. Features fast finality (~400ms), low costs, Move language, and native zkLogin support.

---

## T

### Testnet
Test deployment on Sui blockchain with simulated yield. Used for demo and development. Yield is simulated by moving principal to reward pool (zero-sum). No real funds at risk.

### total_weight
Smart contract variable tracking sum of all participants' deposited_count. Used as denominator in proportional distribution formula.

### TVL (Total Value Locked)
Total amount of funds deposited across all Money Race rooms. Key metric for protocol size and activity.

---

## U

### USDC
USD Coin—a stablecoin pegged 1:1 to US Dollar. The primary token for Money Race deposits and rewards. Minimizes volatility risk for savers.

---

## V

### Vault
Smart contract object holding room funds. Contains two balances:
- **principal** — Deposited funds
- **reward** — Accumulated yield

On mainnet, both increase. On testnet, principal moves to reward (simulation).

---

## Y

### Yield
Additional earnings from DeFi protocols beyond your principal. Sources include lending interest (Scallop, Navi), trading fees (Cetus, Kriya), and staking rewards (Aftermath).

---

## Z

### zkLogin
Sui's zero-knowledge authentication technology allowing sign-in with Web2 accounts (Google, Apple) without needing a crypto wallet. Keys are generated automatically using zero-knowledge proofs.

---

## Symbols

### ~
Tilde symbol indicating approximate value. Used for target APY rates which are estimates based on historical protocol performance and subject to market variability.

---

[Back to Resources →](README.md)
