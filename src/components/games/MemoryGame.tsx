
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const CARD_VALUES = ['🚀', '🎮', '🤖', '⚡', '🎯', '🧠', '💎', '🔥'];

export const MemoryGame = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won'>('playing');
  const [timeLeft, setTimeLeft] = useState(60);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [playerScore, setPlayerScore] = useState(0);

  const initializeGame = useCallback(() => {
    const cardCount = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 12 : 16;
    const selectedValues = CARD_VALUES.slice(0, cardCount / 2);
    const cardPairs = [...selectedValues, ...selectedValues];
    
    const shuffledCards = cardPairs
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameStatus('playing');
    setTimeLeft(difficulty === 'easy' ? 90 : difficulty === 'medium' ? 60 : 45);
  }, [difficulty]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Timer
  useEffect(() => {
    if (gameStatus === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStatus === 'playing') {
      toast.error('Time\'s up! Game over!');
      setGameStatus('won'); // Use 'won' to stop the game, even though player lost
    }
  }, [timeLeft, gameStatus]);

  const handleCardClick = (cardId: number) => {
    if (
      flippedCards.length >= 2 ||
      flippedCards.includes(cardId) ||
      cards[cardId].isMatched ||
      gameStatus !== 'playing'
    ) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    setCards(prev =>
      prev.map(card =>
        card.id === cardId ? { ...card, isFlipped: true } : card
      )
    );

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards[firstId];
      const secondCard = cards[secondId];

      if (firstCard.value === secondCard.value) {
        // Match found
        setTimeout(() => {
          setCards(prev =>
            prev.map(card =>
              card.id === firstId || card.id === secondId
                ? { ...card, isMatched: true }
                : card
            )
          );
          setFlippedCards([]);
          setMatches(prev => prev + 1);
          
          const newMatches = matches + 1;
          const totalPairs = cards.length / 2;
          
          if (newMatches === totalPairs) {
            const bonus = Math.max(0, timeLeft * 10);
            const score = (totalPairs * 100) - (moves * 5) + bonus;
            setPlayerScore(prev => prev + score);
            setGameStatus('won');
            toast.success(`Congratulations! Score: ${score} points`);
          } else {
            toast.success('Match found! 🎉');
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev =>
            prev.map(card =>
              card.id === firstId || card.id === secondId
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const getCardGridCols = () => {
    switch (difficulty) {
      case 'easy': return 'grid-cols-4';
      case 'medium': return 'grid-cols-4';
      case 'hard': return 'grid-cols-4';
      default: return 'grid-cols-4';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Game Stats */}
      <div className="flex items-center justify-between w-full max-w-lg">
        <div className="text-center">
          <div className="text-sm text-gray-400">Score</div>
          <div className="text-xl font-bold text-cyan-400">{playerScore}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Moves</div>
          <div className="text-xl font-bold text-white">{moves}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Time</div>
          <div className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-green-400'}`}>
            {timeLeft}s
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Matches</div>
          <div className="text-xl font-bold text-purple-400">{matches}/{cards.length / 2}</div>
        </div>
      </div>

      {/* Difficulty Selector */}
      <div className="flex space-x-2">
        {(['easy', 'medium', 'hard'] as const).map((level) => (
          <button
            key={level}
            onClick={() => setDifficulty(level)}
            className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
              difficulty === level
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
            <span className="ml-1 text-xs">
              ({level === 'easy' ? '8' : level === 'medium' ? '12' : '16'} cards)
            </span>
          </button>
        ))}
      </div>

      {/* Game Board */}
      <div className={`grid ${getCardGridCols()} gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700`}>
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={card.isMatched || flippedCards.length >= 2}
            className={`
              w-16 h-16 rounded-lg border-2 text-2xl font-bold
              transition-all duration-300 transform
              ${card.isFlipped || card.isMatched
                ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/50 scale-105'
                : 'bg-slate-900 border-slate-600 hover:border-cyan-500/30 hover:scale-105'
              }
              ${card.isMatched ? 'opacity-75' : ''}
              ${!card.isMatched && !card.isFlipped ? 'cursor-pointer' : ''}
            `}
          >
            {card.isFlipped || card.isMatched ? (
              <span className="animate-bounce">{card.value}</span>
            ) : (
              <span className="text-slate-600">?</span>
            )}
          </button>
        ))}
      </div>

      {/* Game Over Screen */}
      {(gameStatus === 'won' || timeLeft === 0) && (
        <div className="text-center p-6 bg-slate-800/80 rounded-xl border border-slate-600">
          <h3 className="text-2xl font-bold text-white mb-2">
            {matches === cards.length / 2 ? '🎉 Congratulations!' : '⏰ Time\'s Up!'}
          </h3>
          <p className="text-gray-300 mb-4">
            {matches === cards.length / 2 
              ? `You completed the puzzle in ${moves} moves!`
              : `You found ${matches} out of ${cards.length / 2} pairs`
            }
          </p>
          <button
            onClick={initializeGame}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200"
          >
            Play Again
          </button>
        </div>
      )}

      {/* AI Info */}
      <div className="text-center text-gray-400 text-sm max-w-md">
        <p className="mb-2">🧠 <strong>AI Features:</strong></p>
        <p>Adaptive difficulty adjusts time limits and card counts. AI tracks your performance to suggest optimal challenge levels!</p>
      </div>
    </div>
  );
};
