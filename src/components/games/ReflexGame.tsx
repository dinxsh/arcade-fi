
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  timeLeft: number;
  maxTime: number;
}

export const ReflexGame = () => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'paused'>('waiting');
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [missedTargets, setMissedTargets] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [targetSpeed, setTargetSpeed] = useState(3000); // AI adjusts this based on performance

  const colors = ['#00ffff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'];

  const generateTarget = useCallback(() => {
    const size = Math.max(30, 80 - level * 3); // Targets get smaller as level increases
    const maxTime = Math.max(1000, targetSpeed - level * 100); // Faster timeout as level increases
    
    const target: Target = {
      id: Date.now() + Math.random(),
      x: Math.random() * (400 - size),
      y: Math.random() * (400 - size),
      size,
      color: colors[Math.floor(Math.random() * colors.length)],
      timeLeft: maxTime,
      maxTime
    };
    
    return target;
  }, [level, targetSpeed]);

  const adjustDifficulty = useCallback(() => {
    if (reactionTimes.length >= 5) {
      const avgReactionTime = reactionTimes.slice(-5).reduce((a, b) => a + b, 0) / 5;
      const accuracy = score / (score + missedTargets) || 0;
      
      // AI adjusts speed based on performance
      if (avgReactionTime < 500 && accuracy > 0.8) {
        setTargetSpeed(prev => Math.max(1000, prev - 200));
        toast.success('AI increased difficulty! 🚀');
      } else if (avgReactionTime > 1000 || accuracy < 0.5) {
        setTargetSpeed(prev => Math.min(4000, prev + 200));
        toast.info('AI decreased difficulty 😊');
      }
    }
  }, [reactionTimes, score, missedTargets]);

  useEffect(() => {
    adjustDifficulty();
  }, [adjustDifficulty, score]);

  const startGame = () => {
    setGameStatus('playing');
    setScore(0);
    setLevel(1);
    setMissedTargets(0);
    setReactionTimes([]);
    setGameTime(0);
    setTargetSpeed(3000);
    setTargets([generateTarget()]);
  };

  const endGame = () => {
    setGameStatus('waiting');
    setTargets([]);
    const accuracy = score / (score + missedTargets) || 0;
    const avgReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;
    
    toast.success(`Game Over! Score: ${score}, Accuracy: ${(accuracy * 100).toFixed(1)}%, Avg Reaction: ${avgReactionTime.toFixed(0)}ms`);
  };

  const handleTargetClick = (targetId: number, startTime: number) => {
    const reactionTime = Date.now() - startTime;
    setReactionTimes(prev => [...prev, reactionTime]);
    
    setTargets(prev => prev.filter(t => t.id !== targetId));
    setScore(prev => prev + Math.max(1, Math.round(100 - reactionTime / 10)));
    
    // Level up every 10 targets
    if ((score + 1) % 10 === 0) {
      setLevel(prev => prev + 1);
      toast.success(`Level ${level + 1}! 🎉`);
    }
    
    // Generate new target
    setTimeout(() => {
      if (gameStatus === 'playing') {
        setTargets(prev => [...prev, generateTarget()]);
      }
    }, Math.random() * 1000 + 500);
  };

  // Game timer
  useEffect(() => {
    if (gameStatus === 'playing') {
      const timer = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameStatus]);

  // Target countdown and removal
  useEffect(() => {
    if (gameStatus === 'playing') {
      const interval = setInterval(() => {
        setTargets(prev => {
          const updatedTargets = prev.map(target => ({
            ...target,
            timeLeft: target.timeLeft - 50
          }));
          
          const expiredTargets = updatedTargets.filter(target => target.timeLeft <= 0);
          if (expiredTargets.length > 0) {
            setMissedTargets(prev => prev + expiredTargets.length);
            
            // End game if too many missed targets
            if (missedTargets >= 5) {
              endGame();
              return [];
            }
          }
          
          return updatedTargets.filter(target => target.timeLeft > 0);
        });
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [gameStatus, missedTargets]);

  // Generate new targets periodically
  useEffect(() => {
    if (gameStatus === 'playing' && targets.length === 0) {
      const timeout = setTimeout(() => {
        setTargets([generateTarget()]);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [gameStatus, targets.length, generateTarget]);

  const getAccuracy = () => {
    const total = score + missedTargets;
    return total > 0 ? ((score / total) * 100).toFixed(1) : '0.0';
  };

  const getAvgReactionTime = () => {
    return reactionTimes.length > 0 
      ? (reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length).toFixed(0)
      : '0';
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Game Stats */}
      <div className="flex items-center justify-between w-full max-w-2xl">
        <div className="text-center">
          <div className="text-sm text-gray-400">Score</div>
          <div className="text-2xl font-bold text-cyan-400">{score}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Level</div>
          <div className="text-2xl font-bold text-purple-400">{level}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Time</div>
          <div className="text-2xl font-bold text-green-400">{gameTime}s</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Accuracy</div>
          <div className="text-2xl font-bold text-yellow-400">{getAccuracy()}%</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Avg Reaction</div>
          <div className="text-2xl font-bold text-blue-400">{getAvgReactionTime()}ms</div>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative w-96 h-96 bg-slate-900 border-2 border-slate-700 rounded-xl overflow-hidden">
        {gameStatus === 'waiting' && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Reflex Trainer</h3>
              <p className="text-gray-300 mb-6">Click the targets as fast as you can!</p>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 text-lg font-semibold"
              >
                Start Training
              </button>
            </div>
          </div>
        )}

        {targets.map((target) => {
          const startTime = Date.now() - (target.maxTime - target.timeLeft);
          const progress = target.timeLeft / target.maxTime;
          
          return (
            <button
              key={target.id}
              onClick={() => handleTargetClick(target.id, startTime)}
              className="absolute rounded-full border-4 border-white/50 transition-all duration-75 hover:scale-110 cursor-pointer animate-pulse"
              style={{
                left: target.x,
                top: target.y,
                width: target.size,
                height: target.size,
                backgroundColor: target.color,
                opacity: progress,
                transform: `scale(${0.5 + progress * 0.5})`,
              }}
            >
              <div 
                className="absolute inset-2 rounded-full bg-white/30"
                style={{
                  transform: `scale(${progress})`,
                }}
              />
            </button>
          );
        })}

        {/* Missed targets indicator */}
        {gameStatus === 'playing' && (
          <div className="absolute top-4 right-4 text-red-400">
            Missed: {missedTargets}/5
          </div>
        )}
      </div>

      {/* Performance Feedback */}
      {gameStatus === 'playing' && reactionTimes.length > 0 && (
        <div className="text-center text-gray-400 text-sm">
          <p>Last reaction time: <span className="text-cyan-400">{reactionTimes[reactionTimes.length - 1]}ms</span></p>
          <p>AI Speed Adjustment: <span className="text-purple-400">{targetSpeed}ms</span></p>
        </div>
      )}

      {/* Controls */}
      {gameStatus === 'playing' && (
        <button
          onClick={endGame}
          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
        >
          End Game
        </button>
      )}

      {/* AI Info */}
      <div className="text-center text-gray-400 text-sm max-w-md">
        <p className="mb-2">🎯 <strong>AI Features:</strong></p>
        <p>The AI monitors your reaction time and accuracy to dynamically adjust target speed and size. The better you perform, the harder it gets!</p>
      </div>
    </div>
  );
};
