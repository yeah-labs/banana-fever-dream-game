import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, GameConfig, Player, Enemy, Bullet, PowerUp, Position } from '@/types/game';

const DEFAULT_CONFIG: GameConfig = {
  canvas: { width: 800, height: 600 },
  player: { speed: 300, bulletSpeed: 400, fireRate: 200, maxHealth: 3 },
  enemy: { speed: 50, bulletSpeed: 200, spawnRate: 800 },
  powerUp: { dropRate: 0.15, magnetRadius: 250 },
  fever: { 
    buildRate: 1, 
    damageMultiplier: { normal: 1, miniBoss: 0.5, boss: 0.25 } 
  }
};

const createInitialPlayer = (): Player => ({
  id: 'player',
  position: { x: 400, y: 550 },
  velocity: { x: 0, y: 0 },
  width: 40,
  height: 40,
  health: 3,
  maxHealth: 3,
  score: 0,
  feverMeter: 0,
  powerUps: [],
  invulnerable: false,
  invulnerabilityTime: 0
});

const createInitialState = (): GameState => ({
  status: 'ready',
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
  feversUsed: 0
});

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [config] = useState<GameConfig>(DEFAULT_CONFIG);
  const keysPressed = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number>();
  const secretSequence = useRef<string[]>([]);
  const lastPowerUpSpawn = useRef<number>(0);
  const activePowerUps = useRef<Map<string, { type: PowerUp['type'], endTime: number }>>(new Map());

  // Input handling
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    keysPressed.current.add(event.key.toLowerCase());
    
    // Secret mode sequence: H B D
    const key = event.key.toLowerCase();
    if (gameState.status === 'ready') {
      secretSequence.current.push(key);
      if (secretSequence.current.length > 3) {
        secretSequence.current = secretSequence.current.slice(-3);
      }
      
      if (secretSequence.current.join('') === 'hbd') {
        setGameState(prev => ({ ...prev, secretMode: true }));
        // TODO: Add confetti animation
      }
    }
  }, [gameState.status]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    keysPressed.current.delete(event.key.toLowerCase());
  }, []);

  // Game actions
  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...createInitialState(),
      status: 'playing',
      secretMode: prev.secretMode,
      lastFrame: performance.now()
    }));
  }, []);

  const resetToReady = useCallback(() => {
    setGameState(prev => ({
      ...createInitialState(),
      status: 'ready',
      secretMode: false
    }));
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ 
      ...prev, 
      status: prev.status === 'paused' ? 'playing' : 'paused' 
    }));
  }, []);

  const gameOver = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'game-over' }));
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
          
          if (enemy.type === 'normal') {
            // Normal enemies are killed instantly
            if (enemy.health > 0) {
              const killReward = handleEnemyKill(enemy);
              totalFeverScore += killReward.points;
              totalFeverIncrease += killReward.feverIncrease;
              enemiesKilled++;
            }
            newEnemy.health = 0;
          } else if (enemy.type === 'mini-boss') {
            newEnemy.health = Math.max(0, enemy.health - enemy.maxHealth * 0.5);
          } else if (enemy.type === 'boss') {
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

  // Collision detection
  const checkCollision = useCallback((obj1: any, obj2: any): boolean => {
    return (
      obj1.position.x < obj2.position.x + obj2.width &&
      obj1.position.x + obj1.width > obj2.position.x &&
      obj1.position.y < obj2.position.y + obj2.height &&
      obj1.position.y + obj1.height > obj2.position.y
    );
  }, []);

  // Power-up spawning with rarity system
  const spawnRandomPowerUp = useCallback(() => {
    const currentTime = performance.now();
    const spawnInterval = 8000; // Spawn every 8 seconds
    
    if (currentTime - lastPowerUpSpawn.current < spawnInterval) return;
    
    lastPowerUpSpawn.current = currentTime;
    
    // Rarity-based weighted selection
    const powerUpPool = [
      // Common (50% total)
      { type: 'shield' as const, rarity: 'common' as const, weight: 50 },
      // Uncommon (30%)
      { type: 'spread-shot' as const, rarity: 'uncommon' as const, weight: 20 },
      { type: 'score-doubler' as const, rarity: 'uncommon' as const, weight: 10 },
      // Rare (15%)
      { type: 'magnet' as const, rarity: 'rare' as const, weight: 15 },
      // Epic (4%)
      { type: 'sword' as const, rarity: 'epic' as const, weight: 4 },
      // Legendary (1%)
      { type: 'reality-warp' as const, rarity: 'legendary' as const, weight: 1 }
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
        velocity: { x: 0, y: 80 },
        width: 20,
        height: 20,
        health: 1,
        maxHealth: 1,
        type: selectedPowerUp.type,
        rarity: selectedPowerUp.rarity,
        duration: selectedPowerUp.type === 'shield' ? 5000 : 
                  selectedPowerUp.type === 'score-doubler' ? 8000 :
                  selectedPowerUp.type === 'magnet' ? 10000 :
                  selectedPowerUp.type === 'sword' ? 5000 :
                  selectedPowerUp.type === 'reality-warp' ? 10000 : 5000,
        effect: {}
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
      
      // Check for spread shot
      const hasSpreadShot = activePowerUps.current.has('spread-shot');
      const hasSword = activePowerUps.current.has('sword');
      
      if (hasSpreadShot) {
        // Three bullet spread
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
            damage: hasSword ? 3 : 1,
            isPlayerBullet: true,
            type: hasSword ? 'sword' : 'normal'
          };
          newBullets.push(newBullet);
        }
      } else {
        // Single bullet
        const newBullet: Bullet = {
          id: `bullet-${Date.now()}`,
          position: {
            x: prev.player.position.x + prev.player.width / 2 - 2,
            y: prev.player.position.y
          },
          velocity: { x: 0, y: -config.player.bulletSpeed },
          width: hasSword ? 6 : 4,
          height: hasSword ? 12 : 8,
          health: 1,
          maxHealth: 1,
          damage: hasSword ? 3 : 1,
          isPlayerBullet: true,
          type: hasSword ? 'sword' : 'normal'
        };
        newBullets.push(newBullet);
      }

      return {
        ...prev,
        bullets: [...prev.bullets, ...newBullets]
      };
    });
  }, [config]);

  // Enemy spawning logic
  const spawnEnemy = useCallback(() => {
    setGameState(prev => {
      if (performance.now() - prev.lastEnemySpawn < config.enemy.spawnRate) return prev;

      const newEnemies: Enemy[] = [];
      const enemiesPerSpawn = Math.min(2, Math.floor(prev.level / 2) + 1); // 1-2 enemies per spawn based on level
      
      for (let i = 0; i < enemiesPerSpawn; i++) {
        const newEnemy: Enemy = {
          id: `enemy-${Date.now()}-${i}`,
          position: {
            x: Math.random() * (config.canvas.width - 40),
            y: -40 - (i * 50) // Stagger spawn positions
          },
          velocity: { x: 0, y: config.enemy.speed },
          width: 30,
          height: 30,
          health: 1,
          maxHealth: 1,
          type: 'normal',
          points: 100,
          pattern: 'straight',
          lastShot: 0
        };
        newEnemies.push(newEnemy);
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
      const hasMagnet = activePowerUps.current.has('magnet');
      const updatedPowerUps = prev.powerUps
        .map(powerUp => {
          let newVelocity = { ...powerUp.velocity };
          
          if (hasMagnet) {
            // Pull power-ups toward player if within magnet radius
            const dx = prev.player.position.x - powerUp.position.x;
            const dy = prev.player.position.y - powerUp.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < config.powerUp.magnetRadius && distance > 0) {
              const magnetStrength = 200;
              newVelocity.x += (dx / distance) * magnetStrength;
              newVelocity.y += (dy / distance) * magnetStrength;
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

      // Update enemies with level-based speed
      const enemySpeed = config.enemy.speed + (prev.level - 1) * 20;
      const updatedEnemies = prev.enemies
        .map(enemy => ({
          ...enemy,
          position: {
            x: enemy.position.x + enemy.velocity.x * deltaTime,
            y: enemy.position.y + (enemy.velocity.y + enemySpeed - config.enemy.speed) * deltaTime
          }
        }))
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
          if (powerUp.type === 'shield') {
            // Shield effect handled in damage calculation
          } else if (powerUp.type === 'reality-warp') {
            // Special reality warp effects can be added here
          }
        } else {
          remainingPowerUps.push(powerUp);
        }
      });

      // Check player-enemy collisions
      let playerDamaged = false;
      const hasShield = activePowerUps.current.has('shield');
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
        newPlayer.invulnerabilityTime = 2000; // 2 seconds of invulnerability
      }

      return {
        ...prev,
        bullets: remainingBullets,
        enemies: remainingEnemies,
        powerUps: remainingPowerUps,
        player: newPlayer,
        wave: newWave,
        level: newLevel,
        totalWaves: newTotalWaves,
        waveProgress: waveProgress >= totalEnemiesInWave ? 0 : waveProgress,
        shakeIntensity: playerDamaged ? 15 : prev.shakeIntensity
      };
    });
  }, [config, checkCollision]);

  // Update player position and actions
  const updatePlayer = useCallback((deltaTime: number) => {
    setGameState(prev => {
      const newVelocity = { x: 0, y: 0 };
      
      if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) {
        newVelocity.x = -config.player.speed;
      }
      if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) {
        newVelocity.x = config.player.speed;
      }
      if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) {
        newVelocity.y = -config.player.speed;
      }
      if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) {
        newVelocity.y = config.player.speed;
      }

      // Handle shooting
      if (keysPressed.current.has(' ')) {
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
  }, [config, keysPressed, shoot]);

  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (gameState.status === 'playing') {
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
  }, [gameState.status, gameState.lastFrame, updatePlayer, updateGameObjects, spawnEnemy]);

  // Start/stop game loop
  useEffect(() => {
    if (gameState.status === 'playing') {
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

  // Event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

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