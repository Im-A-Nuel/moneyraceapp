# MoneyRace Frontend

> Next.js frontend for MoneyRace - an AI-powered gamified savings platform on Sui.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI**: Radix UI + shadcn/ui
- **Blockchain**: @mysten/sui SDK, @mysten/dapp-kit
- **State**: Zustand

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Hero section, features, how it works, race animation |
| Dashboard | `/dashboard` | User stats, active/joined/ended rooms, room search |
| Create Room | `/create-room` | Multi-step form with AI strategy recommendations |
| Room Detail | `/room/[id]` | Room stats, deposit, leaderboard, claim rewards |

## Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
# Open http://localhost:3000
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_RPC=https://fullnode.testnet.sui.io
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_PACKAGE_ID=0x...
NEXT_PUBLIC_ADMIN_CAP_ID=0x...
NEXT_PUBLIC_FAUCET_ID=0x...
NEXT_PUBLIC_USDC_COIN_TYPE=0x...::usdc::USDC
```

## Project Structure

```
frontends/
├── app/                     # Next.js App Router
│   ├── page.tsx             # Landing page
│   ├── dashboard/           # Dashboard with room listings
│   ├── create-room/         # Multi-step room creation
│   └── room/[id]/           # Room detail & interactions
├── components/ui/           # UI Components
│   ├── Navbar.tsx            # Navigation bar
│   ├── Footer.tsx            # Footer with docs link
│   ├── RaceAnimation.tsx     # Live savings race visualization
│   ├── GoldCoin.tsx          # Animated coin component
│   └── MascotAnimation.tsx   # Ant mascot character
├── lib/                     # Utilities
│   ├── api.ts               # Backend API client
│   ├── sui-config.tsx       # Sui SDK configuration
│   └── utils.ts             # Helper functions
├── store/                   # State Management
│   ├── auth.store.ts        # Auth state (Zustand)
│   └── room.store.ts        # Room data cache
└── types/                   # TypeScript interfaces
```

## Key Features

- **Dual Login** - Google OAuth (zkLogin) + Sui Wallet connect
- **AI Chat** - Describe savings goals, get strategy recommendations
- **Gasless UX** - All blockchain transactions sponsored by backend
- **Live Leaderboard** - Real-time participant ranking by consistency
- **Race Animation** - Animated visualization with confetti on winner
- **USDC Faucet** - One-click testnet USDC minting
- **Private Rooms** - Password-protected rooms with auto-generated keys
- **Responsive** - Mobile-friendly layout

## Build & Deploy

```bash
# Production build
npm run build

# Start production server
npm start
```

Deployed on **Vercel**: [moneyraceapp-lac.vercel.app](https://moneyraceapp-lac.vercel.app/)

## License

MIT
