import { track } from "@plausible-analytics/tracker";

/**
 * Tracks a button or link click event
 * @param label - Descriptive label for the clicked element
 * @param type - Type of element clicked (button or link)
 */
export const trackClick = (label: string, type: 'button' | 'link' = 'button') => {
  try {
    track('Click', {
      props: {
        type,
        label,
      },
    });
  } catch (error) {
    // Fail silently - don't break app if analytics fails
    if (import.meta.env.DEV) {
      console.warn('Analytics tracking failed:', error);
    }
  }
};

/**
 * Tracks when a game session starts
 * @param mode - Game mode (compete or practice)
 */
export const trackGameStarted = (mode: 'compete' | 'practice' | 'not-connected') => {
  try {
    // Normalize mode - treat 'not-connected' as 'practice' for analytics
    const normalizedMode = mode === 'not-connected' ? 'practice' : mode;
    
    track('Game Started', {
      props: {
        mode: normalizedMode,
      },
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Analytics tracking failed:', error);
    }
  }
};

/**
 * Tracks when a game session ends
 * @param mode - Game mode (compete or practice)
 * @param type - How the game ended (manual user action or automatic game over)
 * @param score - Final score achieved by the player
 */
export const trackGameEnded = (
  mode: 'compete' | 'practice' | 'not-connected',
  type: 'manual' | 'game over',
  score: number
) => {
  try {
    // Normalize mode - treat 'not-connected' as 'practice' for analytics
    const normalizedMode = mode === 'not-connected' ? 'practice' : mode;
    
    track('Game Ended', {
      props: {
        mode: normalizedMode,
        type,
        score: score.toString(), // Plausible expects string values for custom properties
      },
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Analytics tracking failed:', error);
    }
  }
};

