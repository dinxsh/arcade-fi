
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface CentipedeAIProps {
  onGameComplete?: (score: number) => void;
}

interface Position {
  x: number;
  y: number;
}

interface CentipedeSegment extends Position {
  id: number;
}

interface Bullet extends Position {
  active: boolean;
}

interface Mushroom extends Position {
  hits: number;
}

export const CentipedeAI: React.FC<CentipedeAIProps> = ({ onGameComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerX, setPlayerX] = useState(400);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [centipede, setCentipede] = useState<CentipedeSegment[]>([]);
  const [mushrooms, setMushrooms] = useState<Mushroom[]>([]);
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
  const [centipedeDirection, setCentipedeDirection] = useState(1);
  const [centipedeY, setCentipedeY] = useState(50);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PLAYER_Y = 550;
  const SEGMENT_SIZE = 20;

  const initializeGame = useCallback(() => {
    // Initialize centipede
    const initialCentipede: CentipedeSegment[] = [];
    for (let i = 0; i < 10; i++) {
      initialCentipede.push({
        x: i * SEGMENT_SIZE,
        y: 50,
        id: i
      });
    }
    setCentipede(initialCentipede);

    // Initialize mushrooms
    const initialMushrooms: Mushroom[] = [];
    for (let i = 0; i < 20; i++) {
      initialMushrooms.push({
        x: Math.random() * (CANVAS_WIDTH - SEGMENT_SIZE),
        y: 100 + Math.random() * 400,
        hits: 0
      });
    }
    setMushrooms(initialMushrooms);

    setPlayerX(CANVAS_WIDTH / 2);
    setBullets([]);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setGameStarted(true);
    setCentipedeDirection(1);
    setCentipedeY(50);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setKeys(prev => ({ ...prev, [e.key]: true }));
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setKeys(prev => ({ ...prev, [e.key]: false }));
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const updateGame = useCallback(() => {
    if (!gameStarted || gameOver) return;

    // Update player position
    if (keys['ArrowLeft'] || keys['a']) {
      setPlayerX(prev => Math.max(0, prev - 5));
    }
    if (keys['ArrowRight'] || keys['d']) {
      setPlayerX(prev => Math.min(CANVAS_WIDTH - 20, prev + 5));
    }

    // Shoot bullets
    if (keys[' ']) {
      setBullets(prev => {
        if (prev.length < 3 && prev.every(b => !b.active || b.y < PLAYER_Y - 50)) {
          return [...prev, { x: playerX + 10, y: PLAYER_Y, active: true }];
        }
        return prev;
      });
    }

    // Update bullets
    setBullets(prev =>
      prev
        .map(bullet => ({
          ...bullet,
          y: bullet.y - 10
        }))
        .filter(bullet => bullet.y > 0)
    );

    // Update centipede
    setCentipede(prev => {
      let newCentipede = [...prev];
      
      // Move centipede
      const moveDistance = 2;
      const head = newCentipede[0];
      
      if (head) {
        let newX = head.x + (centipedeDirection * moveDistance);
        let newY = centipedeY;
        
        // Check if centipede hits edge or mushroom
        if (newX <= 0 || newX >= CANVAS_WIDTH - SEGMENT_SIZE) {
          setCentipedeDirection(prev => -prev);
          setCentipedeY(prev => prev + SEGMENT_SIZE);
          newY = centipedeY + SEGMENT_SIZE;
          newX = head.x;
        }

        // Move each segment to follow the previous one
        for (let i = 0; i < newCentipede.length; i++) {
          if (i === 0) {
            newCentipede[i] = { ...newCentipede[i], x: newX, y: newY };
          } else {
            newCentipede[i] = { ...newCentipede[i], x: newCentipede[i-1].x - (SEGMENT_SIZE * centipedeDirection), y: newCentipede[i-1].y };
          }
        }
      }

      return newCentipede;
    });

    // Check bullet-centipede collisions
    setBullets(prevBullets => {
      setCentipede(prevCentipede => {
        let newCentipede = [...prevCentipede];
        let newBullets = [...prevBullets];

        for (let i = newBullets.length - 1; i >= 0; i--) {
          for (let j = newCentipede.length - 1; j >= 0; j--) {
            const bullet = newBullets[i];
            const segment = newCentipede[j];
            
            if (bullet.active &&
                bullet.x < segment.x + SEGMENT_SIZE &&
                bullet.x + 5 > segment.x &&
                bullet.y < segment.y + SEGMENT_SIZE &&
                bullet.y + 10 > segment.y) {
              
              // Remove bullet
              newBullets.splice(i, 1);
              
              // Remove segment and create mushroom
              newCentipede.splice(j, 1);
              setMushrooms(prev => [...prev, { x: segment.x, y: segment.y, hits: 0 }]);
              setScore(prev => prev + 100);
              
              break;
            }
          }
        }

        return newCentipede;
      });
      
      return prevBullets;
    });

    // Check bullet-mushroom collisions
    setBullets(prevBullets => {
      setMushrooms(prevMushrooms => {
        let newMushrooms = [...prevMushrooms];
        let newBullets = [...prevBullets];

        for (let i = newBullets.length - 1; i >= 0; i--) {
          for (let j = newMushrooms.length - 1; j >= 0; j--) {
            const bullet = newBullets[i];
            const mushroom = newMushrooms[j];
            
            if (bullet.active &&
                bullet.x < mushroom.x + SEGMENT_SIZE &&
                bullet.x + 5 > mushroom.x &&
                bullet.y < mushroom.y + SEGMENT_SIZE &&
                bullet.y + 10 > mushroom.y) {
              
              // Remove bullet
              newBullets.splice(i, 1);
              
              // Damage mushroom
              newMushrooms[j] = { ...mushroom, hits: mushroom.hits + 1 };
              
              // Remove mushroom if destroyed
              if (newMushrooms[j].hits >= 4) {
                newMushrooms.splice(j, 1);
                setScore(prev => prev + 10);
              }
              
              break;
            }
          }
        }

        return newMushrooms;
      });
      
      return prevBullets;
    });

    // Check if centipede reaches bottom
    if (centipede.length > 0 && centipede[0].y >= PLAYER_Y - SEGMENT_SIZE) {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameOver(true);
          onGameComplete?.(score);
        }
        return newLives;
      });
      setCentipedeY(50);
    }

    // Check win condition
    if (centipede.length === 0) {
      setScore(prev => prev + 1000);
      // Respawn centipede
      const newCentipede: CentipedeSegment[] = [];
      for (let i = 0; i < 12; i++) {
        newCentipede.push({
          x: i * SEGMENT_SIZE,
          y: 50,
          id: i
        });
      }
      setCentipede(newCentipede);
      setCentipedeY(50);
      setCentipedeDirection(1);
    }

  }, [gameStarted, gameOver, keys, playerX, centipede, centipedeY, centipedeDirection, score, onGameComplete]);

  useEffect(() => {
    const gameLoop = setInterval(updateGame, 1000 / 60);
    return () => clearInterval(gameLoop);
  }, [updateGame]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (!gameStarted) return;

    // Draw player
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(playerX, PLAYER_Y, 20, 20);

    // Draw bullets
    ctx.fillStyle = '#ffffff';
    bullets.forEach(bullet => {
      if (bullet.active) {
        ctx.fillRect(bullet.x, bullet.y, 5, 10);
      }
    });

    // Draw centipede
    centipede.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#ff0000' : '#ffff00';
      ctx.fillRect(segment.x, segment.y, SEGMENT_SIZE, SEGMENT_SIZE);
    });

    // Draw mushrooms
    mushrooms.forEach(mushroom => {
      const alpha = 1 - (mushroom.hits * 0.25);
      ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
      ctx.fillRect(mushroom.x, mushroom.y, SEGMENT_SIZE, SEGMENT_SIZE);
    });

  }, [gameStarted, playerX, bullets, centipede, mushrooms]);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(animationFrame);
  }, [draw]);

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-white">
        <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
        <p className="text-xl mb-4">Final Score: {score}</p>
        <Button onClick={initializeGame} className="mb-4">
          Play Again
        </Button>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-white">
        <h2 className="text-4xl font-bold mb-4">Centipede AI</h2>
        <p className="text-lg mb-4">Use arrow keys or AD to move, spacebar to shoot</p>
        <Button onClick={initializeGame}>
          Start Game
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-4xl mb-4 text-white">
        <div>Score: {score}</div>
        <div>Lives: {lives}</div>
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border border-gray-600 bg-black"
      />
      <div className="mt-4 text-center text-gray-400">
        <p>Arrow Keys / AD: Move • Spacebar: Shoot</p>
      </div>
    </div>
  );
};
