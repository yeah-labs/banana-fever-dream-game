import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, GameConfig, Player, Enemy, Bullet, PowerUp, Position, GameObject } from '@/types/game';
import { GameStatus, PowerUpType, PowerUpRarity, EnemyType, EnemyPattern, BulletType } from '@/types/gameEnums';
import { PowerUpEffect } from '@/types/powerUpEffects';
import { GAME_CONSTANTS } from '@/config/gameConstants';
import { useCollisionSystem } from '@/hooks/game/useCollisionSystem';
import { useGameInputs } from '@/hooks/game/useGameInputs';
import { validateGameState, sanitizeGameState } from '@/utils/gameValidation';

const DEFAULT_CONFIG: GameConfig = {
  canvas: { width: GAME_CONSTANTS.CANVAS.WIDTH, height: GAME_CONSTANTS.CANVAS.HEIGHT },
  player: { 
    speed: GAME_CONSTANTS.PLAYER.SPEED, 
    bulletSpeed: GAME_CONSTANTS.PLAYER.BULLET_SPEED, 
    fireRate: GAME_CONSTANTS.PLAYER.FIRE_RATE, 
    maxHealth: GAME_CONSTANTS.PLAYER.MAX_HEALTH 
  },
  enemy: { 
    speed: GAME_CONSTANTS.ENEMY.SPEED, 
    bulletSpeed: GAME_CONSTANTS.ENEMY.BULLET_SPEED, 
    spawnRate: GAME_CONSTANTS.ENEMY.SPAWN_RATE 
  },
  powerUp: { 
    dropRate: GAME_CONSTANTS.POWER_UP.DROP_RATE, 
    magnetRadius: GAME_CONSTANTS.POWER_UP.MAGNET_RADIUS 
  },
  fever: { 
    buildRate: GAME_CONSTANTS.FEVER.BUILD_RATE, 
    damageMultiplier: GAME_CONSTANTS.FEVER.DAMAGE_MULTIPLIERS 
  }
};

const createInitialPlayer = (): Player => ({
  id: 'player',
  position: { x: GAME_CONSTANTS.PLAYER.INITIAL_X, y: GAME_CONSTANTS.PLAYER.INITIAL_Y },
  velocity: { x: 0, y: 0 },
  width: GAME_CONSTANTS.PLAYER.WIDTH,
  height: GAME_CONSTANTS.PLAYER.HEIGHT,
  health: GAME_CONSTANTS.PLAYER.MAX_HEALTH,
  maxHealth: GAME_CONSTANTS.PLAYER.MAX_HEALTH,
  score: 0,
  feverMeter: 0,

  invulnerable: false,
  invulnerabilityTime: 0
});

const createInitialState = (): GameState => ({
  status: GameStatus.READY,
  player: createInitialPlayer(),
  enemies: [],
  bullets: [],
  powerUps: [],
  level: 1,
  wave: 1,
  waveProgress: 0,
  totalWaves: 0,
  lastEnemySpawn: 0,
  gameTime: 0,
  secretMode: false,
  shakeIntensity: 0,
  lastFrame: 0,
  feversUsed: 0,
  realityStormActive: false,
  realityStormEndTime: 0,
  realityStormIntensity: 0
});

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [config] = useState<GameConfig>(DEFAULT_CONFIG);
  const animationFrameRef = useRef<number>();
  const lastPowerUpSpawn = useRef<number>(0);
  const activePowerUps = useRef<Map<string, { type: PowerUp['type'], endTime: number }>>(new Map());

  
  // Use collision system
  const { checkCollision } = useCollisionSystem();
  
  // Handle secret mode activation
  const handleSecretModeActivated = useCallback(() => {
    setGameState(prev => ({ ...prev, secretMode: true }));
  }, []);
  
  // Use input system
  const { isKeyPressed, keysPressed } = useGameInputs({
    gameStatus: gameState.status,
    onSecretModeActivated: handleSecretModeActivated
  });

  // Game state validation
  const safeSetGameState = useCallback((updater: Parameters<typeof setGameState>[0]) => {
    setGameState(prev => {
      const newState = typeof updater === 'function' ? updater(prev) : updater;
      if (!validateGameState(newState)) {
        console.warn('Invalid game state detected, sanitizing...');
        return sanitizeGameState(newState);
      }
      return newState;
    });
  }, []);

  // Game actions
  const startGame = useCallback(() => {
    safeSetGameState(prev => ({
      ...createInitialState(),
      status: GameStatus.PLAYING,
      secretMode: prev.secretMode,
      lastFrame: performance.now()
    }));
  }, []);

  const resetToReady = useCallback(() => {
    safeSetGameState(prev => ({
      ...createInitialState(),
      status: GameStatus.READY,
      secretMode: false
    }));
  }, []);

  const pauseGame = useCallback(() => {
    safeSetGameState(prev => ({
      ...prev, 
      status: prev.status === GameStatus.PAUSED ? GameStatus.PLAYING : GameStatus.PAUSED 
    }));
  }, []);

  const gameOver = useCallback(() => {
    safeSetGameState(prev => ({ ...prev, status: GameStatus.GAME_OVER }));
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // Helper function to handle enemy kills and scoring
  const handleEnemyKill = useCallback((enemy: Enemy): { points: number, feverIncrease: number } => {
    let points = enemy.points;
    // Apply score doubler if active
    if (activePowerUps.current.has('score-doubler')) {
      points *= 2;
    }
    return {
      points,
      feverIncrease: config.fever.buildRate
    };
  }, [config.fever.buildRate]);

  const activateFever = useCallback(() => {
    if (gameState.player.feverMeter >= 100) {
      setGameState(prev => {
        let totalFeverScore = 0;
        let totalFeverIncrease = 0;
        let enemiesKilled = 0;

        // Calculate score for enemies that will be killed by fever
        const updatedEnemies = prev.enemies.map(enemy => {
          let newEnemy = { ...enemy };
          
          if (enemy.type === EnemyType.NORMAL) {
            // Normal enemies are killed instantly
            if (enemy.health > 0) {
              const killReward = handleEnemyKill(enemy);
              totalFeverScore += killReward.points;
              totalFeverIncrease += killReward.feverIncrease;
              enemiesKilled++;
            }
            newEnemy.health = 0;
          } else if (enemy.type === EnemyType.MINI_BOSS) {
            newEnemy.health = Math.max(0, enemy.health - enemy.maxHealth * 0.5);
          } else if (enemy.type === EnemyType.BOSS) {
            newEnemy.health = Math.max(0, enemy.health - enemy.maxHealth * 0.25);
          }
          return newEnemy;
        });

        return {
          ...prev,
          enemies: updatedEnemies,
          player: { 
            ...prev.player, 
            feverMeter: 0,
            score: prev.player.score + totalFeverScore
          },
          shakeIntensity: 10,
          feversUsed: prev.feversUsed + 1
        };
      });
    }
  }, [gameState.player.feverMeter, handleEnemyKill]);

  // Collision detection is now handled by useCollisionSystem hook

  // Power-up spawning with rarity system
  const spawnRandomPowerUp = useCallback(() => {
    const currentTime = performance.now();
    const spawnInterval = GAME_CONSTANTS.POWER_UP.SPAWN_INTERVAL;
    
    if (currentTime - lastPowerUpSpawn.current < spawnInterval) return;
    
    lastPowerUpSpawn.current = currentTime;
    
    // Rarity-based weighted selection
    const powerUpPool = [
      // Common (35% total)
      { type: PowerUpType.SHIELD, rarity: PowerUpRarity.COMMON, weight: 35 },
      // Uncommon (40%)
      { type: PowerUpType.SPREAD_SHOT, rarity: PowerUpRarity.UNCOMMON, weight: 20 },
      { type: PowerUpType.SCORE_DOUBLER, rarity: PowerUpRarity.UNCOMMON, weight: 20 },
      // Rare (15%)
      { type: PowerUpType.MAGNET, rarity: PowerUpRarity.RARE, weight: 15 },
      // Epic (9%)
      { type: PowerUpType.SWORD, rarity: PowerUpRarity.EPIC, weight: 9 },
      // Legendary (1%)
      { type: PowerUpType.REALITY_WARP, rarity: PowerUpRarity.LEGENDARY, weight: 1 }
    ];
    
    const totalWeight = powerUpPool.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedPowerUp = powerUpPool[0];
    for (const powerUp of powerUpPool) {
      random -= powerUp.weight;
      if (random <= 0) {
        selectedPowerUp = powerUp;
        break;
      }
    }
    
    setGameState(prev => {
      const newPowerUp: PowerUp = {
        id: `powerup-${Date.now()}`,
        position: {
          x: Math.random() * (config.canvas.width - 20),
          y: -20
        },
        velocity: { x: 0, y: GAME_CONSTANTS.POWER_UP.FALL_SPEED },
        width: GAME_CONSTANTS.POWER_UP.WIDTH,
        height: GAME_CONSTANTS.POWER_UP.HEIGHT,
        health: 1,
        maxHealth: 1,
        type: selectedPowerUp.type,
        rarity: selectedPowerUp.rarity,
        duration: GAME_CONSTANTS.POWER_UP.DURATIONS[selectedPowerUp.type as keyof typeof GAME_CONSTANTS.POWER_UP.DURATIONS] || 5000,
        effect: {} as PowerUpEffect
      };
      
      return {
        ...prev,
        powerUps: [...prev.powerUps, newPowerUp]
      };
    });
  }, [config]);

  // Shooting logic with power-up effects
  const lastShotTime = useRef<number>(0);

  const shoot = useCallback(() => {
    const currentTime = performance.now();
    if (currentTime - lastShotTime.current < config.player.fireRate) return;
    
    lastShotTime.current = currentTime;
    setGameState(prev => {
      const newBullets: Bullet[] = [];
      
      // Check for power-ups
      const hasSpreadShot = activePowerUps.current.has(PowerUpType.SPREAD_SHOT);
      const hasSword = activePowerUps.current.has(PowerUpType.SWORD);
      
      if (hasSword) {
        // Sword power-up: Single powerful sword bullet
        const newBullet: Bullet = {
          id: `bullet-${Date.now()}`,
          position: {
            x: prev.player.position.x + prev.player.width / 2 - 3,
            y: prev.player.position.y
          },
          velocity: { 
            x: 0, // Straight shot
            y: -config.player.bulletSpeed 
          },
          width: 6,
          height: 12,
          health: 1,
          maxHealth: 1,
          damage: 5, // 5x normal bullet damage
          isPlayerBullet: true,
          type: BulletType.SWORD
        };
        newBullets.push(newBullet);
      } else if (hasSpreadShot) {
        // Spread shot power-up: Three normal bullets
        for (let i = -1; i <= 1; i++) {
          const newBullet: Bullet = {
            id: `bullet-${Date.now()}-${i}`,
            position: {
              x: prev.player.position.x + prev.player.width / 2 - 2,
              y: prev.player.position.y
            },
            velocity: { 
              x: i * 50, // Spread bullets horizontally
              y: -config.player.bulletSpeed 
            },
            width: 4,
            height: 8,
            health: 1,
            maxHealth: 1,
            damage: 1,
            isPlayerBullet: true,
            type: BulletType.NORMAL
          };
          newBullets.push(newBullet);
        }
      } else {
        // Single normal bullet
        const newBullet: Bullet = {
          id: `bullet-${Date.now()}`,
          position: {
            x: prev.player.position.x + prev.player.width / 2 - 2,
            y: prev.player.position.y
          },
          velocity: { x: 0, y: -config.player.bulletSpeed },
          width: 4,
          height: 8,
          health: 1,
          maxHealth: 1,
          damage: 1,
          isPlayerBullet: true,
          type: BulletType.NORMAL
        };
        newBullets.push(newBullet);
      }

      return {
        ...prev,
        bullets: [...prev.bullets, ...newBullets]
      };
    });
  }, [config]);

  // Enemy spawning logic with escalating threat system
  const spawnEnemy = useCallback(() => {
    setGameState(prev => {
      if (performance.now() - prev.lastEnemySpawn < config.enemy.spawnRate) return prev;

      const newEnemies: Enemy[] = [];
      
      // Escalating threat boss spawning system
      const calculateBossChance = (baseChance: number, maxChance: number, levelBonus: number, waveBonus: number) => {
        const chance = baseChance + (prev.level - 1) * levelBonus + (prev.wave - 1) * waveBonus;
        return Math.min(chance, maxChance);
      };
      
      const miniBossChance = calculateBossChance(1, 8, 0.5, 0.2); // 1% → 8% cap
      const bossChance = calculateBossChance(0.2, 4, 0.3, 0.1); // 0.2% → 4% cap
      
      const random = Math.random() * 100;
      
      // Check for boss spawning (bosses are rarest)
      if (random < bossChance) {
        const boss: Enemy = {
          id: `boss-${Date.now()}`,
          position: {
            x: Math.random() * (config.canvas.width - 80),
            y: -80
          },
          velocity: { x: 50, y: config.enemy.speed * 0.6 }, // Slower but stronger
          width: 80,
          height: 80,
          health: 8 + (prev.level - 1) * 1, // 8+ health scaling (+1 per level)
          maxHealth: 8 + (prev.level - 1) * 1,
          type: EnemyType.BOSS,
          points: 1000 + prev.level * 200,
          pattern: EnemyPattern.SHIELDED,
          lastShot: 0,
          hoverPhase: 0,
          hoverThresholds: [0.2 + Math.random() * 0.1, 0.4 + Math.random() * 0.1, 0.7 + Math.random() * 0.1],
          phaseStartTime: 0
        };
        newEnemies.push(boss);
      }
      // Check for mini-boss spawning (if no boss spawned)
      else if (random < bossChance + miniBossChance) {
        const miniBoss: Enemy = {
          id: `miniboss-${Date.now()}`,
          position: {
            x: Math.random() * (config.canvas.width - 50),
            y: -50
          },
          velocity: { x: 30, y: config.enemy.speed * 0.8 },
          width: 50,
          height: 50,
          health: 3 + (prev.level - 1) * 1, // 3+ health scaling (+1 per level)
          maxHealth: 3 + (prev.level - 1) * 1,
          type: EnemyType.MINI_BOSS,
          points: 300 + prev.level * 50,
          pattern: EnemyPattern.ZIGZAG,
          lastShot: 0,
          hoverPhase: 0,
          hoverThresholds: [0.2 + Math.random() * 0.1, 0.4 + Math.random() * 0.1, 0.7 + Math.random() * 0.1],
          phaseStartTime: 0
        };
        newEnemies.push(miniBoss);
      }
      // Spawn normal enemies (reduced count if boss/mini-boss spawned)
      else {
        const enemiesPerSpawn = Math.min(2, Math.floor(prev.level / 2) + 1);
        
        for (let i = 0; i < enemiesPerSpawn; i++) {
          // 25% chance for diagonal movement
          const isDiagonal = Math.random() < 0.25;
          
          let velocity = { x: 0, y: config.enemy.speed };
          
          if (isDiagonal) {
            // Random angle between 10-15 degrees
            const angle = (10 + Math.random() * 5) * (Math.random() < 0.5 ? 1 : -1);
            const radians = angle * Math.PI / 180;
            
            // 12% speed boost for diagonal enemies
            const diagonalSpeed = config.enemy.speed * 1.12;
            const adjustedSpeed = diagonalSpeed / Math.cos(radians);
            
            velocity = {
              x: Math.sin(radians) * adjustedSpeed,
              y: adjustedSpeed
            };
          }
          
          const newEnemy: Enemy = {
            id: `enemy-${Date.now()}-${i}`,
            position: {
              x: Math.random() * (config.canvas.width - 40),
              y: -40 - (i * 50)
            },
            velocity,
            width: 30,
            height: 30,
            health: 1,
            maxHealth: 1,
            type: EnemyType.NORMAL,
            points: 100,
            pattern: EnemyPattern.STRAIGHT,
            lastShot: 0
          };
          newEnemies.push(newEnemy);
        }
      }

      return {
        ...prev,
        enemies: [...prev.enemies, ...newEnemies],
        lastEnemySpawn: performance.now()
      };
    });
  }, [config]);

  // Update game objects
  const updateGameObjects = useCallback((deltaTime: number) => {
    setGameState(prev => {
      // Clean up expired power-ups
      const currentTime = performance.now();
      for (const [key, powerUp] of activePowerUps.current) {
        if (currentTime > powerUp.endTime) {
          activePowerUps.current.delete(key);
        }
      }

      // Update bullets
      const updatedBullets = prev.bullets
        .map(bullet => ({
          ...bullet,
          position: {
            x: bullet.position.x + bullet.velocity.x * deltaTime,
            y: bullet.position.y + bullet.velocity.y * deltaTime
          }
        }))
        .filter(bullet => 
          bullet.position.y > -10 && 
          bullet.position.y < config.canvas.height + 10 &&
          bullet.position.x > -10 && 
          bullet.position.x < config.canvas.width + 10
        );

      // Update power-ups with magnet effect
      const hasMagnet = activePowerUps.current.has(PowerUpType.MAGNET);
      const updatedPowerUps = prev.powerUps
        .map(powerUp => {
          let newVelocity = { ...powerUp.velocity };
          
          if (hasMagnet) {
            // Pull power-ups toward player if within magnet radius
            // Calculate edge-to-edge distance for better accuracy
            const playerCenterX = prev.player.position.x + prev.player.width / 2;
            const playerCenterY = prev.player.position.y + prev.player.height / 2;
            const powerUpCenterX = powerUp.position.x + powerUp.width / 2;
            const powerUpCenterY = powerUp.position.y + powerUp.height / 2;
            
            const dx = playerCenterX - powerUpCenterX;
            const dy = playerCenterY - powerUpCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < config.powerUp.magnetRadius && distance > 0) {
              const magnetStrength = GAME_CONSTANTS.MAGNET.STRENGTH;
              const pullX = (dx / distance) * magnetStrength;
              const pullY = (dy / distance) * magnetStrength;
              
              // Add velocity damping when within magnet range to prevent fly-by
              newVelocity.x = newVelocity.x * GAME_CONSTANTS.MAGNET.VELOCITY_DAMPING + pullX;
              newVelocity.y = newVelocity.y * GAME_CONSTANTS.MAGNET.VELOCITY_DAMPING + pullY;
              
              // Cap maximum magnet velocity to prevent overshooting
              const maxMagnetVelocity = GAME_CONSTANTS.MAGNET.MAX_VELOCITY;
              const currentSpeed = Math.sqrt(newVelocity.x * newVelocity.x + newVelocity.y * newVelocity.y);
              if (currentSpeed > maxMagnetVelocity) {
                newVelocity.x = (newVelocity.x / currentSpeed) * maxMagnetVelocity;
                newVelocity.y = (newVelocity.y / currentSpeed) * maxMagnetVelocity;
              }
            }
          }
          
          return {
            ...powerUp,
            position: {
              x: powerUp.position.x + newVelocity.x * deltaTime,
              y: powerUp.position.y + newVelocity.y * deltaTime
            },
            velocity: newVelocity
          };
        })
        .filter(powerUp => powerUp.position.y < config.canvas.height + 50);

      // Check for Reality Storm effects  
      const isRealityStormActive = prev.realityStormActive && currentTime < prev.realityStormEndTime;
      
      // Apply Reality Storm chaos to enemy behavior
      let chaosMultiplier = 1;
      if (isRealityStormActive) {
        chaosMultiplier = 0.3 + Math.random() * 0.4; // Random between 0.3-0.7
      }

      // Update enemies with level-based speed and movement patterns
      const enemySpeed = config.enemy.speed + (prev.level - 1) * 20;
      const updatedEnemies = prev.enemies
        .map(enemy => {
          let newVelocity = { ...enemy.velocity };
          let newPosition = { ...enemy.position };
          let updatedEnemy = { ...enemy };
          
          // Apply Reality Storm chaos effects (reduced intensity)
          if (isRealityStormActive) {
            // Random direction changes every 1-2 seconds instead of every frame
            if (Math.random() < 0.01) { // ~1% chance per frame = every 1-2 seconds at 60fps
              // Preserve some downward motion (50% bias toward player)
              const randomAngle = Math.random() * Math.PI * 2;
              const randomSpeed = (config.enemy.speed * 0.8) + (Math.random() * config.enemy.speed * 0.4); // 0.8x to 1.2x speed
              newVelocity.x = Math.cos(randomAngle) * randomSpeed * chaosMultiplier;
              newVelocity.y = Math.max(0, Math.abs(Math.sin(randomAngle)) * randomSpeed * chaosMultiplier * 0.8); // Bias downward
            }
            
            // Subtle size fluctuation (0.9x to 1.1x instead of 0.8x to 1.4x)
            if (Math.random() < 0.002) { // Very occasional size changes
              updatedEnemy.width = enemy.width * (0.9 + Math.random() * 0.2);
              updatedEnemy.height = enemy.height * (0.9 + Math.random() * 0.2);
            }
          }
          
          // Multi-phase hover system for bosses and mini-bosses
          if ((enemy.type === EnemyType.MINI_BOSS || enemy.type === EnemyType.BOSS)) {
            const currentPhase = enemy.hoverPhase || 0;
            const thresholds = enemy.hoverThresholds || [];
            
            // Check if we should enter a hover phase
            if (currentPhase < thresholds.length) {
              const currentThreshold = thresholds[currentPhase];
              const thresholdY = config.canvas.height * currentThreshold;
              
              // If we've reached the threshold and not already hovering
              if (enemy.position.y >= thresholdY && !enemy.isHovering) {
                updatedEnemy.isHovering = true;
                updatedEnemy.hoverStartTime = currentTime;
                updatedEnemy.phaseStartTime = currentTime;
                updatedEnemy.damageWhenStartedHovering = enemy.health;
              }
              
              // If we're currently hovering, check if we should end this phase
              if (enemy.isHovering) {
                const hoverDuration = currentTime - (enemy.phaseStartTime || 0);
                const phaseDurations = [5000, 4000, 3000, 2000]; // 5s → 4s → 3s → 2s
                const currentPhaseDuration = phaseDurations[currentPhase] || 2000;
                
                if (hoverDuration >= currentPhaseDuration) {
                  // Move to next phase
                  updatedEnemy.hoverPhase = currentPhase + 1;
                  updatedEnemy.isHovering = false;
                  updatedEnemy.hoverStartTime = 0;
                  
                  // Increase speed for descent phases
                  const speedMultipliers = [1.0, 1.3, 1.6, 2.0]; // Increasing speed
                  const speedMultiplier = speedMultipliers[currentPhase + 1] || 2.0;
                  updatedEnemy.velocity = {
                    x: enemy.velocity.x * speedMultiplier,
                    y: enemy.velocity.y * speedMultiplier
                  };
                }
              }
            }
          }
          
          // Apply movement patterns with hover logic
          switch (enemy.pattern) {
            case EnemyPattern.ZIGZAG:
              // Mini-boss zigzag pattern
              const zigzagTime = (currentTime / 1000) % 4; // 4-second cycle
              newVelocity.x = Math.sin(zigzagTime * Math.PI) * 80;
              
              // Hover behavior: stop Y movement during hover phases
              if (updatedEnemy.isHovering) {
                newVelocity.y = 0;
              }
              break;
              
            case EnemyPattern.SHIELDED:
              // Boss defensive movement - slower, side-to-side
              const shieldTime = (currentTime / 1500) % (Math.PI * 2);
              newVelocity.x = Math.sin(shieldTime) * 60;
              
              // Hover behavior: stop Y movement during hover phases
              if (updatedEnemy.isHovering) {
                newVelocity.y = 0;
              }
              break;
              
            case EnemyPattern.STRAIGHT:
            default:
              // Normal enemy movement - no change needed
              break;
          }
          
          // Update position with movement pattern
          newPosition.x = enemy.position.x + newVelocity.x * deltaTime;
          
          // Y movement calculation based on hover state
          let yMovement = newVelocity.y;
          if (!updatedEnemy.isHovering) {
            yMovement += enemySpeed - config.enemy.speed;
          }
          newPosition.y = enemy.position.y + yMovement * deltaTime;
          
          // Keep enemies within bounds for horizontal movement
          newPosition.x = Math.max(0, Math.min(config.canvas.width - enemy.width, newPosition.x));
          
          return {
            ...updatedEnemy,
            position: newPosition,
            velocity: newVelocity
          };
        })
        .filter(enemy => 
          enemy.position.y < config.canvas.height + 50 && 
          enemy.health > 0
        );

      // Check player-power-up collisions
      const remainingPowerUps: PowerUp[] = [];
      updatedPowerUps.forEach(powerUp => {
        if (checkCollision(prev.player, powerUp)) {
          // Collect power-up
          const duration = powerUp.duration;
          const endTime = currentTime + duration;
          activePowerUps.current.set(powerUp.type, { type: powerUp.type, endTime });
          
          // Apply immediate effects
          if (powerUp.type === PowerUpType.SHIELD) {
            // Shield effect handled in damage calculation
          } else if (powerUp.type === PowerUpType.REALITY_WARP) {
            // Activate Reality Storm for 10 seconds
            setGameState(currentState => ({
              ...currentState,
              realityStormActive: true,
              realityStormEndTime: currentTime + 10000,
              realityStormIntensity: 1.0,
              shakeIntensity: Math.max(currentState.shakeIntensity, 20)
            }));
          }
        } else {
          remainingPowerUps.push(powerUp);
        }
      });

      // Check player-enemy collisions
      let playerDamaged = false;
      const hasShield = activePowerUps.current.has(PowerUpType.SHIELD);
      if (!prev.player.invulnerable && !hasShield) {
        updatedEnemies.forEach(enemy => {
          if (checkCollision(prev.player, enemy)) {
            playerDamaged = true;
          }
        });
      }

      // Check bullet-enemy collisions
      const remainingBullets: Bullet[] = [];
      const remainingEnemies: Enemy[] = [];
      let scoreIncrease = 0;
      let feverIncrease = 0;
      let enemiesKilled = 0;
      const killedEnemyIds = new Set<string>(); // Track killed enemies to prevent multiple scoring

      updatedBullets.forEach(bullet => {
        let bulletHit = false;
        if (bullet.isPlayerBullet) {
          updatedEnemies.forEach(enemy => {
            if (!bulletHit && checkCollision(bullet, enemy)) {
              bulletHit = true;
              enemy.health -= bullet.damage;
              if (enemy.health <= 0 && !killedEnemyIds.has(enemy.id)) {
                killedEnemyIds.add(enemy.id);
                const killReward = handleEnemyKill(enemy);
                scoreIncrease += killReward.points;
                feverIncrease += killReward.feverIncrease;
                enemiesKilled++;
              }
            }
          });
        }
        if (!bulletHit) {
          remainingBullets.push(bullet);
        }
      });

      // Filter out dead enemies (no more power-up drops from enemy deaths)
      updatedEnemies.forEach(enemy => {
        if (enemy.health > 0) {
          remainingEnemies.push(enemy);
        }
      });

      // Wave progression logic
      const totalEnemiesInWave = 5 + prev.wave; // Increase enemies per wave
      const waveProgress = prev.waveProgress + enemiesKilled;
      let newWave = prev.wave;
      let newLevel = prev.level;
      let newTotalWaves = prev.totalWaves;
      
      if (waveProgress >= totalEnemiesInWave) {
        newWave += 1;
        newTotalWaves += 1; // Increment total waves
        const wavesPerLevel = 3 + Math.floor(prev.level / 2); // More waves per level as level increases
        if (newWave > wavesPerLevel) {
          newLevel += 1;
          newWave = 1;
        }
      }

      const newPlayer = {
        ...prev.player,
        score: prev.player.score + scoreIncrease,
        feverMeter: Math.min(100, prev.player.feverMeter + feverIncrease)
      };

      if (playerDamaged) {
        newPlayer.health = Math.max(0, newPlayer.health - 1);
        newPlayer.invulnerable = true;
        newPlayer.invulnerabilityTime = GAME_CONSTANTS.PLAYER.INVULNERABILITY_TIME;
      }

      // Check if Reality Storm has ended and award survival bonus
      let stormEndBonus = 0;
      let stormActive = prev.realityStormActive;
      let stormIntensity = prev.realityStormIntensity;
      
      if (prev.realityStormActive && currentTime >= prev.realityStormEndTime) {
        // Reality Storm ended - player survived!
        stormActive = false;
        stormIntensity = 0;
        if (newPlayer.health > 0) {
          stormEndBonus = 25000; // Massive survival bonus
        }
      }

      return {
        ...prev,
        bullets: remainingBullets,
        enemies: remainingEnemies,
        powerUps: remainingPowerUps,
        player: {
          ...newPlayer,
          score: newPlayer.score + stormEndBonus
        },
        wave: newWave,
        level: newLevel,
        totalWaves: newTotalWaves,
        waveProgress: waveProgress >= totalEnemiesInWave ? 0 : waveProgress,
        shakeIntensity: playerDamaged ? 15 : (isRealityStormActive ? 25 : prev.shakeIntensity),
        realityStormActive: stormActive,
        realityStormIntensity: stormIntensity
      };
    });
  }, [config, checkCollision]);

  // Update player position and actions
  const updatePlayer = useCallback((deltaTime: number) => {
    setGameState(prev => {
      const newVelocity = { x: 0, y: 0 };
      
      if (isKeyPressed('a') || isKeyPressed('arrowleft')) {
        newVelocity.x = -config.player.speed;
      }
      if (isKeyPressed('d') || isKeyPressed('arrowright')) {
        newVelocity.x = config.player.speed;
      }
      if (isKeyPressed('w') || isKeyPressed('arrowup')) {
        newVelocity.y = -config.player.speed;
      }
      if (isKeyPressed('s') || isKeyPressed('arrowdown')) {
        newVelocity.y = config.player.speed;
      }

      // Handle shooting
      if (isKeyPressed(' ')) {
        shoot();
      }

      const newPosition = {
        x: Math.max(0, Math.min(config.canvas.width - prev.player.width, 
          prev.player.position.x + newVelocity.x * deltaTime)),
        y: Math.max(0, Math.min(config.canvas.height - prev.player.height,
          prev.player.position.y + newVelocity.y * deltaTime))
      };

      return {
        ...prev,
        player: {
          ...prev.player,
          position: newPosition,
          velocity: newVelocity,
          invulnerabilityTime: Math.max(0, prev.player.invulnerabilityTime - deltaTime * 1000),
          invulnerable: prev.player.invulnerabilityTime > 0
        },
        shakeIntensity: Math.max(0, prev.shakeIntensity - deltaTime * 30)
      };
    });
  }, [config, isKeyPressed, shoot]);

  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (gameState.status === GameStatus.PLAYING) {
      const deltaTime = (timestamp - gameState.lastFrame) / 1000;
      
      updatePlayer(deltaTime);
      updateGameObjects(deltaTime);
      spawnEnemy();
      spawnRandomPowerUp();
      
      setGameState(prev => ({
        ...prev,
        gameTime: prev.gameTime + deltaTime,
        lastFrame: timestamp
      }));
      
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameState.status, gameState.lastFrame, updatePlayer, updateGameObjects, spawnEnemy, spawnRandomPowerUp]);

  // Start/stop game loop
  useEffect(() => {
    if (gameState.status === GameStatus.PLAYING) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.status, gameLoop]);

  // Event listeners are now handled by useGameInputs hook

  return {
    gameState,
    config,
    startGame,
    resetToReady,
    pauseGame,
    gameOver,
    activateFever,
    checkCollision,
    setGameState
  };
};