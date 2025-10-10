# Hybrid Payment Flow: Personal Account + Smart Account

## Overview

This implementation uses a hybrid approach combining the best of both worlds:

1. **Payment**: Personal account (EOA) pays 0.1 APE + gas
2. **Score Submission**: Smart account submits with gas sponsorship

## Why This Approach?

✅ **User has APE**: Personal wallet already has tokens, no funding needed
✅ **Gas sponsorship works**: Smart account enables gasless score submission
✅ **Simple UX**: User pays small gas for payment, gets free submission
✅ **Best of both**: Combines simplicity with gas sponsorship

## Architecture

```
User Connects Wallet (MetaMask, etc.)
         ↓
Smart Account Created
         ├── Personal Account (EOA)
         │   └── Has APE tokens
         │   └── Makes payment (pays 0.1 APE + gas)
         │
         └── Smart Account
             └── Submits score (gas sponsored ✨)
```

## Transaction Flow

### 1. Payment Transaction (INSERT COIN)

**Who sends**: Personal Account (EOA)
**What's paid**: 0.1 APE + gas (~$0.01)
**Gas sponsored**: No
**Contract**: CoinSlot.playGame()
**Code**: Uses `account.personalAccount`

```typescript
const personalAccount = account.personalAccount || account;
await sendAndConfirmTransaction({
  transaction,
  account: personalAccount, // Personal wallet
});
```

### 2. Score Submission (Game Over)

**Who sends**: Smart Account
**What's paid**: $0 (free for user)
**Gas sponsored**: Yes ✨
**Contract**: Leaderboard.submitScore()
**Code**: Uses `account` directly

```typescript
await sendAndConfirmTransaction({
  transaction,
  account, // Smart account - gas sponsored!
});
```

## Implementation Details

### Smart Account Configuration

In `src/components/layout/Header.tsx`:

```typescript
const wallets = [
  smartWallet({
    chain: curtis,
    factoryAddress: ACCOUNT_FACTORY_ADDRESS,
    gasless: true, // Enable gasless transactions
  }),
  // ... other wallets
];

<ConnectButton
  // ...
  accountAbstraction={{
    chain: curtis,
    factoryAddress: ACCOUNT_FACTORY_ADDRESS,
    gasless: true,
  }}
/>
```

### Payment Using Personal Account

In `src/hooks/useCoinSlot.ts`:

```typescript
const payToPlay = async () => {
  // Access personal account from smart account
  const personalAccount = (account as any).personalAccount;
  const paymentAccount = personalAccount || account;
  
  // Transaction sent from personal account (user pays gas)
  const result = await sendAndConfirmTransaction({
    transaction,
    account: paymentAccount,
  });
};
```

### Score Submission Using Smart Account

In `src/hooks/useLeaderboard.ts`:

```typescript
const submitScore = async (score: number) => {
  // Transaction sent from smart account (gas sponsored)
  const result = await sendAndConfirmTransaction({
    transaction,
    account, // Smart account
  });
};
```

## Gas Sponsorship Setup

### Required Sponsorship Rule

In thirdweb dashboard, create ONE rule:

```
Rule Name: Leaderboard Submission Sponsorship
Status: ✅ Enabled

Chain: ApeChain Curtis (33111)
Contract: <your-leaderboard-address>
Function: submitScore(uint256,address)

Sponsor for: All addresses (smart accounts)
Daily Budget: $10
Per Transaction Limit: $1
```

**Important**: The rule sponsors transactions from **smart account addresses**, not EOAs.

### What Gets Sponsored

✅ **Leaderboard submissions** - Gas sponsored
❌ **Payment transactions** - User pays gas (normal behavior)

## User Experience

### First Time User

1. **Connect Wallet**
   - User connects MetaMask, Coinbase, etc.
   - Smart account automatically created
   - Personal wallet controls smart account

2. **Click INSERT COIN**
   - Wallet prompts for transaction
   - Shows: 0.1 APE + small gas fee
   - User approves from their personal wallet
   - Payment confirmed ✅

3. **Play Game**
   - Game runs in compete mode
   - Score tracked

4. **Game Ends**
   - Score auto-submits
   - No wallet prompt (gas sponsored!)
   - Score appears on leaderboard ✅

### Returning User

1. **Connect Wallet** - Same smart account restored
2. **INSERT COIN** - Pay from personal wallet
3. **Score submits** - Automatic, gas-free

## Cost Breakdown

### Per Game

| Transaction | Sender | User Pays | Dev Pays |
|------------|--------|-----------|----------|
| Payment | Personal Account | 0.1 APE + $0.01 gas | $0 |
| Score Submission | Smart Account | $0 | $0.02 gas |
| **Total** | | **~0.1 APE + $0.01** | **~$0.02** |

### 1000 Daily Games

- **User costs**: 100 APE + $10 in gas
- **Dev costs**: $20 in sponsored gas
- **Revenue**: 100 APE collected

## Addresses Explained

### Personal Account (EOA)
- User's actual wallet address
- Shows in MetaMask/wallet
- Has APE tokens
- Makes payments
- Example: `0xabc...123`

### Smart Account
- Contract wallet created for user
- Controlled by personal account
- Submits scores with gas sponsorship
- Different address from personal account
- Example: `0x4e0d...5A2D`

### Leaderboard Display
- Shows **personal account** address (originalWallet)
- Users recognize their own address
- Consistent across sessions

## Troubleshooting

### Payment not working

**Check**: Does personal account have APE?
- Look at the address shown in your wallet app
- That's your personal account
- It needs APE for payment

### Gas not sponsored for submissions

**Check**: 
1. Is sponsorship rule enabled?
2. Does rule match Leaderboard contract address?
3. Is budget sufficient?
4. Check transaction on explorer - should show paymaster paid gas

**Important**: Sponsorship rule should work for smart account addresses, not EOA addresses.

### "Personal account undefined" error

**Check**: Is smart account properly configured?
- Wallet should connect through smart account wrapper
- If personalAccount is undefined, fallback to regular account works
- Both scenarios are handled in code

## Testing Checklist

- [ ] Log in (creates smart account)
- [ ] Click INSERT COIN
- [ ] Verify transaction from personal account address
- [ ] Verify user pays 0.1 APE + gas
- [ ] Play game in compete mode
- [ ] Verify score submission transaction
- [ ] Check on explorer: submitted from smart account
- [ ] Check on explorer: gas paid by paymaster
- [ ] Verify score on leaderboard with personal address

## Console Verification

When payment succeeds, you should see:

```
Using account for payment: 0xabc...123 (personal)
Smart account address: 0x4e0d...5A2D (smart)
Payment successful from personal wallet: 0x...
```

When score submits, you should see:

```
Score submitted successfully (gas sponsored): 0x...
```

Check the transaction hashes on block explorer to verify:
- Payment: From personal account, user paid gas
- Submission: From smart account, paymaster paid gas

## Key Benefits

1. **No funding smart account** - User's personal wallet already has APE
2. **Gas sponsorship works** - Smart account enables gasless submissions
3. **Familiar UX** - User pays from their known wallet address
4. **Lower dev costs** - Only sponsor one transaction type
5. **Simple & secure** - Best of both approaches

## Summary

This hybrid model gives you:
- ✅ User pays small gas for payment (acceptable)
- ✅ Dev sponsors gas for submission (great UX)
- ✅ No complicated smart account funding
- ✅ Addresses displayed correctly on leaderboard
- ✅ Works with existing gas sponsorship setup

Perfect balance of simplicity and advanced features! 🍌🎮✨

