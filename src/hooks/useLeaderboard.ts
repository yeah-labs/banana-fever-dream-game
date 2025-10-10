import { useState, useCallback, useMemo } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { prepareContractCall, readContract, getContract, sendAndConfirmTransaction } from 'thirdweb';
import { LeaderboardEntry, LeaderboardState } from '@/types/leaderboard';
import { client, curtis, LEADERBOARD_CONTRACT_ADDRESS } from '@/lib/thirdweb';
import { useWalletAddresses } from './useWalletAddresses';

// Contract ABI (only the functions we need)
const CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "_score", "type": "uint256"},
      {"internalType": "address", "name": "_originalWallet", "type": "address"}
    ],
    "name": "submitScore",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllScores",
    "outputs": [
      {"internalType": "address[]", "name": "_players", "type": "address[]"},
      {"internalType": "address[]", "name": "_originalWallets", "type": "address[]"},
      {"internalType": "uint256[]", "name": "_scores", "type": "uint256[]"},
      {"internalType": "uint256[]", "name": "_timestamps", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_player", "type": "address"}],
    "name": "getPlayerScore",
    "outputs": [
      {"internalType": "uint256", "name": "score", "type": "uint256"},
      {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "player", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "originalWallet", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "score", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "entryId", "type": "uint256"}
    ],
    "name": "ScoreSubmitted",
    "type": "event"
  }
] as const;

export const useLeaderboard = () => {
  const account = useActiveAccount();
  const { originalWalletAddress } = useWalletAddresses();
  
  const [leaderboardState, setLeaderboardState] = useState<LeaderboardState>({
    entries: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get contract instance (memoized to prevent recreation on every render)
  const contract = useMemo(() => getContract({
    client,
    chain: curtis,
    address: LEADERBOARD_CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
  }), []);

  /**
   * Fetch all scores from the contract and sort them
   */
  const fetchLeaderboard = useCallback(async () => {
    setLeaderboardState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Read all scores from contract
      const result = await readContract({
        contract,
        method: "getAllScores",
        params: [],
      });

      const players = result[0] as string[];
      const originalWallets = result[1] as string[];
      const scores = result[2] as bigint[];
      const timestamps = result[3] as bigint[];

      // Convert to LeaderboardEntry array
      const entries: LeaderboardEntry[] = players.map((player, index) => ({
        player,
        originalWallet: originalWallets[index],
        score: Number(scores[index]),
        timestamp: Number(timestamps[index]),
      }));

      // Sort by score (descending) and add ranks
      const sortedEntries = entries
        .sort((a, b) => b.score - a.score)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

      setLeaderboardState({
        entries: sortedEntries,
        isLoading: false,
        error: null,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboardState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to fetch leaderboard data',
      }));
    }
  }, [contract]);

  /**
   * Submit a score to the leaderboard with gas sponsorship
   * Note: Only submit if the player paid to play (compete mode)
   * The contract will verify payment status via CoinSlot contract
   */
  const submitScore = useCallback(async (score: number, playMode?: string): Promise<boolean> => {
    if (!account) {
      console.error('No wallet connected');
      return false;
    }

    if (!originalWalletAddress) {
      console.error('No original wallet address found');
      return false;
    }

    if (score <= 0) {
      console.error('Invalid score');
      return false;
    }

    // Only submit scores from compete mode
    if (playMode && playMode !== 'compete') {
      console.log('Score not submitted: Only compete mode scores are saved to leaderboard');
      return false;
    }

    setIsSubmitting(true);

    try {
      // Prepare the transaction with originalWallet parameter
      const transaction = prepareContractCall({
        contract,
        method: "submitScore",
        params: [BigInt(score), originalWalletAddress as `0x${string}`],
      });

      // Send transaction with gas sponsorship
      // This will automatically use thirdweb's paymaster if configured in the dashboard
      const result = await sendAndConfirmTransaction({
        transaction,
        account,
      });

      console.log('Score submitted successfully (gas sponsored):', result.transactionHash);
      
      // Refresh leaderboard after submission
      await fetchLeaderboard();
      
      setIsSubmitting(false);
      return true;
      
    } catch (error) {
      console.error('Error submitting score:', error);
      setIsSubmitting(false);
      return false;
    }
  }, [account, originalWalletAddress, contract, fetchLeaderboard]);

  /**
   * Get a specific player's score
   */
  const getPlayerScore = useCallback(async (playerAddress: string): Promise<{ score: number; timestamp: number } | null> => {
    try {
      const result = await readContract({
        contract,
        method: "getPlayerScore",
        params: [playerAddress as `0x${string}`],
      });

      return {
        score: Number(result[0]),
        timestamp: Number(result[1]),
      };
    } catch (error) {
      console.error('Error fetching player score:', error);
      return null;
    }
  }, [contract]);

  return {
    leaderboard: leaderboardState.entries,
    isLoading: leaderboardState.isLoading,
    error: leaderboardState.error,
    lastUpdated: leaderboardState.lastUpdated,
    isSubmitting,
    submitScore,
    fetchLeaderboard,
    getPlayerScore,
    isConnected: !!account,
  };
};