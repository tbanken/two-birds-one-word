import { ScreenShell } from '../components/ScreenShell';
import { useGame } from '../context/GameContext';
import { WORD_MODES } from '../data/wordModes';

function WaitingHost() {
  const {
    gameState,
    actions,
    showSettings,
    setShowSettings,
    localSettings,
    wordMode,
    handleSettingsChange,
    handleStartPreRound,
    activePlayers,
    isLoadingWords
  } = useGame();

  return (
    <ScreenShell className="max-w-2xl p-6" style={{ transform: 'rotate(0.3deg)' }}>
      <div className="flex justify-between items-start mb-4 pt-8">
        <div>
          <p className="text-sm text-gray-500 font-hand">Host View</p>
          <h2 className="font-sketch text-3xl">Game Lobby</h2>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 font-hand">Code</p>
          <p className="font-sketch text-3xl tracking-wider">{gameState.code}</p>
        </div>
      </div>

      <div className="hand-drawn-box p-4 mb-4 bg-white">
        <h3 className="font-hand text-lg mb-3">Players ({gameState.players.length})</h3>
        <div className="space-y-2">
          {gameState.players.map((p, i) => (
            <div key={p.id} className="flex justify-between items-center tag-paper p-3" style={{ transform: `rotate(${i % 2 === 0 ? -0.3 : 0.4}deg)` }}>
              <span className="font-hand">
                {p.name}
                {p.isHost ? ' (host)' : ''}
                {p.id === gameState.judgeId ? ' · judge' : ''}
              </span>
              {p.id !== gameState.judgeId && (
                <button
                  onClick={() => actions.setJudge(p.id)}
                  className="btn-paper px-2 py-1 rounded-sm font-hand text-xs"
                >
                  Make Judge
                </button>
              )}
              {p.id === gameState.judgeId && (
                <span className="tag-dark px-2 py-1 font-hand text-xs">Judge</span>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3 font-hand">The judge rates submissions and does not submit a word.</p>
      </div>

      <div className="hand-drawn-box-alt p-4 mb-4 bg-white">
        <button onClick={() => setShowSettings(!showSettings)} className="flex justify-between w-full font-hand text-lg">
          <span>Settings</span>
          <span>{showSettings ? '−' : '+'}</span>
        </button>
        {showSettings ? (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-hand mb-2">Word Mode</label>
              <div className="flex gap-2">
                {Object.entries(WORD_MODES).map(([key, mode]) => (
                  <button
                    key={key}
                    onClick={() => handleSettingsChange(localSettings.roundLength, localSettings.roundsToWin, key)}
                    className={`flex-1 py-2 rounded-sm font-hand text-sm ${wordMode === key ? 'btn-paper btn-dark' : 'btn-paper'}`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2 font-hand">{WORD_MODES[wordMode]?.description}</p>
            </div>
            <div>
              <label className="block text-sm font-hand mb-2">Round Length: {localSettings.roundLength}s</label>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={localSettings.roundLength}
                onChange={e => handleSettingsChange(Number(e.target.value), localSettings.roundsToWin, wordMode)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-hand mb-2">Rounds to Win: {localSettings.roundsToWin}</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n}
                    onClick={() => handleSettingsChange(localSettings.roundLength, n, wordMode)}
                    className={`flex-1 py-2 rounded-sm font-hand ${localSettings.roundsToWin === n ? 'btn-paper btn-dark' : 'btn-paper'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-2 font-hand">
            {WORD_MODES[wordMode]?.label} words · {localSettings.roundLength}s rounds · first to {localSettings.roundsToWin}
          </p>
        )}
      </div>

      <button
        onClick={handleStartPreRound}
        disabled={activePlayers.length < 2 || isLoadingWords}
        className="w-full btn-paper btn-accent py-3 rounded-sm font-hand"
      >
        {isLoadingWords ? 'Loading...' : activePlayers.length < 2 ? 'Need at least 2 players (besides judge)' : 'Start Game'}
      </button>
    </ScreenShell>
  );
}

function WaitingPlayer() {
  const { gameState, isJudge, playerId } = useGame();

  return (
    <ScreenShell
      centered
      className="p-8 max-w-md w-full text-center"
      style={{ transform: 'rotate(-0.4deg)' }}
    >
      <h2 className="font-sketch text-3xl mb-2 pt-6">You're In!</h2>
      <div className="pencil-line w-24 mx-auto mb-4"></div>
      <p className="text-gray-500 mb-2 font-hand text-lg">Waiting for host to start...</p>
      {isJudge && (
        <p className="text-gray-600 mb-4 font-hand">You're the judge this game</p>
      )}
      <div className="hand-drawn-box p-4 bg-white">
        <div className="flex flex-wrap justify-center gap-2">
          {gameState.players.map((p, i) => (
            <span key={p.id} className={`px-3 py-1 font-hand ${p.id === playerId ? 'tag-dark' : 'tag-paper'}`} style={{ transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}>
              {p.name}
              {p.id === playerId ? ' (you)' : ''}
              {p.id === gameState.judgeId ? ' · judge' : ''}
            </span>
          ))}
        </div>
      </div>
    </ScreenShell>
  );
}

export function WaitingScreen() {
  const { isHost } = useGame();
  return isHost ? <WaitingHost /> : <WaitingPlayer />;
}
