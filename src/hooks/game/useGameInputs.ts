import { useCallback, useRef, useEffect } from 'react';
import { GameStatus } from '@/types/gameEnums';
import { GAME_CONSTANTS } from '@/config/gameConstants';

interface UseGameInputsProps {
  gameStatus: GameStatus;
  onSecretModeActivated: () => void;
}

export const useGameInputs = ({ gameStatus, onSecretModeActivated }: UseGameInputsProps) => {
  const keysPressed = useRef<Set<string>>(new Set());
  const secretSequence = useRef<string[]>([]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    keysPressed.current.add(event.key.toLowerCase());
    
    // Secret mode sequence: H B D
    const key = event.key.toLowerCase();
    if (gameStatus === GameStatus.READY) {
      secretSequence.current.push(key);
      if (secretSequence.current.length > 3) {
        secretSequence.current = secretSequence.current.slice(-3);
      }
      
      if (secretSequence.current.join('') === GAME_CONSTANTS.SECRET.SEQUENCE.join('')) {
        onSecretModeActivated();
      }
    }
  }, [gameStatus, onSecretModeActivated]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    keysPressed.current.delete(event.key.toLowerCase());
  }, []);

  const isKeyPressed = useCallback((key: string): boolean => {
    return keysPressed.current.has(key.toLowerCase());
  }, []);

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
    isKeyPressed,
    keysPressed: keysPressed.current
  };
};