
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface BreakoutAIProps {
  onGameComplete?: (score: number) => void;
}

interface Position {
  x: number;
  y: number;
}

interface Ball extends Position {
  velocityX: number;
  velocityY: number;
  size: number;
}

interface Brick extends Position {
  width: number;
  height: number;
  color: string;
  points: number;
  destroyed: boolean;
}

export const BreakoutAI: React.FC<BreakoutAIProps> = ({ onGameComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [paddleX, setPaddleX] = useState(350);
  const [ball, setBall] = useState<Ball>({
    x: 400,
    y: 300,
    velocityX: 4,
    velocityY: 4,
    size: 10
  });
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PADDLE_WIDTH = 100;
  const PADDLE_HEIGHT = 20;
  const PADDLE_Y = 550;

  const initializeGame = useCallback(() => {
    // Initialize bricks
    const initialBricks: Brick[] = [];
    const brickWidth = 75;
    const brickHeight = 20;
    const rows = 8;
    const cols = 10;
    const colors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#0000ff', '#8800ff', '#ff00ff'];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        initialBricks.push({
          x: col * (brickWidth + 5) + 30,
          y: row * (brickHeight + 5) + 50,
          width: brickWidth,
          height: brickHeight,
          color: colors[row],
          points: (rows - row) * 10,
          destroyed: false
        });
      }
    }

    setBricks(initialBricks);
    setPaddleX(CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2);
    setBall({
      x: CANVAS_WIDTH / 2,
      y: PADDLE_Y - 30,
      velocityX: 4 * (Math.random() > 0.5 ? 1 : -1),
      velocityY: -4,
      size: 10
    });
    setScore(0);
    setLives(3);
    setGameOver(false);
    setGameStarted(true);
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

    // Update paddle position
    if (keys['ArrowLeft'] || keys['a']) {
      setPaddleX(prev => Math.max(0, prev - 8));
    }
    if (keys['ArrowRight'] || keys['d']) {
      setPaddleX(prev => Math.min(CANVAS_WIDTH - PADDLE_WIDTH, prev + 8));
    }

    // Update ball position
    setBall(prev => {
      let newBall = { ...prev };
      newBall.x += newBall.velocityX;
      newBall.y += newBall.velocityY;

      // Ball collision with walls
      if (newBall.x <= 0 || newBall.x >= CANVAS_WIDTH - newBall.size) {
        newBall.velocityX = -newBall.velocityX;
        newBall.x = Math.max(0, Math.min(CANVAS_WIDTH - newBall.size, newBall.x));
      }
      
      if (newBall.y <= 0) {
        newBall.velocityY = -newBall.velocityY;
        newBall.y = 0;
      }

      // Ball collision with paddle
      if (newBall.y + newBall.size >= PADDLE_Y &&
          newBall.y + newBall.size <= PADDLE_Y + PADDLE_HEIGHT &&
          newBall.x + newBall.size >= paddleX &&
          newBall.x <= paddleX + PADDLE_WIDTH) {
        
        newBall.velocityY = -Math.abs(newBall.velocityY);
        
        // Add angle based on where ball hits paddle
        const hitPos = (newBall.x - paddleX) / PADDLE_WIDTH;
        newBall.velocityX = (hitPos - 0.5) * 8;
      }

      // Ball falls below paddle
      if (newBall.y > CANVAS_HEIGHT) {
        setLives(prevLives => {
          const newLives = prevLives - 1;
          if (newLives <= 0) {
            setGameOver(true);
            onGameComplete?.(score);
          }
          return newLives;
        });
        
        // Reset ball
        return {
          x: CANVAS_WIDTH / 2,
          y: PADDLE_Y - 30,
          velocityX: 4 * (Math.random() > 0.5 ? 1 : -1),
          velocityY: -4,
          size: 10
        };
      }

      return newBall;
    });

    // Check ball collision with bricks
    setBricks(prevBricks => {
      const newBricks = [...prevBricks];
      let scoreIncrease = 0;

      for (let i = 0; i < newBricks.length; i++) {
        const brick = newBricks[i];
        if (brick.destroyed) continue;

        if (ball.x + ball.size >= brick.x &&
            ball.x <= brick.x + brick.width &&
            ball.y + ball.size >= brick.y &&
            ball.y <= brick.y + brick.height) {
          
          // Destroy brick
          newBricks[i] = { ...brick, destroyed: true };
          scoreIncrease += brick.points;
          
          // Determine collision side and bounce
          const ballCenterX = ball.x + ball.size / 2;
          const ballCenterY = ball.y + ball.size / 2;
          const brickCenterX = brick.x + brick.width / 2;
          const brickCenterY = brick.y + brick.height / 2;
          
          const deltaX = Math.abs(ballCenterX - brickCenterX);
          const deltaY = Math.abs(ballCenterY - brickCenterY);
          
          setBall(prev => ({
            ...prev,
            velocityY: deltaY > deltaX ? -prev.velocityY : prev.velocityY,
            velocityX: deltaX > deltaY ? -prev.velocityX : prev.velocityX
          }));
          
          break;
        }
      }

      if (scoreIncrease > 0) {
        setScore(prev => prev + scoreIncrease);
      }

      // Check win condition
      if (newBricks.every(brick => brick.destroyed)) {
        setScore(prev => prev + 1000);
        onGameComplete?.(score + 1000);
        setGameOver(true);
      }

      return newBricks;
    });

  }, [gameStarted, gameOver, keys, paddleX, ball, score, onGameComplete]);

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

    // Draw bricks
    bricks.forEach(brick => {
      if (!brick.destroyed) {
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        
        // Add border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
      }
    });

    // Draw paddle
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddleX, PADDLE_Y, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x + ball.size/2, ball.y + ball.size/2, ball.size/2, 0, Math.PI * 2);
    ctx.fill();

  }, [gameStarted, bricks, paddleX, ball]);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(animationFrame);
  }, [draw]);

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-white">
        <h2 className="text-4xl font-bold mb-4">{bricks.every(b => b.destroyed) ? 'You Win!' : 'Game Over!'}</h2>
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
        <h2 className="text-4xl font-bold mb-4">Breakout AI</h2>
        <p className="text-lg mb-4">Use arrow keys or AD to move paddle</p>
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
        <p>Arrow Keys / AD: Move Paddle • Break all bricks to win!</p>
      </div>
    </div>
  );
};
