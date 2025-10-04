export interface LeaderboardEntry {
  player: string; // Wallet address
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
