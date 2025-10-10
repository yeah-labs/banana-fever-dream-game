# Gas-Sponsored Payment Flow Implementation

> **Note**: This document describes the dual gas sponsorship approach. The current implementation uses a **hybrid approach** (personal account for payment, smart account for submission). See `docs/setup/HYBRID_PAYMENT_FLOW.md` for current implementation.

## Overview

This document describes the implementation of dual gas sponsorship for both payment and score submission transactions in the Banana Fever Dream game.

## Transaction Flow

### 1. Payment Transaction (INSERT COIN)
- **Who sends**: Original wallet (EOA)
- **What's paid**: 0.1 APE (by user)
- **Gas**: Sponsored by developer via thirdweb paymaster
- **Contract**: CoinSlot.playGame()
- **Tracks**: Payment by original wallet address

### 2. Score Submission (Game Over)
- **Who sends**: Smart account
- **What's paid**: Nothing (free transaction)
- **Gas**: Sponsored by developer via thirdweb paymaster
- **Contract**: Leaderboard.submitScore()
- **Verifies**: Original wallet has active payment

## Implementation Details

### Frontend Changes

#### `src/hooks/useCoinSlot.ts`
- **Updated**: Uses `personalAccount` (original wallet) for payment transactions
- **Key Feature**: `paymentAccount = account.personalAccount || account`
- **Benefit**: User pays 0.1 APE from their original wallet with sponsored gas

```typescript
// Get the personal account (original wallet) from the smart account
const paymentAccount = (account as any).personalAccount || account;

// Send transaction from original wallet with gas sponsorship
const result = await sendAndConfirmTransaction({
  transaction,
  account: paymentAccount, // Original wallet pays 0.1 APE, gas sponsored
});
```

### Smart Contract Changes

#### `contracts/Leaderboard.sol`
- **Updated**: Modifier now checks original wallet payment status
- **Key Change**: `onlyPaidPlayers(address _originalWallet)` takes parameter
- **Verification**: Checks `hasActivePayment(_originalWallet)` not `msg.sender`

```solidity
modifier onlyPaidPlayers(address _originalWallet) {
    require(coinSlotAddress != address(0), "CoinSlot address not set");
    ICoinSlot coinSlot = ICoinSlot(coinSlotAddress);
    // Check if the ORIGINAL wallet paid, not the smart account submitting
    require(coinSlot.hasActivePayment(_originalWallet), "Original wallet must pay to submit score");
    _;
}
```

#### `contracts/CoinSlot.sol`
- **No changes needed**: Already tracks by `msg.sender` (original wallet)
- Contract correctly stores payment status per original wallet address

## Deployment Steps

### 1. Deploy Updated Contracts

```bash
# Deploy updated Leaderboard contract
npx thirdweb deploy contracts/Leaderboard.sol

# CoinSlot doesn't need redeployment (no changes)
# But if deploying fresh:
npx thirdweb deploy contracts/CoinSlot.sol
```

### 2. Update Environment Variables

Update `.env` with deployed addresses:

```env
VITE_LEADERBOARD_CONTRACT_ADDRESS=<new-leaderboard-address>
VITE_COINSLOT_CONTRACT_ADDRESS=<coinslot-address>
```

### 3. Link Contracts

After deploying the new Leaderboard contract:

1. Go to thirdweb dashboard → Your Leaderboard contract
2. Navigate to "Write" tab
3. Call `setCoinSlotAddress(address)`
4. Enter your CoinSlot contract address
5. Execute transaction

### 4. Configure Gas Sponsorship (Critical!)

You need **TWO** sponsorship rules in thirdweb dashboard:

#### Rule 1: CoinSlot Payment Sponsorship

```
Settings → Gas Credits → Create Rule

Rule Name: CoinSlot Payment Sponsorship
Status: ✅ Enabled

Chain: ApeChain Curtis Testnet
Chain ID: 33111

Contract Address: <your-coinslot-address>
Function: playGame()

Sponsor for: All addresses
Daily Budget: $10 (adjust based on usage)
Monthly Budget: $100
Per Transaction Limit: $1
Rate Limiting: 1 payment per wallet per hour (recommended)
```

#### Rule 2: Leaderboard Submission Sponsorship

```
Settings → Gas Credits → Create Rule

Rule Name: Leaderboard Submission Sponsorship
Status: ✅ Enabled

Chain: ApeChain Curtis Testnet
Chain ID: 33111

Contract Address: <your-leaderboard-address>
Function: submitScore(uint256,address)

Sponsor for: All addresses
Daily Budget: $10 (adjust based on usage)
Monthly Budget: $100
Per Transaction Limit: $1
Rate Limiting: 5 submissions per wallet per hour (recommended)
```

### 5. Restart Development Server

```bash
npm run dev
```

## Testing Checklist

### Payment Transaction Test
- [ ] Log in with original EOA that has APE
- [ ] Click "INSERT COIN" button
- [ ] Verify transaction uses original wallet address (not smart account)
- [ ] Verify user pays 0.1 APE
- [ ] Check transaction on explorer - gas should be sponsored
- [ ] Verify `hasActivePay[originalWallet] = true` in CoinSlot contract

### Score Submission Test
- [ ] Play game in compete mode
- [ ] Finish game with a score
- [ ] Verify smart account submits score
- [ ] Check transaction on explorer - gas should be sponsored
- [ ] Verify score appears on leaderboard
- [ ] Verify `hasActivePay[originalWallet] = false` after submission

### Practice Mode Test
- [ ] Click "PRACTICE" button
- [ ] Play game
- [ ] Verify no payment transaction
- [ ] Verify score NOT submitted to leaderboard

## Cost Analysis

### Per Compete Game
- **Payment transaction**: ~50,000 gas ≈ $0.001 - $0.01
- **Score submission**: ~100,000 gas ≈ $0.002 - $0.02
- **Total gas sponsored**: $0.003 - $0.03 per game

### Daily Volume (1000 games)
- **Gas costs**: $3 - $30 per day
- **Revenue**: 100 APE collected (1000 × 0.1 APE)
- **Net**: Depends on APE price (~$10-100 APE value)

## User Experience

### What User Pays
1. **First time**: Connects wallet (free)
2. **INSERT COIN**: Approves 0.1 APE payment (no gas fees!)
3. **Play game**: Free gameplay
4. **Score submission**: Automatic, no approval needed (no gas fees!)

### What Developer Pays
1. **Payment transaction gas**: ~$0.01 per game
2. **Score submission gas**: ~$0.02 per game
3. **Total**: ~$0.03 per compete game

## Key Benefits

✅ **User pays only 0.1 APE** - No gas fees at all
✅ **Original wallet keeps control** - Payment from actual wallet
✅ **Smart account for submission** - Seamless score saving
✅ **Dual gas sponsorship** - Both transactions covered
✅ **Clear separation** - Payment vs. submission flows
✅ **Cost control** - Daily/monthly budget limits

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER CLICKS "INSERT COIN"                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Original Wallet (EOA) sends transaction                    │
│  Value: 0.1 APE (user pays)                                 │
│  Gas: Sponsored by paymaster (you pay)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  CoinSlot.playGame()                                        │
│  hasActivePay[originalWallet] = true                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    USER PLAYS GAME                          │
│                    (compete mode)                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    GAME ENDS                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Smart Account sends transaction                            │
│  Value: 0 (free)                                            │
│  Gas: Sponsored by paymaster (you pay)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Leaderboard.submitScore(_score, _originalWallet)          │
│  Checks: hasActivePay[_originalWallet] == true             │
│  Action: Save score, clear payment                          │
└─────────────────────────────────────────────────────────────┘
```

## Troubleshooting

### "Insufficient funds" error
- **Problem**: Original wallet doesn't have 0.1 APE
- **Solution**: Send APE to original wallet address (not smart account)

### "Original wallet must pay to submit score" error
- **Problem**: Payment wasn't registered or already cleared
- **Solution**: Click INSERT COIN again before playing

### Gas sponsorship not working
- **Check**: Both sponsorship rules are enabled
- **Check**: Contract addresses match exactly
- **Check**: Function names match exactly
- **Check**: Budget not exceeded

### Smart account not accessible
- **Problem**: `personalAccount` is undefined
- **Solution**: User may not be using smart account, fallback works
- **Note**: Code handles both cases: `personalAccount || account`

## Monitoring

### Metrics to Track
1. **Payment success rate**: % of INSERT COIN clicks that succeed
2. **Score submission rate**: % of compete games that submit scores
3. **Gas costs**: Daily/monthly sponsorship spend
4. **Revenue**: Total APE collected in CoinSlot
5. **Failed transactions**: Track and analyze failures

### Dashboard Queries

```typescript
// Check payment status for a wallet
const hasPaid = await readContract({
  contract: coinSlotContract,
  method: "hasActivePayment",
  params: [originalWalletAddress]
});

// Get contract balance
const balance = await readContract({
  contract: coinSlotContract,
  method: "getBalance",
  params: []
});

// Withdraw funds (owner only)
await sendAndConfirmTransaction({
  transaction: prepareContractCall({
    contract: coinSlotContract,
    method: "withdraw",
    params: []
  }),
  account: ownerAccount
});
```

## Security Considerations

### Rate Limiting
- **Payment**: 1 per wallet per hour prevents spam
- **Submission**: 5 per wallet per hour allows legitimate retries
- **Budget limits**: Daily/monthly caps prevent runaway costs

### Payment Verification
- Leaderboard contract verifies payment before accepting score
- Payment tracked by original wallet, not smart account
- Payment automatically cleared after successful submission

### Access Control
- Only contract owner can set CoinSlot address
- Only contract owner can withdraw funds
- All transactions logged with events

## Next Steps

1. ✅ Deploy updated Leaderboard contract
2. ✅ Link CoinSlot and Leaderboard contracts
3. ✅ Configure both gas sponsorship rules
4. ✅ Test payment flow end-to-end
5. ✅ Monitor costs and adjust budgets
6. 🔄 Consider implementing prize distribution
7. 🔄 Add analytics dashboard
8. 🔄 Implement anti-cheat measures

## Summary

This implementation provides the best user experience:
- **User**: Pays only 0.1 APE, no gas fees, simple flow
- **Developer**: Controls costs, sponsors gas for both transactions
- **Security**: Payment verification, rate limiting, budget controls
- **Scalability**: Can handle thousands of daily games

The dual gas sponsorship model makes the game accessible while maintaining security and cost control. 🍌🎮🏆

