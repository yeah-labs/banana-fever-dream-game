import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";

// Create a single ThirdWeb client instance to be shared across the app
export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "your-client-id",
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

