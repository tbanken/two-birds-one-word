import { GameProvider, useGame } from './context/GameContext';
import { GameOverScreen } from './screens/GameOverScreen';
import { JudgingScreen } from './screens/JudgingScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { PlayingScreen } from './screens/PlayingScreen';
import { PreRoundScreen } from './screens/PreRoundScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { WaitingScreen } from './screens/WaitingScreen';

function GameRouter() {
  const { screen, gameState } = useGame();

  if (screen === 'lobby' || !gameState) return <LobbyScreen />;
  if (screen === 'waiting') return <WaitingScreen />;
  if (screen === 'preround') return <PreRoundScreen />;
  if (screen === 'playing') return <PlayingScreen />;
  if (screen === 'judging') return <JudgingScreen />;
  if (screen === 'results') return <ResultsScreen />;
  if (screen === 'gameover') return <GameOverScreen />;

  return null;
}

export default function App() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  );
}
