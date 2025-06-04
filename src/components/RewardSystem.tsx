
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Coins, Gift, Star, Trophy } from 'lucide-react';
import { gameStore } from '@/lib/gameStore';
import { toast } from 'sonner';

interface RewardSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RewardSystem = ({ isOpen, onClose }: RewardSystemProps) => {
  const [stats, setStats] = useState(gameStore.getStats());
  const [achievements, setAchievements] = useState(gameStore.getAchievements());

  useEffect(() => {
    if (isOpen) {
      setStats(gameStore.getStats());
      setAchievements(gameStore.getAchievements());
    }
  }, [isOpen]);

  const rewards = [
    { id: 'hint', name: 'Game Hint', cost: 50, icon: '💡', description: 'Get a helpful hint for any game' },
    { id: 'theme', name: 'Neon Theme', cost: 200, icon: '🎨', description: 'Unlock exclusive neon themes' },
    { id: 'powerup', name: 'Power Boost', cost: 150, icon: '⚡', description: 'Start games with bonus power' },
    { id: 'avatar', name: 'Custom Avatar', cost: 300, icon: '👤', description: 'Personalize your profile' }
  ];

  const handleRedeem = (reward: any) => {
    if (gameStore.spendCurrency(reward.cost)) {
      setStats(gameStore.getStats());
      toast.success(`Redeemed ${reward.name}! 🎉`);
    } else {
      toast.error('Not enough coins! Play more games to earn coins.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-green-400/30 text-white max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-xl shadow-2xl shadow-green-400/20">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-green-400 via-cyan-400 to-green-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <Gift className="w-8 h-8 text-green-400" />
            Reward Center
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Currency Display */}
          <div className="text-center p-6 bg-gradient-to-r from-green-500/10 via-cyan-500/10 to-green-500/10 rounded-2xl border border-green-400/40 neon-glow">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Coins className="w-8 h-8 text-yellow-400 animate-pulse" />
              <span className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">{stats.currency}</span>
              <span className="text-xl text-green-400 font-semibold">AI Coins</span>
            </div>
            <p className="text-gray-300">Play games to earn more coins and unlock rewards!</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-gray-900/80 to-black/80 rounded-xl border border-green-400/30 backdrop-blur-sm hover:border-green-400/50 transition-all duration-300">
              <div className="text-3xl font-bold text-green-400 mb-2">{stats.gamesPlayed}</div>
              <div className="text-sm text-gray-300">Games Played</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-gray-900/80 to-black/80 rounded-xl border border-cyan-400/30 backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300">
              <div className="text-3xl font-bold text-cyan-400 mb-2">{stats.highestScore}</div>
              <div className="text-sm text-gray-300">Best Score</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-gray-900/80 to-black/80 rounded-xl border border-purple-400/30 backdrop-blur-sm hover:border-purple-400/50 transition-all duration-300">
              <div className="text-3xl font-bold text-purple-400 mb-2">{stats.achievements.length}</div>
              <div className="text-sm text-gray-300">Achievements</div>
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h3 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-3">
              <Trophy className="w-6 h-6" />
              Achievements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className={`p-4 rounded-xl border transition-all duration-300 ${achievement.unlocked 
                  ? 'bg-gradient-to-r from-green-500/20 to-cyan-500/20 border-green-400/50 shadow-lg shadow-green-400/10' 
                  : 'bg-gradient-to-r from-gray-900/50 to-black/50 border-gray-600/30'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <div className={`font-bold ${achievement.unlocked ? 'text-green-400' : 'text-gray-400'}`}>
                        {achievement.title}
                      </div>
                      <div className="text-sm text-gray-400">{achievement.description}</div>
                      {achievement.unlocked && (
                        <div className="text-xs text-green-300 font-semibold mt-1">+{achievement.reward} coins earned!</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rewards Store */}
          <div>
            <h3 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-3">
              <Star className="w-6 h-6" />
              Rewards Store
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {rewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-900/80 to-black/80 rounded-xl border border-green-400/30 backdrop-blur-sm hover:border-green-400/50 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{reward.icon}</span>
                    <div>
                      <div className="font-bold text-white text-lg">{reward.name}</div>
                      <div className="text-sm text-gray-300">{reward.description}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={stats.currency < reward.cost}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl transition-all duration-200 disabled:cursor-not-allowed font-semibold shadow-lg"
                  >
                    <Coins className="w-4 h-4" />
                    {reward.cost}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
