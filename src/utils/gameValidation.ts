import { GameState, Player, Enemy, Bullet, PowerUp } from '@/types/game';
import { GameStatus } from '@/types/gameEnums';
import { GAME_CONSTANTS } from '@/config/gameConstants';

// Validate game object bounds
export const isValidPosition = (x: number, y: number): boolean => {
  return !isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y);
};

// Validate player state
export const validatePlayer = (player: Player): boolean => {
  if (!player || typeof player !== 'object') return false;
  
  return (
    isValidPosition(player.position.x, player.position.y) &&
    player.health >= 0 &&
    player.health <= player.maxHealth &&
    player.feverMeter >= 0 &&
    player.feverMeter <= GAME_CONSTANTS.FEVER.MAX_METER &&
    player.score >= 0
  );
};

// Validate enemy state
export const validateEnemy = (enemy: Enemy): boolean => {
  if (!enemy || typeof enemy !== 'object') return false;
  
  return (
    isValidPosition(enemy.position.x, enemy.position.y) &&
    enemy.health >= 0 &&
    enemy.health <= enemy.maxHealth &&
    enemy.points >= 0
  );
};

// Validate bullet state
export const validateBullet = (bullet: Bullet): boolean => {
  if (!bullet || typeof bullet !== 'object') return false;
  
  return (
    isValidPosition(bullet.position.x, bullet.position.y) &&
    bullet.damage > 0 &&
    typeof bullet.isPlayerBullet === 'boolean'
  );
};

// Validate power-up state
export const validatePowerUp = (powerUp: PowerUp): boolean => {
  if (!powerUp || typeof powerUp !== 'object') return false;
  
  return (
    isValidPosition(powerUp.position.x, powerUp.position.y) &&
    powerUp.duration > 0
  );
};

// Validate entire game state
export const validateGameState = (gameState: GameState): boolean => {
  if (!gameState || typeof gameState !== 'object') return false;
  
  try {
    // Validate basic properties
    if (!Object.values(GameStatus).includes(gameState.status)) return false;
    if (!validatePlayer(gameState.player)) return false;
    
    // Validate arrays
    if (!Array.isArray(gameState.enemies) || 
        !Array.isArray(gameState.bullets) || 
        !Array.isArray(gameState.powerUps)) return false;
    
    // Validate array contents
    if (!gameState.enemies.every(validateEnemy)) return false;
    if (!gameState.bullets.every(validateBullet)) return false;
    if (!gameState.powerUps.every(validatePowerUp)) return false;
    
    // Validate numeric properties
    if (gameState.level < 1 || 
        gameState.wave < 1 || 
        gameState.gameTime < 0 ||
        !isFinite(gameState.gameTime)) return false;
    
    return true;
  } catch (error) {
    console.error('Game state validation error:', error);
    return false;
  }
};

// Sanitize game state (fix common issues)
export const sanitizeGameState = (gameState: GameState): GameState => {
  return {
    ...gameState,
    player: {
      ...gameState.player,
      health: Math.max(0, Math.min(gameState.player.health, gameState.player.maxHealth)),
      feverMeter: Math.max(0, Math.min(gameState.player.feverMeter, GAME_CONSTANTS.FEVER.MAX_METER)),
      score: Math.max(0, gameState.player.score)
    },
    enemies: gameState.enemies.filter(validateEnemy),
    bullets: gameState.bullets.filter(validateBullet),
    powerUps: gameState.powerUps.filter(validatePowerUp),
    level: Math.max(1, gameState.level),
    wave: Math.max(1, gameState.wave),
    gameTime: Math.max(0, gameState.gameTime)
  };
};