import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { GameState } from '@/types/game';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Trophy } from 'lucide-react';
import { trackClick } from '@/utils/analytics';

interface GameOverProps {
  gameState: GameState;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ 
  gameState, 
  onRestart, 
  onMainMenu
}) => {
  const navigate = useNavigate();
  const { player, level, wave, gameTime } = gameState;
  const timeMinutes = Math.floor(gameTime / 60);
  const timeSeconds = Math.floor(gameTime % 60);
  
  const { submitScore, isSubmitting, isConnected } = useLeaderboard();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [userCancelled, setUserCancelled] = useState(false);

  // Auto-submit score when game ends if user is logged in and in compete mode
  useEffect(() => {
    const submitGameScore = async () => {
      if (isConnected && player.score > 0 && !hasSubmitted && !userCancelled && gameState.playMode === 'compete') {
        setHasSubmitted(true);
        const success = await submitScore(player.score, gameState.playMode);
        if (!success) {
          // User cancelled or transaction failed - honor their choice
          setUserCancelled(true);
          setHasSubmitted(false);
        }
      }
    };

    submitGameScore();
  }, [isConnected, player.score, hasSubmitted, userCancelled, submitScore, gameState.playMode]);

  return (
    <div className="min-h-screen bg-gradient-game flex justify-center p-4 pt-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Game Over Title */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-destructive animate-pulse">
            THE DREAM IS OVER
          </h1>
          <p className="text-lg text-muted-foreground">
            The Pith have overtaken the swamp... for now.
          </p>
          
          {/* Login Status */}
          {!isConnected && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
              <p className="text-sm text-yellow-200">
                💡 Log in and insert a coin to compete
              </p>
            </div>
          )}
          
          {isConnected && gameState.playMode === 'practice' && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
              <p className="text-sm text-yellow-200">
                💡 Insert a coin to compete
              </p>
            </div>
          )}
          
          {isConnected && gameState.playMode === 'compete' && isSubmitting && (
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3">
              <p className="text-sm text-blue-200">
                Submitting your score to ApeChain...
              </p>
            </div>
          )}
          
          {isConnected && gameState.playMode === 'compete' && hasSubmitted && !isSubmitting && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
              <p className="text-sm text-green-200">
                ✅ Score submitted successfully!
              </p>
            </div>
          )}
          
          {isConnected && gameState.playMode === 'compete' && userCancelled && !isSubmitting && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
              <p className="text-sm text-yellow-200">
                ⚠️ Score submission cancelled. Your score was not saved to the leaderboard.
              </p>
            </div>
          )}
        </div>

        {/* Final Stats */}
        <Card className="bg-card/80 backdrop-blur-sm border-destructive/20">
          <CardHeader>
            <CardTitle className="text-center text-primary">Final Stats</CardTitle>
            <CardDescription className="text-center">
              Your performance in the fever dream
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Score */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {player.score.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Final Score</div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-foreground">{level}</div>
                <div className="text-sm text-muted-foreground">Level Reached</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-foreground">{gameState.totalWaves}</div>
                <div className="text-sm text-muted-foreground">Waves Survived</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-foreground">
                  {timeMinutes}:{timeSeconds.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-muted-foreground">Time Played</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-foreground">
                  {gameState.feversUsed}
                </div>
                <div className="text-sm text-muted-foreground">Fevers Used</div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => {
              trackClick('Play Again', 'button');
              onRestart();
            }}
            size="lg"
            className="bg-gradient-banana hover:shadow-fever 
                     transition-all duration-300 transform hover:scale-105"
          >
            PLAY AGAIN
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-primary hover:bg-primary/10"
            onClick={() => {
              trackClick('Leaderboard', 'button');
              navigate('/leaderboard');
            }}
          >
            Leaderboard
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-primary hover:bg-primary/10"
            onClick={() => {
              trackClick('Feedback', 'button');
              window.open('https://forms.gle/mNJY7RjN1rg6WvV88', '_blank');
            }}
          >
            Feedback
          </Button>
        </div>

      </div>
    </div>
  );
};