import { ScreenShell } from '../components/ScreenShell';
import { useGame } from '../context/GameContext';

export function LobbyScreen() {
  const {
    isConnected,
    username,
    setUsername,
    gameCode,
    setGameCode,
    isJoining,
    setIsJoining,
    handleCreateGame,
    handleJoinGame
  } = useGame();

  return (
    <ScreenShell
      centered
      showLeave={false}
      className="p-8 max-w-md w-full"
      style={{ transform: 'rotate(-0.5deg)' }}
    >
      {isJoining && (
        <button
          onClick={() => setIsJoining(false)}
          className="absolute top-4 left-4 btn-paper px-3 py-1 rounded-sm font-hand text-sm"
        >
          ← Back
        </button>
      )}
      <h1 className="font-sketch text-5xl text-center mb-1 text-gray-800">Two Birds</h1>
      <h2 className="font-sketch text-3xl text-center mb-2 text-gray-600">One Word</h2>
      <div className="pencil-line w-32 mx-auto mb-4"></div>
      <p className="text-gray-500 text-center mb-6 font-hand text-lg">Find one word that connects two random words</p>

      <input
        type="text"
        placeholder="Your name..."
        value={username}
        onChange={e => setUsername(e.target.value)}
        className="w-full p-3 input-paper rounded-sm mb-4 font-hand text-lg"
        maxLength={20}
      />

      {!isJoining ? (
        <div className="space-y-3">
          <button
            onClick={handleCreateGame}
            disabled={!username.trim() || !isConnected}
            className="w-full btn-paper btn-dark py-3 rounded-sm font-hand text-lg"
          >
            Host a Game
          </button>
          <button
            onClick={() => setIsJoining(true)}
            disabled={!username.trim() || !isConnected}
            className="w-full btn-paper py-3 rounded-sm font-hand text-lg"
          >
            Join as Player
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Game code..."
            value={gameCode}
            onChange={e => setGameCode(e.target.value.toUpperCase())}
            className="w-full p-3 input-paper rounded-sm text-center text-xl tracking-widest font-hand"
            maxLength={6}
          />
          <button
            onClick={handleJoinGame}
            disabled={!username.trim() || gameCode.length < 4 || !isConnected}
            className="w-full btn-paper btn-dark py-3 rounded-sm font-hand text-lg"
          >
            Join
          </button>
        </div>
      )}
    </ScreenShell>
  );
}
