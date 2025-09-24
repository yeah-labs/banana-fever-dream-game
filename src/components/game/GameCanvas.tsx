import React, { useRef, useEffect } from 'react';
import { GameState, GameConfig } from '@/types/game';

interface GameCanvasProps {
  gameState: GameState;
  config: GameConfig;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'hsl(230, 15%, 8%)';
    ctx.fillRect(0, 0, config.canvas.width, config.canvas.height);

    // Apply screen shake
    if (gameState.shakeIntensity > 0) {
      const shakeX = (Math.random() - 0.5) * gameState.shakeIntensity;
      const shakeY = (Math.random() - 0.5) * gameState.shakeIntensity;
      ctx.translate(shakeX, shakeY);
    }

    // Draw player
    if (gameState.player) {
      ctx.fillStyle = gameState.player.invulnerable ? 
        'hsla(45, 100%, 50%, 0.5)' : 'hsl(45, 100%, 50%)';
      
      // Simple banana-like shape
      ctx.beginPath();
      ctx.arc(
        gameState.player.position.x + gameState.player.width / 2,
        gameState.player.position.y + gameState.player.height / 2,
        gameState.player.width / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Add banana glow effect
      if (!gameState.player.invulnerable) {
        ctx.shadowColor = 'hsl(45, 100%, 50%)';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Draw enemies
    gameState.enemies.forEach(enemy => {
      const color = gameState.secretMode ? 
        'hsl(120, 40%, 35%)' : // Green for easter egg mode
        enemy.type === 'boss' ? 'hsl(350, 80%, 40%)' :
        enemy.type === 'mini-boss' ? 'hsl(15, 70%, 45%)' :
        'hsl(0, 80%, 55%)';

      ctx.fillStyle = color;
      
      // Draw enemy based on type
      if (enemy.type === 'boss') {
        // Large boss enemy
        ctx.fillRect(
          enemy.position.x,
          enemy.position.y,
          enemy.width,
          enemy.height
        );
        // Add threatening glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.fillRect(
          enemy.position.x,
          enemy.position.y,
          enemy.width,
          enemy.height
        );
        ctx.shadowBlur = 0;
      } else {
        // Regular/mini-boss enemies - circular
        ctx.beginPath();
        ctx.arc(
          enemy.position.x + enemy.width / 2,
          enemy.position.y + enemy.height / 2,
          enemy.width / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    });

    // Draw bullets
    gameState.bullets.forEach(bullet => {
      ctx.fillStyle = bullet.isPlayerBullet ? 
        'hsl(45, 100%, 65%)' : 'hsl(0, 80%, 55%)';
      
      if (bullet.type === 'sword') {
        // Draw sword-like bullet
        ctx.fillRect(
          bullet.position.x,
          bullet.position.y,
          bullet.width,
          bullet.height
        );
      } else {
        // Regular bullets
        ctx.beginPath();
        ctx.arc(
          bullet.position.x + bullet.width / 2,
          bullet.position.y + bullet.height / 2,
          bullet.width / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    });

    // Draw power-ups
    gameState.powerUps.forEach(powerUp => {
      const rarityColors = {
        common: 'hsl(120, 40%, 50%)',
        uncommon: 'hsl(200, 60%, 50%)',
        rare: 'hsl(280, 70%, 60%)',
        epic: 'hsl(45, 80%, 55%)',
        legendary: 'hsl(330, 90%, 70%)'
      };

      ctx.fillStyle = rarityColors[powerUp.rarity];
      ctx.fillRect(
        powerUp.position.x,
        powerUp.position.y,
        powerUp.width,
        powerUp.height
      );

      // Add glow effect for rare items
      if (powerUp.rarity !== 'common') {
        ctx.shadowColor = rarityColors[powerUp.rarity];
        ctx.shadowBlur = 8;
        ctx.fillRect(
          powerUp.position.x,
          powerUp.position.y,
          powerUp.width,
          powerUp.height
        );
        ctx.shadowBlur = 0;
      }
    });

    // Reset transform for shake effect
    if (gameState.shakeIntensity > 0) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

  }, [gameState, config]);

  return (
    <canvas
      ref={canvasRef}
      width={config.canvas.width}
      height={config.canvas.height}
      className="border-2 border-primary bg-background rounded-lg shadow-banana"
    />
  );
};