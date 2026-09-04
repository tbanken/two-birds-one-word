import { ScreenShell } from '../components/ScreenShell';
import { WinDots } from '../components/WinDots';
import { useGame } from '../context/GameContext';
import { WORD_MODES } from '../data/wordModes';

function PreRoundHost() {
  const {
    gameState,
    wordMode,
    localSettings,
    judge,
    activePlayers,
    isLoadingWords,
    handleRegenerateWords,
    actions
  } = useGame();

  return (
    <ScreenShell className="max-w-2xl p-6" style={{ transform: 'rotate(-0.2deg)' }}>
      <div className="flex justify-between items-start mb-4 pt-8">
        <div>
          <p className="text-sm text-gray-500 font-hand">Host View · {WORD_MODES[wordMode]?.label}</p>
          <h2 className="font-sketch text-3xl">Round {gameState.roundNumber}</h2>
        </div>
        <div className="text-sm text-gray-500 text-right font-hand">
          <p>{localSettings.roundLength}s round</p>
          <p>First to {localSettings.roundsToWin}</p>
          <p>Judge: {judge?.name}</p>
        </div>
      </div>

      <div className="flex justify-center gap-3 mb-6 flex-wrap">
        {activePlayers.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2 tag-paper px-3 py-2" style={{ transform: `rotate(${i % 2 === 0 ? -0.5 : 0.5}deg)` }}>
            <span className="text-sm font-hand">{p.name}</span>
            <WinDots odplayerId={p.id} />
          </div>
        ))}
      </div>

      <div className="words-banner rounded-sm p-8 mb-4 text-center" style={{ transform: 'rotate(0.2deg)' }}>
        <p className="text-sm text-gray-500 mb-3 font-hand">This Round's Words</p>
        <div className="flex items-center justify-center gap-6">
          <span className="font-sketch text-4xl">{gameState.words[0]}</span>
          <span className="font-hand text-2xl text-gray-400">&</span>
          <span className="font-sketch text-4xl">{gameState.words[1]}</span>
        </div>
      </div>

      <button onClick={handleRegenerateWords} disabled={isLoadingWords} className="w-full btn-paper py-3 rounded-sm font-hand mb-4">
        {isLoadingWords ? 'Loading...' : 'Generate Different Words'}
      </button>

      <button onClick={() => actions.startPlaying()} className="w-full btn-paper btn-accent py-4 rounded-sm font-hand text-lg">
        Start Round
      </button>
    </ScreenShell>
  );
}

function PreRoundPlayer() {
  const { gameState, isJudge, playerId } = useGame();

  return (
    <ScreenShell
      centered
      className="p-8 max-w-lg w-full text-center"
      style={{ transform: 'rotate(0.3deg)' }}
    >
      <p className="text-sm text-gray-500 font-hand mb-2 pt-6">Round {gameState.roundNumber}</p>
      <h2 className="font-sketch text-3xl mb-4">{isJudge ? 'Get Ready to Judge!' : 'Get Ready!'}</h2>

      {!isJudge && (
        <div className="flex justify-center gap-2 mb-6">
          <span className="text-sm text-gray-500 font-hand">Your wins:</span>
          <WinDots odplayerId={playerId} />
        </div>
      )}

      <div className="words-banner rounded-sm p-6 mb-6" style={{ transform: 'rotate(-0.3deg)' }}>
        <p className="text-sm text-gray-500 mb-2 font-hand">This Round's Words</p>
        <div className="flex items-center justify-center gap-4">
          <span className="font-sketch text-3xl">{gameState.words[0]}</span>
          <span className="font-hand text-xl text-gray-400">&</span>
          <span className="font-sketch text-3xl">{gameState.words[1]}</span>
        </div>
      </div>

      <div className="hand-drawn-box p-4 bg-white">
        <p className="text-gray-500 font-hand">Waiting for host to start...</p>
      </div>
    </ScreenShell>
  );
}

export function PreRoundScreen() {
  const { isHost } = useGame();
  return isHost ? <PreRoundHost /> : <PreRoundPlayer />;
}
