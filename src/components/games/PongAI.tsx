
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface Position {
  x: number;
  y: number;
}

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;

export const PongAI = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStatus, setGameStatus] = useState<'playing' | 'paused' | 'gameOver'>('playing');
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [playerY, setPlayerY] = useState(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [aiY, setAiY] = useState(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [ball, setBall] = useState<Ball>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    dx: 5,
    dy: 3
  });

  const resetBall = () => {
    setBall({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      dx: Math.random() > 0.5 ? 5 : -5,
      dy: (Math.random() - 0.5) * 6
    });
  };

  const updateGame = () => {
    if (gameStatus !== 'playing') return;

    setBall(prevBall => {
      let newBall = { ...prevBall };
      
      // Move ball
      newBall.x += newBall.dx;
      newBall.y += newBall.dy;

      // Ball collision with top/bottom walls
      if (newBall.y <= 0 || newBall.y >= CANVAS_HEIGHT - BALL_SIZE) {
        newBall.dy = -newBall.dy;
      }

      // Ball collision with paddles
      if (newBall.x <= PADDLE_WIDTH && 
          newBall.y >= playerY && 
          newBall.y <= playerY + PADDLE_HEIGHT) {
        newBall.dx = -newBall.dx;
        newBall.dx *= 1.05; // Increase speed slightly
      }

      if (newBall.x >= CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE && 
          newBall.y >= aiY && 
          newBall.y <= aiY + PADDLE_HEIGHT) {
        newBall.dx = -newBall.dx;
        newBall.dx *= 1.05;
      }

      // Score
      if (newBall.x < 0) {
        setAiScore(prev => prev + 1);
        toast.error('AI scores!');
        setTimeout(resetBall, 1000);
        return { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: 5, dy: 3 };
      }

      if (newBall.x > CANVAS_WIDTH) {
        setPlayerScore(prev => prev + 1);
        toast.success('You score!');
        setTimeout(resetBall, 1000);
        return { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: -5, dy: 3 };
      }

      return newBall;
    });

    // AI paddle movement with prediction
    setAiY(prevAiY => {
      const ballCenterY = ball.y + BALL_SIZE / 2;
      const paddleCenterY = prevAiY + PADDLE_HEIGHT / 2;
      const diff = ballCenterY - paddleCenterY;
      
      const aiSpeed = 4 + Math.min(aiScore, 3); // AI gets faster as it scores
      
      if (Math.abs(diff) > 5) {
        return Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, 
          prevAiY + (diff > 0 ? aiSpeed : -aiSpeed)));
      }
      return prevAiY;
    });
  };

  useEffect(() => {
    const gameLoop = setInterval(updateGame, 16);
    return () => clearInterval(gameLoop);
  }, [gameStatus, ball, playerY, aiY, aiScore]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw center line
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(0, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
    
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    setPlayerY(Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, mouseY - PADDLE_HEIGHT / 2)));
  };

  const resetGame = () => {
    setPlayerScore(0);
    setAiScore(0);
    setPlayerY(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    setAiY(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    resetBall();
    setGameStatus('playing');
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex items-center justify-between w-full max-w-lg">
        <div className="text-center">
          <div className="text-sm text-gray-400">You</div>
          <div className="text-2xl font-bold text-cyan-400">{playerScore}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">AI</div>
          <div className="text-2xl font-bold text-red-400">{aiScore}</div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onMouseMove={handleMouseMove}
        className="border-2 border-slate-600 rounded-lg cursor-none bg-slate-900"
      />

      <button
        onClick={resetGame}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
      >
        Reset Game
      </button>

      <div className="text-center text-gray-400 text-sm max-w-md">
        <p className="mb-2">🏓 Move your mouse to control the left paddle</p>
        <p>🤖 AI adapts speed based on performance!</p>
      </div>
    </div>
  );
};
