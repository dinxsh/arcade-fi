
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface Pipe {
  x: number;
  topHeight: number;
  bottomY: number;
  passed: boolean;
}

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const BIRD_SIZE = 20;
const PIPE_WIDTH = 50;
const PIPE_GAP = 150;
const GRAVITY = 0.5;
const JUMP_STRENGTH = -8;

export const FlappyAI = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStatus, setGameStatus] = useState<'playing' | 'gameOver'>('playing');
  const [score, setScore] = useState(0);
  const [birdY, setBirdY] = useState(CANVAS_HEIGHT / 2);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [aiDifficulty, setAiDifficulty] = useState(1);

  const generatePipe = (x: number): Pipe => {
    const minHeight = 50;
    const maxHeight = CANVAS_HEIGHT - PIPE_GAP - minHeight;
    const topHeight = minHeight + Math.random() * (maxHeight - minHeight);
    
    return {
      x,
      topHeight,
      bottomY: topHeight + PIPE_GAP,
      passed: false
    };
  };

  const resetGame = () => {
    setBirdY(CANVAS_HEIGHT / 2);
    setBirdVelocity(0);
    setPipes([generatePipe(CANVAS_WIDTH)]);
    setScore(0);
    setGameStatus('playing');
    setAiDifficulty(1);
  };

  const jump = () => {
    if (gameStatus === 'playing') {
      setBirdVelocity(JUMP_STRENGTH);
    } else if (gameStatus === 'gameOver') {
      resetGame();
    }
  };

  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (gameStatus !== 'playing') return;

      // Update bird physics
      setBirdVelocity(prev => prev + GRAVITY);
      setBirdY(prev => {
        const newY = prev + birdVelocity;
        
        // Check ground/ceiling collision
        if (newY <= 0 || newY >= CANVAS_HEIGHT - BIRD_SIZE) {
          setGameStatus('gameOver');
          toast.error(`Game Over! Score: ${score}`);
          return prev;
        }
        
        return newY;
      });

      // Update pipes
      setPipes(prev => {
        let newPipes = prev.map(pipe => ({
          ...pipe,
          x: pipe.x - 2 - Math.floor(score / 5) // Speed increases with score
        }));

        // Remove off-screen pipes
        newPipes = newPipes.filter(pipe => pipe.x > -PIPE_WIDTH);

        // Add new pipes
        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < CANVAS_WIDTH - 200) {
          newPipes.push(generatePipe(CANVAS_WIDTH));
        }

        // Check collisions and scoring
        newPipes.forEach(pipe => {
          const birdLeft = CANVAS_WIDTH / 4;
          const birdRight = birdLeft + BIRD_SIZE;
          const birdTop = birdY;
          const birdBottom = birdY + BIRD_SIZE;

          // Collision detection
          if (birdRight > pipe.x && birdLeft < pipe.x + PIPE_WIDTH) {
            if (birdTop < pipe.topHeight || birdBottom > pipe.bottomY) {
              setGameStatus('gameOver');
              toast.error(`Game Over! Score: ${score}`);
            }
          }

          // Scoring
          if (!pipe.passed && pipe.x + PIPE_WIDTH < birdLeft) {
            pipe.passed = true;
            setScore(prev => prev + 1);
            setAiDifficulty(prev => Math.min(prev + 0.1, 3));
            toast.success('Point scored!');
          }
        });

        return newPipes;
      });
    }, 16);

    return () => clearInterval(gameLoop);
  }, [gameStatus, birdY, birdVelocity, score]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw pipes
    ctx.fillStyle = '#228B22';
    pipes.forEach(pipe => {
      // Top pipe
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, CANVAS_HEIGHT - pipe.bottomY);
      
      // Pipe caps
      ctx.fillStyle = '#32CD32';
      ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, PIPE_WIDTH + 10, 30);
      ctx.fillRect(pipe.x - 5, pipe.bottomY, PIPE_WIDTH + 10, 30);
      ctx.fillStyle = '#228B22';
    });

    // Draw bird
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(CANVAS_WIDTH / 4, birdY, BIRD_SIZE, BIRD_SIZE);
    
    // Bird details
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(CANVAS_WIDTH / 4 + 15, birdY + 8, 8, 4); // Beak
    ctx.fillStyle = '#000';
    ctx.fillRect(CANVAS_WIDTH / 4 + 5, birdY + 5, 3, 3); // Eye
  });

  useEffect(() => {
    resetGame();
  }, []);

  const handleClick = () => jump();
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      jump();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStatus, score]);

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="text-center">
        <div className="text-sm text-gray-400">Score</div>
        <div className="text-3xl font-bold text-yellow-400">{score}</div>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleClick}
        className="border-2 border-slate-600 rounded-lg cursor-pointer"
      />

      {gameStatus === 'gameOver' && (
        <div className="text-center p-4 bg-slate-800/80 rounded-xl border border-slate-600">
          <h3 className="text-xl font-bold text-red-400 mb-2">Game Over!</h3>
          <p className="text-gray-300 mb-4">Final Score: {score}</p>
          <button
            onClick={resetGame}
            className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-200"
          >
            Play Again
          </button>
        </div>
      )}

      <div className="text-center text-gray-400 text-sm max-w-md">
        <p className="mb-2">🐦 Click or press Space to flap</p>
        <p>🚀 Speed increases with score! AI adjusts difficulty dynamically.</p>
      </div>
    </div>
  );
};
