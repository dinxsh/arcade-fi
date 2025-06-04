
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Share2, Trophy, Users, Star } from 'lucide-react';
import { toast } from 'sonner';
import { gameStore } from '@/lib/gameStore';
import { SocialShareDialog } from './SocialShareDialog';

interface ScoreDialogProps {
  isOpen: boolean;
  onClose: () => void;
  game: string;
  score: number;
  gameData?: any;
}

export const ScoreDialog = ({ isOpen, onClose, game, score, gameData }: ScoreDialogProps) => {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSocialShare, setShowSocialShare] = useState(false);
  const [rewardInfo, setRewardInfo] = useState<{ reward: number; newTotal: number } | null>(null);

  // Add game result when dialog opens
  useState(() => {
    if (isOpen && score > 0 && !rewardInfo) {
      const result = gameStore.addGameResult(score);
      setRewardInfo(result);
      if (result.reward > 0) {
        toast.success(`You earned ${result.reward} AI Coins! 💰`);
      }
    }
  });

  const handleShare = () => {
    setShowSocialShare(true);
  };

  const handleSubmitScore = async () => {
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Score submitted to leaderboard!');
    setIsSubmitting(false);
    onClose();
  };

  const getRank = (score: number) => {
    if (score >= 1000) return 'Grandmaster';
    if (score >= 750) return 'Expert';
    if (score >= 500) return 'Advanced';
    if (score >= 250) return 'Intermediate';
    return 'Beginner';
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Grandmaster': return 'text-purple-400';
      case 'Expert': return 'text-red-400';
      case 'Advanced': return 'text-orange-400';
      case 'Intermediate': return 'text-blue-400';
      default: return 'text-green-400';
    }
  };

  const rank = getRank(score);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-black/95 border-green-500/30 text-white max-w-md backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-green-400 flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6" />
              Game Complete!
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Score Display */}
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">{score}</div>
              <div className="text-gray-400">Final Score</div>
              <div className={`text-lg font-semibold ${getRankColor(rank)} mt-2`}>
                {rank} Rank
              </div>
            </div>

            {/* Reward Display */}
            {rewardInfo && (
              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-4 border border-green-500/30">
                <div className="text-center">
                  <div className="text-green-400 font-semibold mb-1">Coins Earned!</div>
                  <div className="text-2xl font-bold text-yellow-400">+{rewardInfo.reward}</div>
                  <div className="text-sm text-gray-400">Total: {rewardInfo.newTotal} AI Coins</div>
                </div>
              </div>
            )}

            {/* Game Stats */}
            <div className="bg-gray-900/50 rounded-lg p-4 space-y-2 border border-green-500/20">
              <div className="text-center text-gray-300 text-sm mb-3">Game: {game}</div>
              {gameData && (
                <>
                  {gameData.moves && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Moves:</span>
                      <span className="text-cyan-400">{gameData.moves}</span>
                    </div>
                  )}
                  {gameData.time && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Time:</span>
                      <span className="text-green-400">{gameData.time}s</span>
                    </div>
                  )}
                  {gameData.level && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Level:</span>
                      <span className="text-purple-400">{gameData.level}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Share Score */}
            <button
              onClick={handleShare}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share Score
            </button>

            {/* Submit to Leaderboard */}
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter username for leaderboard"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-900/50 border border-green-500/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                maxLength={20}
              />
              <button
                onClick={handleSubmitScore}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Users className="w-4 h-4" />
                {isSubmitting ? 'Submitting...' : 'Submit to Leaderboard'}
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <SocialShareDialog
        isOpen={showSocialShare}
        onClose={() => setShowSocialShare(false)}
        game={game}
        score={score}
      />
    </>
  );
};
