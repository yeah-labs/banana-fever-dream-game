# Gas Sponsorship Setup Guide

This guide walks you through enabling gas-free leaderboard score submissions using thirdweb's Account Abstraction and gas sponsorship features.

## Overview

With gas sponsorship enabled, players can submit their scores to the leaderboard without paying gas fees. Your application covers the gas costs, creating a seamless user experience.

## Prerequisites

- Thirdweb account with a project created
- Your `VITE_THIRDWEB_CLIENT_ID` configured in your environment
- Leaderboard contract deployed at: `0xc2b0fd0536590ef616f361e3a4f6ff15a8e36c51`
- ApeChain Curtis Testnet (Chain ID: 33111)

## Step 1: Configure Gas Sponsorship in thirdweb Dashboard

### 1.1 Access Gas Credits Settings

1. Go to [thirdweb Dashboard](https://thirdweb.com/dashboard)
2. Navigate to **Settings** → **Gas Credits** or visit: https://thirdweb.com/dashboard/settings/gas-credits
3. Click **"Add funds"** to purchase gas credits (if needed)

### 1.2 Create Sponsorship Rule

1. Click **"Create Rule"** or **"New Sponsorship Rule"**
2. Configure the following settings:

   **Basic Settings:**
   - **Rule Name**: `Banana Leaderboard Submissions`
   - **Status**: Enabled ✅

   **Chain & Network:**
   - **Chain**: ApeChain Curtis Testnet
   - **Chain ID**: 33111

   **Contract Configuration:**
   - **Contract Address**: `0xc2b0fd0536590ef616f361e3a4f6ff15a8e36c51`
   - **Function**: `submitScore(uint256)`

   **Budget & Limits:**
   - **Daily Budget**: Set based on expected usage (e.g., $10/day)
   - **Monthly Budget**: Set based on expected usage (e.g., $100/month)
   - **Per Transaction Limit**: Set reasonable gas limit (e.g., $1 per transaction)
   - **Rate Limiting**: Consider enabling to prevent abuse

3. Click **"Save"** to activate the rule

## Step 2: Verify Configuration

### 2.1 Test Gas Sponsorship

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Connect a wallet in your app

3. Play the game and submit a score

4. Check the browser console for:
   ```
   Score submitted successfully (gas sponsored): 0x...
   ```

5. Verify the transaction on the block explorer - you should see that gas was paid by thirdweb's paymaster, not your wallet

### 2.2 Monitor Usage

1. Return to **Gas Credits** dashboard
2. View **Usage Statistics**:
   - Total gas sponsored
   - Number of transactions
   - Cost breakdown by contract/function
   - Daily/monthly trends

## Step 3: Production Deployment Considerations

### 3.1 Security Best Practices

When deploying to production, consider these security measures:

1. **Rate Limiting**: Enable rate limiting in sponsorship rules to prevent abuse
   - Limit per wallet address (e.g., max 10 submissions per day)
   - Limit per IP address
   - Set maximum gas per transaction

2. **Contract Verification**: Only sponsor specific verified contracts and functions

3. **Budget Alerts**: Set up alerts for when spending exceeds thresholds

### 3.2 Cost Optimization

1. **Monitor Usage**: Regularly check gas credit usage and adjust budgets
2. **Set Realistic Limits**: Configure per-transaction and daily limits
3. **Consider Tiered Sponsorship**: Sponsor only for new users or special events

### 3.3 Fallback Strategy

If gas sponsorship fails (budget exceeded, service unavailable), the current implementation will return an error. Consider implementing a fallback:

```typescript
// In useLeaderboard.ts - modify submitScore function
try {
  // Try with gas sponsorship first
  const result = await sendAndConfirmTransaction({
    transaction,
    account,
    gasless: true,
  });
  // Success with sponsorship
  return true;
} catch (error) {
  console.error('Gas sponsorship failed, falling back to user-paid gas:', error);
  
  // Fallback: user pays gas
  try {
    const result = await sendAndConfirmTransaction({
      transaction,
      account,
      gasless: false, // User pays gas
    });
    return true;
  } catch (fallbackError) {
    console.error('Transaction failed:', fallbackError);
    return false;
  }
}
```

## Step 4: Advanced Configuration (Optional)

### 4.1 Account Factory Deployment

If you want to use smart accounts (not implemented in current setup):

1. Deploy thirdweb's Account Factory:
   ```bash
   npx thirdweb deploy
   ```
2. Select "Account Factory" from the list
3. Deploy to ApeChain Curtis (33111)
4. Save the deployed address

### 4.2 Backend API for Gas Sponsorship

For enhanced security in production, create a backend API:

```typescript
// backend/api/sponsor-transaction.ts
import { createThirdwebClient } from "thirdweb";
import { sendAndConfirmTransaction } from "thirdweb";

const client = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY, // Only on backend!
});

export async function sponsorScoreSubmission(req, res) {
  // Validate request
  const { score, userAddress } = req.body;
  
  // Add rate limiting checks here
  // Add validation checks here
  
  // Sponsor the transaction
  try {
    const result = await sendAndConfirmTransaction({
      // ... transaction details
      gasless: true,
    });
    
    res.json({ success: true, txHash: result.transactionHash });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
```

## Troubleshooting

### Gas Sponsorship Not Working

1. **Check Dashboard Configuration**:
   - Verify the sponsorship rule is enabled
   - Confirm contract address matches exactly
   - Ensure chain ID is correct (33111)
   - Check that budget limits haven't been exceeded

2. **Check Console Errors**:
   - Look for specific error messages
   - Verify account is connected
   - Check network connection

3. **Verify Client ID**:
   - Ensure `VITE_THIRDWEB_CLIENT_ID` is correctly set
   - Client ID must match the one in thirdweb dashboard

### Budget Exceeded

If you see "Budget exceeded" errors:

1. Increase daily/monthly budget limits
2. Check usage statistics to understand spending
3. Consider implementing more aggressive rate limiting

### Transactions Failing

1. Check ApeChain Curtis RPC is working
2. Verify leaderboard contract is deployed and functional
3. Test with user-paid gas to isolate sponsorship issues

## Cost Estimation

Estimated costs per transaction on ApeChain Curtis:
- Gas price: ~0.1 Gwei (varies)
- submitScore gas usage: ~50,000 gas
- Cost per submission: ~$0.001 - $0.01 (varies with APE price)

For 1000 daily submissions:
- Daily cost: $1 - $10
- Monthly cost: $30 - $300

## Support

For additional help:
- [thirdweb Documentation](https://portal.thirdweb.com/connect/account-abstraction/get-started)
- [thirdweb Discord](https://discord.gg/thirdweb)
- [Gas Credits Guide](https://portal.thirdweb.com/account-abstraction/guides/gas-credits)

## Summary

✅ Gas sponsorship is now enabled for leaderboard submissions
✅ Players can submit scores without paying gas fees
✅ You can monitor and control costs via thirdweb dashboard
✅ Production-ready with proper configuration

Happy building! 🍌🎮

