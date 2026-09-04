import { useGame } from '../context/GameContext';
import { WinDots } from './WinDots';

export function Scoreboard({ highlight }) {
  const { activePlayers, roundWins, totalPoints, localSettings } = useGame();

  const playersWithWins = activePlayers.map(p => ({
    ...p,
    wins: roundWins[p.id] || 0,
    points: totalPoints[p.id] || 0
  })).sort((a, b) => b.wins - a.wins);

  return (
    <div className="hand-drawn-box bg-white p-4">
      <h3 className="font-sketch text-2xl text-center mb-3">Scoreboard (First to {localSettings.roundsToWin})</h3>
      {playersWithWins.length === 0 ? (
        <p className="text-center text-gray-500 font-hand">No players yet</p>
      ) : (
        <div className="space-y-2">
          {playersWithWins.map((p, i) => (
            <div key={p.id} className={`flex items-center justify-between p-3 ${highlight === p.id ? 'tag-paper' : 'bg-gray-50'}`} style={{ transform: `rotate(${(i % 2 === 0 ? -0.3 : 0.3)}deg)` }}>
              <div className="flex items-center gap-2">
                <span className="font-hand text-lg">{p.name}{highlight === p.id ? ' (you)' : ''}</span>
              </div>
              <div className="flex items-center gap-3">
                <WinDots odplayerId={p.id} />
                <div className="text-right">
                  <p className="font-sketch text-xl">{p.wins} {p.wins === 1 ? 'win' : 'wins'}</p>
                  <p className="text-xs text-gray-500 font-hand">{p.points} pts</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
