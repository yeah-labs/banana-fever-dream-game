import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, GameConfig, Player, Enemy, Bullet, PowerUp, Position } from '@/types/game';

const DEFAULT_CONFIG: GameConfig = {
  canvas: { width: 800, height: 600 },
  player: { speed: 300, bulletSpeed: 400, fireRate: 200, maxHealth: 3 },
  enemy: { speed: 50, bulletSpeed: 200, spawnRate: 2000 },
  powerUp: { dropRate: 0.15, magnetRadius: 150 },
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
  status: 'menu',
  player: createInitialPlayer(),
  enemies: [],
  bullets: [],
  powerUps: [],
  level: 1,
  wave: 1,
  waveProgress: 0,
  lastEnemySpawn: 0,
  gameTime: 0,
  secretMode: false,
  shakeIntensity: 0,
  lastFrame: 0
});

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [config] = useState<GameConfig>(DEFAULT_CONFIG);
  const keysPressed = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number>();
  const secretSequence = useRef<string[]>([]);

  // Input handling
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    keysPressed.current.add(event.key.toLowerCase());
    
    // Secret mode sequence: H B D
    const key = event.key.toLowerCase();
    if (gameState.status === 'menu') {
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

  const activateFever = useCallback(() => {
    if (gameState.player.feverMeter >= 100) {
      setGameState(prev => {
        // Clear all normal enemies
        const updatedEnemies = prev.enemies.map(enemy => {
          if (enemy.type === 'normal') {
            return { ...enemy, health: 0 };
          } else if (enemy.type === 'mini-boss') {
            return { ...enemy, health: Math.max(0, enemy.health - enemy.maxHealth * 0.5) };
          } else if (enemy.type === 'boss') {
            return { ...enemy, health: Math.max(0, enemy.health - enemy.maxHealth * 0.25) };
          }
          return enemy;
        });

        return {
          ...prev,
          enemies: updatedEnemies,
          player: { ...prev.player, feverMeter: 0 },
          shakeIntensity: 10
        };
      });
    }
  }, [gameState.player.feverMeter]);

  // Collision detection
  const checkCollision = useCallback((obj1: any, obj2: any): boolean => {
    return (
      obj1.position.x < obj2.position.x + obj2.width &&
      obj1.position.x + obj1.width > obj2.position.x &&
      obj1.position.y < obj2.position.y + obj2.height &&
      obj1.position.y + obj1.height > obj2.position.y
    );
  }, []);

  // Shooting logic
  const lastShotTime = useRef<number>(0);

  const shoot = useCallback(() => {
    const currentTime = performance.now();
    if (currentTime - lastShotTime.current < config.player.fireRate) return;
    
    lastShotTime.current = currentTime;
    setGameState(prev => {
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
        type: 'normal'
      };

      return {
        ...prev,
        bullets: [...prev.bullets, newBullet]
      };
    });
  }, [config]);

  // Enemy spawning logic
  const spawnEnemy = useCallback(() => {
    setGameState(prev => {
      if (performance.now() - prev.lastEnemySpawn < config.enemy.spawnRate) return prev;

      const newEnemy: Enemy = {
        id: `enemy-${Date.now()}`,
        position: {
          x: Math.random() * (config.canvas.width - 40),
          y: -40
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

      return {
        ...prev,
        enemies: [...prev.enemies, newEnemy],
        lastEnemySpawn: performance.now()
      };
    });
  }, [config]);

  // Update game objects
  const updateGameObjects = useCallback((deltaTime: number) => {
    setGameState(prev => {
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

      // Check player-enemy collisions
      let playerDamaged = false;
      if (!prev.player.invulnerable) {
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

      updatedBullets.forEach(bullet => {
        let bulletHit = false;
        if (bullet.isPlayerBullet) {
          updatedEnemies.forEach(enemy => {
            if (!bulletHit && checkCollision(bullet, enemy)) {
              bulletHit = true;
              enemy.health -= bullet.damage;
              if (enemy.health <= 0) {
                scoreIncrease += enemy.points;
                feverIncrease += config.fever.buildRate;
                enemiesKilled++;
              }
            }
          });
        }
        if (!bulletHit) {
          remainingBullets.push(bullet);
        }
      });

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
      
      if (waveProgress >= totalEnemiesInWave) {
        newWave += 1;
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
        player: newPlayer,
        wave: newWave,
        level: newLevel,
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
    pauseGame,
    gameOver,
    activateFever,
    checkCollision,
    setGameState
  };
};