
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

type Player = 'X' | 'O' | null;
type Board = Player[];

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6] // Diagonals
];

export const TicTacToeGame = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameStatus, setGameStatus] = useState<'playing' | 'win' | 'lose' | 'draw'>('playing');
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);

  const checkWinner = (board: Board): Player => {
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const isBoardFull = (board: Board): boolean => {
    return board.every(cell => cell !== null);
  };

  // Minimax algorithm for AI
  const minimax = (board: Board, depth: number, isMaximizing: boolean): number => {
    const winner = checkWinner(board);
    
    if (winner === 'O') return 10 - depth; // AI wins
    if (winner === 'X') return depth - 10; // Player wins
    if (isBoardFull(board)) return 0; // Draw

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          const evaluation = minimax(board, depth + 1, false);
          board[i] = null;
          maxEval = Math.max(maxEval, evaluation);
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'X';
          const evaluation = minimax(board, depth + 1, true);
          board[i] = null;
          minEval = Math.min(minEval, evaluation);
        }
      }
      return minEval;
    }
  };

  const findBestMove = (board: Board): number => {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        const score = minimax(board, 0, false);
        board[i] = null;

        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    return bestMove;
  };

  const handleCellClick = (index: number) => {
    if (board[index] !== null || !isPlayerTurn || gameStatus !== 'playing') {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsPlayerTurn(false);

    // Check for game end
    const winner = checkWinner(newBoard);
    if (winner === 'X') {
      setGameStatus('win');
      setPlayerScore(prev => prev + 1);
      toast.success('You won! 🎉');
    } else if (isBoardFull(newBoard)) {
      setGameStatus('draw');
      toast.info("It's a draw!");
    }
  };

  // AI turn
  useEffect(() => {
    if (!isPlayerTurn && gameStatus === 'playing') {
      const timer = setTimeout(() => {
        const aiMove = findBestMove([...board]);
        if (aiMove !== -1) {
          const newBoard = [...board];
          newBoard[aiMove] = 'O';
          setBoard(newBoard);

          const winner = checkWinner(newBoard);
          if (winner === 'O') {
            setGameStatus('lose');
            setAiScore(prev => prev + 1);
            toast.error('AI won this round!');
          } else if (isBoardFull(newBoard)) {
            setGameStatus('draw');
            toast.info("It's a draw!");
          } else {
            setIsPlayerTurn(true);
          }
        }
      }, 500); // AI thinks for 500ms

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, board, gameStatus]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setGameStatus('playing');
  };

  const resetScores = () => {
    setPlayerScore(0);
    setAiScore(0);
    resetGame();
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Score Display */}
      <div className="flex items-center justify-between w-full max-w-sm">
        <div className="text-center">
          <div className="text-sm text-gray-400">You (X)</div>
          <div className="text-2xl font-bold text-cyan-400">{playerScore}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">AI (O)</div>
          <div className="text-2xl font-bold text-red-400">{aiScore}</div>
        </div>
      </div>

      {/* Game Status */}
      <div className="text-center">
        {gameStatus === 'playing' && (
          <p className="text-lg text-white">
            {isPlayerTurn ? "Your turn" : "AI is thinking..."}
            {!isPlayerTurn && <span className="animate-pulse ml-2">🤔</span>}
          </p>
        )}
        {gameStatus === 'win' && (
          <p className="text-lg text-green-400 font-bold">You Won! 🎉</p>
        )}
        {gameStatus === 'lose' && (
          <p className="text-lg text-red-400 font-bold">AI Won! 🤖</p>
        )}
        {gameStatus === 'draw' && (
          <p className="text-lg text-yellow-400 font-bold">It's a Draw! 🤝</p>
        )}
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-2 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            disabled={cell !== null || !isPlayerTurn || gameStatus !== 'playing'}
            className={`
              w-20 h-20 border-2 border-slate-600 rounded-lg text-3xl font-bold
              transition-all duration-200 flex items-center justify-center
              ${cell === null && isPlayerTurn && gameStatus === 'playing' 
                ? 'hover:border-cyan-500 hover:bg-slate-700/50 cursor-pointer' 
                : 'cursor-not-allowed'
              }
              ${cell === 'X' ? 'text-cyan-400 bg-cyan-500/10' : ''}
              ${cell === 'O' ? 'text-red-400 bg-red-500/10' : ''}
              ${cell === null ? 'bg-slate-900/50' : ''}
            `}
          >
            {cell}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex space-x-4">
        <button
          onClick={resetGame}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
        >
          New Game
        </button>
        <button
          onClick={resetScores}
          className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
        >
          Reset Scores
        </button>
      </div>

      {/* AI Info */}
      <div className="text-center text-gray-400 text-sm max-w-md">
        <p className="mb-2">🤖 <strong>AI Features:</strong></p>
        <p>This AI uses the Minimax algorithm with perfect strategy. It will never lose - the best you can do is draw!</p>
      </div>
    </div>
  );
};
