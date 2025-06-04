
import { X, RotateCcw } from 'lucide-react';
import { Game } from '@/lib/gamesList';
import { useState } from 'react';

interface GameModalProps {
  game: Game;
  onClose: () => void;
}

export const GameModal = ({ game, onClose }: GameModalProps) => {
  const [gameKey, setGameKey] = useState(0);
  const GameComponent = game.component;

  const handleRestart = () => {
    setGameKey(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
              <game.icon className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{game.title}</h2>
              <p className="text-sm text-gray-400">{game.category}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRestart}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200"
              title="Restart Game"
            >
              <RotateCcw className="w-5 h-5 text-gray-300" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200"
              title="Close Game"
            >
              <X className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Game Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
          <GameComponent key={gameKey} />
        </div>
      </div>
    </div>
  );
};
