import { useGame } from '../context/GameContext';

export function ConnectionStatus() {
  const { isConnected } = useGame();

  return (
    <div className="fixed top-4 right-4 flex items-center gap-2 tag-paper px-3 py-1 z-50">
      <div className={`connection-dot ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="font-hand text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
    </div>
  );
}

export function Notifications() {
  const { notifications } = useGame();

  return (
    <div className="fixed top-16 right-4 space-y-2 z-50">
      {notifications.map(n => (
        <div
          key={n.id}
          className={`notification hand-drawn-box px-4 py-2 ${
            n.type === 'error' ? 'bg-red-100' :
            n.type === 'success' ? 'bg-green-100' : 'bg-blue-100'
          }`}
        >
          <span className={`font-hand ${
            n.type === 'error' ? 'text-red-700' :
            n.type === 'success' ? 'text-green-700' : 'text-blue-700'
          }`}>{n.message}</span>
        </div>
      ))}
    </div>
  );
}

export function LeaveButton() {
  const { handleLeaveGame } = useGame();

  return (
    <button
      onClick={handleLeaveGame}
      className="absolute top-4 left-4 btn-paper px-3 py-1 rounded-sm font-hand text-sm z-10"
    >
      ← Leave
    </button>
  );
}

export function ScreenShell({
  centered = false,
  showLeave = true,
  className = '',
  style,
  children
}) {
  return (
    <div className={`min-h-screen paper-bg p-4 ${centered ? 'flex items-center justify-center' : ''}`}>
      <ConnectionStatus />
      <Notifications />
      <div
        className={`paper-card rounded-sm relative ${centered ? 'w-full' : 'mx-auto'} ${className}`}
        style={style}
      >
        {showLeave && <LeaveButton />}
        {children}
      </div>
    </div>
  );
}
