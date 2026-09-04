import { RoundWordsBanner } from '../components/RoundWordsBanner';
import { ScreenShell } from '../components/ScreenShell';
import { WinDots } from '../components/WinDots';
import { useGame } from '../context/GameContext';

function JudgingJudge() {
  const {
    gameState,
    activePlayers,
    submissions,
    judgeOrder,
    getAnonLabel,
    getRate,
    handleRate,
    actions
  } = useGame();

  const orderedIds = judgeOrder.length > 0
    ? judgeOrder
    : activePlayers.filter(p => submissions[p.id]).map(p => p.id);
  const toJudge = orderedIds
    .map(id => activePlayers.find(p => p.id === id))
    .filter(Boolean);

  const allRated = toJudge.every(p => getRate(p.id, 0) !== undefined && getRate(p.id, 1) !== undefined);

  const scores = toJudge
    .filter(p => getRate(p.id, 0) !== undefined && getRate(p.id, 1) !== undefined)
    .map(p => ({
      id: p.id,
      label: getAnonLabel(p.id),
      total: getRate(p.id, 0) + getRate(p.id, 1)
    }))
    .sort((a, b) => a.total - b.total);

  const hasTie = scores.length >= 2 && scores[0].total === scores[1].total;
  const tiedPlayers = hasTie ? scores.filter(s => s.total === scores[0].total) : [];

  return (
    <ScreenShell className="max-w-2xl p-6" style={{ transform: 'rotate(-0.2deg)' }}>
      <p className="text-sm text-gray-500 font-hand mb-2 pt-8">Judge View</p>
      <h2 className="font-sketch text-3xl mb-2">Rate Submissions</h2>
      <p className="text-sm text-gray-500 mb-4 font-hand">Names are hidden until results</p>

      <RoundWordsBanner label="Rate connections to:" size="sm" />

      {toJudge.length === 0 ? (
        <p className="text-center text-gray-500 py-8 font-hand">No submissions</p>
      ) : (
        <div className="space-y-6 mb-6">
          {toJudge.map((p, idx) => (
            <div key={p.id} className="hand-drawn-box p-4 bg-white" style={{ transform: `rotate(${idx % 2 === 0 ? -0.2 : 0.2}deg)` }}>
              <div className="flex justify-between items-center mb-4">
                <span className="font-hand text-gray-600">Entry {getAnonLabel(p.id)}</span>
                <span className="font-sketch text-xl">"{submissions[p.id]}"</span>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-500 mb-2 font-hand">
                  {gameState.words[0]} → {submissions[p.id]}
                </p>
                <div className="flex gap-2">
                  {[1,2,3].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleRate(p.id, 0, v)}
                      className={`flex-1 py-3 rounded-sm font-hand text-lg ${getRate(p.id, 0) === v ? 'btn-paper btn-dark' : 'btn-paper'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-500 mb-2 font-hand">
                  {gameState.words[1]} → {submissions[p.id]}
                </p>
                <div className="flex gap-2">
                  {[1,2,3].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleRate(p.id, 1, v)}
                      className={`flex-1 py-3 rounded-sm font-hand text-lg ${getRate(p.id, 1) === v ? 'btn-paper btn-dark' : 'btn-paper'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {getRate(p.id, 0) !== undefined && getRate(p.id, 1) !== undefined && (
                <div className="text-center tag-paper py-2 mt-3">
                  <span className="font-hand">Total: </span>
                  <span className="font-sketch text-lg">{getRate(p.id, 0) + getRate(p.id, 1)} pts</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-sm text-center text-gray-400 mb-4 font-hand">1 = Perfect, 3 = Poor. Lowest wins!</p>

      {hasTie && allRated && (
        <div className="hand-drawn-box bg-yellow-50 p-4 mb-4 text-center" style={{ transform: 'rotate(0.2deg)' }}>
          <p className="font-hand text-yellow-800 mb-2">Tie detected! Adjust scores so there's a clear winner.</p>
          <p className="font-sketch text-yellow-700">
            Entry {tiedPlayers.map(p => p.label).join(' & ')} tied at {tiedPlayers[0].total} pts
          </p>
        </div>
      )}

      <button
        onClick={() => actions.finishJudging()}
        disabled={!allRated || hasTie || toJudge.length === 0}
        className="w-full btn-paper btn-accent py-3 rounded-sm font-hand text-lg"
      >
        {!allRated ? 'Rate all submissions' : hasTie ? 'Break the tie first' : 'Reveal Results'}
      </button>
    </ScreenShell>
  );
}

function JudgingPlayer() {
  const { judge, playerId, hasSubmitted, submissions } = useGame();

  return (
    <ScreenShell
      centered
      className="p-8 max-w-md w-full text-center"
      style={{ transform: 'rotate(0.3deg)' }}
    >
      <h2 className="font-sketch text-3xl mb-2 pt-6">Judging...</h2>
      <div className="pencil-line w-24 mx-auto mb-4"></div>
      <p className="text-gray-500 mb-4 font-hand">{judge?.name} is rating submissions</p>

      <div className="flex justify-center gap-2 mb-4">
        <span className="text-sm text-gray-500 font-hand">Your wins:</span>
        <WinDots odplayerId={playerId} />
      </div>

      {hasSubmitted && (
        <div className="hand-drawn-box p-4 bg-white">
          <p className="text-sm text-gray-500 font-hand">Your word</p>
          <p className="font-sketch text-2xl">"{submissions[playerId]}"</p>
        </div>
      )}
    </ScreenShell>
  );
}

export function JudgingScreen() {
  const { isJudge } = useGame();
  return isJudge ? <JudgingJudge /> : <JudgingPlayer />;
}
