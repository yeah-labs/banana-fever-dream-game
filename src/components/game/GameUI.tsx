import React from 'react';
import { GameState } from '@/types/game';
import { Progress } from '@/components/ui/progress';

interface GameUIProps {
  gameState: GameState;
  onActivateFever: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({ gameState, onActivateFever }) => {
  // This component is no longer used as UI has been moved to BananaFeverDream
  return null;
};