# AI Strategy Assistant

## Overview

Money Race features **EigenAI (deepseek-v31-terminus)**, an intelligent AI assistant that analyzes your savings goals and recommends optimal investment strategies for Sui blockchain.

**Key Features:**
- 🧠 **Data-Driven Recommendations** — Based on DeFi protocol performance
- 🌐 **Bilingual Support** — Works with English and Indonesian prompts
- 📊 **Protocol-Specific** — Recommends actual Sui protocols (Scallop, Navi, Cetus, etc.)
- 💡 **Reasoning Engine** — Explains WHY a strategy suits you, not just WHAT to choose

---

## AI Technology

Money Race uses **EigenAI** with two deployment approaches:

### Current (Testnet/Demo)
- **Prompt-based AI analysis** — User describes goals in natural language
- AI analyzes text input and recommends strategies based on general DeFi knowledge
- Supports both English and Indonesian prompts
- Fast, flexible, and easy to iterate

### Production (Mainnet)
- **Fine-tuned model** trained on Sui-specific datasets:
  - Historical protocol performance data (Scallop, Navi, Cetus APY history)
  - User savings behavior patterns across rooms
  - Market condition correlations and trends
  - Yield optimization strategies and risk models
- More accurate recommendations based on real historical data
- Better understanding of Sui DeFi ecosystem dynamics
- Personalized suggestions based on user patterns

> **Why Fine-tuning?** Generic AI models lack context about specific DeFi protocols and their historical performance. Training on real data ensures recommendations are grounded in actual Sui ecosystem behavior, not just general financial knowledge.

---

## How It Works

### 1. Input Your Goal

Simply describe your savings goal in natural language:

**Example prompts:**
```
"I want to save for a vacation in 3 months, low risk"
"Saya mau nabung untuk dana darurat, aman saja"
"Looking for aggressive growth, willing to take risks"
"Need to save $5000 in 6 months"
```

### 2. AI Analysis

EigenAI analyzes your prompt considering:

| Factor | What AI Considers |
|--------|-------------------|
| **Risk Tolerance** | Keywords like "safe", "aggressive", "moderate", "conservative" |
| **Time Horizon** | Duration mentioned (days, weeks, months) |
| **Goal Type** | Emergency fund, vacation, investment, long-term savings |
| **Amount** | Deposit size and target amount |
| **Language** | English or Indonesian prompt |

### 3. Strategy Recommendation

AI returns **3 tailored strategies** with:
- ✅ Risk level assessment
- ✅ Specific protocol allocations
- ✅ Expected APY range
- ✅ Detailed reasoning explanation

---

## Strategy Output

---

## Conservative Strategy

**Risk Level:** Low
**Target APY:** ~4%
**Best For:** Risk-averse savers, beginners, emergency funds

**Protocol Allocation:**
```
Scallop (Lending)      → 50%  |  Stable lending yield
Navi Protocol (Lending) → 30%  |  Conservative DeFi returns
Aftermath (Liquid Staking) → 20%  |  Low-risk staking rewards
```

**Characteristics:**
- ✅ Maximum capital protection
- ✅ Stable, predictable growth
- ✅ Focus on battle-tested lending protocols
- ✅ Lower volatility exposure
- ✅ Ideal for short-term goals (7-30 days)

**Why This Works:**
Lending protocols like Scallop and Navi provide consistent yield from borrower interest with minimal impermanent loss risk.

---

## Balanced Strategy

**Risk Level:** Medium
**Target APY:** ~8%
**Best For:** Moderate savers, most users, balanced growth

**Protocol Allocation:**
```
Scallop (Lending)    → 35%  |  Stable base yield
Cetus (DEX/LP)       → 35%  |  Trading fee rewards
Turbos Finance (AMM) → 20%  |  Liquidity incentives
Navi Protocol        → 10%  |  Conservative buffer
```

**Characteristics:**
- ✅ Mix of stability and growth
- ✅ Diversified across lending + DEX
- ✅ Good risk-reward balance
- ✅ Moderate volatility exposure
- ✅ Recommended for medium-term (30-90 days)

**Why This Works:**
Combines stable lending yields with DEX trading fees for enhanced returns without excessive risk.

---

## Aggressive Strategy

**Risk Level:** High
**Target APY:** ~15%
**Best For:** Experienced DeFi users, high risk tolerance

**Protocol Allocation:**
```
Cetus (DEX/LP)         → 40%  |  High trading volume pools
Kriya (DEX)            → 30%  |  Concentrated liquidity
Turbos Finance (AMM)   → 20%  |  Incentive farming
Aftermath (Staking)    → 10%  |  Diversification
```

**Characteristics:**
- ✅ Maximum growth potential
- ✅ Heavy DEX/AMM exposure
- ✅ Higher impermanent loss risk
- ✅ Best for long-term commitment (90+ days)
- ✅ Requires understanding of DeFi mechanics

**Why This Works:**
Focuses on liquidity providing in high-volume DEX pools where trading fees and incentives generate superior yields.

---

## Strategy Comparison

| Aspect | Conservative | Balanced | Aggressive |
|--------|--------------|----------|------------|
| **Target APY** | ~4% | ~8% | ~15% |
| **Risk Level** | Low | Medium | High |
| **Primary Protocols** | Scallop, Navi | Scallop, Cetus | Cetus, Kriya |
| **Volatility** | Very Low | Moderate | High |
| **Best Duration** | 7-30 days | 30-90 days | 90+ days |
| **IL Risk** | None | Low | Medium-High |

---

## Example AI Recommendation

When you input: **"I want to save for emergency fund, need it safe"**

AI responds:

```
🤖 EigenAI Recommendation

Based on your goal: "emergency fund, need it safe"

Recommended Strategy: CONSERVATIVE

Why this fits:
- Emergency funds require high liquidity and safety
- Conservative strategy minimizes volatility risk
- 80% allocation to stable lending (Scallop + Navi)
- Target 4% APY with minimal downside risk
- Short-term flexibility (can withdraw after room ends)

Alternative Options:
1. Balanced (~8% APY) - If willing to accept moderate risk
2. Aggressive (~15% APY) - Not recommended for emergency funds
```

---

## Testnet vs Mainnet

| Aspect | Testnet (Current) | Mainnet (Coming) |
|--------|------------------|------------------|
| AI Model | Prompt-based (generic) | Fine-tuned (DeFi datasets) |
| Protocol Integration | Simulated | Real (Scallop, Navi, Cetus, etc.) |
| APY | Fixed simulation | Variable (market rates) |
| Accuracy | General recommendations | Data-driven precision |

> **Note:** Current testnet uses prompt-based AI with simulated APY rates. Mainnet will deploy a fine-tuned model trained on real Sui DeFi data for more accurate recommendations.

---

[Next: Rewards →](rewards.md)
