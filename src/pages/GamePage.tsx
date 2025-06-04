
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';
import { games } from '@/lib/gamesList';
import { ScoreDialog } from '@/components/ScoreDialog';

export const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [gameKey, setGameKey] = useState(0);
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const game = games.find(g => g.id === gameId);

  useEffect(() => {
    if (!game) {
      navigate('/');
    }
  }, [game, navigate]);

  if (!game) {
    return null;
  }

  const GameComponent = game.component;

  const handleRestart = () => {
    setGameKey(prev => prev + 1);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleGameComplete = (score: number) => {
    setFinalScore(score);
    setShowScoreDialog(true);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Web3 background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-400/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Matrix grid background */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
            {[...Array(400)].map((_, i) => (
              <div key={i} className="border border-green-500/20"></div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10">
        {/* Game Header with Web3 styling */}
        <header className="w-full py-4 px-6 border-b border-green-500/20 bg-black/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToHome}
                className="p-3 bg-gradient-to-r from-black to-gray-900 hover:neon-glow rounded-lg transition-all duration-200 flex items-center gap-2 neon-border"
                title="Back to Home"
              >
                <ArrowLeft className="w-5 h-5 text-green-400" />
                <span className="text-green-400 hidden sm:inline font-semibold">Back</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-black to-gray-900 rounded-lg neon-border">
                  <game.icon className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{game.title}</h1>
                  <p className="text-sm text-green-400">{game.category}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRestart}
                className="p-3 bg-gradient-to-r from-black to-gray-900 hover:neon-glow rounded-lg transition-all duration-200 flex items-center gap-2 neon-border"
                title="Restart Game"
              >
                <RotateCcw className="w-5 h-5 text-green-400" />
                <span className="text-green-400 hidden sm:inline font-semibold">Restart</span>
              </button>
            </div>
          </div>
        </header>

        {/* Game Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-black via-gray-900 to-green-900/10 neon-border rounded-3xl p-6 backdrop-blur-sm">
              <GameComponent key={gameKey} onGameComplete={handleGameComplete} />
            </div>
          </div>
        </main>
      </div>

      {/* Score Dialog */}
      <ScoreDialog
        isOpen={showScoreDialog}
        onClose={() => setShowScoreDialog(false)}
        game={game.title}
        score={finalScore}
      />
    </div>
  );
};

export default GamePage;
