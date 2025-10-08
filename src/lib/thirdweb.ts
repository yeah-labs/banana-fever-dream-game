import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";

// Create a single ThirdWeb client instance to be shared across the app
export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "e6c0a93655383ce4c2c6ae8726aab5b7",
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
export const LEADERBOARD_CONTRACT_ADDRESS = import.meta.env.VITE_LEADERBOARD_CONTRACT_ADDRESS || "0x9e6921bc255b66ba779cca638049b8cd6fc29070";

// Account Factory address for smart accounts
export const ACCOUNT_FACTORY_ADDRESS = import.meta.env.VITE_ACCOUNT_FACTORY_ADDRESS || "0x1b853d955330c72c964bb33d624248ff213d9335";

