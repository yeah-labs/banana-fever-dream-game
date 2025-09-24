import React from 'react';
import { GameState } from '@/types/game';
import { Progress } from '@/components/ui/progress';

interface GameUIProps {
  gameState: GameState;
  onActivateFever: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({ gameState, onActivateFever }) => {
  const { player, level, wave, secretMode } = gameState;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
        {/* Score and Level */}
        <div className="bg-card/90 backdrop-blur-sm rounded-lg p-4 border border-border">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-primary">
              {player.score.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              Level {level} • Wave {wave}
            </div>
            {secretMode && (
              <div className="text-xs text-accent font-bold animate-pulse">
                🎉 PP MODE ACTIVE
              </div>
            )}
          </div>
        </div>

        {/* Health */}
        <div className="bg-card/90 backdrop-blur-sm rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Health</span>
            <div className="flex gap-1">
              {Array.from({ length: player.maxHealth }, (_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 ${
                    i < player.health
                      ? 'bg-primary border-primary shadow-banana'
                      : 'border-muted bg-transparent'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-4 left-4 right-4">
        {/* Fever Meter */}
        <div className="bg-card/90 backdrop-blur-sm rounded-lg p-4 border border-border">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Banana Fever
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.floor(player.feverMeter)}%
              </span>
            </div>
            
            <div className="relative">
              <Progress 
                value={player.feverMeter} 
                className="h-3 bg-muted/50"
              />
              <div 
                className={`absolute inset-0 bg-gradient-fever rounded-full transition-opacity duration-300 ${
                  player.feverMeter >= 100 ? 'animate-fever-build opacity-80' : 'opacity-0'
                }`} 
              />
            </div>

            {player.feverMeter >= 100 && (
              <button
                onClick={onActivateFever}
                className="w-full bg-primary text-primary-foreground hover:bg-primary-glow 
                         rounded-md py-2 px-4 font-bold text-sm transition-all duration-200
                         shadow-fever animate-pulse-banana pointer-events-auto"
              >
                ACTIVATE FEVER! (SPACE)
              </button>
            )}
          </div>
        </div>

        {/* Active Power-ups */}
        {player.powerUps.length > 0 && (
          <div className="mt-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border">
            <div className="text-xs text-muted-foreground mb-2">Active Power-ups</div>
            <div className="flex gap-2 flex-wrap">
              {player.powerUps.map((powerUp, index) => {
                const rarityColors = {
                  common: 'border-secondary bg-secondary/20',
                  uncommon: 'border-blue-400 bg-blue-400/20',
                  rare: 'border-powerup bg-powerup/20',
                  epic: 'border-primary bg-primary/20',
                  legendary: 'border-pink-400 bg-pink-400/20'
                };

                return (
                  <div
                    key={`${powerUp.type}-${index}`}
                    className={`px-2 py-1 rounded text-xs font-medium border ${
                      rarityColors[powerUp.rarity]
                    }`}
                  >
                    {powerUp.type.replace('-', ' ')}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-4 right-4">
        <div className="bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border text-xs text-muted-foreground">
          <div>WASD / Arrows: Move</div>
          <div>Space: Shoot / Fever</div>
          <div>P: Pause</div>
        </div>
      </div>
    </div>
  );
};