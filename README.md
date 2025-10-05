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

## ThirdWeb Integration

This project includes ThirdWeb integration for Web3 wallet connections with social login support.

### Setup

1. Get your ThirdWeb Client ID from [ThirdWeb Dashboard](https://thirdweb.com/dashboard)
2. Create a `.env` file in the root directory:
   ```
   VITE_THIRDWEB_CLIENT_ID=your-thirdweb-client-id-here
   ```
3. The app will automatically use the client ID for wallet connections

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

- **Quick Start**: See `QUICK_START_GAS_SPONSORSHIP.md`
- **Full Guide**: See `GAS_SPONSORSHIP_SETUP.md`
- **Success Guide**: See `SMART_ACCOUNT_SUCCESS.md`

### 💰 Cost Management

Monitor gas sponsorship usage in your thirdweb dashboard:
- Track sponsored transactions
- Set daily/monthly budgets
- Configure rate limiting
- Set up budget alerts

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/41d9e267-6704-4f9f-b1cf-ab41253714e2) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
