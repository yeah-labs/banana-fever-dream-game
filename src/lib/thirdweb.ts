import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";

// Create a single ThirdWeb client instance to be shared across the app
export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
});

// ApeChain Curtis Testnet configuration
export const curtis = defineChain({
  id: 33111,
  rpc: "https://33111.rpc.thirdweb.com",
  nativeCurrency: {
    name: "ApeCoin",
    symbol: "APE",
    decimals: 18,
  },
});

// Leaderboard contract address
export const LEADERBOARD_CONTRACT_ADDRESS = import.meta.env.VITE_LEADERBOARD_CONTRACT_ADDRESS;

// CoinSlot contract address
export const COINSLOT_CONTRACT_ADDRESS = import.meta.env.VITE_COINSLOT_CONTRACT_ADDRESS;

// Account Factory address for smart accounts
export const ACCOUNT_FACTORY_ADDRESS = import.meta.env.VITE_ACCOUNT_FACTORY_ADDRESS;

