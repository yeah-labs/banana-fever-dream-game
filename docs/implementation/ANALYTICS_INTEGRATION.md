# Analytics Integration - Plausible Analytics

This document describes the analytics implementation using Plausible Analytics to track user interactions and game events.

## Overview

Plausible Analytics is a privacy-friendly analytics solution that tracks user behavior without cookies or personal data collection. The implementation focuses on tracking:

- User interactions (clicks)
- Game lifecycle events (start/end)
- User engagement metrics

## Setup

### Installation

```bash
npm i @plausible-analytics/tracker
```

### Configuration

Analytics are initialized in `src/main.tsx`:

```typescript
import { init as initPlausible } from "@plausible-analytics/tracker";

initPlausible({
  domain: window.location.hostname,
  captureOnLocalhost: true,
});
```

**Note**: `captureOnLocalhost` is set to `true` to enable testing during development. Plausible automatically handles filtering and data segmentation on their platform.

## Tracked Events

### 1. Click Events

All button and link interactions are tracked with the following properties:

**Event Name**: `Click`

**Properties**:
- `type`: "button" or "link"
- `label`: Descriptive label of what was clicked

**Tracked Buttons**:
- Banana Fever Dream title (link)
- Log In
- Log Out
- Practice
- Leaderboard
- Info
- Feedback
- Insert Coin
- Back to Game
- End Game
- Play Again
- Refresh

### 2. Game Started Event

Tracks when a game session begins.

**Event Name**: `Game Started`

**Properties**:
- `mode`: "compete" or "practice"

**Triggers**:
- Practice button clicked
- Insert Coin payment successful

### 3. Game Ended Event

Tracks when a game session ends.

**Event Name**: `Game Ended`

**Properties**:
- `mode`: "compete" or "practice"
- `type`: "manual" or "game over"
- `score`: Final score as string

**Triggers**:
- Player health reaches 0 (automatic game over)
- Player clicks "End Game" button (manual)

## Implementation

### Analytics Utilities (`src/utils/analytics.ts`)

Three helper functions provide a clean API for tracking:

```typescript
// Track button/link clicks
trackClick(label: string, type: 'button' | 'link')

// Track game start
trackGameStarted(mode: 'compete' | 'practice' | 'not-connected')

// Track game end
trackGameEnded(mode: 'compete' | 'practice' | 'not-connected', type: 'manual' | 'game over', score: number)
```

### Usage Examples

#### Click Tracking
```typescript
import { trackClick } from '@/utils/analytics';

<Button onClick={() => {
  trackClick('Feedback', 'button');
  window.open('https://forms.gle/...', '_blank');
}}>
  Feedback
</Button>
```

#### Game Lifecycle Tracking
```typescript
import { trackGameStarted, trackGameEnded } from '@/utils/analytics';

// Starting a game
const handleStartGame = () => {
  const mode = account ? 'practice' : 'not-connected';
  startGame(mode);
  trackGameStarted(mode);
};

// Ending a game (manual)
const handleEndGame = () => {
  trackGameEnded(gameState.playMode, 'manual', gameState.player.score);
  gameOver();
};

// Ending a game (automatic)
useEffect(() => {
  if (gameState.status === 'playing' && gameState.player.health <= 0) {
    trackGameEnded(gameState.playMode, 'game over', gameState.player.score);
    gameOver();
  }
}, [gameState.status, gameState.player.health]);
```

## Files Modified

### New Files
- `src/utils/analytics.ts` - Analytics utility functions

### Modified Files
- `src/main.tsx` - Plausible initialization
- `src/components/layout/Header.tsx` - Title, login, logout tracking
- `src/components/game/BananaFeverDream.tsx` - Game actions and navigation tracking
- `src/components/game/GameOver.tsx` - Post-game actions tracking
- `src/pages/Info.tsx` - Navigation tracking
- `src/pages/Leaderboard.tsx` - Navigation and refresh tracking

## Privacy & Data

### What's Tracked
- Page views (automatic)
- Button/link clicks with labels
- Game session starts with mode
- Game session ends with mode, type, and score

### What's NOT Tracked
- Personal information
- User identities
- IP addresses (anonymized by Plausible)
- Cookies or local storage data

### Compliance
Plausible is GDPR, CCPA, and PECR compliant by default. No cookie banners or consent forms are required.

## Analytics Dashboard

### Accessing Data

1. Log into your Plausible account
2. Select your domain/project
3. View real-time and historical data

### Key Metrics to Monitor

1. **User Engagement**
   - Click events by label (which buttons are most used)
   - Navigation patterns (Info vs Leaderboard clicks)

2. **Game Metrics**
   - Game Started events by mode (compete vs practice ratio)
   - Game Ended by type (manual vs game over)
   - Average scores (via Game Ended score property)

3. **Conversion Funnel**
   - Log In clicks
   - Insert Coin clicks
   - Game Started (compete mode)
   - Game Ended (compete mode with scores)

### Custom Reports

Create custom reports in Plausible to analyze:
- Practice vs compete mode adoption
- Score distribution by game mode
- User retention (repeat gameplay)
- Feature usage (which buttons drive engagement)

## Future Enhancements

Potential additions for deeper analytics:

1. **Power-up Tracking**
   - Track which power-ups are collected
   - Measure effectiveness of different power-ups

2. **Level/Wave Tracking**
   - Track how far players progress
   - Identify difficulty spikes

3. **Session Duration**
   - Track time spent in-game
   - Measure engagement length

4. **Social Sharing**
   - Track leaderboard views
   - Monitor social share clicks (if added)

## Development vs Production

The configuration uses `captureOnLocalhost: true` to enable tracking during local development for testing purposes. Plausible handles data filtering and segmentation on their platform, so you can keep this setting enabled without polluting your production analytics.

## Troubleshooting

### Events Not Showing Up

1. **Check Plausible Domain**: Ensure domain in `initPlausible()` matches your Plausible project
2. **Verify Network**: Open browser DevTools → Network tab, look for requests to `plausible.io/api/event`
3. **Check Console**: Look for any Plausible-related errors
4. **Script Blockers**: Disable ad blockers that might block analytics

### Testing Locally

With `captureOnLocalhost: true`, events should appear immediately in your Plausible dashboard. Use the real-time view to verify tracking.

## Best Practices

1. **Consistent Labeling**: Use clear, descriptive labels that match button text
2. **Meaningful Properties**: Include properties that help understand user behavior
3. **Avoid Over-tracking**: Don't track every tiny interaction, focus on meaningful actions
4. **String Values**: Plausible requires string values for custom properties (e.g., convert numbers to strings)
5. **Privacy First**: Never track personal information or sensitive data

## References

- [Plausible Analytics Documentation](https://plausible.io/docs)
- [Plausible Analytics Tracker Package](https://github.com/plausible/plausible-tracker)
- [Custom Events Guide](https://plausible.io/docs/custom-event-goals)
- [Custom Properties Guide](https://plausible.io/docs/custom-props/introduction)

---

*Last updated: October 15, 2025*

