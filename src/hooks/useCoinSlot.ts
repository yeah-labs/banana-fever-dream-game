import { useState, useCallback, useMemo } from 'react';
import { useActiveAccount, useAdminWallet } from 'thirdweb/react';
import { prepareContractCall, readContract, getContract, sendAndConfirmTransaction } from 'thirdweb';
import { client, curtis, COINSLOT_CONTRACT_ADDRESS } from '@/lib/thirdweb';
import { toWei } from 'thirdweb/utils';

// Contract ABI for CoinSlot
const COINSLOT_ABI = [
  {
    "inputs": [],
    "name": "playGame",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_player", "type": "address"}],
    "name": "hasActivePayment",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_player", "type": "address"}],
    "name": "clearPayment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PLAY_COST",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "player", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "GamePaid",
    "type": "event"
  }
] as const;

export const useCoinSlot = () => {
  const account = useActiveAccount();
  const adminWallet = useAdminWallet(); // Get the underlying EOA/personal wallet
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasActivePay, setHasActivePay] = useState(false);

  // Get contract instance (memoized to prevent recreation on every render)
  const contract = useMemo(() => getContract({
    client,
    chain: curtis,
    address: COINSLOT_CONTRACT_ADDRESS,
    abi: COINSLOT_ABI,
  }), []);

  /**
   * Check if the current account has an active payment
   */
  const checkActivePayment = useCallback(async (): Promise<boolean> => {
    if (!account) return false;

    try {
      const result = await readContract({
        contract,
        method: "hasActivePayment",
        params: [account.address],
      });

      setHasActivePay(result as boolean);
      return result as boolean;
    } catch (error) {
      console.error('Error checking active payment:', error);
      return false;
    }
  }, [account, contract]);

  /**
   * Pay 0.1 APE to play the game in compete mode
   * Uses admin wallet (EOA) to pay - user pays 0.1 APE + gas
   * Smart account is used only for score submission (gas sponsored)
   */
  const payToPlay = useCallback(async (): Promise<boolean> => {
    if (!account) {
      setError('No wallet connected');
      return false;
    }

    // Get the admin account (personal wallet) from the admin wallet
    let paymentAccount = account; // Default to smart account
    
    if (adminWallet) {
      const adminAccount = adminWallet.getAccount?.();
      if (adminAccount) {
        paymentAccount = adminAccount;
      }
    }

    setIsPaying(true);
    setError(null);

    try {
      console.log('Using account for payment:', paymentAccount.address);
      console.log('Smart account address:', account.address);
      console.log('Admin wallet exists:', !!adminWallet);

      // Prepare the transaction to pay 0.1 APE
      const transaction = prepareContractCall({
        contract,
        method: "playGame",
        params: [],
        value: toWei('0.1'), // 0.1 APE
      });

      // Send transaction from ADMIN/PERSONAL WALLET - user pays gas + 0.1 APE
      const result = await sendAndConfirmTransaction({
        transaction,
        account: paymentAccount, // Admin wallet pays, not smart account
      });

      console.log('Payment successful from personal wallet:', result.transactionHash);
      
      // Update active payment status
      setHasActivePay(true);
      setIsPaying(false);
      return true;
      
    } catch (error) {
      console.error('Error paying to play:', error);
      
      // Check for user rejection
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('user rejected') || errorMessage.includes('User denied')) {
        setError('Transaction cancelled');
      } else {
        setError('Payment failed. Please try again.');
      }
      
      setIsPaying(false);
      return false;
    }
  }, [account, adminWallet, contract]);

  /**
   * Clear payment status (called after game ends)
   */
  const clearPayment = useCallback(async (): Promise<boolean> => {
    if (!account) return false;

    try {
      const transaction = prepareContractCall({
        contract,
        method: "clearPayment",
        params: [account.address],
      });

      await sendAndConfirmTransaction({
        transaction,
        account,
      });

      setHasActivePay(false);
      return true;
    } catch (error) {
      console.error('Error clearing payment:', error);
      return false;
    }
  }, [account, contract]);

  return {
    payToPlay,
    checkActivePayment,
    clearPayment,
    isPaying,
    error,
    hasActivePay,
    isConnected: !!account,
  };
};

