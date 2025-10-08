export interface LeaderboardEntry {
  player: string; // Smart wallet address
  originalWallet: string; // Original wallet address (EOA)
  score: number;
  timestamp: number;
  rank?: number;
}

export interface LeaderboardState {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}
