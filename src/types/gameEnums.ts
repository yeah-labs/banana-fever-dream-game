// Game enums for better type safety
export enum GameStatus {
  READY = 'ready',
  PLAYING = 'playing',
  GAME_OVER = 'game-over'
}

export enum PowerUpType {
  SPREAD_SHOT = 'spread-shot',
  SHIELD = 'shield',
  SCORE_DOUBLER = 'score-doubler',
  MAGNET = 'magnet',
  SWORD = 'sword',
  REALITY_WARP = 'reality-warp'
}

export enum PowerUpRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export enum EnemyType {
  NORMAL = 'normal',
  MINI_BOSS = 'mini-boss',
  BOSS = 'boss',
  EASTER_EGG = 'easter-egg'
}

export enum EnemyPattern {
  ZIGZAG = 'zigzag',
  STRAIGHT = 'straight',
  SHIELDED = 'shielded'
}

export enum BulletType {
  NORMAL = 'normal',
  BANANA = 'banana',
  SWORD = 'sword'
}