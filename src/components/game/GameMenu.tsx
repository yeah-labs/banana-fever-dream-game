import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface GameMenuProps {
  onStartGame: () => void;
  secretMode: boolean;
  highScore?: number;
}

export const GameMenu: React.FC<GameMenuProps> = ({ 
  onStartGame, 
  secretMode, 
  highScore = 0 
}) => {
  return (
    <div className="min-h-screen bg-gradient-game flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Title */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-primary animate-pulse-banana">
            🍌 BANANA FEVER DREAM
          </h1>
          <p className="text-xl text-muted-foreground">
            The Pith are invading! Defend the swamp with banana power!
          </p>
          {secretMode && (
            <div className="text-lg text-accent font-bold animate-bounce">
              🎉 PP MODE UNLOCKED! 🎉
            </div>
          )}
        </div>

        {/* Game Info */}
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Game Story</CardTitle>
            <CardDescription>
              You doze off at your keyboard. What happens next is something you will never forget. Or will you?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The ceiling of the clubhouse unzips—out drifts the invading Pith. 
              These bug-like alien creatures are here to take over the swamp.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-foreground mb-2">🎯 Objectives</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Shoot banana projectiles</li>
                  <li>• Collect power-ups</li>
                  <li>• Build Fever meter</li>
                  <li>• Survive escalating waves</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-2">🎮 Controls</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• WASD / Arrow Keys: Move</li>
                  <li>• Space: Shoot / Activate Fever</li>
                  <li>• P: Pause Game</li>
                  <li>• H-B-D: Secret Mode</li>
                </ul>
              </div>
            </div>

            {highScore > 0 && (
              <div className="pt-4 border-t border-border">
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">High Score: </span>
                  <span className="text-lg font-bold text-primary">{highScore.toLocaleString()}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Start Button */}
        <div className="text-center">
          <Button
            onClick={onStartGame}
            size="lg"
            className="text-xl px-12 py-6 bg-gradient-banana hover:shadow-fever 
                     transition-all duration-300 transform hover:scale-105
                     border-2 border-primary-glow"
          >
            START FEVER DREAM
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            BAYC-inspired • Neo-retro • Weird Fun
          </p>
          <p className="text-xs text-muted-foreground opacity-60">
            "When you go into the cave, allow yourself to be as creative as possible."
          </p>
        </div>
      </div>
    </div>
  );
};