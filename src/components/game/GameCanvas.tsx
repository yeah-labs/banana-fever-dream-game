import React, { useRef, useEffect, useState } from 'react';
import { GameState, GameConfig } from '@/types/game';
import playerMonkeyImage from '@/assets/player-monkey.png';

interface GameCanvasProps {
  gameState: GameState;
  config: GameConfig;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerImage, setPlayerImage] = useState<HTMLImageElement | null>(null);

  // Load player image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setPlayerImage(img);
    img.src = playerMonkeyImage;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'hsl(230, 15%, 8%)';
    ctx.fillRect(0, 0, config.canvas.width, config.canvas.height);

    // Apply screen shake with reduced Reality Storm intensity multiplier
    let effectiveShake = gameState.shakeIntensity;
    if (gameState.realityStormActive) {
      effectiveShake *= 1.5; // Reduced from 3x to 1.5x shake intensity
    }
    
    if (effectiveShake > 0) {
      const shakeX = (Math.random() - 0.5) * effectiveShake;
      const shakeY = (Math.random() - 0.5) * effectiveShake;
      ctx.translate(shakeX, shakeY);
    }

    // Reality Storm visual effects (reduced intensity)
    if (gameState.realityStormActive) {
      // Rare color inversion effect (2% chance instead of 10%)
      if (Math.random() < 0.02) {
        ctx.filter = 'invert(1) hue-rotate(180deg)';
      }
      
      // Subtle screen warping effect (2% instead of 5%)
      const warpScale = 1 + (Math.sin(Date.now() * 0.01) * 0.02);
      ctx.scale(warpScale, warpScale);
    }

    // Draw player
    if (gameState.player && playerImage) {
      // Apply invulnerability effect
      if (gameState.player.invulnerable) {
        ctx.globalAlpha = 0.5;
      }
      
      // Draw player image
      ctx.drawImage(
        playerImage,
        gameState.player.position.x,
        gameState.player.position.y,
        gameState.player.width,
        gameState.player.height
      );

      // Reset alpha
      if (gameState.player.invulnerable) {
        ctx.globalAlpha = 1;
      }
    }

    // Draw enemies
    gameState.enemies.forEach(enemy => {
      const color = gameState.secretMode ? 
        'hsl(220, 70%, 50%)' : // Blue for easter egg mode
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
        common: 'hsl(0, 0%, 60%)',       // Gray
        uncommon: 'hsl(120, 60%, 50%)',  // Green
        rare: 'hsl(220, 70%, 60%)',      // Blue
        epic: 'hsl(280, 70%, 60%)',      // Purple
        legendary: 'hsl(45, 80%, 55%)'   // Gold
      };

      ctx.fillStyle = rarityColors[powerUp.rarity];
      
      // Draw different shapes based on power-up type
      if (powerUp.type === 'spread-shot') {
        // Three small circles for spread shot
        const radius = powerUp.width / 6;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(
            powerUp.position.x + powerUp.width / 2 + (i - 1) * radius * 2,
            powerUp.position.y + powerUp.height / 2,
            radius,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      } else if (powerUp.type === 'shield') {
        // Pentagon shape for shield
        ctx.beginPath();
        const centerX = powerUp.position.x + powerUp.width / 2;
        const centerY = powerUp.position.y + powerUp.height / 2;
        const radius = powerUp.width / 2;
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      } else if (powerUp.type === 'score-doubler') {
        // Draw "X" text for score doubler
        const centerX = powerUp.position.x + powerUp.width / 2;
        const centerY = powerUp.position.y + powerUp.height / 2;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Fill with power-up color
        ctx.fillStyle = rarityColors[powerUp.rarity];
        ctx.fillText('X', centerX, centerY);
        
        // Reset text properties
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
      } else if (powerUp.type === 'magnet') {
        // Two vertical lines for magnet poles
        const centerX = powerUp.position.x + powerUp.width / 2;
        const centerY = powerUp.position.y + powerUp.height / 2;
        ctx.strokeStyle = rarityColors[powerUp.rarity];
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        // Left pole
        ctx.beginPath();
        ctx.moveTo(centerX - 4, centerY - 6);
        ctx.lineTo(centerX - 4, centerY + 6);
        ctx.stroke();
        
        // Right pole
        ctx.beginPath();
        ctx.moveTo(centerX + 4, centerY - 6);
        ctx.lineTo(centerX + 4, centerY + 6);
        ctx.stroke();
        
        // Reset line properties
        ctx.lineWidth = 1;
        ctx.lineCap = 'butt';
      } else if (powerUp.type === 'sword') {
        // Three horizontal rectangles for sword
        const centerX = powerUp.position.x + powerUp.width / 2;
        const centerY = powerUp.position.y + powerUp.height / 2;
        const rectWidth = 4;
        const rectHeight = 8;
        const spacing = 6;
        
        ctx.fillStyle = rarityColors[powerUp.rarity];
        
        // Left sword
        ctx.fillRect(centerX - spacing - rectWidth/2, centerY - rectHeight/2, rectWidth, rectHeight);
        // Center sword
        ctx.fillRect(centerX - rectWidth/2, centerY - rectHeight/2, rectWidth, rectHeight);
        // Right sword
        ctx.fillRect(centerX + spacing - rectWidth/2, centerY - rectHeight/2, rectWidth, rectHeight);
      } else if (powerUp.type === 'reality-warp') {
        // Tilted pill shape for reality warp
        const centerX = powerUp.position.x + powerUp.width / 2;
        const centerY = powerUp.position.y + powerUp.height / 2;
        const pillWidth = powerUp.width * 1.2;
        const pillHeight = powerUp.height * 0.7;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(Math.PI / 4); // 45 degrees
        
        // Draw pill (rounded rectangle)
        ctx.beginPath();
        ctx.roundRect(-pillWidth/2, -pillHeight/2, pillWidth, pillHeight, pillHeight/2);
        ctx.fill();
        
        ctx.restore();
      } else {
        // Default: rectangle for other types
        ctx.fillRect(
          powerUp.position.x,
          powerUp.position.y,
          powerUp.width,
          powerUp.height
        );
      }

    });

    // Reset all transforms and filters
    if (effectiveShake > 0 || gameState.realityStormActive) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.filter = 'none';
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