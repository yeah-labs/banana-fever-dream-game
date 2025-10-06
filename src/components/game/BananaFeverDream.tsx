import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameState } from '@/hooks/useGameState';
import { GameCanvas } from './GameCanvas';

import { GameOver } from './GameOver';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const BananaFeverDream: React.FC = () => {
  const navigate = useNavigate();
  const { gameState, config, startGame, resetToReady, gameOver, activateFever } = useGameState();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      switch (key) {
        case ' ':
          event.preventDefault();
          // Space key only shoots, no longer starts the game
          break;
        
        case 'f':
          event.preventDefault();
          if (gameState.status === 'playing') {
            if (gameState.player.feverMeter >= 100) {
              activateFever();
              toast.success('🍌 BANANA FEVER ACTIVATED!', {
                duration: 2000,
                style: { 
                  background: 'hsl(45, 100%, 50%)', 
                  color: 'hsl(230, 15%, 8%)',
                  fontWeight: 'bold'
                }
              });
            }
          }
          break;
        
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.status, gameState.player.feverMeter, activateFever]);

  // Check for game over conditions
  useEffect(() => {
    if (gameState.status === 'playing' && gameState.player.health <= 0) {
      gameOver();
      toast.error('Game Over! The Pith have won...', {
        duration: 3000
      });
    }
  }, [gameState.status, gameState.player.health, gameOver]);

  // Secret mode activation toast
  useEffect(() => {
    if (gameState.secretMode) {
      toast.success('🎂 PPMan Mode Activated!', {
        duration: 3000,
        style: { 
          background: 'hsl(220, 80%, 60%)', 
          color: 'hsl(230, 15%, 8%)',
          fontWeight: 'bold'
        }
      });
    }
  }, [gameState.secretMode]);

  const handleStartGame = () => {
    startGame();
    toast.success('Fever Dream begins...', {
      duration: 2000
    });
  };

  const handleResetToReady = () => {
    resetToReady();
    toast.success('Game reset - Ready to play!', {
      duration: 2000
    });
  };

  const handleMainMenu = () => {
    // Reset to ready state instead of reloading
    window.location.reload();
  };

  const handleLeaderboardClick = () => {
    navigate('/leaderboard');
  };

  const renderCurrentScreen = () => {
    switch (gameState.status) {
      case 'game-over':
        return (
          <GameOver
            gameState={gameState}
            onRestart={handleResetToReady}
            onMainMenu={handleMainMenu}
          />
        );
      
      case 'ready':
      case 'playing':
        return (
          <div className="min-h-screen bg-gradient-game flex flex-col items-center justify-start p-4">
            {/* UI above the game */}
            <div className="w-[800px] mb-4">
              <div className="grid grid-cols-[2fr_1fr_2fr] gap-4 items-stretch">
                {/* Score and Level */}
                <div className="bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border min-h-[70px] flex items-center">
                  <div className="space-y-1 w-full">
                    <div className="text-2xl font-bold text-primary">
                      {gameState.player.score.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Level {gameState.level} • Wave {gameState.wave}
                    </div>
                  </div>
                </div>

                {/* Health */}
                <div className="bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border min-h-[70px] flex items-center">
                  <div className="flex flex-col items-center gap-2 w-full">
                    <span className="text-sm text-muted-foreground">Health</span>
                    <div className="flex gap-1">
                      {Array.from({ length: gameState.player.maxHealth }, (_, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-full border-2 ${
                            i < gameState.player.health
                              ? 'bg-primary border-primary shadow-banana'
                              : 'border-muted bg-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fever Meter */}
                <div className="bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border min-h-[70px] flex items-center">
                  <div className="space-y-2 w-full">
                    {gameState.player.feverMeter < 100 && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">
                            Banana Fever
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {Math.floor(gameState.player.feverMeter)}%
                          </span>
                        </div>
                        
                        <div className="relative">
                          <div className="w-full bg-muted/50 rounded-full h-3">
                            <div 
                              className="bg-gradient-fever h-3 rounded-full transition-all duration-300"
                              style={{ width: `${gameState.player.feverMeter}%` }}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {gameState.player.feverMeter >= 100 && (
                      <button
                        onClick={activateFever}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary-glow 
                                 rounded-md py-1 px-2 font-bold text-xs transition-all duration-200
                                 shadow-fever animate-pulse-banana"
                      >
                        ACTIVATE FEVER!
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Game Canvas */}
            <div className="relative">
              <GameCanvas gameState={gameState} config={config} />
              
            </div>

            {/* Unified Bottom Area */}
            <div className="w-[800px] mt-4 flex justify-between items-start">
              {/* Game Controls - left side */}
              <div className="flex gap-2">
                <Button
                  onClick={gameState.status === 'ready' ? handleStartGame : gameOver}
                  size="lg"
                  className="bg-gradient-banana hover:shadow-fever 
                           transition-all duration-300 transform hover:scale-105
                           border-2 border-primary-glow"
                >
                  {gameState.status === 'ready' ? 'START GAME' : 'END GAME'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary hover:bg-primary/10"
                  onClick={handleLeaderboardClick}
                >
                  LEADERBOARD
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary hover:bg-primary/10"
                  onClick={() => window.open('https://forms.gle/mNJY7RjN1rg6WvV88', '_blank')}
                >
                  FEEDBACK
                </Button>
              </div>

              {/* Controls hint - right side */}
              <div className="flex flex-col items-start gap-2">
                <div className="bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border text-xs text-muted-foreground">
                  <div>WASD / Arrows: Move</div>
                  <div>Space: Shoot</div>
                  <div>F: Activate Fever</div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {renderCurrentScreen()}
    </div>
  );
};