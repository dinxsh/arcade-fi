import { useState } from 'react';
import { Trophy, Zap, Wand2, Gift, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlobalLeaderboard } from './GlobalLeaderboard';
import { RewardSystem } from './RewardSystem';
import { ChatRoom } from './ChatRoom';

export const Header = () => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <header className="w-full py-6 px-4 border-b border-green-500/20 bg-black/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
            <div className="relative">
              <div className="absolute inset-0 bg-green-400/20 rounded-xl blur-lg"></div>
              <div className="relative p-3 bg-gradient-to-br from-black to-gray-900 rounded-xl border border-green-400/30">
                <Zap className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                ArcadeFi
              </h1>
              <p className="text-sm text-gray-400">Try Gaming with AI</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowChat(true)}
              className="group flex items-center gap-2 bg-gradient-to-r from-black to-gray-900 hover:from-gray-900 hover:to-black text-blue-400 px-4 py-2 rounded-xl transition-all duration-200 shadow-lg transform hover:scale-105 border border-blue-400/30"
            >
              <MessageCircle className="w-4 h-4 group-hover:animate-pulse" />
              <span className="hidden sm:inline font-semibold">Chat</span>
            </button>

            <button
              onClick={() => setShowRewards(true)}
              className="group flex items-center gap-2 bg-gradient-to-r from-black to-gray-900 hover:from-gray-900 hover:to-black text-yellow-400 px-4 py-2 rounded-xl transition-all duration-200 shadow-lg transform hover:scale-105 border border-yellow-400/30"
            >
              <Gift className="w-4 h-4 group-hover:animate-pulse" />
              <span className="hidden sm:inline font-semibold">Rewards</span>
            </button>
            
            <Link
              to="/create"
              className="group flex items-center gap-2 bg-gradient-to-r from-black to-gray-900 hover:from-gray-900 hover:to-black text-purple-400 px-4 py-2 rounded-xl transition-all duration-200 shadow-lg transform hover:scale-105 border border-purple-400/30"
            >
              <Wand2 className="w-4 h-4 group-hover:animate-pulse" />
              <span className="hidden sm:inline font-semibold">Create Game</span>
            </Link>
            
            <button
              onClick={() => setShowLeaderboard(true)}
              className="group flex items-center gap-3 bg-gradient-to-r from-black to-gray-900 hover:from-gray-900 hover:to-black text-green-400 px-6 py-3 rounded-xl transition-all duration-200 shadow-lg transform hover:scale-105 border border-green-400/30"
            >
              <Trophy className="w-5 h-5 group-hover:animate-pulse" />
              <span className="hidden sm:inline font-semibold">Leaderboard</span>
            </button>
          </div>
        </div>
      </header>

      <GlobalLeaderboard 
        isOpen={showLeaderboard} 
        onClose={() => setShowLeaderboard(false)} 
      />

      <RewardSystem 
        isOpen={showRewards} 
        onClose={() => setShowRewards(false)} 
      />

      <ChatRoom 
        isOpen={showChat} 
        onClose={() => setShowChat(false)} 
      />
    </>
  );
};
