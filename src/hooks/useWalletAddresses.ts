import { useActiveAccount, useActiveWallet, useAdminWallet } from 'thirdweb/react';

/**
 * Centralized hook for managing wallet addresses
 * Returns the original (admin) wallet address for users with smart wallets,
 * or the regular account address for standard wallets
 */
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

  /**
   * Format wallet address to short form (0x1234...5678)
   */
  const formatAddress = (address?: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return {
    // Original wallet address (raw and formatted)
    originalWalletAddress,
    formattedOriginalAddress: formatAddress(originalWalletAddress),
    
    // Connection status
    isConnected: !!account,
    
    // Utility function for custom formatting
    formatAddress,
  };
};

