
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface FroggerAIProps {
  onGameComplete?: (score: number) => void;
}

interface Position {
  x: number;
  y: number;
}

interface Vehicle extends Position {
  width: number;
  speed: number;
  color: string;
}

interface Log extends Position {
  width: number;
  speed: number;
}

export const FroggerAI: React.FC<FroggerAIProps> = ({ onGameComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [frog, setFrog] = useState<Position>({ x: 400, y: 560 });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [onLog, setOnLog] = useState(false);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const FROG_SIZE = 30;
  const LANE_HEIGHT = 40;

  const initializeGame = useCallback(() => {
    // Initialize vehicles for road lanes
    const initialVehicles: Vehicle[] = [];
    const lanes = [400, 360, 320, 280, 240]; // Road lanes
    
    lanes.forEach((laneY, index) => {
      for (let i = 0; i < 3; i++) {
        initialVehicles.push({
          x: (i * 250) + (index % 2 === 0 ? 0 : 125),
          y: laneY,
          width: 60,
          speed: (index % 2 === 0 ? 2 : -2) * (1 + index * 0.3),
          color: `hsl(${index * 60}, 70%, 50%)`
        });
      }
    });

    // Initialize logs for water lanes
    const initialLogs: Log[] = [];
    const waterLanes = [160, 120, 80]; // Water lanes
    
    waterLanes.forEach((laneY, index) => {
      for (let i = 0; i < 2; i++) {
        initialLogs.push({
          x: (i * 350) + (index % 2 === 0 ? 0 : 175),
          y: laneY,
          width: 120,
          speed: (index % 2 === 0 ? 1.5 : -1.5)
        });
      }
    });

    setVehicles(initialVehicles);
    setLogs(initialLogs);
    setFrog({ x: CANVAS_WIDTH / 2, y: 560 });
    setScore(0);
    setLives(3);
    setGameOver(false);
    setGameStarted(true);
    setOnLog(false);
  }, []);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!gameStarted || gameOver) return;

    const moveDistance = LANE_HEIGHT;
    let newX = frog.x;
    let newY = frog.y;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
        newY = Math.max(0, frog.y - moveDistance);
        if (newY < frog.y) setScore(prev => prev + 10);
        break;
      case 'ArrowDown':
      case 's':
        newY = Math.min(560, frog.y + moveDistance);
        break;
      case 'ArrowLeft':
      case 'a':
        newX = Math.max(0, frog.x - FROG_SIZE);
        break;
      case 'ArrowRight':
      case 'd':
        newX = Math.min(CANVAS_WIDTH - FROG_SIZE, frog.x + FROG_SIZE);
        break;
    }

    setFrog({ x: newX, y: newY });
  }, [gameStarted, gameOver, frog]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const updateGame = useCallback(() => {
    if (!gameStarted || gameOver) return;

    // Update vehicles
    setVehicles(prev => prev.map(vehicle => {
      let newX = vehicle.x + vehicle.speed;
      
      // Wrap around screen
      if (vehicle.speed > 0 && newX > CANVAS_WIDTH) {
        newX = -vehicle.width;
      } else if (vehicle.speed < 0 && newX < -vehicle.width) {
        newX = CANVAS_WIDTH;
      }
      
      return { ...vehicle, x: newX };
    }));

    // Update logs
    setLogs(prev => prev.map(log => {
      let newX = log.x + log.speed;
      
      // Wrap around screen
      if (log.speed > 0 && newX > CANVAS_WIDTH) {
        newX = -log.width;
      } else if (log.speed < 0 && newX < -log.width) {
        newX = CANVAS_WIDTH;
      }
      
      return { ...log, x: newX };
    }));

    // Check if frog is on a log
    let frogOnLog = false;
    if (frog.y >= 60 && frog.y <= 180) { // Water area
      logs.forEach(log => {
        if (frog.x + FROG_SIZE > log.x && 
            frog.x < log.x + log.width && 
            Math.abs(frog.y - log.y) < 20) {
          frogOnLog = true;
          // Move frog with log
          setFrog(prev => ({
            ...prev,
            x: Math.max(0, Math.min(CANVAS_WIDTH - FROG_SIZE, prev.x + log.speed))
          }));
        }
      });
    }
    setOnLog(frogOnLog);

    // Check vehicle collisions
    vehicles.forEach(vehicle => {
      if (frog.x + FROG_SIZE > vehicle.x && 
          frog.x < vehicle.x + vehicle.width && 
          Math.abs(frog.y - vehicle.y) < 20) {
        // Collision with vehicle
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameOver(true);
            onGameComplete?.(score);
          } else {
            setFrog({ x: CANVAS_WIDTH / 2, y: 560 });
          }
          return newLives;
        });
      }
    });

    // Check if frog is in water without log
    if (frog.y >= 60 && frog.y <= 180 && !frogOnLog) {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameOver(true);
          onGameComplete?.(score);
        } else {
          setFrog({ x: CANVAS_WIDTH / 2, y: 560 });
        }
        return newLives;
      });
    }

    // Check win condition
    if (frog.y <= 40) {
      setScore(prev => prev + 1000);
      setFrog({ x: CANVAS_WIDTH / 2, y: 560 });
    }

  }, [gameStarted, gameOver, frog, vehicles, logs, onLog, score, onGameComplete]);

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

    // Draw safe zones
    ctx.fillStyle = '#00aa00';
    ctx.fillRect(0, 520, CANVAS_WIDTH, 80); // Start zone
    ctx.fillRect(0, 0, CANVAS_WIDTH, 40);   // End zone
    ctx.fillRect(0, 200, CANVAS_WIDTH, 40); // Middle safe zone

    // Draw road
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 240, CANVAS_WIDTH, 280);

    // Draw water
    ctx.fillStyle = '#0066cc';
    ctx.fillRect(0, 40, CANVAS_WIDTH, 160);

    // Draw road lanes
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    for (let y = 280; y < 520; y += 40) {
      ctx.beginPath();
      ctx.setLineDash([10, 10]);
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw vehicles
    vehicles.forEach(vehicle => {
      ctx.fillStyle = vehicle.color;
      ctx.fillRect(vehicle.x, vehicle.y, vehicle.width, 30);
    });

    // Draw logs
    ctx.fillStyle = '#8B4513';
    logs.forEach(log => {
      ctx.fillRect(log.x, log.y, log.width, 30);
    });

    // Draw frog
    ctx.fillStyle = onLog ? '#90EE90' : '#00FF00';
    ctx.fillRect(frog.x, frog.y, FROG_SIZE, FROG_SIZE);

    // Draw frog eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(frog.x + 5, frog.y + 5, 5, 5);
    ctx.fillRect(frog.x + 20, frog.y + 5, 5, 5);

  }, [gameStarted, frog, vehicles, logs, onLog]);

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
        <h2 className="text-4xl font-bold mb-4">Frogger AI</h2>
        <p className="text-lg mb-4">Use arrow keys or WASD to move. Cross the road and river!</p>
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
        <p>Arrow Keys / WASD: Move • Avoid cars • Use logs to cross water</p>
      </div>
    </div>
  );
};
