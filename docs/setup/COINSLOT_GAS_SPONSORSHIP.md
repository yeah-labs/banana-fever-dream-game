# CoinSlot Gas Sponsorship Setup Guide

This guide walks you through deploying the CoinSlot contract and enabling gas-free payments for competitive gameplay using thirdweb's gas sponsorship features.

## Overview

The CoinSlot contract enables a pay-to-play competitive mode where players pay 0.1 APE to play and have their scores saved to the leaderboard. With gas sponsorship enabled, players only pay the 0.1 APE - no gas fees required.

## Prerequisites

- Thirdweb account with a project created
- Your `VITE_THIRDWEB_CLIENT_ID` configured in your environment
- ApeChain Curtis Testnet (Chain ID: 33111)
- Wallet with APE tokens for deployment

## Step 1: Deploy CoinSlot Contract

### 1.1 Prepare for Deployment

The CoinSlot contract is located at `contracts/CoinSlot.sol`. It includes:

- `playGame()` - Payable function requiring exactly 0.1 APE
- `hasActivePayment()` - Check if a player has an active payment
- `clearPayment()` - Clear payment status after game ends
- `withdraw()` - Owner can withdraw accumulated funds
- Payment tracking and events

### 1.2 Deploy Using Thirdweb

```bash
npx thirdweb deploy contracts/CoinSlot.sol
```

Follow the prompts:
1. Select your wallet
2. Choose "ApeChain Curtis" (Chain ID: 33111)
3. Confirm the deployment transaction
4. Save the deployed contract address

### 1.3 Update Environment Variables

Add the deployed address to your `.env` file:

```env
VITE_COINSLOT_CONTRACT_ADDRESS=0x<your-deployed-address>
```

## Step 2: Update Leaderboard Contract

### 2.1 Deploy Updated Leaderboard

The updated leaderboard contract now integrates with CoinSlot to verify payments.

```bash
npx thirdweb deploy contracts/Leaderboard.sol
```

### 2.2 Link Contracts

After deploying the updated Leaderboard contract, you need to link it to CoinSlot:

1. Go to your deployed Leaderboard contract in thirdweb dashboard
2. Navigate to the "Write" tab
3. Find the `setCoinSlotAddress` function
4. Enter your CoinSlot contract address
5. Execute the transaction

Update your environment with the new leaderboard address if needed:

```env
VITE_LEADERBOARD_CONTRACT_ADDRESS=0x<your-updated-leaderboard-address>
```

## Step 3: Configure Gas Sponsorship

### 3.1 Access Gas Credits Settings

1. Go to [thirdweb Dashboard](https://thirdweb.com/dashboard)
2. Navigate to **Settings** → **Gas Credits**
3. Add funds if needed

### 3.2 Create Sponsorship Rule for CoinSlot

1. Click **"Create Rule"** or **"New Sponsorship Rule"**
2. Configure the following:

   **Basic Settings:**
   - **Rule Name**: `CoinSlot Payment Sponsorship`
   - **Status**: Enabled ✅

   **Chain & Network:**
   - **Chain**: ApeChain Curtis Testnet
   - **Chain ID**: 33111

   **Contract Configuration:**
   - **Contract Address**: Your CoinSlot contract address
   - **Function**: `playGame()`

   **Budget & Limits:**
   - **Daily Budget**: Set based on expected usage (e.g., $5/day)
   - **Monthly Budget**: Set based on expected usage (e.g., $50/month)
   - **Per Transaction Limit**: $0.50 (should be more than enough)
   - **Rate Limiting**: Recommended - 1 payment per wallet per 5 minutes

3. Click **"Save"** to activate the rule

### 3.3 Verify Existing Leaderboard Sponsorship

Ensure your existing leaderboard sponsorship rule is still active:

1. Navigate to **Gas Credits** → **Rules**
2. Find your "Banana Leaderboard Submissions" rule
3. Verify it's enabled and has sufficient budget
4. Update the contract address if you deployed a new leaderboard

## Step 4: Test the Payment Flow

### 4.1 Test Payment Transaction

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Connect a wallet with APE tokens

3. Click "INSERT COIN" button

4. Approve the 0.1 APE payment (gas should be sponsored)

5. Verify in console:
   ```
   Payment successful (gas sponsored): 0x...
   ```

### 4.2 Test Score Submission

1. Play the game in compete mode

2. Complete the game

3. Score should auto-submit (also gas sponsored)

4. Verify on block explorer that both transactions had gas paid by paymaster

### 4.3 Test Practice Mode

1. Click "PRACTICE" button (no payment)

2. Play the game

3. At game over, verify message shows: "Insert a coin to compete"

4. Verify score is NOT submitted to leaderboard

## Step 5: Production Deployment Considerations

### 5.1 Security Best Practices

1. **Rate Limiting**: Enable aggressive rate limiting to prevent abuse
   - Max 1 payment per wallet per hour
   - Max 5 payments per IP per day

2. **Budget Alerts**: Set up alerts at 50%, 75%, and 90% of budget

3. **Contract Verification**: Verify both contracts on ApeChain block explorer

4. **Monitoring**: Monitor for unusual spending patterns

### 5.2 Cost Estimation

Estimated costs on ApeChain Curtis:
- `playGame()` gas usage: ~50,000 gas
- Gas price: ~0.1 Gwei (varies)
- Cost per payment: ~$0.001 - $0.01

For 1000 daily payments:
- Daily cost: $1 - $10
- Monthly cost: $30 - $300
- Player receives: 100 APE (0.1 APE × 1000 payments)

### 5.3 Revenue Management

**Withdrawing Funds:**

1. Go to your CoinSlot contract in thirdweb dashboard
2. Navigate to "Write" tab
3. Find the `withdraw()` function
4. Execute to withdraw all accumulated APE
5. Funds will be sent to contract owner address

**Best Practices:**
- Withdraw regularly (e.g., weekly) to manage prize pool
- Keep some funds in contract for player confidence
- Monitor total payments via `getBalance()` function

## Step 6: Mainnet Deployment

When ready for mainnet (ApeChain):

1. **Deploy to ApeChain Mainnet:**
   ```bash
   npx thirdweb deploy contracts/CoinSlot.sol --network apechain
   npx thirdweb deploy contracts/Leaderboard.sol --network apechain
   ```

2. **Update Chain Configuration:**
   In `src/lib/thirdweb.ts`, update to ApeChain mainnet:
   ```typescript
   export const apechain = defineChain({
     id: 33139,
     rpc: "https://33139.rpc.thirdweb.com",
     // ... other config
   });
   ```

3. **Update Environment:**
   ```env
   VITE_COINSLOT_CONTRACT_ADDRESS=<mainnet-address>
   VITE_LEADERBOARD_CONTRACT_ADDRESS=<mainnet-address>
   ```

4. **Create Mainnet Sponsorship Rules** with production budgets

5. **Test Thoroughly** before announcing

## Troubleshooting

### Payment Transaction Failing

**Check:**
1. CoinSlot address is correct in environment
2. User has at least 0.1 APE in wallet
3. Gas sponsorship rule is enabled and has budget
4. Chain ID matches (33111 for Curtis testnet)

### Score Submission Failing

**Check:**
1. Player paid via CoinSlot (has active payment)
2. CoinSlot address is set in leaderboard contract
3. Leaderboard gas sponsorship is still active
4. Player wallet is connected

### Gas Not Being Sponsored

**Check:**
1. Sponsorship rules are enabled
2. Budget limits not exceeded
3. Contract addresses match exactly
4. Function names match exactly (`playGame` for payment, `submitScore` for leaderboard)
5. Rate limits not exceeded

### INSERT COIN Button Disabled

**Check:**
1. Wallet is connected (button requires connection)
2. No pending transaction (isPaying state)
3. Contract address is not zero address

## Monitoring & Analytics

### Key Metrics to Track

1. **Payment Metrics:**
   - Total payments received
   - Average payments per day
   - Payment success rate

2. **Gas Sponsorship Metrics:**
   - Total gas sponsored
   - Cost per transaction
   - Failed transactions

3. **Player Metrics:**
   - Unique players who paid
   - Conversion rate (practice → compete)
   - Repeat players

### Accessing Data

Use thirdweb dashboard or directly query contracts:

```typescript
// Get total payments
const balance = await readContract({
  contract: coinSlotContract,
  method: "getBalance",
  params: []
});

// Get leaderboard entries
const entries = await readContract({
  contract: leaderboardContract,
  method: "getAllScores",
  params: []
});
```

## Support Resources

- [Thirdweb Documentation](https://portal.thirdweb.com)
- [Gas Sponsorship Guide](https://portal.thirdweb.com/account-abstraction/guides/gas-credits)
- [ApeChain Documentation](https://docs.apechain.com)
- [Thirdweb Discord](https://discord.gg/thirdweb)

## Summary

✅ CoinSlot contract enables pay-to-play competitive mode
✅ Players pay 0.1 APE to compete for leaderboard rankings
✅ Gas fees sponsored for both payment and score submission
✅ Owner can withdraw accumulated funds anytime
✅ Practice mode remains free for all users
✅ Production-ready with proper security and monitoring

Happy building! 🍌🎮🏆

