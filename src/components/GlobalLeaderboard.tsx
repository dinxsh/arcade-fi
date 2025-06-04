
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trophy, Crown, Medal, Star, Gamepad2 } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  game: string;
  avatar?: string;
}

interface GlobalLeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

// More human-like demo leaderboard data
const demoLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: 'GameMaster_Alex', score: 15420, game: 'Snake vs AI', avatar: '🎮' },
  { rank: 2, username: 'NeonNinja', score: 12890, game: 'Tetris AI', avatar: '🥷' },
  { rank: 3, username: 'CyberSarah', score: 11750, game: 'AI Maze Runner', avatar: '👩‍💻' },
  { rank: 4, username: 'PixelPro_Mike', score: 9540, game: 'Reflex Trainer', avatar: '🚀' },
  { rank: 5, username: 'RetroGamer_Luna', score: 8760, game: 'Pong AI', avatar: '🌙' },
  { rank: 6, username: 'BlockBuster_Jay', score: 7920, game: 'Block Breaker AI', avatar: '💎' },
  { rank: 7, username: 'FlightAce_Emma', score: 6850, game: 'Flappy AI', avatar: '✈️' },
  { rank: 8, username: 'BrainBox_Ryan', score: 5690, game: 'Memory Match AI', avatar: '🧠' },
  { rank: 9, username: 'StrategyQueen', score: 4200, game: 'AI Tic-Tac-Toe', avatar: '👑' },
  { rank: 10, username: 'CodeCrusher', score: 3450, game: 'Puzzle AI', avatar: '⚡' }
];

export const GlobalLeaderboard = ({ isOpen, onClose }: GlobalLeaderboardProps) => {
  const [selectedGame, setSelectedGame] = useState<string>('All Games');

  const games = ['All Games', 'Snake vs AI', 'Tetris AI', 'AI Maze Runner', 'Reflex Trainer', 'Pong AI', 'Block Breaker AI', 'Flappy AI', 'Memory Match AI', 'AI Tic-Tac-Toe'];

  const filteredLeaderboard = selectedGame === 'All Games' 
    ? demoLeaderboard 
    : demoLeaderboard.filter(entry => entry.game === selectedGame);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400 animate-pulse" />;
      case 2: return <Medal className="w-6 h-6 text-gray-300" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <Star className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/20 via-yellow-400/20 to-yellow-500/20 border-yellow-400/50 shadow-lg shadow-yellow-400/20';
      case 2: return 'bg-gradient-to-r from-gray-400/20 via-gray-300/20 to-gray-400/20 border-gray-400/50 shadow-lg shadow-gray-400/10';
      case 3: return 'bg-gradient-to-r from-amber-600/20 via-amber-500/20 to-amber-600/20 border-amber-500/50 shadow-lg shadow-amber-500/10';
      default: return 'bg-gradient-to-r from-gray-900/50 to-black/50 border-gray-600/30 hover:border-green-400/30';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-green-400/30 text-white w-full max-w-5xl max-h-[90vh] overflow-hidden backdrop-blur-xl shadow-2xl shadow-green-400/20">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-center text-4xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-green-400 bg-clip-text text-transparent flex items-center justify-center gap-4">
            <Trophy className="w-10 h-10 text-green-400" />
            Global Leaderboard
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Game Filter */}
          <div className="flex items-center gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-green-400/30">
            {games.map((game) => (
              <button
                key={game}
                onClick={() => setSelectedGame(game)}
                className={`whitespace-nowrap px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  selectedGame === game
                    ? 'bg-gradient-to-r from-green-500 to-cyan-500 text-white shadow-lg shadow-green-400/30 scale-105'
                    : 'bg-gradient-to-r from-gray-800 to-gray-900 text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-800 border border-gray-600/30'
                }`}
              >
                {game}
              </button>
            ))}
          </div>

          {/* Leaderboard List */}
          <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-green-400/30">
            {filteredLeaderboard.map((entry) => (
              <div
                key={`${entry.username}-${entry.rank}`}
                className={`flex items-center justify-between p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${getRankBg(entry.rank)}`}
              >
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4">
                    {getRankIcon(entry.rank)}
                    <span className="text-2xl font-bold text-gray-200 min-w-[4rem]">#{entry.rank}</span>
                  </div>
                  
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 via-cyan-500/20 to-green-500/20 rounded-full flex items-center justify-center text-3xl border-2 border-green-400/40 shadow-lg">
                      {entry.avatar || '👤'}
                    </div>
                    <div>
                      <div className="font-bold text-xl text-white mb-1">{entry.username}</div>
                      <div className="text-sm text-gray-300 flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4 text-green-400" />
                        {entry.game}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">points</div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-r from-gray-900/80 to-black/80 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8 border border-green-400/30">
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">{demoLeaderboard.length}</div>
              <div className="text-sm text-gray-300 font-semibold">Active Players</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">{games.length - 1}</div>
              <div className="text-sm text-gray-300 font-semibold">Games Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">Live</div>
              <div className="text-sm text-gray-300 font-semibold">Competition</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
