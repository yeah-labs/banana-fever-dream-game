import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, RefreshCw, Trophy, Medal, Award } from 'lucide-react';
import { useActiveAccount } from 'thirdweb/react';

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const account = useActiveAccount();
  const { leaderboard, isLoading, error, fetchLeaderboard, lastUpdated } = useLeaderboard();

  // Fetch leaderboard data when component mounts
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Get top 20 entries
  const top20 = leaderboard.slice(0, 20);

  // Find current user's rank if they're on the leaderboard
  const userEntry = account ? leaderboard.find(entry => 
    entry.player.toLowerCase() === account.address.toLowerCase()
  ) : null;

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 hover:bg-yellow-600">1st</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400 hover:bg-gray-500">2nd</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600 hover:bg-amber-700">3rd</Badge>;
    return <Badge variant="outline">{rank}th</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-game flex flex-col items-center justify-start p-4 pt-4">
      <div className="w-full max-w-4xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/')}
            className="border-primary hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Game
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={fetchLeaderboard}
            disabled={isLoading}
            className="border-primary hover:bg-primary/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-primary">Leaderboard</h1>
          <p className="text-base text-muted-foreground">
            Top 20 players in the Banana Fever Dream
          </p>
        </div>

        {/* User's Rank Card (if on leaderboard and not in top 20) */}
        {userEntry && userEntry.rank && userEntry.rank > 20 && (
          <Card className="bg-card/80 backdrop-blur-sm border-primary/50">
            <CardHeader>
              <CardTitle className="text-center">Your Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getRankBadge(userEntry.rank)}
                  <span className="font-mono">{formatAddress(userEntry.player)}</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {userEntry.score.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Connection Warning */}
        {!account && (
          <Alert className="bg-yellow-500/10 border-yellow-500/50">
            <AlertDescription className="text-center">
              Connect your wallet to rank on the board!
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Leaderboard Table */}
        <Card className="bg-card/80 backdrop-blur-sm -mt-2">
          <CardContent className="pt-3 pb-3">
            {isLoading && leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading leaderboard...
              </div>
            ) : top20.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No scores yet. Be the first to play!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {top20.map((entry) => {
                    const isCurrentUser = account && 
                      entry.player.toLowerCase() === account.address.toLowerCase();
                    
                    return (
                      <TableRow 
                        key={`${entry.player}-${entry.timestamp}`}
                        className={isCurrentUser ? 'bg-primary/10' : ''}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRankIcon(entry.rank!)}
                            {getRankBadge(entry.rank!)}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          <div className="flex items-center gap-2">
                            {formatAddress(entry.player)}
                            {isCurrentUser && (
                              <Badge variant="secondary" className="text-xs">You</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          {entry.score.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatDate(entry.timestamp)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
