import { useState, useCallback, useMemo } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { prepareContractCall, readContract, getContract } from 'thirdweb';
import { useSendTransaction } from 'thirdweb/react';
import { LeaderboardEntry, LeaderboardState } from '@/types/leaderboard';
import { client, curtis } from '@/lib/thirdweb';

// Deployed contract address on ApeChain Curtis Testnet
const CONTRACT_ADDRESS = "0xf31101fe38e8841b0477766040b742b1d40b83ff";

// Contract ABI (only the functions we need)
const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "_score", "type": "uint256"}],
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
      {"indexed": false, "internalType": "uint256", "name": "score", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "ScoreSubmitted",
    "type": "event"
  }
] as const;

export const useLeaderboard = () => {
  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending: isSubmitting } = useSendTransaction();
  
  const [leaderboardState, setLeaderboardState] = useState<LeaderboardState>({
    entries: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  // Get contract instance (memoized to prevent recreation on every render)
  const contract = useMemo(() => getContract({
    client,
    chain: curtis,
    address: CONTRACT_ADDRESS,
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
      const scores = result[1] as bigint[];
      const timestamps = result[2] as bigint[];

      // Convert to LeaderboardEntry array
      const entries: LeaderboardEntry[] = players.map((player, index) => ({
        player,
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
   * Submit a score to the leaderboard
   */
  const submitScore = useCallback(async (score: number): Promise<boolean> => {
    if (!account) {
      console.error('No wallet connected');
      return false;
    }

    if (score <= 0) {
      console.error('Invalid score');
      return false;
    }

    try {
      const transaction = prepareContractCall({
        contract,
        method: "submitScore",
        params: [BigInt(score)],
      });

      return new Promise((resolve) => {
        sendTransaction(transaction, {
          onSuccess: () => {
            console.log('Score submitted successfully');
            // Refresh leaderboard after submission
            fetchLeaderboard();
            resolve(true);
          },
          onError: (error) => {
            console.error('Error submitting score:', error);
            resolve(false);
          },
        });
      });
    } catch (error) {
      console.error('Error preparing transaction:', error);
      return false;
    }
  }, [account, contract, sendTransaction, fetchLeaderboard]);

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
