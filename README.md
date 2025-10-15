# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/41d9e267-6704-4f9f-b1cf-ab41253714e2

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/41d9e267-6704-4f9f-b1cf-ab41253714e2) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- ThirdWeb (Web3 wallet integration)
- Plausible Analytics (Privacy-friendly analytics)

## 🎮 Game Features

- **Fast-paced gameplay** - No pause functionality for continuous action
- **WASD/Arrow controls** - Move your monkey character
- **Space to shoot** - Fire bananas at enemies
- **F key for Fever Mode** - Activate special abilities when meter is full
- **Gas-free leaderboard** - Submit scores without paying gas fees
- **Web3 integration** - Connect with MetaMask and other wallets
- **Smart accounts** - Automatic account abstraction for seamless UX
- **Original wallet tracking** - Consistent user identification across smart and regular wallets

## Environment Variables Setup

This project requires environment variables to function. Create a `.env` file in the root directory with the following variables:

```env
# ThirdWeb Configuration
VITE_THIRDWEB_CLIENT_ID=your_thirdweb_client_id_here

# ApeChain Contract Addresses
VITE_LEADERBOARD_CONTRACT_ADDRESS=0x1a184ce89ce282c23abc38e9f2d010ce740393cb
VITE_COINSLOT_CONTRACT_ADDRESS=0x871103bae46a7fc99ba11f1312b4cadd44cda3b8
VITE_ACCOUNT_FACTORY_ADDRESS=0x1b853d955330c72c964bb33d624248ff213d9335

# Game Configuration
VITE_COIN_COST_APE=0.1

# Supabase Configuration (if using Supabase features)
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here
```

**Note**: All environment variables are required. The app will not function without them.

### Getting Your Values

1. **ThirdWeb Client ID**: Get from [ThirdWeb Dashboard](https://thirdweb.com/dashboard)
2. **Contract Addresses**: Use the default values shown above (deployed on ApeChain Curtis)
3. **Coin Cost**: Set to `0.1` for 0.1 APE per game (adjust as needed)
4. **Supabase**: Get from your [Supabase Project Settings](https://supabase.com/dashboard)

## ThirdWeb Integration

This project includes ThirdWeb integration for Web3 wallet connections with social login support

### Features

- **Social Login**: Connect with Google/Gmail accounts
- **Wallet Display**: Shows connected wallet address in the header
- **Multiple Wallet Support**: Supports various Web3 wallets
- **Disconnect Functionality**: Easy wallet disconnection
- **Gas Sponsorship**: Players can submit leaderboard scores without paying gas fees! 🎉

### Components

- `Header.tsx`: Main header component with wallet connection UI
- ThirdWeb Provider: Wraps the entire app for wallet functionality

## 🎉 Gasless Leaderboard with Account Abstraction

The leaderboard now supports **completely gas-free score submissions** using thirdweb's Account Abstraction and Smart Accounts!

### ✅ What's Working

- **Smart Accounts**: Users connect with familiar wallets (MetaMask, etc.)
- **Gasless Transactions**: No gas fees for score submissions
- **Instant Submissions**: 2-5 seconds vs 15-30 seconds
- **Seamless UX**: No MetaMask popups for score submissions
- **Automatic Setup**: Smart accounts created automatically

### 🚀 How It Works

1. **User connects** with MetaMask (or other wallet)
2. **Smart account created** automatically (one-time setup)
3. **Play game** and submit score
4. **Transaction is gasless** - sponsored by your thirdweb credits
5. **Instant submission** - no popups or confirmations needed

### 📊 Benefits

- **Higher engagement** - no gas barrier
- **Better retention** - users don't need APE tokens
- **Professional UX** - modern Web3 experience
- **Controlled costs** - set sponsorship budgets

### 🔧 Technical Implementation

- **Account Factory**: `0x1b853d955330c72c964bb33d624248ff213d9335`
- **Leaderboard Contract**: `0xc2b0fd0536590ef616f361e3a4f6ff15a8e36c51`
- **Chain**: ApeChain Curtis (33111)
- **Smart Wallet**: Configured with gasless transactions
- **Account Abstraction**: Enabled in ConnectButton

### 📚 Documentation

All technical documentation has been organized in the `docs/` folder:

- **Quick Start**: See `docs/setup/QUICK_START_GAS_SPONSORSHIP.md`
- **Full Guide**: See `docs/setup/GAS_SPONSORSHIP_SETUP.md`
- **Success Guide**: See `docs/setup/SMART_ACCOUNT_SUCCESS.md`
- **Implementation Details**: See `docs/implementation/`
- **Documentation Index**: See `docs/README.md`

### 💰 Cost Management

Monitor gas sponsorship usage in your thirdweb dashboard:
- Track sponsored transactions
- Set daily/monthly budgets
- Configure rate limiting
- Set up budget alerts

## 📊 Analytics

The project uses **Plausible Analytics** for privacy-friendly, GDPR-compliant user tracking.

### What's Tracked

- **User Interactions**: Button clicks and navigation
- **Game Events**: Game starts, game ends, scores
- **Engagement Metrics**: Feature usage and user flow

### Events Tracked

1. **Click Events**: All major buttons (Login, Practice, Leaderboard, etc.)
2. **Game Started**: Tracks mode (compete vs practice)
3. **Game Ended**: Tracks mode, type (manual/game over), and final score

### Privacy

- No personal data collected
- No cookies used
- GDPR/CCPA compliant
- IP addresses anonymized

### Documentation

For full analytics implementation details, see [Analytics Integration Guide](docs/implementation/ANALYTICS_INTEGRATION.md).

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/41d9e267-6704-4f9f-b1cf-ab41253714e2) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
