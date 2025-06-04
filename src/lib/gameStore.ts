
interface GameStats {
  gamesPlayed: number;
  totalScore: number;
  highestScore: number;
  currency: number;
  achievements: string[];
  streakDays: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  reward: number;
  unlocked: boolean;
  icon: string;
}

class GameStore {
  private stats: GameStats;
  private achievements: Achievement[];

  constructor() {
    this.stats = this.loadStats();
    this.achievements = this.loadAchievements();
  }

  private loadStats(): GameStats {
    const saved = localStorage.getItem('aiArcadeStats');
    return saved ? JSON.parse(saved) : {
      gamesPlayed: 0,
      totalScore: 0,
      highestScore: 0,
      currency: 100, // Starting currency
      achievements: [],
      streakDays: 0
    };
  }

  private loadAchievements(): Achievement[] {
    return [
      { id: 'first_win', title: 'First Victory', description: 'Win your first game', reward: 50, unlocked: false, icon: '🏆' },
      { id: 'high_scorer', title: 'High Scorer', description: 'Score over 1000 points', reward: 100, unlocked: false, icon: '⭐' },
      { id: 'streak_master', title: 'Streak Master', description: 'Play 5 games in a row', reward: 200, unlocked: false, icon: '🔥' },
      { id: 'currency_collector', title: 'Currency Collector', description: 'Earn 1000 coins total', reward: 300, unlocked: false, icon: '💰' }
    ];
  }

  private saveStats() {
    localStorage.setItem('aiArcadeStats', JSON.stringify(this.stats));
  }

  addGameResult(score: number) {
    this.stats.gamesPlayed++;
    this.stats.totalScore += score;
    
    if (score > this.stats.highestScore) {
      this.stats.highestScore = score;
    }

    // Calculate reward based on score
    const reward = Math.floor(score / 10) + 10;
    this.stats.currency += reward;

    this.checkAchievements();
    this.saveStats();
    
    return { reward, newTotal: this.stats.currency };
  }

  private checkAchievements() {
    this.achievements.forEach(achievement => {
      if (!achievement.unlocked) {
        let shouldUnlock = false;

        switch (achievement.id) {
          case 'first_win':
            shouldUnlock = this.stats.gamesPlayed >= 1;
            break;
          case 'high_scorer':
            shouldUnlock = this.stats.highestScore >= 1000;
            break;
          case 'streak_master':
            shouldUnlock = this.stats.gamesPlayed >= 5;
            break;
          case 'currency_collector':
            shouldUnlock = this.stats.currency >= 1000;
            break;
        }

        if (shouldUnlock) {
          achievement.unlocked = true;
          this.stats.achievements.push(achievement.id);
          this.stats.currency += achievement.reward;
        }
      }
    });
  }

  getStats() {
    return { ...this.stats };
  }

  getAchievements() {
    return this.achievements.map(a => ({ ...a }));
  }

  spendCurrency(amount: number): boolean {
    if (this.stats.currency >= amount) {
      this.stats.currency -= amount;
      this.saveStats();
      return true;
    }
    return false;
  }
}

export const gameStore = new GameStore();
