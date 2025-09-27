import { PowerUpType } from '@/types/gameEnums';

// Centralized game constants - extracted from magic numbers throughout the codebase
export const GAME_CONSTANTS = {
  // Canvas settings
  CANVAS: {
    WIDTH: 800,
    HEIGHT: 600,
  },

  // Player settings
  PLAYER: {
    SPEED: 300,
    BULLET_SPEED: 400,
    FIRE_RATE: 200,
    MAX_HEALTH: 3,
    WIDTH: 40,
    HEIGHT: 40,
    INITIAL_X: 400,
    INITIAL_Y: 550,
    INVULNERABILITY_TIME: 2000,
  },

  // Enemy settings
  ENEMY: {
    SPEED: 50,
    BULLET_SPEED: 200,
    SPAWN_RATE: 800,
    NORMAL: {
      WIDTH: 30,
      HEIGHT: 30,
      HEALTH: 1,
      POINTS: 100,
    },
    MINI_BOSS: {
      WIDTH: 50,
      HEIGHT: 50,
      BASE_HEALTH: 3,
      BASE_POINTS: 300,
      SPEED_MULTIPLIER: 0.8,
    },
    BOSS: {
      WIDTH: 80,
      HEIGHT: 80,
      BASE_HEALTH: 8,
      BASE_POINTS: 1000,
      SPEED_MULTIPLIER: 0.6,
    },
  },

  // Power-up settings
  POWER_UP: {
    DROP_RATE: 0.15,
    MAGNET_RADIUS: 250,
    SPAWN_INTERVAL: 8000,
    WIDTH: 20,
    HEIGHT: 20,
    FALL_SPEED: 80,
    DURATIONS: {
      [PowerUpType.SHIELD]: 5000,
      [PowerUpType.SCORE_DOUBLER]: 10000,
      [PowerUpType.MAGNET]: 10000,
      [PowerUpType.SWORD]: 10000,
      [PowerUpType.REALITY_WARP]: 10000,
      [PowerUpType.SPREAD_SHOT]: 5000,
    } as const,
  },

  // Magnet effect settings
  MAGNET: {
    STRENGTH: 800,
    VELOCITY_DAMPING: 0.8,
    MAX_VELOCITY: 600,
  },

  // Bullet settings
  BULLET: {
    NORMAL: {
      WIDTH: 4,
      HEIGHT: 8,
      DAMAGE: 1,
    },
    SWORD: {
      WIDTH: 6,
      HEIGHT: 12,
      DAMAGE: 5,
    },
  },

  // Fever mode settings
  FEVER: {
    BUILD_RATE: 1,
    MAX_METER: 100,
    DAMAGE_MULTIPLIERS: {
      NORMAL: 1,
      MINI_BOSS: 0.5,
      BOSS: 0.25,
    },
    SHAKE_INTENSITY: 10,
  },

  // Boss spawning chances
  BOSS_SPAWN: {
    MINI_BOSS: {
      BASE_CHANCE: 1,
      MAX_CHANCE: 8,
      LEVEL_BONUS: 0.5,
      WAVE_BONUS: 0.2,
    },
    BOSS: {
      BASE_CHANCE: 0.2,
      MAX_CHANCE: 4,
      LEVEL_BONUS: 0.3,
      WAVE_BONUS: 0.1,
    },
  },

  // Spread shot settings
  SPREAD_SHOT: {
    BULLET_COUNT: 3,
    HORIZONTAL_SPREAD: 50,
  },

  // Secret mode
  SECRET: {
    SEQUENCE: ['h', 'b', 'd'],
  },
} as const;