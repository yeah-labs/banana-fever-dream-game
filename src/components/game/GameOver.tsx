import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { GameState } from '@/types/game';

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
  const { player, level, wave, gameTime } = gameState;
  const timeMinutes = Math.floor(gameTime / 60);
  const timeSeconds = Math.floor(gameTime % 60);

  return (
    <div className="min-h-screen bg-gradient-game flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Game Over Title */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-destructive animate-pulse">
            THE DREAM IS OVER
          </h1>
          <p className="text-lg text-muted-foreground">
            The Pith have overtaken the swamp... for now.
          </p>
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
            onClick={onRestart}
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
            onClick={() => window.open('https://banana-fever-dream.lovable.app/', '_self')}
          >
            HOME
          </Button>
        </div>

      </div>
    </div>
  );
};