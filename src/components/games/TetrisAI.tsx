
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

interface Tetromino {
  type: TetrominoType;
  shape: number[][];
  x: number;
  y: number;
  color: string;
}

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 25;

const TETROMINOS: Record<TetrominoType, { shape: number[][], color: string }> = {
  I: { shape: [[1,1,1,1]], color: '#00ffff' },
  O: { shape: [[1,1],[1,1]], color: '#ffff00' },
  T: { shape: [[0,1,0],[1,1,1]], color: '#800080' },
  S: { shape: [[0,1,1],[1,1,0]], color: '#00ff00' },
  Z: { shape: [[1,1,0],[0,1,1]], color: '#ff0000' },
  J: { shape: [[1,0,0],[1,1,1]], color: '#0000ff' },
  L: { shape: [[0,0,1],[1,1,1]], color: '#ffa500' },
};

export const TetrisAI = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [board, setBoard] = useState<string[][]>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(''))
  );
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null);
  const [nextPiece, setNextPiece] = useState<Tetromino | null>(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameStatus, setGameStatus] = useState<'playing' | 'paused' | 'gameOver'>('playing');
  const [aiMode, setAiMode] = useState(false);
  const [dropTime, setDropTime] = useState(1000);

  const createRandomPiece = (): Tetromino => {
    const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    const type = types[Math.floor(Math.random() * types.length)];
    const { shape, color } = TETROMINOS[type];
    
    return {
      type,
      shape,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(shape[0].length / 2),
      y: 0,
      color
    };
  };

  const rotatePiece = (piece: Tetromino): Tetromino => {
    const rotated = piece.shape[0].map((_, i) =>
      piece.shape.map(row => row[i]).reverse()
    );
    return { ...piece, shape: rotated };
  };

  const isValidPosition = (piece: Tetromino, board: string[][], dx = 0, dy = 0): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x + dx;
          const newY = piece.y + y + dy;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }
          if (newY >= 0 && board[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const placePiece = (piece: Tetromino, board: string[][]): string[][] => {
    const newBoard = board.map(row => [...row]);
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.y + y;
          const boardX = piece.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.color;
          }
        }
      }
    }
    return newBoard;
  };

  const clearLines = (board: string[][]): { newBoard: string[][], linesCleared: number } => {
    const fullLines = board.map((row, i) => row.every(cell => cell !== '') ? i : -1)
                           .filter(i => i !== -1);
    
    if (fullLines.length === 0) {
      return { newBoard: board, linesCleared: 0 };
    }

    const newBoard = board.filter((_, i) => !fullLines.includes(i));
    const emptyLines = Array(fullLines.length).fill(null)
                           .map(() => Array(BOARD_WIDTH).fill(''));
    
    return {
      newBoard: [...emptyLines, ...newBoard],
      linesCleared: fullLines.length
    };
  };

  const findBestMove = (piece: Tetromino, board: string[][]) => {
    let bestScore = -Infinity;
    let bestMove = { x: piece.x, rotation: 0 };

    // Try all rotations
    for (let rotation = 0; rotation < 4; rotation++) {
      let testPiece = { ...piece };
      for (let r = 0; r < rotation; r++) {
        testPiece = rotatePiece(testPiece);
      }

      // Try all horizontal positions
      for (let x = -2; x < BOARD_WIDTH + 2; x++) {
        testPiece.x = x;
        testPiece.y = 0;

        // Drop piece down
        while (isValidPosition(testPiece, board, 0, 1)) {
          testPiece.y++;
        }

        if (isValidPosition(testPiece, board)) {
          const testBoard = placePiece(testPiece, board);
          const { linesCleared } = clearLines(testBoard);
          
          // Simple AI scoring
          const score = linesCleared * 100 - calculateHoles(testBoard) * 10 - calculateHeight(testBoard);
          
          if (score > bestScore) {
            bestScore = score;
            bestMove = { x, rotation };
          }
        }
      }
    }

    return bestMove;
  };

  const calculateHoles = (board: string[][]): number => {
    let holes = 0;
    for (let x = 0; x < BOARD_WIDTH; x++) {
      let blockFound = false;
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        if (board[y][x]) {
          blockFound = true;
        } else if (blockFound) {
          holes++;
        }
      }
    }
    return holes;
  };

  const calculateHeight = (board: string[][]): number => {
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      if (board[y].some(cell => cell !== '')) {
        return BOARD_HEIGHT - y;
      }
    }
    return 0;
  };

  const movePiece = (dx: number, dy: number) => {
    if (!currentPiece || gameStatus !== 'playing') return;

    if (isValidPosition(currentPiece, board, dx, dy)) {
      setCurrentPiece(prev => prev ? { ...prev, x: prev.x + dx, y: prev.y + dy } : null);
    } else if (dy > 0) {
      // Piece has landed
      const newBoard = placePiece(currentPiece, board);
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
      
      setBoard(clearedBoard);
      setLines(prev => prev + linesCleared);
      setScore(prev => prev + linesCleared * 100 * level);
      setLevel(prev => Math.floor(lines / 10) + 1);
      setDropTime(Math.max(50, 1000 - (level - 1) * 100));

      if (linesCleared > 0) {
        toast.success(`${linesCleared} line${linesCleared > 1 ? 's' : ''} cleared!`);
      }

      setCurrentPiece(nextPiece);
      setNextPiece(createRandomPiece());

      // Check game over
      if (nextPiece && !isValidPosition(nextPiece, clearedBoard)) {
        setGameStatus('gameOver');
        toast.error(`Game Over! Score: ${score}`);
      }
    }
  };

  const rotateCurrent = () => {
    if (!currentPiece || gameStatus !== 'playing') return;
    
    const rotated = rotatePiece(currentPiece);
    if (isValidPosition(rotated, board)) {
      setCurrentPiece(rotated);
    }
  };

  useEffect(() => {
    if (!currentPiece) {
      setCurrentPiece(createRandomPiece());
      setNextPiece(createRandomPiece());
    }
  }, [currentPiece]);

  useEffect(() => {
    if (gameStatus !== 'playing' || !currentPiece) return;

    const interval = setInterval(() => {
      if (aiMode) {
        const bestMove = findBestMove(currentPiece, board);
        let piece = { ...currentPiece };
        
        // Apply rotations
        for (let r = 0; r < bestMove.rotation; r++) {
          piece = rotatePiece(piece);
        }
        
        // Move to target position
        piece.x = bestMove.x;
        
        if (isValidPosition(piece, board)) {
          setCurrentPiece(piece);
        }
      }
      
      movePiece(0, 1);
    }, aiMode ? 100 : dropTime);

    return () => clearInterval(interval);
  }, [gameStatus, currentPiece, board, dropTime, aiMode, level]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameStatus !== 'playing') return;

      switch (e.key) {
        case 'ArrowLeft':
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          movePiece(0, 1);
          break;
        case 'ArrowUp':
        case ' ':
          rotateCurrent();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPiece, board, gameStatus]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw board
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (board[y][x]) {
          ctx.fillStyle = board[y][x];
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          ctx.strokeStyle = '#333';
          ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Draw current piece
    if (currentPiece) {
      ctx.fillStyle = currentPiece.color;
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const drawX = (currentPiece.x + x) * CELL_SIZE;
            const drawY = (currentPiece.y + y) * CELL_SIZE;
            ctx.fillRect(drawX, drawY, CELL_SIZE, CELL_SIZE);
            ctx.strokeStyle = '#333';
            ctx.strokeRect(drawX, drawY, CELL_SIZE, CELL_SIZE);
          }
        }
      }
    }

    // Draw grid
    ctx.strokeStyle = '#222';
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(BOARD_WIDTH * CELL_SIZE, y * CELL_SIZE);
      ctx.stroke();
    }
  });

  const resetGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill('')));
    setCurrentPiece(null);
    setNextPiece(null);
    setScore(0);
    setLines(0);
    setLevel(1);
    setDropTime(1000);
    setGameStatus('playing');
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex items-center justify-between w-full max-w-lg">
        <div className="text-center">
          <div className="text-sm text-gray-400">Score</div>
          <div className="text-xl font-bold text-cyan-400">{score}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Lines</div>
          <div className="text-xl font-bold text-green-400">{lines}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Level</div>
          <div className="text-xl font-bold text-purple-400">{level}</div>
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex flex-col items-center space-y-2">
          <canvas
            ref={canvasRef}
            width={BOARD_WIDTH * CELL_SIZE}
            height={BOARD_HEIGHT * CELL_SIZE}
            className="border-2 border-slate-600 rounded-lg bg-black"
          />
        </div>
        
        <div className="flex flex-col space-y-4">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="text-sm text-gray-400 mb-2">Next Piece</div>
            <div className="w-16 h-16 bg-black border border-slate-600 rounded flex items-center justify-center">
              {nextPiece && (
                <div className="text-xs" style={{ color: nextPiece.color }}>
                  {nextPiece.type}
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setAiMode(!aiMode)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
              aiMode 
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
            } text-white`}
          >
            AI: {aiMode ? 'ON' : 'OFF'}
          </button>
          
          <button
            onClick={resetGame}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm"
          >
            Reset
          </button>
        </div>
      </div>

      {gameStatus === 'gameOver' && (
        <div className="text-center p-6 bg-slate-800/80 rounded-xl border border-slate-600">
          <h3 className="text-2xl font-bold text-red-400 mb-2">Game Over!</h3>
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
        <p className="mb-2">🎮 Arrow keys to move, Up/Space to rotate</p>
        <p>🤖 AI mode uses advanced algorithms to find optimal placements!</p>
      </div>
    </div>
  );
};
