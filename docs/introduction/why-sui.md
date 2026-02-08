# Why Sui?

## Choosing the Right Blockchain

Building a savings-focused dApp requires a blockchain that prioritizes **speed, security, low cost, and user experience**. After evaluating multiple Layer 1 and Layer 2 solutions, we chose **Sui Network** as the foundation for Money Race. Here's why.

---

## Key Reasons

### 1. Parallel Transaction Processing

Sui uses a unique **object-centric model** that enables parallel execution of independent transactions. Unlike traditional blockchains that process transactions sequentially, Sui can handle thousands of transactions simultaneously.

**Why it matters for Money Race:**
- Multiple users can deposit into different rooms at the same time without congestion
- Room creation, deposits, and reward claims all execute in parallel
- No bottlenecks during peak activity periods

---

### 2. Sub-Second Finality

Sui achieves **transaction finality in under 1 second** — users don't have to wait for block confirmations.

**Why it matters for Money Race:**
- Deposits are confirmed instantly
- Reward claims happen in real-time
- The user experience feels as fast as Web2 applications

---

### 3. Low and Predictable Gas Fees

Sui's gas model keeps transaction costs **extremely low and predictable**, making it feasible to sponsor gas for all users.

**Why it matters for Money Race:**
- We can offer **100% gasless transactions** — users pay zero gas fees
- Backend sponsors all gas costs without significant overhead
- Users only need USDC to participate, no native SUI tokens required

---

### 4. zkLogin — Web2-Friendly Authentication

Sui's **zkLogin** allows users to authenticate using their existing Google accounts through zero-knowledge proofs, without exposing any personal data on-chain.

**Why it matters for Money Race:**
- No wallet setup, no seed phrases, no browser extensions
- One-click login with Google — as easy as signing into any Web2 app
- Lowers the barrier for non-crypto users to enter DeFi
- User privacy preserved through zero-knowledge cryptography

---

### 5. Move Language — Safety by Design

Sui uses the **Move programming language**, originally developed at Meta (Facebook) for the Diem project. Move is designed with safety as a first-class priority.

**Key safety features:**
- **Linear type system** — Assets cannot be accidentally duplicated or destroyed
- **Resource-oriented programming** — Digital assets are treated as real resources with strict ownership rules
- **Built-in formal verification** — Easier to prove contract correctness
- **No reentrancy attacks** — The language design eliminates an entire class of vulnerabilities common in Solidity

**Why it matters for Money Race:**
- User funds are protected at the language level
- Smart contract bugs that could cause fund loss are structurally prevented
- Greater confidence in the security of deposits and reward distribution

---

### 6. Rich DeFi Ecosystem

Sui has a growing and mature DeFi ecosystem with battle-tested protocols:

| Protocol | Type | Role in Money Race |
|----------|------|--------------------|
| **Scallop** | Lending | Conservative yield generation |
| **Navi Protocol** | Lending | Stable yield with low risk |
| **Cetus** | DEX & Liquidity | Balanced to aggressive strategies |
| **Turbos Finance** | AMM | Diversified yield farming |
| **Kriya** | DEX | High-yield trading strategies |
| **Aftermath Finance** | Liquid Staking | Additional yield layer |

This ecosystem enables our AI (EigenAI) to recommend and allocate funds across multiple protocols based on user risk preferences.

---

### 7. Programmable Transaction Blocks (PTBs)

Sui's **Programmable Transaction Blocks** allow multiple operations to be composed into a single atomic transaction.

**Why it matters for Money Race:**
- Deposit + room state update + leaderboard update can happen in one transaction
- Reduces complexity and gas costs
- Ensures all-or-nothing execution — no partial state changes

---

### 8. Sponsored Transactions

Sui natively supports **sponsored transactions**, where a third party (our backend) can pay the gas fees on behalf of the user.

**Why it matters for Money Race:**
- Built-in support for our gasless UX — no hacky workarounds needed
- Clean multi-signature flow: user signs intent, backend adds gas sponsorship
- Reliable and well-supported by the Sui SDK

---

## Sui vs Other Blockchains

| Feature | Sui | Ethereum | Solana | Aptos |
|---------|-----|----------|--------|-------|
| **Finality** | < 1 second | ~12 minutes | ~0.4 seconds | < 1 second |
| **Gas Fees** | Very low | High & variable | Very low | Low |
| **Sponsored Transactions** | Native support | Requires relayers | Not native | Supported |
| **zkLogin (Web2 Auth)** | Native | Not available | Not available | Not available |
| **Smart Contract Language** | Move (safe) | Solidity (flexible) | Rust (complex) | Move (safe) |
| **Parallel Execution** | Object-level | Sequential | Transaction-level | Block-STM |
| **DeFi Ecosystem** | Growing | Mature | Large | Early |

---

## Summary

Sui isn't just a fast blockchain — it's a blockchain designed for **real-world user experience**. The combination of zkLogin, sponsored transactions, sub-second finality, and the Move language makes it the ideal platform for Money Race's mission: **making savings accessible, fun, and rewarding for everyone**.

> *"We didn't choose Sui because it's trendy. We chose it because it's the only blockchain where we can deliver a truly gasless, Web2-like savings experience without compromising on security or decentralization."*

---

[Next: How It Works →](../how-it-works/README.md)
