import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface AsteroidsAIProps {
  onGameComplete?: (score: number) => void;
}

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

interface GameObject extends Position {
  velocity: Velocity;
  angle: number;
  size: number;
}

interface Ship extends GameObject {
  thrust: boolean;
}

interface Asteroid extends GameObject {
  level: number;
}

interface Bullet extends GameObject {
  life: number;
}

export const AsteroidsAI: React.FC<AsteroidsAIProps> = ({ onGameComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [ship, setShip] = useState<Ship>({
    x: 400,
    y: 300,
    velocity: { x: 0, y: 0 },
    angle: 0,
    size: 10,
    thrust: false
  });
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  const initializeGame = useCallback(() => {
    const initialAsteroids: Asteroid[] = [];
    for (let i = 0; i < 5; i++) {
      initialAsteroids.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2
        },
        angle: Math.random() * Math.PI * 2,
        size: 30,
        level: 3
      });
    }
    setAsteroids(initialAsteroids);
    setShip({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      velocity: { x: 0, y: 0 },
      angle: 0,
      size: 10,
      thrust: false
    });
    setBullets([]);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setGameStarted(true);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setKeys(prev => ({ ...prev, [e.key]: true }));
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setKeys(prev => ({ ...prev, [e.key]: false }));
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const updateGame = useCallback(() => {
    if (!gameStarted || gameOver) return;

    // Update ship
    setShip(prevShip => {
      let newShip = { ...prevShip };
      
      if (keys['ArrowLeft'] || keys['a']) {
        newShip.angle -= 0.2;
      }
      if (keys['ArrowRight'] || keys['d']) {
        newShip.angle += 0.2;
      }
      if (keys['ArrowUp'] || keys['w']) {
        newShip.thrust = true;
        newShip.velocity.x += Math.cos(newShip.angle) * 0.5;
        newShip.velocity.y += Math.sin(newShip.angle) * 0.5;
      } else {
        newShip.thrust = false;
      }

      // Apply friction
      newShip.velocity.x *= 0.99;
      newShip.velocity.y *= 0.99;

      // Update position
      newShip.x += newShip.velocity.x;
      newShip.y += newShip.velocity.y;

      // Wrap around screen
      if (newShip.x < 0) newShip.x = CANVAS_WIDTH;
      if (newShip.x > CANVAS_WIDTH) newShip.x = 0;
      if (newShip.y < 0) newShip.y = CANVAS_HEIGHT;
      if (newShip.y > CANVAS_HEIGHT) newShip.y = 0;

      return newShip;
    });

    // Shoot bullets
    if (keys[' ']) {
      setBullets(prevBullets => {
        if (prevBullets.length < 4) {
          return [...prevBullets, {
            x: ship.x,
            y: ship.y,
            velocity: {
              x: Math.cos(ship.angle) * 10,
              y: Math.sin(ship.angle) * 10
            },
            angle: ship.angle,
            size: 2,
            life: 60
          }];
        }
        return prevBullets;
      });
    }

    // Update bullets
    setBullets(prevBullets => 
      prevBullets
        .map(bullet => ({
          ...bullet,
          x: bullet.x + bullet.velocity.x,
          y: bullet.y + bullet.velocity.y,
          life: bullet.life - 1
        }))
        .filter(bullet => bullet.life > 0)
        .map(bullet => {
          let wrappedX = bullet.x;
          let wrappedY = bullet.y;
          
          if (bullet.x < 0) wrappedX = CANVAS_WIDTH;
          if (bullet.x > CANVAS_WIDTH) wrappedX = 0;
          if (bullet.y < 0) wrappedY = CANVAS_HEIGHT;
          if (bullet.y > CANVAS_HEIGHT) wrappedY = 0;
          
          return {
            ...bullet,
            x: wrappedX,
            y: wrappedY
          };
        })
    );

    // Update asteroids
    setAsteroids(prevAsteroids =>
      prevAsteroids.map(asteroid => {
        let newX = asteroid.x + asteroid.velocity.x;
        let newY = asteroid.y + asteroid.velocity.y;
        
        if (newX < 0) newX = CANVAS_WIDTH;
        if (newX > CANVAS_WIDTH) newX = 0;
        if (newY < 0) newY = CANVAS_HEIGHT;
        if (newY > CANVAS_HEIGHT) newY = 0;
        
        return {
          ...asteroid,
          x: newX,
          y: newY,
          angle: asteroid.angle + 0.02
        };
      })
    );

    // Check collisions
    setBullets(prevBullets => {
      setAsteroids(prevAsteroids => {
        let newAsteroids = [...prevAsteroids];
        let newBullets = [...prevBullets];
        let scoreIncrease = 0;

        for (let i = newBullets.length - 1; i >= 0; i--) {
          for (let j = newAsteroids.length - 1; j >= 0; j--) {
            const bullet = newBullets[i];
            const asteroid = newAsteroids[j];
            const dx = bullet.x - asteroid.x;
            const dy = bullet.y - asteroid.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < asteroid.size) {
              newBullets.splice(i, 1);
              const destroyedAsteroid = newAsteroids.splice(j, 1)[0];
              scoreIncrease += destroyedAsteroid.level * 20;

              if (destroyedAsteroid.level > 1) {
                for (let k = 0; k < 2; k++) {
                  newAsteroids.push({
                    x: destroyedAsteroid.x,
                    y: destroyedAsteroid.y,
                    velocity: {
                      x: (Math.random() - 0.5) * 3,
                      y: (Math.random() - 0.5) * 3
                    },
                    angle: Math.random() * Math.PI * 2,
                    size: destroyedAsteroid.size / 2,
                    level: destroyedAsteroid.level - 1
                  });
                }
              }
              break;
            }
          }
        }

        if (scoreIncrease > 0) {
          setScore(prev => prev + scoreIncrease);
        }

        return newAsteroids;
      });
      
      return prevBullets;
    });

  }, [gameStarted, gameOver, keys, ship]);

  useEffect(() => {
    const gameLoop = setInterval(updateGame, 1000 / 60);
    return () => clearInterval(gameLoop);
  }, [updateGame]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (!gameStarted) return;

    // Draw ship
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ship.size, 0);
    ctx.lineTo(-ship.size, -ship.size / 2);
    ctx.lineTo(-ship.size / 2, 0);
    ctx.lineTo(-ship.size, ship.size / 2);
    ctx.closePath();
    ctx.stroke();

    if (ship.thrust) {
      ctx.strokeStyle = '#ff0';
      ctx.beginPath();
      ctx.moveTo(-ship.size, -3);
      ctx.lineTo(-ship.size * 1.5, 0);
      ctx.lineTo(-ship.size, 3);
      ctx.stroke();
    }
    ctx.restore();

    // Draw asteroids
    asteroids.forEach(asteroid => {
      ctx.save();
      ctx.translate(asteroid.x, asteroid.y);
      ctx.rotate(asteroid.angle);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, asteroid.size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    // Draw bullets
    bullets.forEach(bullet => {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [gameStarted, ship, asteroids, bullets]);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(animationFrame);
  }, [draw]);

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-white">
        <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
        <p className="text-xl mb-4">Final Score: {score}</p>
        <Button onClick={initializeGame} className="mb-4">
          Play Again
        </Button>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-white">
        <h2 className="text-4xl font-bold mb-4">Asteroids AI</h2>
        <p className="text-lg mb-4">Use arrow keys or WASD to move, spacebar to shoot</p>
        <Button onClick={initializeGame}>
          Start Game
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-4xl mb-4 text-white">
        <div>Score: {score}</div>
        <div>Lives: {lives}</div>
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border border-gray-600 bg-black"
      />
      <div className="mt-4 text-center text-gray-400">
        <p>Arrow Keys / WASD: Move • Spacebar: Shoot</p>
      </div>
    </div>
  );
};
