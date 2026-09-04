import { RoundResultsList } from '../components/RoundResultsList';
import { RoundWordsBanner } from '../components/RoundWordsBanner';
import { ScreenShell } from '../components/ScreenShell';
import { useGame } from '../context/GameContext';

export function GameOverScreen() {
  const {
    gameState,
    playerId,
    roundResults,
    roundWins,
    isHost,
    handleResetGame,
    handleBackToLobby
  } = useGame();

  const isWinner = gameState?.winner?.id === playerId;

  return (
    <ScreenShell
      centered
      className="p-8 max-w-lg w-full text-center"
      style={{ transform: 'rotate(-0.4deg)' }}
    >
      <h2 className="font-sketch text-4xl mb-2 pt-6">{isWinner ? 'You Win!' : 'Game Over'}</h2>
      <div className="pencil-line w-32 mx-auto mb-4"></div>
      <p className="font-hand text-xl text-gray-600 mb-6">
        {gameState?.winner?.name} wins the game!
      </p>

      {(gameState?.words?.[0] || roundResults.length > 0) && (
        <div className="mb-6 text-left">
          <h3 className="font-hand text-lg mb-2 text-center">Last Round</h3>
          <RoundWordsBanner label={null} size="sm" />
          {roundResults.length > 0 && <RoundResultsList />}
        </div>
      )}

      <div className="hand-drawn-box p-4 mb-6 bg-white">
        <h3 className="font-hand text-lg mb-3">Final Standings</h3>
        <div className="space-y-2">
          {Object.entries(roundWins)
            .sort(([,a], [,b]) => b - a)
            .map(([id, wins], i) => {
              const p = gameState?.players?.find(pl => pl.id === id);
              return (
                <div key={id} className="flex justify-between tag-paper p-2" style={{ transform: `rotate(${i % 2 === 0 ? -0.3 : 0.3}deg)` }}>
                  <span className="font-hand">{p?.name}</span>
                  <span className="font-sketch">{wins} {wins === 1 ? 'win' : 'wins'}</span>
                </div>
              );
            })}
        </div>
      </div>

      {isHost ? (
        <button onClick={handleResetGame} className="w-full btn-paper btn-dark py-3 rounded-sm font-hand text-lg">
          Play Again
        </button>
      ) : (
        <button onClick={handleBackToLobby} className="w-full btn-paper btn-dark py-3 rounded-sm font-hand text-lg">
          Back to Lobby
        </button>
      )}
    </ScreenShell>
  );
}
