import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";

// Create a single ThirdWeb client instance to be shared across the app
export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "68d5404076f619c37f4207240d300b13",
});

// Get chain ID from environment variable (default to ApeChain mainnet)
// Curtis Testnet: 33111 | ApeChain Mainnet: 33139
const CHAIN_ID = parseInt(import.meta.env.VITE_APECHAIN_CHAIN_ID || "33139", 10);

// ApeChain configuration (supports both Curtis testnet and mainnet)
export const apechain = defineChain({
  id: CHAIN_ID,
  rpc: `https://${CHAIN_ID}.rpc.thirdweb.com`,
  nativeCurrency: {
    name: "ApeCoin",
    symbol: "APE",
    decimals: 18,
  },
});

// Backward compatibility alias
export const curtis = apechain;

// Leaderboard contract address
export const LEADERBOARD_CONTRACT_ADDRESS = import.meta.env.VITE_LEADERBOARD_CONTRACT_ADDRESS || "0x1b853d955330c72c964bb33d624248ff213d9335";

// CoinSlot contract address
export const COINSLOT_CONTRACT_ADDRESS = import.meta.env.VITE_COINSLOT_CONTRACT_ADDRESS || "0xc2b0fd0536590ef616f361e3a4f6ff15a8e36c51";

// Account Factory address for smart accounts
export const ACCOUNT_FACTORY_ADDRESS = import.meta.env.VITE_ACCOUNT_FACTORY_ADDRESS || "0xf31101fe38e8841b0477766040b742b1d40b83ff";

