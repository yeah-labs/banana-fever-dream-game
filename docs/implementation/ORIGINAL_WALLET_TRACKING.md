# Original Wallet Address Tracking

## Overview

The Banana Fever Dream leaderboard tracks and displays **original wallet addresses** instead of smart wallet addresses. This provides a consistent and recognizable experience for users, especially those using Account Abstraction (smart wallets).

## The Problem

When using Account Abstraction (AA) with smart wallets:
- Users have **two addresses**:
  1. **Smart Wallet Address** - The AA contract address (changes between sessions/devices)
  2. **Original Wallet Address** - The user's EOA wallet (MetaMask, etc.) that controls the smart wallet

- If we only store/display smart wallet addresses:
  - ❌ Users don't recognize their own address
  - ❌ Address might be different next session
  - ❌ "You" badge doesn't work correctly
  - ❌ Poor user experience

## The Solution

Store **both addresses** but display only the **original wallet address** in the UI.

### Benefits
- ✅ Users recognize their own wallet address
- ✅ Consistent identity across sessions and devices
- ✅ "You" badge works correctly
- ✅ Better UX for smart wallet users
- ✅ Still works perfectly for regular wallet users

## Implementation

### 1. Smart Contract Changes

**File:** `/contracts/Leaderboard.sol`

```solidity
struct ScoreEntry {
    address player;           // Smart wallet address
    address originalWallet;   // Original EOA wallet address ✨ NEW
    uint256 score;
    uint256 timestamp;
    uint256 entryId;
}

function submitScore(uint256 _score, address _originalWallet) external {
    require(_score > 0, "Score must be greater than 0");
    require(_originalWallet != address(0), "Original wallet cannot be zero address");
    
    ScoreEntry memory newEntry = ScoreEntry({
        player: msg.sender,              // Smart wallet
        originalWallet: _originalWallet, // Original wallet ✨ NEW
        score: _score,
        timestamp: block.timestamp,
        entryId: nextEntryId
    });
    
    allScores.push(newEntry);
    emit ScoreSubmitted(msg.sender, _originalWallet, _score, block.timestamp, nextEntryId);
    
    nextEntryId++;
}
```

### 2. TypeScript Types

**File:** `/src/types/leaderboard.ts`

```typescript
export interface LeaderboardEntry {
  player: string;          // Smart wallet address
  originalWallet: string;  // Original wallet address ✨ NEW
  score: number;
  timestamp: number;
  rank?: number;
}
```

### 3. Wallet Address Hook

**File:** `/src/hooks/useWalletAddresses.ts` (NEW)

```typescript
import { useActiveAccount, useActiveWallet, useAdminWallet } from 'thirdweb/react';

export const useWalletAddresses = () => {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const adminWallet = useAdminWallet();

  // Get the admin/original account from the wallet
  let originalWalletAddress: string | undefined;
  
  // Use adminWallet hook to get the original wallet
  if (adminWallet) {
    const adminAccount = adminWallet.getAccount?.();
    originalWalletAddress = adminAccount?.address;
  }
  
  // Fallback to regular account if no admin wallet
  if (!originalWalletAddress) {
    originalWalletAddress = account?.address;
  }

  const formatAddress = (address?: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return {
    originalWalletAddress,
    formattedOriginalAddress: formatAddress(originalWalletAddress),
    isConnected: !!account,
    formatAddress,
  };
};
```

### 4. Leaderboard Hook Updates

**File:** `/src/hooks/useLeaderboard.ts`

```typescript
import { useWalletAddresses } from './useWalletAddresses';

export const useLeaderboard = () => {
  const account = useActiveAccount();
  const { originalWalletAddress } = useWalletAddresses(); // ✨ NEW

  const submitScore = useCallback(async (score: number): Promise<boolean> => {
    if (!account || !originalWalletAddress) {
      return false;
    }

    const transaction = prepareContractCall({
      contract,
      method: "submitScore",
      params: [
        BigInt(score), 
        originalWalletAddress as `0x${string}` // ✨ NEW parameter
      ],
    });

    const result = await sendAndConfirmTransaction({
      transaction,
      account,
    });

    await fetchLeaderboard();
    return true;
  }, [account, originalWalletAddress, contract, fetchLeaderboard]);

  // ... rest of hook
};
```

### 5. Header Component

**File:** `/src/components/layout/Header.tsx`

```typescript
import { useWalletAddresses } from '@/hooks/useWalletAddresses';

const Header: React.FC = () => {
  const { formattedOriginalAddress, isConnected } = useWalletAddresses();

  return (
    <Badge>
      <User className="w-4 h-4 mr-2" />
      {formattedOriginalAddress}  {/* ✨ Shows original wallet, not smart wallet */}
    </Badge>
  );
};
```

### 6. Leaderboard Page

**File:** `/src/pages/Leaderboard.tsx`

```typescript
import { useWalletAddresses } from '@/hooks/useWalletAddresses';

const Leaderboard: React.FC = () => {
  const { originalWalletAddress, formatAddress } = useWalletAddresses();

  // Find user by original wallet
  const userEntry = originalWalletAddress ? leaderboard.find(entry => 
    entry.originalWallet.toLowerCase() === originalWalletAddress.toLowerCase()
  ) : null;

  return (
    <TableCell>
      {formatAddress(entry.originalWallet)}  {/* ✨ Shows original wallet */}
      {isCurrentUser && <Badge>You</Badge>}
    </TableCell>
  );
};
```

## How It Works: User Flow

### Scenario 1: User with Smart Wallet (Account Abstraction)

1. **User connects** with in-app wallet (Google auth)
2. **Smart wallet created** automatically
   - Smart wallet address: `0x4e0d...5A2D`
   - Original wallet address: `0xc82c...669B` (the EOA controlling it)
3. **User plays game** and submits score
4. **Backend stores** both addresses in contract
5. **UI displays** only `0xc82c...669B` (original wallet)
6. **User sees** their recognizable address everywhere
7. **"You" badge** works correctly

### Scenario 2: User with Regular Wallet (MetaMask)

1. **User connects** with MetaMask
2. **No smart wallet** - just regular EOA
   - Account address: `0xabc1...def2`
   - Original wallet address: `0xabc1...def2` (same)
3. **User plays game** and submits score
4. **Backend stores** both as the same address
5. **UI displays** `0xabc1...def2` (their MetaMask address)
6. **Everything works** the same as before

## Testing

To test original wallet tracking:

1. **Connect with different wallet types**
   - In-app wallet (Google/Discord/X)
   - MetaMask
   - Coinbase Wallet
   - Rabby

2. **Check header shows correct address**
   - For smart wallets: shows original EOA
   - For regular wallets: shows wallet address

3. **Play and submit scores**
   - Verify submission succeeds
   - Check transaction on block explorer
   - Both addresses stored on-chain

4. **View leaderboard**
   - Verify your entries show original wallet
   - "You" badge appears next to your scores
   - Address is consistent across sessions

5. **Reconnect and verify**
   - Disconnect wallet
   - Reconnect (might get different smart wallet)
   - Verify still identified by original wallet
   - "You" badge still works

## Files Modified

1. ✅ `contracts/Leaderboard.sol` - Added originalWallet field
2. ✅ `src/types/leaderboard.ts` - Added originalWallet to type
3. ✅ `src/hooks/useWalletAddresses.ts` - NEW centralized hook
4. ✅ `src/hooks/useLeaderboard.ts` - Pass originalWallet to contract
5. ✅ `src/components/layout/Header.tsx` - Show original wallet
6. ✅ `src/pages/Leaderboard.tsx` - Show original wallets

## Contract Deployment

When deploying the updated contract:

1. **Deploy** new `Leaderboard.sol` contract
2. **Update** contract address in `/src/lib/thirdweb.ts`
3. **Update** ABI in `/src/hooks/useLeaderboard.ts` (if needed)
4. **Test** with different wallet types
5. **Verify** on block explorer (optional)

### Migration Notes

- ⚠️ This is a **breaking change** - requires new contract deployment
- 🔄 Old leaderboard data won't have originalWallet field
- ✅ Start fresh with new contract (as decided)
- ✅ No migration needed

## Troubleshooting

### Header shows smart wallet instead of original wallet

**Check:**
- `useWalletAddresses` hook is properly imported
- `useAdminWallet()` is available and returns data
- Console logs show correct originalWalletAddress
- Component is using `formattedOriginalAddress` not `account.address`

**Fix:**
```typescript
// ❌ Wrong
{formatAddress(account.address)}

// ✅ Correct
const { formattedOriginalAddress } = useWalletAddresses();
{formattedOriginalAddress}
```

### "You" badge not appearing

**Check:**
- Matching logic uses `originalWallet` not `player`
- Comparison is case-insensitive (`.toLowerCase()`)
- `originalWalletAddress` is defined

**Fix:**
```typescript
// ❌ Wrong
const isCurrentUser = entry.player.toLowerCase() === account.address.toLowerCase();

// ✅ Correct
const isCurrentUser = originalWalletAddress && 
  entry.originalWallet.toLowerCase() === originalWalletAddress.toLowerCase();
```

### Contract call fails

**Check:**
- Updated contract is deployed
- Contract address is correct in config
- ABI includes updated `submitScore` signature
- Both parameters are provided

**Fix:**
```typescript
// ❌ Wrong (old signature)
params: [BigInt(score)]

// ✅ Correct (new signature)
params: [BigInt(score), originalWalletAddress as `0x${string}`]
```

## Best Practices

1. **Always use `useWalletAddresses` hook** for getting wallet addresses
2. **Never display smart wallet addresses** in UI
3. **Store both addresses** in smart contract for flexibility
4. **Match users by original wallet** for "You" badges
5. **Test with multiple wallet types** before deployment
6. **Handle undefined gracefully** (wallet not connected)

## Future Enhancements

Possible improvements:
- Allow users to view their smart wallet address (in settings)
- Add ENS resolution for original wallets
- Display wallet icons based on type
- Show "Smart Account" badge for AA users
- Link to block explorer with both addresses

---

**Status**: ✅ Implemented and tested with multiple wallet types
**Last Updated**: 2025

