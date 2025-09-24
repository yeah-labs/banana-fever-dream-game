import React, { useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { GameCanvas } from './GameCanvas';
import { GameUI } from './GameUI';
import { GameMenu } from './GameMenu';
import { GameOver } from './GameOver';
import { toast } from 'sonner';

export const BananaFeverDream: React.FC = () => {
  const { gameState, config, startGame, pauseGame, gameOver, activateFever } = useGameState();
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('banana-fever-high-score');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      switch (key) {
        case ' ':
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
        
        case 'p':
          if (gameState.status === 'playing' || gameState.status === 'paused') {
            pauseGame();
            toast.info(gameState.status === 'playing' ? 'Game Paused' : 'Game Resumed');
          }
          break;
        
        case 'escape':
          if (gameState.status === 'playing') {
            pauseGame();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.status, gameState.player.feverMeter, activateFever, pauseGame]);

  // Check for game over conditions
  useEffect(() => {
    if (gameState.status === 'playing' && gameState.player.health <= 0) {
      // Check if it's a new high score
      const currentScore = gameState.player.score;
      if (currentScore > highScore) {
        setHighScore(currentScore);
        setIsNewHighScore(true);
        localStorage.setItem('banana-fever-high-score', currentScore.toString());
        toast.success('🎉 NEW HIGH SCORE!', {
          duration: 5000,
          style: { 
            background: 'hsl(45, 100%, 50%)', 
            color: 'hsl(230, 15%, 8%)',
            fontWeight: 'bold'
          }
        });
      } else {
        setIsNewHighScore(false);
      }
      
      gameOver();
      toast.error('Game Over! The Pith have won...', {
        duration: 3000
      });
    }
  }, [gameState.status, gameState.player.health, gameState.player.score, highScore, gameOver]);

  // Secret mode activation toast
  useEffect(() => {
    if (gameState.secretMode) {
      toast.success('🎉 PP MODE ACTIVATED! 🎉', {
        duration: 3000,
        style: { 
          background: 'hsl(280, 100%, 70%)', 
          color: 'hsl(230, 15%, 8%)',
          fontWeight: 'bold'
        }
      });
    }
  }, [gameState.secretMode]);

  const handleStartGame = () => {
    startGame();
    toast.success('Fever Dream begins...', {
      duration: 2000,
      style: { 
        background: 'hsl(120, 40%, 35%)', 
        color: 'hsl(45, 100%, 85%)'
      }
    });
  };

  const handleMainMenu = () => {
    // Reset to menu state
    window.location.reload();
  };

  const renderCurrentScreen = () => {
    switch (gameState.status) {
      case 'menu':
        return (
          <GameMenu
            onStartGame={handleStartGame}
            secretMode={gameState.secretMode}
            highScore={highScore}
          />
        );
      
      case 'game-over':
        return (
          <GameOver
            gameState={gameState}
            onRestart={handleStartGame}
            onMainMenu={handleMainMenu}
            isNewHighScore={isNewHighScore}
          />
        );
      
      case 'playing':
      case 'paused':
        return (
          <div className="min-h-screen bg-gradient-game flex items-center justify-center p-4">
            <div className="relative">
              <GameCanvas gameState={gameState} config={config} />
              <GameUI gameState={gameState} onActivateFever={activateFever} />
              
              {gameState.status === 'paused' && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm 
                               flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <h2 className="text-4xl font-bold text-primary">PAUSED</h2>
                    <p className="text-muted-foreground">Press P to resume</p>
                  </div>
                </div>
              )}
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