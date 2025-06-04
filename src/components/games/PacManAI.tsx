
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface PacManAIProps {
  onGameComplete?: (score: number) => void;
}

interface Position {
  x: number;
  y: number;
}

interface Ghost extends Position {
  direction: number;
  color: string;
  mode: 'chase' | 'scatter' | 'frightened';
}

export const PacManAI: React.FC<PacManAIProps> = ({ onGameComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [pacman, setPacman] = useState<Position & { direction: number }>({ x: 9, y: 15, direction: 0 });
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const [pellets, setPellets] = useState<Set<string>>(new Set());
  const [powerPellets, setPowerPellets] = useState<Set<string>>(new Set());

  const CELL_SIZE = 20;
  const CANVAS_WIDTH = 19 * CELL_SIZE;
  const CANVAS_HEIGHT = 21 * CELL_SIZE;

  // Simple maze layout (1 = wall, 0 = path, 2 = pellet, 3 = power pellet)
  const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,3,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1,3,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,1,2,2,1,2,2,1,2,2,2,2,2,1],
    [1,1,1,1,1,2,1,1,0,1,0,1,1,2,1,1,1,1,1],
    [0,0,0,0,1,2,1,0,0,0,0,0,1,2,1,0,0,0,0],
    [1,1,1,1,1,2,1,0,1,0,1,0,1,2,1,1,1,1,1],
    [0,0,0,0,0,2,0,0,1,0,1,0,0,2,0,0,0,0,0],
    [1,1,1,1,1,2,1,0,1,1,1,0,1,2,1,1,1,1,1],
    [0,0,0,0,1,2,1,0,0,0,0,0,1,2,1,0,0,0,0],
    [1,1,1,1,1,2,1,1,0,1,0,1,1,2,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1,2,1],
    [1,3,2,2,1,2,2,2,2,2,2,2,2,2,1,2,2,3,1],
    [1,1,1,2,1,2,1,2,1,1,1,2,1,2,1,2,1,1,1],
    [1,2,2,2,2,2,1,2,2,1,2,2,1,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];

  const initializeGame = useCallback(() => {
    // Initialize pellets
    const newPellets = new Set<string>();
    const newPowerPellets = new Set<string>();
    
    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[y].length; x++) {
        if (maze[y][x] === 2) {
          newPellets.add(`${x},${y}`);
        } else if (maze[y][x] === 3) {
          newPowerPellets.add(`${x},${y}`);
        }
      }
    }
    
    setPellets(newPellets);
    setPowerPellets(newPowerPellets);

    // Initialize ghosts
    setGhosts([
      { x: 9, y: 9, direction: 0, color: '#ff0000', mode: 'chase' },
      { x: 8, y: 10, direction: 1, color: '#ffb8ff', mode: 'chase' },
      { x: 9, y: 10, direction: 2, color: '#00ffff', mode: 'chase' },
      { x: 10, y: 10, direction: 3, color: '#ffb852', mode: 'chase' }
    ]);

    setPacman({ x: 9, y: 15, direction: 0 });
    setScore(0);
    setLives(3);
    setGameOver(false);
    setGameStarted(true);
  }, []);

  const canMove = (x: number, y: number): boolean => {
    if (x < 0 || x >= 19 || y < 0 || y >= 21) return false;
    return maze[y][x] !== 1;
  };

  const directions = [
    { x: 1, y: 0 },  // right
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }, // left
    { x: 0, y: -1 }  // up
  ];

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!gameStarted || gameOver) return;

    let newDirection = pacman.direction;
    switch (e.key) {
      case 'ArrowRight':
      case 'd':
        newDirection = 0;
        break;
      case 'ArrowDown':
      case 's':
        newDirection = 1;
        break;
      case 'ArrowLeft':
      case 'a':
        newDirection = 2;
        break;
      case 'ArrowUp':
      case 'w':
        newDirection = 3;
        break;
    }

    const dir = directions[newDirection];
    const newX = pacman.x + dir.x;
    const newY = pacman.y + dir.y;
    
    if (canMove(newX, newY)) {
      setPacman(prev => ({ ...prev, direction: newDirection }));
    }
  }, [gameStarted, gameOver, pacman]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const updateGame = useCallback(() => {
    if (!gameStarted || gameOver) return;

    // Move Pac-Man
    setPacman(prev => {
      const dir = directions[prev.direction];
      let newX = prev.x + dir.x;
      let newY = prev.y + dir.y;

      // Tunnel effect
      if (newX < 0) newX = 18;
      if (newX > 18) newX = 0;

      if (canMove(newX, newY)) {
        return { ...prev, x: newX, y: newY };
      }
      return prev;
    });

    // Check pellet collection
    const pacmanKey = `${pacman.x},${pacman.y}`;
    if (pellets.has(pacmanKey)) {
      setPellets(prev => {
        const newPellets = new Set(prev);
        newPellets.delete(pacmanKey);
        return newPellets;
      });
      setScore(prev => prev + 10);
    }

    if (powerPellets.has(pacmanKey)) {
      setPowerPellets(prev => {
        const newPowerPellets = new Set(prev);
        newPowerPellets.delete(pacmanKey);
        return newPowerPellets;
      });
      setScore(prev => prev + 50);
      // Make ghosts frightened
      setGhosts(prev => prev.map(ghost => ({ ...ghost, mode: 'frightened' as const })));
    }

    // Simple AI for ghosts
    setGhosts(prev => prev.map(ghost => {
      const possibleDirections = [];
      for (let i = 0; i < 4; i++) {
        const dir = directions[i];
        const newX = ghost.x + dir.x;
        const newY = ghost.y + dir.y;
        if (canMove(newX, newY)) {
          possibleDirections.push(i);
        }
      }

      let newDirection = ghost.direction;
      if (possibleDirections.length > 0) {
        if (ghost.mode === 'chase') {
          // Simple AI: move towards Pac-Man
          const dx = pacman.x - ghost.x;
          const dy = pacman.y - ghost.y;
          
          if (Math.abs(dx) > Math.abs(dy)) {
            newDirection = dx > 0 ? 0 : 2; // right or left
          } else {
            newDirection = dy > 0 ? 1 : 3; // down or up
          }
          
          if (!possibleDirections.includes(newDirection)) {
            newDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
          }
        } else {
          // Random movement when frightened
          newDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
        }
      }

      const dir = directions[newDirection];
      let newX = ghost.x + dir.x;
      let newY = ghost.y + dir.y;

      // Tunnel effect
      if (newX < 0) newX = 18;
      if (newX > 18) newX = 0;

      if (canMove(newX, newY)) {
        return { ...ghost, x: newX, y: newY, direction: newDirection };
      }
      return ghost;
    }));

    // Check win condition
    if (pellets.size === 0 && powerPellets.size === 0) {
      setGameOver(true);
      onGameComplete?.(score);
    }

  }, [gameStarted, gameOver, pacman, pellets, powerPellets, score, onGameComplete]);

  useEffect(() => {
    const gameLoop = setInterval(updateGame, 200);
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

    // Draw maze
    ctx.fillStyle = '#0000ff';
    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[y].length; x++) {
        if (maze[y][x] === 1) {
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Draw pellets
    ctx.fillStyle = '#ffff00';
    pellets.forEach(pelletKey => {
      const [x, y] = pelletKey.split(',').map(Number);
      ctx.beginPath();
      ctx.arc(x * CELL_SIZE + CELL_SIZE/2, y * CELL_SIZE + CELL_SIZE/2, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw power pellets
    ctx.fillStyle = '#ffff00';
    powerPellets.forEach(pelletKey => {
      const [x, y] = pelletKey.split(',').map(Number);
      ctx.beginPath();
      ctx.arc(x * CELL_SIZE + CELL_SIZE/2, y * CELL_SIZE + CELL_SIZE/2, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Pac-Man
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(
      pacman.x * CELL_SIZE + CELL_SIZE/2,
      pacman.y * CELL_SIZE + CELL_SIZE/2,
      CELL_SIZE/2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw ghosts
    ghosts.forEach(ghost => {
      ctx.fillStyle = ghost.mode === 'frightened' ? '#0000ff' : ghost.color;
      ctx.fillRect(
        ghost.x * CELL_SIZE + 2,
        ghost.y * CELL_SIZE + 2,
        CELL_SIZE - 4,
        CELL_SIZE - 4
      );
    });

  }, [gameStarted, pacman, ghosts, pellets, powerPellets]);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(animationFrame);
  }, [draw]);

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-white">
        <h2 className="text-4xl font-bold mb-4">Game Complete!</h2>
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
        <h2 className="text-4xl font-bold mb-4">Pac-Man AI</h2>
        <p className="text-lg mb-4">Use arrow keys or WASD to move</p>
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
        <p>Arrow Keys / WASD: Move • Collect all pellets to win!</p>
      </div>
    </div>
  );
};
