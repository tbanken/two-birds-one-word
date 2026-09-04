import { useGame } from '../context/GameContext';

export function RoundResultsList() {
  const { roundResults, playerId } = useGame();

  return (
    <div className="space-y-2">
      {roundResults.map((r, i) => (
        <div key={r.id} className={`flex justify-between p-3 ${i === 0 ? 'hand-drawn-box bg-white' : 'tag-paper'}`} style={{ transform: `rotate(${i % 2 === 0 ? -0.2 : 0.3}deg)` }}>
          <div className="flex items-center gap-3">
            <span className="font-hand text-gray-400">#{i+1}</span>
            <div>
              <p className="font-hand">{r.name}{r.id === playerId ? ' (you)' : ''}</p>
              <p className="text-sm text-gray-500 font-hand">"{r.word}"</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-sketch text-xl">{r.total}</p>
            <p className="text-xs text-gray-400 font-hand">{r.r1}+{r.r2}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
