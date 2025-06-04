
import { GameCard } from './GameCard';
import { games } from '@/lib/gamesList';
import { useNavigate } from 'react-router-dom';

export const GameGrid = () => {
  const navigate = useNavigate();

  const handleGameSelect = (gameId: string) => {
    navigate(`/game/${gameId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {games.map((game) => (
        <GameCard 
          key={game.id} 
          game={game} 
          onClick={() => handleGameSelect(game.id)} 
        />
      ))}
    </div>
  );
};
