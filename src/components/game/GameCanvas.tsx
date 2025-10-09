import React, { useRef, useEffect, useState, memo } from 'react';
import { GameState, GameConfig } from '@/types/game';
import playerMonkeyImage from '@/assets/player-monkey.png';
import enemyNormalImage from '@/assets/enemy-normal.png';
import enemyNormalBlackImage from '@/assets/enemy-normal-black.png';
import enemyPPManImage from '@/assets/enemy-ppman.png';
import enemyMiniBossImage from '@/assets/enemy-mini-boss.png';
import enemyBossImage from '@/assets/enemy-boss.png';
import powerUpSpreadShotImage from '@/assets/powerup-spread-shot.png';
import powerUpShieldImage from '@/assets/powerup-shield.png';
import powerUpScoreDoublerImage from '@/assets/powerup-score-doubler.png';
import powerUpMagnetImage from '@/assets/powerup-magnet.png';
import powerUpSwordImage from '@/assets/powerup-sword.png';
import powerUpRealityWarpImage from '@/assets/powerup-reality-warp.png';

interface GameCanvasProps {
  gameState: GameState;
  config: GameConfig;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerImage, setPlayerImage] = useState<HTMLImageElement | null>(null);
  const [enemyImages, setEnemyImages] = useState<{
    normal: HTMLImageElement | null;
    normalBlack: HTMLImageElement | null;
    ppman: HTMLImageElement | null;
    miniBoss: HTMLImageElement | null;
    boss: HTMLImageElement | null;
  }>({ normal: null, normalBlack: null, ppman: null, miniBoss: null, boss: null });
  const [powerUpImages, setPowerUpImages] = useState<{
    spreadShot: HTMLImageElement | null;
    shield: HTMLImageElement | null;
    scoreDoubler: HTMLImageElement | null;
    magnet: HTMLImageElement | null;
    sword: HTMLImageElement | null;
    realityWarp: HTMLImageElement | null;
  }>({ spreadShot: null, shield: null, scoreDoubler: null, magnet: null, sword: null, realityWarp: null });

  // Load player image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setPlayerImage(img);
    img.src = playerMonkeyImage;
  }, []);

  // Load enemy images
  useEffect(() => {
    const normalImg = new Image();
    normalImg.onload = () => setEnemyImages(prev => ({ ...prev, normal: normalImg }));
    normalImg.src = enemyNormalImage;

    const normalBlackImg = new Image();
    normalBlackImg.onload = () => setEnemyImages(prev => ({ ...prev, normalBlack: normalBlackImg }));
    normalBlackImg.src = enemyNormalBlackImage;

    const ppmanImg = new Image();
    ppmanImg.onload = () => setEnemyImages(prev => ({ ...prev, ppman: ppmanImg }));
    ppmanImg.src = enemyPPManImage;

    const miniBossImg = new Image();
    miniBossImg.onload = () => setEnemyImages(prev => ({ ...prev, miniBoss: miniBossImg }));
    miniBossImg.src = enemyMiniBossImage;

    const bossImg = new Image();
    bossImg.onload = () => setEnemyImages(prev => ({ ...prev, boss: bossImg }));
    bossImg.src = enemyBossImage;
  }, []);

  // Load power-up images
  useEffect(() => {
    const spreadShotImg = new Image();
    spreadShotImg.onload = () => setPowerUpImages(prev => ({ ...prev, spreadShot: spreadShotImg }));
    spreadShotImg.src = powerUpSpreadShotImage;

    const shieldImg = new Image();
    shieldImg.onload = () => setPowerUpImages(prev => ({ ...prev, shield: shieldImg }));
    shieldImg.src = powerUpShieldImage;

    const scoreDoublerImg = new Image();
    scoreDoublerImg.onload = () => setPowerUpImages(prev => ({ ...prev, scoreDoubler: scoreDoublerImg }));
    scoreDoublerImg.src = powerUpScoreDoublerImage;

    const magnetImg = new Image();
    magnetImg.onload = () => setPowerUpImages(prev => ({ ...prev, magnet: magnetImg }));
    magnetImg.src = powerUpMagnetImage;

    const swordImg = new Image();
    swordImg.onload = () => setPowerUpImages(prev => ({ ...prev, sword: swordImg }));
    swordImg.src = powerUpSwordImage;

    const realityWarpImg = new Image();
    realityWarpImg.onload = () => setPowerUpImages(prev => ({ ...prev, realityWarp: realityWarpImg }));
    realityWarpImg.src = powerUpRealityWarpImage;
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
      // Select appropriate image based on enemy type
      let enemyImage: HTMLImageElement | null = null;
      if (enemy.type === 'boss' && enemyImages.boss) {
        enemyImage = enemyImages.boss;
      } else if (enemy.type === 'mini-boss' && enemyImages.miniBoss) {
        enemyImage = enemyImages.miniBoss;
      } else if (enemy.type === 'normal') {
        // In secret mode, use PPMan image for all normal enemies
        if (gameState.secretMode && enemyImages.ppman) {
          enemyImage = enemyImages.ppman;
        } else {
          // Randomly select between normal variants based on enemy ID for consistency
          // Use timestamp portion of ID to get proper randomization even with single spawns
          const idHash = parseInt(enemy.id.split('-')[1], 10) || 0;
          const variant = idHash % 2;
          enemyImage = variant === 0 ? enemyImages.normal : enemyImages.normalBlack;
        }
      }

      // Draw enemy image if loaded
      if (enemyImage) {
        ctx.drawImage(
          enemyImage,
          enemy.position.x,
          enemy.position.y,
          enemy.width,
          enemy.height
        );
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
      // Select appropriate image based on power-up type
      let powerUpImage: HTMLImageElement | null = null;
      
      switch (powerUp.type) {
        case 'spread-shot':
          powerUpImage = powerUpImages.spreadShot;
          break;
        case 'shield':
          powerUpImage = powerUpImages.shield;
          break;
        case 'score-doubler':
          powerUpImage = powerUpImages.scoreDoubler;
          break;
        case 'magnet':
          powerUpImage = powerUpImages.magnet;
          break;
        case 'sword':
          powerUpImage = powerUpImages.sword;
          break;
        case 'reality-warp':
          powerUpImage = powerUpImages.realityWarp;
          break;
      }

      // Draw power-up image if loaded
      if (powerUpImage) {
        ctx.drawImage(
          powerUpImage,
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

export default memo(GameCanvas);