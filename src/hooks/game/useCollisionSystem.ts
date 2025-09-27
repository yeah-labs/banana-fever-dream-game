import { useCallback } from 'react';
import { GameObject } from '@/types/game';

export const useCollisionSystem = () => {
  // Collision detection using AABB (Axis-Aligned Bounding Box)
  const checkCollision = useCallback((obj1: GameObject, obj2: GameObject): boolean => {
    return (
      obj1.position.x < obj2.position.x + obj2.width &&
      obj1.position.x + obj1.width > obj2.position.x &&
      obj1.position.y < obj2.position.y + obj2.height &&
      obj1.position.y + obj1.height > obj2.position.y
    );
  }, []);

  return {
    checkCollision
  };
};