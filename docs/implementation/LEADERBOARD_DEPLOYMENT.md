# Leaderboard Deployment Guide

## Step 1: Deploy the Smart Contract

### Prerequisites
- Install [Foundry](https://getfoundry.sh/) or use [Remix IDE](https://remix.ethereum.org/)
- Have APE tokens on ApeChain Curtis Testnet
- Get testnet APE from [Curtis Faucet](https://curtis.apefaucet.com/)

### Option A: Using Remix IDE (Recommended for simplicity)

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create a new file `BananaLeaderboard.sol`
3. Copy the contract code from `/contracts/BananaLeaderboard.sol`
4. Compile the contract (Solidity 0.8.20+)
5. Deploy:
   - Select "Injected Provider - MetaMask" in Environment
   - Connect to ApeChain Curtis Testnet (Chain ID: 33111)
   - Click "Deploy"
   - Confirm the transaction in your wallet
6. Copy the deployed contract address

### Option B: Using Foundry

```bash
# Initialize Foundry project
forge init leaderboard-contract
cd leaderboard-contract

# Copy contract
cp ../contracts/BananaLeaderboard.sol src/

# Deploy (replace YOUR_PRIVATE_KEY)
forge create --rpc-url https://33111.rpc.thirdweb.com \
  --private-key YOUR_PRIVATE_KEY \
  src/BananaLeaderboard.sol:BananaLeaderboard

# Save the deployed contract address
```

## Step 2: Update Frontend Configuration

1. Open `src/hooks/useLeaderboard.ts`
2. Replace `YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE` with your actual contract address:
   ```typescript
   const CONTRACT_ADDRESS = "0xYourContractAddressHere";
   ```

## Step 3: Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Test the following flows:
   - Connect wallet
   - Play a game
   - Check if score is submitted on game over
   - Navigate to `/leaderboard`
   - Verify your score appears
   - Test refresh functionality

## Step 4: Verify Contract (Optional but Recommended)

Using Remix:
1. Go to the contract on Curtis block explorer
2. Click "Verify and Publish"
3. Select compiler version 0.8.20
4. Paste the flattened source code
5. Verify

## Network Details

**ApeChain Curtis Testnet**
- Chain ID: 33111
- RPC: https://33111.rpc.thirdweb.com
- Currency: APE
- Block Explorer: https://curtis.explorer.caldera.xyz/

## Troubleshooting

### "Insufficient funds" error
- Get testnet APE from the faucet

### "Transaction reverted" when submitting score
- Ensure score > 0
- Ensure new score > previous best score
- Check wallet has enough APE for gas

### Leaderboard not loading
- Verify contract address is correct
- Check browser console for errors
- Ensure ThirdWeb client ID is set in `.env`

### Score not appearing
- Wait a few seconds for blockchain confirmation
- Click refresh button
- Check transaction on block explorer

## Future Enhancements

The contract is designed to be extensible. To add more fields later:

1. Update the `ScoreEntry` struct in the contract
2. Deploy a new version of the contract
3. Update the frontend types and UI
4. Consider adding a migration function to move data
