import { RoundResultsList } from '../components/RoundResultsList';
import { RoundWordsBanner } from '../components/RoundWordsBanner';
import { Scoreboard } from '../components/Scoreboard';
import { ScreenShell } from '../components/ScreenShell';
import { useGame } from '../context/GameContext';

function ResultsHost() {
  const { gameState, roundResults, isLoadingWords, handleStartPreRound, actions } = useGame();
  const gameWon = Boolean(gameState.winner);

  return (
    <ScreenShell className="max-w-2xl p-6" style={{ transform: 'rotate(-0.3deg)' }}>
      <p className="text-sm text-gray-500 font-hand mb-2 pt-8">Host View</p>
      <h2 className="font-sketch text-3xl mb-4">Round {gameState.roundNumber} Results</h2>

      {roundResults.length > 0 && (
        <div className="hand-drawn-box p-4 mb-4 bg-white text-center" style={{ transform: 'rotate(0.3deg)' }}>
          <p className="text-sm text-gray-500 font-hand">Round Winner</p>
          <p className="font-sketch text-2xl">{roundResults[0].name}</p>
          <p className="font-hand text-gray-600">"{roundResults[0].word}" — {roundResults[0].total} pts ({roundResults[0].r1}+{roundResults[0].r2})</p>
          {gameWon && (
            <p className="font-sketch text-lg text-green-700 mt-2">{gameState.winner.name} wins the game!</p>
          )}
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-hand text-lg mb-3">Round Scores</h3>
        <RoundWordsBanner label={null} size="sm" />
        <RoundResultsList />
      </div>

      <div className="mb-6">
        <Scoreboard />
      </div>

      {gameWon ? (
        <button onClick={() => actions.showGameOver()} className="w-full btn-paper btn-accent py-3 rounded-sm font-hand text-lg">
          Final Standings
        </button>
      ) : (
        <button onClick={handleStartPreRound} disabled={isLoadingWords} className="w-full btn-paper btn-accent py-3 rounded-sm font-hand text-lg">
          {isLoadingWords ? 'Loading...' : 'Next Round'}
        </button>
      )}
    </ScreenShell>
  );
}

function ResultsPlayer() {
  const { gameState, roundResults, playerId, isJudge } = useGame();
  const myResult = roundResults.find(r => r.id === playerId);
  const myRank = roundResults.findIndex(r => r.id === playerId) + 1;
  const gameWon = Boolean(gameState.winner);

  return (
    <ScreenShell
      centered
      className="p-8 max-w-lg w-full"
      style={{ transform: 'rotate(0.2deg)' }}
    >
      <h2 className="font-sketch text-3xl text-center mb-2 pt-6">Round {gameState.roundNumber} Results</h2>
      <div className="pencil-line w-24 mx-auto mb-4"></div>

      <RoundWordsBanner label="The words were" size="sm" />

      {myRank === 1 && !isJudge && (
        <div className="hand-drawn-box p-4 mb-4 bg-white text-center" style={{ transform: 'rotate(-0.3deg)' }}>
          <p className="font-sketch text-2xl text-green-700">You won this round!</p>
        </div>
      )}

      {myResult && myRank !== 1 && (
        <div className="text-center p-4 tag-paper mb-4">
          <p className="text-sm text-gray-500 font-hand">You placed</p>
          <p className="font-sketch text-4xl">#{myRank}</p>
          <p className="font-hand text-gray-600">"{myResult.word}" — {myResult.total} pts</p>
        </div>
      )}

      {gameWon && (
        <div className="hand-drawn-box p-3 mb-4 bg-white text-center">
          <p className="font-sketch text-lg text-green-700">{gameState.winner.name} wins the game!</p>
        </div>
      )}

      <div className="mb-4">
        <h3 className="font-hand text-lg mb-2">Round Scores</h3>
        <RoundResultsList />
      </div>

      {!isJudge && <Scoreboard highlight={playerId} />}

      <p className="text-center text-gray-500 mt-4 text-sm font-hand">
        {gameWon ? 'Waiting for final standings...' : 'Waiting for next round...'}
      </p>
    </ScreenShell>
  );
}

export function ResultsScreen() {
  const { isHost } = useGame();
  return isHost ? <ResultsHost /> : <ResultsPlayer />;
}
