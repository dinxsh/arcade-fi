
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface Position {
  x: number;
  y: number;
}

interface Cell {
  x: number;
  y: number;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  visited: boolean;
  isPath: boolean;
}

const MAZE_SIZE = 15;
const CELL_SIZE = 20;

export const MazeGame = () => {
  const [maze, setMaze] = useState<Cell[][]>([]);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [goalPos, setGoalPos] = useState<Position>({ x: MAZE_SIZE - 1, y: MAZE_SIZE - 1 });
  const [aiPath, setAiPath] = useState<Position[]>([]);
  const [showAiPath, setShowAiPath] = useState(false);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won'>('playing');
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [hint, setHint] = useState<Position | null>(null);

  // Generate maze using recursive backtracking
  const generateMaze = useCallback(() => {
    const newMaze: Cell[][] = Array(MAZE_SIZE).fill(null).map((_, y) =>
      Array(MAZE_SIZE).fill(null).map((_, x) => ({
        x,
        y,
        walls: { top: true, right: true, bottom: true, left: true },
        visited: false,
        isPath: false
      }))
    );

    const stack: Position[] = [];
    let current = { x: 0, y: 0 };
    newMaze[current.y][current.x].visited = true;

    const getNeighbors = (pos: Position): Position[] => {
      const neighbors: Position[] = [];
      const { x, y } = pos;
      
      if (y > 0 && !newMaze[y - 1][x].visited) neighbors.push({ x, y: y - 1 });
      if (x < MAZE_SIZE - 1 && !newMaze[y][x + 1].visited) neighbors.push({ x: x + 1, y });
      if (y < MAZE_SIZE - 1 && !newMaze[y + 1][x].visited) neighbors.push({ x, y: y + 1 });
      if (x > 0 && !newMaze[y][x - 1].visited) neighbors.push({ x: x - 1, y });
      
      return neighbors;
    };

    const removeWall = (current: Position, next: Position) => {
      const dx = current.x - next.x;
      const dy = current.y - next.y;

      if (dx === 1) {
        newMaze[current.y][current.x].walls.left = false;
        newMaze[next.y][next.x].walls.right = false;
      } else if (dx === -1) {
        newMaze[current.y][current.x].walls.right = false;
        newMaze[next.y][next.x].walls.left = false;
      } else if (dy === 1) {
        newMaze[current.y][current.x].walls.top = false;
        newMaze[next.y][next.x].walls.bottom = false;
      } else if (dy === -1) {
        newMaze[current.y][current.x].walls.bottom = false;
        newMaze[next.y][next.x].walls.top = false;
      }
    };

    while (true) {
      const neighbors = getNeighbors(current);
      
      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        stack.push({ ...current });
        
        removeWall(current, next);
        
        current = { ...next };
        newMaze[current.y][current.x].visited = true;
      } else if (stack.length > 0) {
        const prev = stack.pop()!;
        current = { ...prev };
      } else {
        break;
      }
    }

    return newMaze;
  }, []);

  // Fixed A* pathfinding algorithm
  const findPath = useCallback((start: Position, end: Position, maze: Cell[][]): Position[] => {
    const openSet: Position[] = [start];
    const cameFrom: Map<string, Position> = new Map();
    const gScore: Map<string, number> = new Map();
    const fScore: Map<string, number> = new Map();

    const getKey = (pos: Position) => `${pos.x},${pos.y}`;
    const heuristic = (a: Position, b: Position) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

    gScore.set(getKey(start), 0);
    fScore.set(getKey(start), heuristic(start, end));

    const getValidNeighbors = (pos: Position): Position[] => {
      const neighbors: Position[] = [];
      const cell = maze[pos.y][pos.x];

      if (!cell.walls.top && pos.y > 0) neighbors.push({ x: pos.x, y: pos.y - 1 });
      if (!cell.walls.right && pos.x < MAZE_SIZE - 1) neighbors.push({ x: pos.x + 1, y: pos.y });
      if (!cell.walls.bottom && pos.y < MAZE_SIZE - 1) neighbors.push({ x: pos.x, y: pos.y + 1 });
      if (!cell.walls.left && pos.x > 0) neighbors.push({ x: pos.x - 1, y: pos.y });

      return neighbors;
    };

    while (openSet.length > 0) {
      openSet.sort((a, b) => (fScore.get(getKey(a)) || Infinity) - (fScore.get(getKey(b)) || Infinity));
      const current = openSet.shift()!;

      if (current.x === end.x && current.y === end.y) {
        const path: Position[] = [];
        let temp: Position | undefined = current;
        while (temp) {
          path.unshift(temp);
          temp = cameFrom.get(getKey(temp));
        }
        return path;
      }

      const neighbors = getValidNeighbors(current);
      for (const neighbor of neighbors) {
        const tentativeGScore = (gScore.get(getKey(current)) || Infinity) + 1;
        const neighborKey = getKey(neighbor);

        if (tentativeGScore < (gScore.get(neighborKey) || Infinity)) {
          cameFrom.set(neighborKey, current);
          gScore.set(neighborKey, tentativeGScore);
          fScore.set(neighborKey, tentativeGScore + heuristic(neighbor, end));

          if (!openSet.some(pos => pos.x === neighbor.x && pos.y === neighbor.y)) {
            openSet.push(neighbor);
          }
        }
      }
    }

    return [];
  }, []);

  // Initialize game
  const initializeGame = useCallback(() => {
    const newMaze = generateMaze();
    setMaze(newMaze);
    setPlayerPos({ x: 0, y: 0 });
    setGoalPos({ x: MAZE_SIZE - 1, y: MAZE_SIZE - 1 });
    setMoves(0);
    setTimeElapsed(0);
    setGameStatus('playing');
    setShowAiPath(false);
    setHint(null);
    
    // Calculate AI path with retry logic
    setTimeout(() => {
      const path = findPath({ x: 0, y: 0 }, { x: MAZE_SIZE - 1, y: MAZE_SIZE - 1 }, newMaze);
      setAiPath(path);
      if (path.length === 0) {
        console.warn('No path found, regenerating maze...');
        initializeGame();
      }
    }, 100);
  }, [generateMaze, findPath]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Timer
  useEffect(() => {
    if (gameStatus === 'playing') {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameStatus]);

  // Player movement
  const movePlayer = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameStatus !== 'playing') return;

    const current = maze[playerPos.y][playerPos.x];
    let newPos = { ...playerPos };

    switch (direction) {
      case 'up':
        if (!current.walls.top && playerPos.y > 0) newPos.y--;
        break;
      case 'down':
        if (!current.walls.bottom && playerPos.y < MAZE_SIZE - 1) newPos.y++;
        break;
      case 'left':
        if (!current.walls.left && playerPos.x > 0) newPos.x--;
        break;
      case 'right':
        if (!current.walls.right && playerPos.x < MAZE_SIZE - 1) newPos.x++;
        break;
    }

    if (newPos.x !== playerPos.x || newPos.y !== playerPos.y) {
      setPlayerPos(newPos);
      setMoves(prev => prev + 1);
      setHint(null);

      // Check if reached goal
      if (newPos.x === goalPos.x && newPos.y === goalPos.y) {
        setGameStatus('won');
        const score = Math.max(0, 1000 - moves * 10 - timeElapsed * 5);
        toast.success(`Maze completed! Score: ${score} points`);
      }
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          movePlayer('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          movePlayer('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          movePlayer('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          movePlayer('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playerPos, maze, gameStatus, goalPos, moves, timeElapsed]);

  const toggleAiPath = () => {
    setShowAiPath(!showAiPath);
    toast.info(showAiPath ? 'AI path hidden' : 'AI path shown');
  };

  const getHint = () => {
    if (aiPath.length > 1) {
      const currentIndex = aiPath.findIndex(pos => pos.x === playerPos.x && pos.y === playerPos.y);
      if (currentIndex >= 0 && currentIndex < aiPath.length - 1) {
        setHint(aiPath[currentIndex + 1]);
        toast.success('Hint: Next step highlighted!');
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Game Stats */}
      <div className="flex items-center justify-between w-full max-w-lg">
        <div className="text-center">
          <div className="text-sm text-gray-400">Moves</div>
          <div className="text-xl font-bold text-cyan-400">{moves}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Time</div>
          <div className="text-xl font-bold text-green-400">{timeElapsed}s</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Optimal</div>
          <div className="text-xl font-bold text-purple-400">{aiPath.length - 1}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex space-x-2">
        <button
          onClick={toggleAiPath}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 text-sm"
        >
          {showAiPath ? 'Hide' : 'Show'} AI Path
        </button>
        <button
          onClick={getHint}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 text-sm"
        >
          Get Hint
        </button>
        <button
          onClick={initializeGame}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm"
        >
          New Maze
        </button>
      </div>

      {/* Maze */}
      <div className="relative border-2 border-slate-700 bg-slate-900">
        <svg
          width={MAZE_SIZE * CELL_SIZE}
          height={MAZE_SIZE * CELL_SIZE}
          className="block"
        >
          {/* Maze walls */}
          {maze.map((row, y) =>
            row.map((cell, x) => (
              <g key={`${x}-${y}`}>
                {/* AI path */}
                {showAiPath && aiPath.some(pos => pos.x === x && pos.y === y) && (
                  <rect
                    x={x * CELL_SIZE + 2}
                    y={y * CELL_SIZE + 2}
                    width={CELL_SIZE - 4}
                    height={CELL_SIZE - 4}
                    fill="rgba(168, 85, 247, 0.3)"
                  />
                )}

                {/* Hint highlight */}
                {hint && hint.x === x && hint.y === y && (
                  <rect
                    x={x * CELL_SIZE + 2}
                    y={y * CELL_SIZE + 2}
                    width={CELL_SIZE - 4}
                    height={CELL_SIZE - 4}
                    fill="rgba(251, 191, 36, 0.5)"
                    className="animate-pulse"
                  />
                )}

                {/* Walls */}
                {cell.walls.top && (
                  <line
                    x1={x * CELL_SIZE}
                    y1={y * CELL_SIZE}
                    x2={(x + 1) * CELL_SIZE}
                    y2={y * CELL_SIZE}
                    stroke="#64748b"
                    strokeWidth="2"
                  />
                )}
                {cell.walls.right && (
                  <line
                    x1={(x + 1) * CELL_SIZE}
                    y1={y * CELL_SIZE}
                    x2={(x + 1) * CELL_SIZE}
                    y2={(y + 1) * CELL_SIZE}
                    stroke="#64748b"
                    strokeWidth="2"
                  />
                )}
                {cell.walls.bottom && (
                  <line
                    x1={x * CELL_SIZE}
                    y1={(y + 1) * CELL_SIZE}
                    x2={(x + 1) * CELL_SIZE}
                    y2={(y + 1) * CELL_SIZE}
                    stroke="#64748b"
                    strokeWidth="2"
                  />
                )}
                {cell.walls.left && (
                  <line
                    x1={x * CELL_SIZE}
                    y1={y * CELL_SIZE}
                    x2={x * CELL_SIZE}
                    y2={(y + 1) * CELL_SIZE}
                    stroke="#64748b"
                    strokeWidth="2"
                  />
                )}
              </g>
            ))
          )}

          {/* Goal */}
          <circle
            cx={goalPos.x * CELL_SIZE + CELL_SIZE / 2}
            cy={goalPos.y * CELL_SIZE + CELL_SIZE / 2}
            r={CELL_SIZE / 3}
            fill="#10b981"
            className="animate-pulse"
          />

          {/* Player */}
          <circle
            cx={playerPos.x * CELL_SIZE + CELL_SIZE / 2}
            cy={playerPos.y * CELL_SIZE + CELL_SIZE / 2}
            r={CELL_SIZE / 3}
            fill="#00ffff"
            stroke="#67e8f9"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Game Over Screen */}
      {gameStatus === 'won' && (
        <div className="text-center p-6 bg-slate-800/80 rounded-xl border border-slate-600">
          <h3 className="text-2xl font-bold text-green-400 mb-2">🎉 Maze Completed!</h3>
          <p className="text-gray-300 mb-4">
            Completed in {moves} moves and {timeElapsed} seconds
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Optimal path: {aiPath.length - 1} moves
          </p>
          <button
            onClick={initializeGame}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200"
          >
            Generate New Maze
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-gray-400 text-sm max-w-md">
        <p className="mb-2">🎮 Use arrow keys or WASD to move</p>
        <p className="mb-2">🚀 <strong>AI Features:</strong></p>
        <p>Procedurally generated mazes with A* pathfinding assistance. AI shows optimal routes and provides intelligent hints!</p>
      </div>
    </div>
  );
};
