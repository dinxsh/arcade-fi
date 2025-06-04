
import { Brain, Gamepad2, Target, Zap, Puzzle, Cpu, Sparkles, Grid3X3, Activity, Blocks, Rocket, Ghost, Bug, TreePine, Square } from 'lucide-react';
import { SnakeGame } from '@/components/games/SnakeGame';
import { TicTacToeGame } from '@/components/games/TicTacToeGame';
import { MemoryGame } from '@/components/games/MemoryGame';
import { ReflexGame } from '@/components/games/ReflexGame';
import { MazeGame } from '@/components/games/MazeGame';
import { PongAI } from '@/components/games/PongAI';
import { FlappyAI } from '@/components/games/FlappyAI';
import { BlockBreakerAI } from '@/components/games/BlockBreakerAI';
import { TetrisAI } from '@/components/games/TetrisAI';
import { SpaceInvadersAI } from '@/components/games/SpaceInvadersAI';
import { AsteroidsAI } from '@/components/games/AsteroidsAI';
import { PacManAI } from '@/components/games/PacManAI';
import { CentipedeAI } from '@/components/games/CentipedeAI';
import { FroggerAI } from '@/components/games/FroggerAI';
import { BreakoutAI } from '@/components/games/BreakoutAI';

export interface Game {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: any;
  component: any;
  aiFeatures: string[];
}

export const games: Game[] = [
  {
    id: 'snake-ai',
    title: 'Snake vs AI',
    description: 'Classic snake game with intelligent AI opponents that learn your patterns',
    category: 'Action AI',
    icon: Gamepad2,
    component: SnakeGame,
    aiFeatures: ['Smart AI opponents', 'Pattern recognition', 'Adaptive strategy']
  },
  {
    id: 'tictactoe-ai',
    title: 'AI Tic-Tac-Toe',
    description: 'Challenge an unbeatable AI using advanced minimax algorithms',
    category: 'Strategy AI',
    icon: Brain,
    component: TicTacToeGame,
    aiFeatures: ['Minimax algorithm', 'Perfect strategy', 'Difficulty levels']
  },
  {
    id: 'memory-ai',
    title: 'Memory Match AI',
    description: 'Test your memory against an AI that adapts to your skill level',
    category: 'Puzzle AI',
    icon: Puzzle,
    component: MemoryGame,
    aiFeatures: ['Adaptive difficulty', 'Memory patterns', 'Smart hints']
  },
  {
    id: 'reflex-trainer',
    title: 'Reflex Trainer',
    description: 'AI-powered reflex training that adjusts speed based on your performance',
    category: 'Action AI',
    icon: Zap,
    component: ReflexGame,
    aiFeatures: ['Performance tracking', 'Dynamic speed', 'Skill assessment']
  },
  {
    id: 'maze-runner',
    title: 'AI Maze Runner',
    description: 'Navigate procedurally generated mazes with AI pathfinding assistance',
    category: 'Puzzle AI',
    icon: Target,
    component: MazeGame,
    aiFeatures: ['Procedural generation', 'Pathfinding AI', 'Dynamic layouts']
  },
  {
    id: 'pong-ai',
    title: 'Pong AI',
    description: 'Classic Pong with AI that adapts its speed and strategy based on your skill',
    category: 'Action AI',
    icon: Activity,
    component: PongAI,
    aiFeatures: ['Adaptive AI speed', 'Predictive movement', 'Difficulty scaling']
  },
  {
    id: 'flappy-ai',
    title: 'Flappy AI',
    description: 'Flappy Bird with AI-generated obstacles and dynamic difficulty adjustment',
    category: 'Action AI',
    icon: Sparkles,
    component: FlappyAI,
    aiFeatures: ['Dynamic obstacles', 'Speed scaling', 'Performance tracking']
  },
  {
    id: 'block-breaker',
    title: 'Block Breaker AI',
    description: 'Break blocks with AI assistance and intelligent power-up generation',
    category: 'Action AI',
    icon: Grid3X3,
    component: BlockBreakerAI,
    aiFeatures: ['AI paddle assist', 'Smart power-ups', 'Adaptive physics']
  },
  {
    id: 'tetris-ai',
    title: 'Tetris AI',
    description: 'Classic Tetris with AI that can play perfectly or assist your moves',
    category: 'Puzzle AI',
    icon: Blocks,
    component: TetrisAI,
    aiFeatures: ['Perfect AI player', 'Move optimization', 'Strategic analysis']
  },
  {
    id: 'space-invaders',
    title: 'Space Invaders AI',
    description: 'Classic space shooter with intelligent alien formations and adaptive difficulty',
    category: 'Action AI',
    icon: Rocket,
    component: SpaceInvadersAI,
    aiFeatures: ['Smart alien AI', 'Formation patterns', 'Dynamic difficulty']
  },
  {
    id: 'asteroids-ai',
    title: 'Asteroids AI',
    description: 'Navigate through space destroying asteroids with AI-powered generation',
    category: 'Action AI',
    icon: Rocket,
    component: AsteroidsAI,
    aiFeatures: ['Procedural asteroids', 'Physics simulation', 'Smart spawning']
  },
  {
    id: 'pacman-ai',
    title: 'Pac-Man AI',
    description: 'Classic maze game with intelligent ghost AI that learns your patterns',
    category: 'Action AI',
    icon: Ghost,
    component: PacManAI,
    aiFeatures: ['Smart ghost AI', 'Pattern learning', 'Adaptive pursuit']
  },
  {
    id: 'centipede-ai',
    title: 'Centipede AI',
    description: 'Shoot the descending centipede with AI-powered movement and obstacles',
    category: 'Action AI',
    icon: Bug,
    component: CentipedeAI,
    aiFeatures: ['Dynamic movement', 'Adaptive speed', 'Smart obstacles']
  },
  {
    id: 'frogger-ai',
    title: 'Frogger AI',
    description: 'Cross roads and rivers with AI-generated traffic and water patterns',
    category: 'Action AI',
    icon: TreePine,
    component: FroggerAI,
    aiFeatures: ['Traffic patterns', 'Dynamic obstacles', 'Timing assistance']
  },
  {
    id: 'breakout-ai',
    title: 'Breakout AI',
    description: 'Enhanced brick breaker with AI physics and strategic brick placement',
    category: 'Action AI',
    icon: Square,
    component: BreakoutAI,
    aiFeatures: ['Physics AI', 'Strategic layouts', 'Adaptive difficulty']
  }
];
