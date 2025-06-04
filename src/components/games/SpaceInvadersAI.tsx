
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface Enemy {
  x: number;
  y: number;
  type: 'basic' | 'advanced' | 'boss';
  health: number;
  color: string;
}

interface Bullet {
  x: number;
  y: number;
  owner: 'player' | 'enemy';
  speed: number;
}

interface PowerUp {
  x: number;
  y: number;
  type: 'rapid' | 'shield' | 'double';
  color: string;
}

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PLAYER_SIZE = 30;
const ENEMY_SIZE = 25;

export const SpaceInvadersAI = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStatus, setGameStatus] = useState<'playing' | 'gameOver' | 'paused'>('playing');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [playerX, setPlayerX] = useState(CANVAS_WIDTH / 2);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [level, setLevel] = useState(1);
  const [playerPower, setPlayerPower] = useState('normal');

  const spawnEnemies = (waveLevel: number) => {
    const newEnemies: Enemy[] = [];
    const rows = Math.min(4 + Math.floor(waveLevel / 3), 6);
    const cols = Math.min(8 + Math.floor(waveLevel / 2), 12);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let type: 'basic' | 'advanced' | 'boss' = 'basic';
        let health = 1;
        let color = '#00ff00';
        
        if (row === 0 && waveLevel > 2) {
          type = 'boss';
          health = 3;
          color = '#ff0000';
        } else if (row < 2 && waveLevel > 1) {
          type = 'advanced';
          health = 2;
          color = '#ffff00';
        }
        
        newEnemies.push({
          x: col * (ENEMY_SIZE + 10) + 50,
          y: row * (ENEMY_SIZE + 10) + 50,
          type,
          health,
          color
        });
      }
    }
    return newEnemies;
  };

  const resetGame = () => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setPlayerX(CANVAS_WIDTH / 2);
    setEnemies(spawnEnemies(1));
    setBullets([]);
    setPowerUps([]);
    setPlayerPower('normal');
    setGameStatus('playing');
  };

  const shoot = () => {
    if (gameStatus !== 'playing') return;
    
    setBullets(prev => [
      ...prev,
      {
        x: playerX,
        y: CANVAS_HEIGHT - 40,
        owner: 'player',
        speed: -5
      }
    ]);
  };

  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (gameStatus !== 'playing') return;

      // Move bullets
      setBullets(prev => {
        let newBullets = prev.map(bullet => ({
          ...bullet,
          y: bullet.y + bullet.speed
        })).filter(bullet => bullet.y > 0 && bullet.y < CANVAS_HEIGHT);

        return newBullets;
      });

      // Enemy AI - shooting
      if (Math.random() < 0.02 + level * 0.01) {
        const shootingEnemies = enemies.filter(e => Math.random() < 0.3);
        if (shootingEnemies.length > 0) {
          const enemy = shootingEnemies[Math.floor(Math.random() * shootingEnemies.length)];
          setBullets(prev => [
            ...prev,
            {
              x: enemy.x + ENEMY_SIZE / 2,
              y: enemy.y + ENEMY_SIZE,
              owner: 'enemy',
              speed: 2 + level * 0.5
            }
          ]);
        }
      }

      // Move enemies down occasionally
      if (Math.random() < 0.005) {
        setEnemies(prev => prev.map(enemy => ({
          ...enemy,
          y: enemy.y + 10
        })));
      }

      // Collision detection
      setBullets(prevBullets => {
        let newBullets = [...prevBullets];
        
        // Player bullets vs enemies
        setEnemies(prevEnemies => {
          let newEnemies = [...prevEnemies];
          let scoreIncrease = 0;
          
          newBullets.forEach((bullet, bulletIndex) => {
            if (bullet.owner === 'player') {
              newEnemies.forEach((enemy, enemyIndex) => {
                if (bullet.x > enemy.x && bullet.x < enemy.x + ENEMY_SIZE &&
                    bullet.y > enemy.y && bullet.y < enemy.y + ENEMY_SIZE) {
                  
                  newEnemies[enemyIndex] = { ...enemy, health: enemy.health - 1 };
                  newBullets.splice(bulletIndex, 1);
                  
                  if (newEnemies[enemyIndex].health <= 0) {
                    scoreIncrease += enemy.type === 'boss' ? 50 : enemy.type === 'advanced' ? 20 : 10;
                    newEnemies.splice(enemyIndex, 1);
                    
                    // Chance to drop power-up
                    if (Math.random() < 0.1) {
                      const types = ['rapid', 'shield', 'double'];
                      setPowerUps(prev => [...prev, {
                        x: enemy.x,
                        y: enemy.y,
                        type: types[Math.floor(Math.random() * types.length)] as any,
                        color: '#00ffff'
                      }]);
                    }
                  }
                }
              });
            }
          });
          
          if (scoreIncrease > 0) {
            setScore(prev => prev + scoreIncrease);
            toast.success(`+${scoreIncrease} points!`);
          }
          
          // Check if all enemies defeated
          if (newEnemies.length === 0) {
            setLevel(prev => prev + 1);
            toast.success(`Level ${level + 1}!`);
            setTimeout(() => {
              setEnemies(spawnEnemies(level + 1));
            }, 1000);
          }
          
          return newEnemies;
        });

        // Enemy bullets vs player
        newBullets.forEach((bullet, bulletIndex) => {
          if (bullet.owner === 'enemy') {
            if (bullet.x > playerX - PLAYER_SIZE/2 && bullet.x < playerX + PLAYER_SIZE/2 &&
                bullet.y > CANVAS_HEIGHT - 50 && bullet.y < CANVAS_HEIGHT - 10) {
              
              setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                  setGameStatus('gameOver');
                  toast.error(`Game Over! Final Score: ${score}`);
                } else {
                  toast.warning(`Hit! ${newLives} lives remaining`);
                }
                return newLives;
              });
              
              newBullets.splice(bulletIndex, 1);
            }
          }
        });

        return newBullets;
      });

      // Power-up collection
      setPowerUps(prev => {
        return prev.filter(powerUp => {
          if (powerUp.x > playerX - PLAYER_SIZE/2 && powerUp.x < playerX + PLAYER_SIZE/2 &&
              powerUp.y > CANVAS_HEIGHT - 50 && powerUp.y < CANVAS_HEIGHT - 10) {
            
            setPlayerPower(powerUp.type);
            toast.success(`Power-up: ${powerUp.type}!`);
            
            setTimeout(() => setPlayerPower('normal'), 10000);
            return false;
          }
          return powerUp.y < CANVAS_HEIGHT;
        }).map(powerUp => ({ ...powerUp, y: powerUp.y + 2 }));
      });

      // Check game over conditions
      const enemyReachedBottom = enemies.some(enemy => enemy.y + ENEMY_SIZE > CANVAS_HEIGHT - 60);
      if (enemyReachedBottom) {
        setGameStatus('gameOver');
        toast.error(`Game Over! Enemies reached Earth!`);
      }

    }, 16);

    return () => clearInterval(gameLoop);
  }, [gameStatus, enemies, score, level, playerX, lives]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with space background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#000428');
    gradient.addColorStop(1, '#004e92');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
      const x = (i * 37) % CANVAS_WIDTH;
      const y = (i * 47) % CANVAS_HEIGHT;
      ctx.fillRect(x, y, 1, 1);
    }

    // Draw player
    ctx.fillStyle = playerPower !== 'normal' ? '#00ffff' : '#00ff00';
    ctx.fillRect(playerX - PLAYER_SIZE/2, CANVAS_HEIGHT - 40, PLAYER_SIZE, 20);
    
    // Player cannon
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(playerX - 3, CANVAS_HEIGHT - 50, 6, 10);

    // Draw enemies
    enemies.forEach(enemy => {
      ctx.fillStyle = enemy.color;
      ctx.fillRect(enemy.x, enemy.y, ENEMY_SIZE, ENEMY_SIZE);
      
      // Health indicator
      if (enemy.health > 1) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText(enemy.health.toString(), enemy.x + 5, enemy.y + 15);
      }
    });

    // Draw bullets
    bullets.forEach(bullet => {
      ctx.fillStyle = bullet.owner === 'player' ? '#00ffff' : '#ff0000';
      ctx.fillRect(bullet.x - 2, bullet.y - 5, 4, 10);
    });

    // Draw power-ups
    powerUps.forEach(powerUp => {
      ctx.fillStyle = powerUp.color;
      ctx.fillRect(powerUp.x, powerUp.y, 15, 15);
      
      ctx.fillStyle = '#000000';
      ctx.font = '10px Arial';
      ctx.fillText(powerUp.type[0].toUpperCase(), powerUp.x + 5, powerUp.y + 10);
    });
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    setPlayerX(Math.max(PLAYER_SIZE/2, Math.min(CANVAS_WIDTH - PLAYER_SIZE/2, mouseX)));
  };

  const handleClick = () => {
    shoot();
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        shoot();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStatus]);

  useEffect(() => {
    resetGame();
  }, []);

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex items-center justify-between w-full max-w-lg">
        <div className="text-center">
          <div className="text-sm text-gray-400">Score</div>
          <div className="text-xl font-bold text-cyan-400">{score}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Lives</div>
          <div className="text-xl font-bold text-red-400">{lives}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Level</div>
          <div className="text-xl font-bold text-purple-400">{level}</div>
        </div>
      </div>

      {playerPower !== 'normal' && (
        <div className="text-center text-yellow-400 font-bold animate-pulse">
          Power-up Active: {playerPower.toUpperCase()}
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        className="border-2 border-slate-600 rounded-lg cursor-crosshair bg-space"
      />

      {gameStatus === 'gameOver' && (
        <div className="text-center p-6 bg-slate-800/80 rounded-xl border border-slate-600">
          <h3 className="text-2xl font-bold text-red-400 mb-2">🚀 Game Over!</h3>
          <p className="text-gray-300 mb-2">Final Score: {score}</p>
          <p className="text-gray-300 mb-4">Level Reached: {level}</p>
          <button
            onClick={resetGame}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200"
          >
            Play Again
          </button>
        </div>
      )}

      <div className="text-center text-gray-400 text-sm max-w-md">
        <p className="mb-2">🚀 Move mouse to aim, click or Space to shoot</p>
        <p>🤖 AI enemies adapt strategy and shooting patterns by level!</p>
      </div>
    </div>
  );
};
