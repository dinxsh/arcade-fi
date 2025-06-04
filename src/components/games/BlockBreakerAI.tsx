
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  hits: number;
  maxHits: number;
}

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
}

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 10;
const BLOCK_WIDTH = 60;
const BLOCK_HEIGHT = 20;
const BALL_SIZE = 10;

export const BlockBreakerAI = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStatus, setGameStatus] = useState<'playing' | 'gameOver' | 'won'>('playing');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [paddleX, setPaddleX] = useState(CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2);
  const [ball, setBall] = useState<Ball>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 50,
    dx: 3,
    dy: -3,
    size: BALL_SIZE
  });
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [aiAssist, setAiAssist] = useState(false);

  const generateBlocks = () => {
    const newBlocks: Block[] = [];
    const colors = ['#ff4444', '#ff8844', '#ffff44', '#44ff44', '#4444ff'];
    
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 10; col++) {
        const maxHits = Math.floor(row / 2) + 1;
        newBlocks.push({
          x: col * (BLOCK_WIDTH + 2) + 10,
          y: row * (BLOCK_HEIGHT + 2) + 50,
          width: BLOCK_WIDTH,
          height: BLOCK_HEIGHT,
          color: colors[row],
          hits: 0,
          maxHits
        });
      }
    }
    return newBlocks;
  };

  const resetGame = () => {
    setBall({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 50,
      dx: 3,
      dy: -3,
      size: BALL_SIZE
    });
    setPaddleX(CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2);
    setBlocks(generateBlocks());
    setScore(0);
    setLives(3);
    setGameStatus('playing');
  };

  const checkCollision = (rect1: any, rect2: any) => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  };

  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (gameStatus !== 'playing') return;

      setBall(prevBall => {
        let newBall = { ...prevBall };
        
        // Move ball
        newBall.x += newBall.dx;
        newBall.y += newBall.dy;

        // Wall collisions
        if (newBall.x <= 0 || newBall.x >= CANVAS_WIDTH - BALL_SIZE) {
          newBall.dx = -newBall.dx;
        }
        if (newBall.y <= 0) {
          newBall.dy = -newBall.dy;
        }

        // Paddle collision
        const paddleRect = { x: paddleX, y: CANVAS_HEIGHT - 20, width: PADDLE_WIDTH, height: PADDLE_HEIGHT };
        const ballRect = { x: newBall.x, y: newBall.y, width: BALL_SIZE, height: BALL_SIZE };
        
        if (checkCollision(ballRect, paddleRect) && newBall.dy > 0) {
          newBall.dy = -newBall.dy;
          // Add some spin based on where ball hits paddle
          const hitPos = (newBall.x - paddleX) / PADDLE_WIDTH;
          newBall.dx = (hitPos - 0.5) * 6;
        }

        // Bottom boundary (lose life)
        if (newBall.y > CANVAS_HEIGHT) {
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameStatus('gameOver');
              toast.error(`Game Over! Final Score: ${score}`);
            } else {
              toast.warning(`Life lost! ${newLives} lives remaining`);
            }
            return newLives;
          });
          
          return {
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT - 50,
            dx: 3,
            dy: -3,
            size: BALL_SIZE
          };
        }

        return newBall;
      });

      // Block collisions
      setBlocks(prevBlocks => {
        const newBlocks = [...prevBlocks];
        let scoreIncrease = 0;

        for (let i = newBlocks.length - 1; i >= 0; i--) {
          const block = newBlocks[i];
          const ballRect = { x: ball.x, y: ball.y, width: BALL_SIZE, height: BALL_SIZE };
          const blockRect = { x: block.x, y: block.y, width: block.width, height: block.height };

          if (checkCollision(ballRect, blockRect)) {
            setBall(prev => ({ ...prev, dy: -prev.dy }));
            
            newBlocks[i] = { ...block, hits: block.hits + 1 };
            
            if (newBlocks[i].hits >= block.maxHits) {
              scoreIncrease += (block.maxHits * 10);
              newBlocks.splice(i, 1);
            }
          }
        }

        if (scoreIncrease > 0) {
          setScore(prev => prev + scoreIncrease);
          toast.success(`+${scoreIncrease} points!`);
        }

        // Check win condition
        if (newBlocks.length === 0) {
          setGameStatus('won');
          toast.success(`Level Complete! Bonus: ${lives * 100} points!`);
          setScore(prev => prev + lives * 100);
        }

        return newBlocks;
      });

      // AI assist for paddle movement
      if (aiAssist) {
        setPaddleX(prevX => {
          const ballCenterX = ball.x + BALL_SIZE / 2;
          const paddleCenterX = prevX + PADDLE_WIDTH / 2;
          const diff = ballCenterX - paddleCenterX;
          
          if (Math.abs(diff) > 5) {
            const moveSpeed = 3;
            return Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, 
              prevX + (diff > 0 ? moveSpeed : -moveSpeed)));
          }
          return prevX;
        });
      }
    }, 16);

    return () => clearInterval(gameLoop);
  }, [gameStatus, ball, paddleX, score, lives, aiAssist]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw blocks
    blocks.forEach(block => {
      const alpha = 1 - (block.hits / block.maxHits) * 0.7;
      ctx.fillStyle = block.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.fillRect(block.x, block.y, block.width, block.height);
      
      // Block border
      ctx.strokeStyle = '#ffffff44';
      ctx.strokeRect(block.x, block.y, block.width, block.height);
    });

    // Draw paddle
    ctx.fillStyle = aiAssist ? '#00ff88' : '#00ffff';
    ctx.fillRect(paddleX, CANVAS_HEIGHT - 20, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x + BALL_SIZE/2, ball.y + BALL_SIZE/2, BALL_SIZE/2, 0, Math.PI * 2);
    ctx.fill();
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (aiAssist) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    setPaddleX(Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, mouseX - PADDLE_WIDTH / 2)));
  };

  useEffect(() => {
    resetGame();
  }, []);

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex items-center justify-between w-full max-w-lg">
        <div className="text-center">
          <div className="text-sm text-gray-400">Score</div>
          <div className="text-2xl font-bold text-cyan-400">{score}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Lives</div>
          <div className="text-2xl font-bold text-red-400">{lives}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Blocks</div>
          <div className="text-2xl font-bold text-purple-400">{blocks.length}</div>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => setAiAssist(!aiAssist)}
          className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
            aiAssist 
              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
              : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
          } text-white`}
        >
          AI Assist: {aiAssist ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={resetGame}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm"
        >
          Reset Game
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onMouseMove={handleMouseMove}
        className="border-2 border-slate-600 rounded-lg cursor-none bg-slate-900"
      />

      {(gameStatus === 'gameOver' || gameStatus === 'won') && (
        <div className="text-center p-6 bg-slate-800/80 rounded-xl border border-slate-600">
          <h3 className={`text-2xl font-bold mb-2 ${gameStatus === 'won' ? 'text-green-400' : 'text-red-400'}`}>
            {gameStatus === 'won' ? '🎉 Level Complete!' : '💥 Game Over!'}
          </h3>
          <p className="text-gray-300 mb-4">Final Score: {score}</p>
          <button
            onClick={resetGame}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200"
          >
            Play Again
          </button>
        </div>
      )}

      <div className="text-center text-gray-400 text-sm max-w-md">
        <p className="mb-2">🎮 Move mouse to control paddle</p>
        <p>🤖 Toggle AI assist for automated paddle movement!</p>
      </div>
    </div>
  );
};
