
import { Play, Brain, Sparkles, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { Game } from '@/lib/gamesList';
import { GameGuideDialog } from './GameGuideDialog';

interface GameCardProps {
  game: Game;
  onClick: () => void;
}

export const GameCard = ({ game, onClick }: GameCardProps) => {
  const [showGuide, setShowGuide] = useState(false);
  const IconComponent = game.icon;
  
  const handleGuideClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowGuide(true);
  };
  
  return (
    <>
      <div 
        className="group relative bg-gradient-to-br from-black via-gray-900 to-green-900/10 border border-green-500/30 rounded-3xl p-8 cursor-pointer transition-all duration-500 hover:border-green-400/60 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:scale-[1.02] backdrop-blur-sm"
        onClick={onClick}
      >
        {/* Enhanced glow effect on hover with green theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-400/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/3 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative z-10">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400/20 rounded-xl blur-md group-hover:blur-lg transition-all duration-300"></div>
                <div className="relative p-3 bg-gradient-to-br from-black to-gray-900 rounded-xl border border-green-400/30 group-hover:border-green-400/60 transition-all duration-300">
                  <IconComponent className="w-7 h-7 text-green-400 group-hover:scale-110 transition-transform duration-200" />
                </div>
              </div>
              <span className="text-sm text-green-400 font-semibold px-3 py-1 bg-green-500/10 rounded-full border border-green-500/30">
                {game.category}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleGuideClick}
                className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 rounded-lg border border-blue-500/30 transition-all duration-200"
                title="How to Play"
              >
                <HelpCircle className="w-5 h-5 text-blue-400" />
              </button>
              <div className="relative">
                <Brain className="w-6 h-6 text-green-400 group-hover:animate-pulse" />
                <Sparkles className="w-3 h-3 text-green-300 absolute -top-1 -right-1 group-hover:animate-ping" />
              </div>
            </div>
          </div>

          {/* Enhanced Content */}
          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-300 transition-colors duration-300 leading-tight">
            {game.title}
          </h3>
          <p className="text-gray-400 text-base mb-6 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
            {game.description}
          </p>

          {/* Enhanced AI Features */}
          <div className="space-y-3 mb-8">
            {game.aiFeatures.slice(0, 2).map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 text-sm group-hover:text-gray-200 transition-colors duration-300">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex-shrink-0 group-hover:animate-pulse"></div>
                <span className="text-gray-300 leading-relaxed">{feature}</span>
              </div>
            ))}
          </div>

          {/* Enhanced Play Button with Web3 styling */}
          <button className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 hover:from-green-500 hover:via-blue-500 hover:to-purple-500 text-black py-4 px-6 rounded-2xl transition-all duration-300 transform group-hover:scale-105 shadow-lg border border-green-400/50 font-semibold text-lg">
            <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            <span>Play Now</span>
            <Sparkles className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity duration-200" />
          </button>
        </div>
      </div>

      <GameGuideDialog
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        gameId={game.id}
        gameTitle={game.title}
      />
    </>
  );
};
