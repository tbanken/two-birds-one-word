import { useGame } from '../context/GameContext';

export function WinDots({ odplayerId }) {
  const { localSettings, roundWins } = useGame();

  return (
    <div className="flex gap-1">
      {Array.from({ length: localSettings.roundsToWin }).map((_, i) => (
        <div key={i} className={`win-dot ${i < (roundWins[odplayerId] || 0) ? 'win-dot-filled' : ''}`} />
      ))}
    </div>
  );
}
