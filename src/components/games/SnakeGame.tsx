
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface Position {
  x: number;
  y: number;
}

interface Snake {
  body: Position[];
  direction: Position;
  color: string;
  isPlayer: boolean;
}

const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const INITIAL_SPEED = 200;

export const SnakeGame = () => {
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'gameOver'>('playing');
  const [score, setScore] = useState(0);
  const [playerSnake, setPlayerSnake] = useState<Snake>({
    body: [{ x: 10, y: 10 }],
    direction: { x: 1, y: 0 },
    color: '#00ffff',
    isPlayer: true
  });
  const [aiSnake, setAiSnake] = useState<Snake>({
    body: [{ x: 5, y: 5 }],
    direction: { x: 1, y: 0 },
    color: '#ff6b6b',
    isPlayer: false
  });
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });

  const generateFood = useCallback(() => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (
      playerSnake.body.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
      aiSnake.body.some(segment => segment.x === newFood.x && segment.y === newFood.y)
    );
    return newFood;
  }, [playerSnake.body, aiSnake.body]);

  const moveSnake = useCallback((snake: Snake): Snake => {
    if (gameState !== 'playing') return snake;

    const head = snake.body[0];
    const newHead = {
      x: (head.x + snake.direction.x + GRID_SIZE) % GRID_SIZE,
      y: (head.y + snake.direction.y + GRID_SIZE) % GRID_SIZE
    };

    const newBody = [newHead, ...snake.body];

    // Check if ate food
    if (newHead.x === food.x && newHead.y === food.y) {
      setFood(generateFood());
      if (snake.isPlayer) {
        setScore(prev => prev + 10);
        toast.success("Food eaten! +10 points");
      }
    } else {
      newBody.pop();
    }

    // Check collision with self
    if (snake.body.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      setGameState('gameOver');
      toast.error(`${snake.isPlayer ? 'You' : 'AI'} crashed into ${snake.isPlayer ? 'yourself' : 'itself'}!`);
    }

    return { ...snake, body: newBody };
  }, [gameState, food, generateFood]);

  // AI Logic - Simple pathfinding towards food
  const updateAIDirection = useCallback(() => {
    const head = aiSnake.body[0];
    const dx = food.x - head.x;
    const dy = food.y - head.y;

    // Simple AI: move towards food, avoid walls and self
    let newDirection = aiSnake.direction;

    if (Math.abs(dx) > Math.abs(dy)) {
      newDirection = { x: dx > 0 ? 1 : -1, y: 0 };
    } else {
      newDirection = { x: 0, y: dy > 0 ? 1 : -1 };
    }

    // Avoid collision with own body (basic check)
    const nextPos = {
      x: (head.x + newDirection.x + GRID_SIZE) % GRID_SIZE,
      y: (head.y + newDirection.y + GRID_SIZE) % GRID_SIZE
    };

    if (aiSnake.body.some(segment => segment.x === nextPos.x && segment.y === nextPos.y)) {
      // Try alternative directions
      const alternatives = [
        { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
      ];
      
      for (const alt of alternatives) {
        const altPos = {
          x: (head.x + alt.x + GRID_SIZE) % GRID_SIZE,
          y: (head.y + alt.y + GRID_SIZE) % GRID_SIZE
        };
        if (!aiSnake.body.some(segment => segment.x === altPos.x && segment.y === altPos.y)) {
          newDirection = alt;
          break;
        }
      }
    }

    setAiSnake(prev => ({ ...prev, direction: newDirection }));
  }, [aiSnake, food]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      setPlayerSnake(moveSnake);
      setAiSnake(prev => moveSnake(prev));
      updateAIDirection();
    }, INITIAL_SPEED);

    return () => clearInterval(gameLoop);
  }, [gameState, moveSnake, updateAIDirection]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      const directions: { [key: string]: Position } = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }
      };

      const newDirection = directions[e.key];
      if (newDirection) {
        // Prevent reversing into self
        if (newDirection.x !== -playerSnake.direction.x || newDirection.y !== -playerSnake.direction.y) {
          setPlayerSnake(prev => ({ ...prev, direction: newDirection }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, playerSnake.direction]);

  const restartGame = () => {
    setGameState('playing');
    setScore(0);
    setPlayerSnake({
      body: [{ x: 10, y: 10 }],
      direction: { x: 1, y: 0 },
      color: '#00ffff',
      isPlayer: true
    });
    setAiSnake({
      body: [{ x: 5, y: 5 }],
      direction: { x: 1, y: 0 },
      color: '#ff6b6b',
      isPlayer: false
    });
    setFood({ x: 15, y: 15 });
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex items-center justify-between w-full max-w-md">
        <div className="text-white">
          <div className="text-sm text-gray-400">Your Score</div>
          <div className="text-2xl font-bold text-cyan-400">{score}</div>
        </div>
        <div className="text-white">
          <div className="text-sm text-gray-400">AI Length</div>
          <div className="text-2xl font-bold text-red-400">{aiSnake.body.length}</div>
        </div>
      </div>

      <div className="relative">
        <svg
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="border-2 border-cyan-500/30 rounded-lg bg-slate-900/50"
          style={{ imageRendering: 'pixelated' }}
        >
          {/* Grid lines */}
          {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
            <g key={i}>
              <line
                x1={i * (CANVAS_SIZE / GRID_SIZE)}
                y1={0}
                x2={i * (CANVAS_SIZE / GRID_SIZE)}
                y2={CANVAS_SIZE}
                stroke="rgba(100, 116, 139, 0.1)"
                strokeWidth={1}
              />
              <line
                x1={0}
                y1={i * (CANVAS_SIZE / GRID_SIZE)}
                x2={CANVAS_SIZE}
                y2={i * (CANVAS_SIZE / GRID_SIZE)}
                stroke="rgba(100, 116, 139, 0.1)"
                strokeWidth={1}
              />
            </g>
          ))}

          {/* Food */}
          <circle
            cx={food.x * (CANVAS_SIZE / GRID_SIZE) + (CANVAS_SIZE / GRID_SIZE) / 2}
            cy={food.y * (CANVAS_SIZE / GRID_SIZE) + (CANVAS_SIZE / GRID_SIZE) / 2}
            r={(CANVAS_SIZE / GRID_SIZE) / 3}
            fill="#fbbf24"
            className="animate-pulse"
          />

          {/* Player Snake */}
          {playerSnake.body.map((segment, index) => (
            <rect
              key={`player-${index}`}
              x={segment.x * (CANVAS_SIZE / GRID_SIZE)}
              y={segment.y * (CANVAS_SIZE / GRID_SIZE)}
              width={CANVAS_SIZE / GRID_SIZE}
              height={CANVAS_SIZE / GRID_SIZE}
              fill={index === 0 ? '#00ffff' : '#0891b2'}
              stroke={index === 0 ? '#67e8f9' : '#0891b2'}
              strokeWidth={1}
              rx={2}
            />
          ))}

          {/* AI Snake */}
          {aiSnake.body.map((segment, index) => (
            <rect
              key={`ai-${index}`}
              x={segment.x * (CANVAS_SIZE / GRID_SIZE)}
              y={segment.y * (CANVAS_SIZE / GRID_SIZE)}
              width={CANVAS_SIZE / GRID_SIZE}
              height={CANVAS_SIZE / GRID_SIZE}
              fill={index === 0 ? '#ff6b6b' : '#dc2626'}
              stroke={index === 0 ? '#fca5a5' : '#dc2626'}
              strokeWidth={1}
              rx={2}
            />
          ))}
        </svg>

        {gameState === 'gameOver' && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Game Over!</h3>
              <p className="text-gray-300 mb-6">Final Score: {score}</p>
              <button
                onClick={restartGame}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-gray-400 text-sm">
        <p className="mb-2">Use arrow keys to control your snake (cyan)</p>
        <p>Compete against the AI snake (red) to eat the most food!</p>
      </div>
    </div>
  );
};
