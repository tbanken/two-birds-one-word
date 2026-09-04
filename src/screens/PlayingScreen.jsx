import { RoundWordsBanner } from '../components/RoundWordsBanner';
import { ScreenShell } from '../components/ScreenShell';
import { WinDots } from '../components/WinDots';
import { useGame } from '../context/GameContext';

function PlayingJudge() {
  const { gameState, timeLeft, activePlayers, submissions, actions } = useGame();

  return (
    <ScreenShell className="max-w-2xl p-6" style={{ transform: 'rotate(0.2deg)' }}>
      <div className="flex justify-between items-center mb-4 pt-8">
        <div>
          <p className="text-sm text-gray-500 font-hand">Judge View</p>
          <h2 className="font-sketch text-2xl">Round {gameState.roundNumber}</h2>
        </div>
        <div className={`font-sketch text-4xl ${timeLeft <= 10 ? 'text-red-600' : ''}`}>{timeLeft}s</div>
      </div>

      <div className="flex justify-center gap-3 mb-4 flex-wrap">
        {activePlayers.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2 tag-paper px-3 py-1" style={{ transform: `rotate(${i % 2 === 0 ? -0.4 : 0.4}deg)` }}>
            <span className="text-sm font-hand">{p.name}</span>
            <WinDots odplayerId={p.id} />
          </div>
        ))}
      </div>

      <RoundWordsBanner label={null} />

      <div className="hand-drawn-box p-4 mb-4 bg-white">
        <h3 className="font-hand mb-3">Submissions ({Object.keys(submissions).length}/{activePlayers.length})</h3>
        <div className="space-y-2">
          {activePlayers.map((p, i) => (
            <div key={p.id} className="flex justify-between tag-paper p-3" style={{ transform: `rotate(${i % 2 === 0 ? -0.2 : 0.3}deg)` }}>
              <span className="font-hand">{p.name}</span>
              <span className={`font-hand ${submissions[p.id] ? 'text-green-700' : 'text-gray-400'}`}>
                {submissions[p.id] ? 'Submitted' : 'Waiting...'}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3 font-hand">Round ends automatically when everyone submits.</p>
      </div>

      <button onClick={() => actions.endRound()} className="w-full btn-paper btn-dark py-3 rounded-sm font-hand">
        End Round & Judge
      </button>
    </ScreenShell>
  );
}

function PlayingPlayer() {
  const {
    gameState,
    timeLeft,
    playerId,
    isHost,
    hasSubmitted,
    submissions,
    activePlayers,
    inputWord,
    setInputWord,
    handleSubmitWord,
    actions
  } = useGame();

  return (
    <ScreenShell
      centered
      className="p-8 max-w-lg w-full"
      style={{ transform: 'rotate(-0.3deg)' }}
    >
      <div className="flex justify-between items-center mb-4 pt-8">
        <div>
          <p className="text-sm text-gray-500 font-hand">Round {gameState.roundNumber}{isHost ? ' · Host' : ''}</p>
          <h2 className="font-sketch text-2xl">Submit Your Word!</h2>
        </div>
        <div className={`font-sketch text-4xl ${timeLeft <= 10 ? 'text-red-600' : ''}`}>{timeLeft}s</div>
      </div>

      <div className="flex justify-center gap-2 mb-4">
        <span className="text-sm text-gray-500 font-hand">Your wins:</span>
        <WinDots odplayerId={playerId} />
      </div>

      <div className="words-banner rounded-sm p-6 mb-6 text-center" style={{ transform: 'rotate(0.2deg)' }}>
        <p className="text-sm text-gray-500 mb-2 font-hand">Find one word that connects:</p>
        <div className="flex items-center justify-center gap-4">
          <span className="font-sketch text-2xl">{gameState.words[0]}</span>
          <span className="font-hand text-lg text-gray-400">&</span>
          <span className="font-sketch text-2xl">{gameState.words[1]}</span>
        </div>
      </div>

      {hasSubmitted ? (
        <div className="text-center py-6 hand-drawn-box bg-white">
          <p className="font-sketch text-2xl text-green-700 mb-1">Submitted!</p>
          <p className="font-hand text-lg">"{submissions[playerId]}"</p>
          <p className="text-sm text-gray-500 mt-2 font-hand">
            {Object.keys(submissions).length}/{activePlayers.length} submitted — round continues when all are in
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Type your word..."
            value={inputWord}
            onChange={e => setInputWord(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmitWord()}
            className="w-full p-4 input-paper rounded-sm font-hand text-lg"
            maxLength={30}
          />
          <button onClick={handleSubmitWord} disabled={!inputWord.trim()} className="w-full btn-paper btn-dark py-4 rounded-sm font-hand text-lg">
            Submit
          </button>
        </div>
      )}

      {isHost && (
        <button onClick={() => actions.endRound()} className="w-full btn-paper mt-4 py-2 rounded-sm font-hand text-sm">
          End Round Early
        </button>
      )}
    </ScreenShell>
  );
}

export function PlayingScreen() {
  const { isJudge } = useGame();
  return isJudge ? <PlayingJudge /> : <PlayingPlayer />;
}
