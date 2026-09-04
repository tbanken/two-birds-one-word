import { useGame } from '../context/GameContext';

export function RoundWordsBanner({ label = "This Round's Words", size = 'md' }) {
  const { gameState } = useGame();
  const textClass = size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-xl' : 'text-3xl';

  return (
    <div className="words-banner rounded-sm p-4 mb-4 text-center" style={{ transform: 'rotate(0.2deg)' }}>
      {label && <p className="text-sm text-gray-500 mb-2 font-hand">{label}</p>}
      <div className="flex items-center justify-center gap-4">
        <span className={`font-sketch ${textClass}`}>{gameState?.words?.[0]}</span>
        <span className="font-hand text-xl text-gray-400">&</span>
        <span className={`font-sketch ${textClass}`}>{gameState?.words?.[1]}</span>
      </div>
    </div>
  );
}
