import React, { useState, useEffect, useCallback } from 'react';
import { useGameSocket } from './hooks/useGameSocket';

// Paper-style CSS
const paperStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Handlee&display=swap');
  
  .paper-bg {
    background-color: #f5f1e8;
    background-image: 
      linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
    background-size: 24px 24px;
  }
  
  .paper-card {
    background: linear-gradient(135deg, #fffef9 0%, #f9f6ee 50%, #f5f1e6 100%);
    box-shadow: 2px 3px 8px rgba(0,0,0,0.08), inset 0 0 60px rgba(255,255,255,0.3);
    border: 1px solid #e8e0d0;
    position: relative;
  }
  
  .paper-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E");
    opacity: 0.03;
    pointer-events: none;
    border-radius: inherit;
  }
  
  .hand-drawn-box {
    border: 2px solid #4a4a4a;
    border-radius: 2px;
    transform: rotate(-0.2deg);
    box-shadow: 1px 2px 0 rgba(0,0,0,0.1);
  }
  
  .hand-drawn-box-alt {
    border: 2px solid #4a4a4a;
    border-radius: 2px;
    transform: rotate(0.3deg);
    box-shadow: -1px 2px 0 rgba(0,0,0,0.1);
  }
  
  .pencil-line {
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, #5a5a5a 5%, #4a4a4a 50%, #5a5a5a 95%, transparent 100%);
    transform: rotate(-0.5deg);
  }
  
  .font-hand {
    font-family: 'Handlee', cursive;
  }
  
  .font-sketch {
    font-family: 'Handlee', cursive;
  }
  
  .btn-paper {
    background: linear-gradient(180deg, #fdfcf8 0%, #f0ebe0 100%);
    border: 2px solid #4a4a4a;
    box-shadow: 2px 2px 0 rgba(0,0,0,0.15);
    transition: all 0.1s ease;
    transform: rotate(-0.2deg);
  }
  
  .btn-paper:hover {
    transform: rotate(0deg) translateY(-1px);
    box-shadow: 3px 3px 0 rgba(0,0,0,0.15);
  }
  
  .btn-paper:active {
    transform: rotate(-0.1deg) translateY(1px);
    box-shadow: 1px 1px 0 rgba(0,0,0,0.15);
  }
  
  .btn-paper:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .btn-dark {
    background: linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 100%);
    color: #f5f1e8;
    border: 2px solid #2a2a2a;
  }
  
  .btn-accent {
    background: linear-gradient(180deg, #7c9885 0%, #5a7a63 100%);
    color: #f5f1e8;
    border: 2px solid #4a6a53;
  }
  
  .input-paper {
    background: #fffef9;
    border: 2px solid #4a4a4a;
    box-shadow: inset 1px 1px 3px rgba(0,0,0,0.05);
  }
  
  .input-paper:focus {
    outline: none;
    border-color: #2a2a2a;
    box-shadow: inset 1px 1px 3px rgba(0,0,0,0.05), 0 0 0 2px rgba(74,74,74,0.1);
  }
  
  .tag-paper {
    background: #f0ebe0;
    border: 1px solid #c9c2b4;
    transform: rotate(-0.5deg);
  }
  
  .tag-dark {
    background: #4a4a4a;
    color: #f5f1e8;
    border: 1px solid #3a3a3a;
  }
  
  .words-banner {
    background: linear-gradient(135deg, #f5f1e8 0%, #e8e0d0 100%);
    border: 2px solid #4a4a4a;
    position: relative;
  }
  
  .words-banner::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 20px;
    right: 20px;
    height: 4px;
    background: #4a4a4a;
  }
  
  .win-dot {
    width: 14px;
    height: 14px;
    border: 2px solid #4a4a4a;
    border-radius: 50%;
    background: #fffef9;
  }
  
  .win-dot-filled {
    background: #4a4a4a;
  }
  
  .connection-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  
  .notification {
    animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
  }
  
  @keyframes slideIn {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;

// Common words list (fallback)
const COMMON_WORDS = [
  'apple', 'beach', 'bread', 'chair', 'dance', 'dream', 'earth', 'flame', 'glass', 'grain',
  'grape', 'grass', 'heart', 'honey', 'house', 'juice', 'laugh', 'lemon', 'light', 'maple',
  'metal', 'money', 'moon', 'music', 'night', 'ocean', 'paint', 'paper', 'peace', 'phone',
  'piano', 'plant', 'queen', 'radio', 'river', 'salad', 'sheep', 'shell', 'shirt', 'sleep',
  'smile', 'smoke', 'snake', 'snow', 'space', 'spice', 'spine', 'sport', 'stage', 'stamp',
  'star', 'steam', 'steel', 'stone', 'storm', 'story', 'stove', 'sugar', 'table', 'taste',
  'tiger', 'toast', 'tower', 'train', 'treat', 'trend', 'tribe', 'truck', 'trust', 'truth',
  'urban', 'value', 'video', 'voice', 'waste', 'watch', 'water', 'whale', 'wheat', 'wheel',
  'white', 'whole', 'world', 'youth', 'angel', 'brain', 'brick', 'brush', 'candy', 'cards',
  'charm', 'chess', 'child', 'chips', 'city', 'cloud', 'clown', 'coach', 'coast', 'coral'
];

export default function TwoBirdsOneWord() {
  const { isConnected, playerId, gameState, error, timeLeft, actions } = useGameSocket();
  
  const [screen, setScreen] = useState('lobby');
  const [username, setUsername] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [inputWord, setInputWord] = useState('');
  const [isLoadingWords, setIsLoadingWords] = useState(false);
  const [localSettings, setLocalSettings] = useState({ roundLength: 30, roundsToWin: 3 });
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Inject styles
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = paperStyles;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  // Sync screen with game state
  useEffect(() => {
    if (gameState) {
      setScreen(gameState.state);
      if (gameState.settings) {
        setLocalSettings(gameState.settings);
      }
    }
  }, [gameState]);

  // Handle notifications from error (host left, etc.)
  useEffect(() => {
    if (error) {
      addNotification(error, 'error');
      
      // If it's a host left error, redirect to lobby after showing notification
      if (error.includes('host') && error.includes('left')) {
        setTimeout(() => {
          setScreen('lobby');
          setGameCode('');
          setUsername('');
        }, 2000);
      }
    }
  }, [error]);

  // Track player changes for notifications
  const prevPlayersRef = React.useRef([]);
  const prevPlayerCountRef = React.useRef(0);
  
  useEffect(() => {
    if (gameState?.players) {
      const prevPlayers = prevPlayersRef.current;
      const currentPlayers = gameState.players;
      const activeCurrent = currentPlayers.filter(p => !p.isHost);
      const activePrev = prevPlayers.filter(p => !p.isHost);
      
      // Check for players who left (only if we had players before)
      if (activePrev.length > 0) {
        activePrev.forEach(prev => {
          if (!activeCurrent.find(p => p.id === prev.id)) {
            addNotification(`${prev.name} left the game`, 'info');
          }
        });
      }
      
      // Check for new players who joined (only if we had players before to avoid initial load)
      if (prevPlayerCountRef.current > 0) {
        activeCurrent.forEach(curr => {
          if (!activePrev.find(p => p.id === curr.id)) {
            addNotification(`${curr.name} joined the game`, 'success');
          }
        });
      }
      
      prevPlayersRef.current = currentPlayers;
      prevPlayerCountRef.current = currentPlayers.length;
    }
  }, [gameState?.players]);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // Derived state
  const isHost = playerId && gameState?.hostId === playerId;
  const activePlayers = gameState?.players?.filter(p => !p.isHost) || [];
  const hasSubmitted = Boolean(gameState?.submissions?.[playerId]);
  const roundWins = gameState?.roundWins || {};
  const totalPoints = gameState?.totalPoints || {};
  const submissions = gameState?.submissions || {};
  const ratings = gameState?.ratings || {};
  const roundResults = gameState?.roundResults || [];

  // Auto-submit word when timer hits 0 (server has 500ms grace period)
  const prevTimeLeftRef = React.useRef(timeLeft);
  const hasAutoSubmittedRef = React.useRef(false);
  
  // Reset auto-submit flag when round starts
  useEffect(() => {
    if (gameState?.state === 'playing') {
      hasAutoSubmittedRef.current = false;
    }
  }, [gameState?.state]);
  
  // Watch for timer hitting 0
  useEffect(() => {
    const wasAboveZero = prevTimeLeftRef.current > 0;
    const isNowZero = timeLeft === 0;
    const isPlaying = gameState?.state === 'playing';
    const isPlayer = playerId && gameState?.hostId !== playerId;
    const hasWordTyped = inputWord.trim().length > 0;
    const notYetSubmitted = !gameState?.submissions?.[playerId];
    const hasNotAutoSubmitted = !hasAutoSubmittedRef.current;
    
    if (wasAboveZero && isNowZero && isPlaying && isPlayer && hasWordTyped && notYetSubmitted && hasNotAutoSubmitted) {
      console.log('Auto-submitting word on timer end:', inputWord.trim());
      hasAutoSubmittedRef.current = true;
      actions.submitWord(inputWord.trim());
      setInputWord('');
    }
    
    prevTimeLeftRef.current = timeLeft;
  }, [timeLeft, gameState?.state, gameState?.submissions, gameState?.hostId, playerId, inputWord, actions]);

  // Fetch words from Datamuse API (common words only)
  const fetchWords = async () => {
    setIsLoadingWords(true);
    try {
      const res = await fetch('https://api.datamuse.com/words?ml=thing&max=100&md=f');
      const data = await res.json();
      
      const goodWords = data
        .filter(w => {
          const freq = w.tags?.find(t => t.startsWith('f:'));
          const freqValue = freq ? parseFloat(freq.split(':')[1]) : 0;
          return w.word.length >= 4 && w.word.length <= 6 && freqValue > 10 && /^[a-z]+$/.test(w.word);
        })
        .map(w => w.word);
      
      if (goodWords.length >= 2) {
        const shuffled = goodWords.sort(() => Math.random() - 0.5);
        return [shuffled[0], shuffled[1]];
      }
      throw new Error('Not enough words');
    } catch {
      const shuffled = [...COMMON_WORDS].sort(() => Math.random() - 0.5);
      return [shuffled[0], shuffled[1]];
    } finally {
      setIsLoadingWords(false);
    }
  };

  const handleCreateGame = () => {
    if (!username.trim()) return;
    actions.createGame(username.trim());
  };

  const handleJoinGame = () => {
    if (!username.trim() || !gameCode) return;
    actions.joinGame(gameCode, username.trim());
  };

  const handleStartPreRound = async () => {
    const words = await fetchWords();
    actions.startPreRound(words[0], words[1]);
  };

  const handleRegenerateWords = async () => {
    const words = await fetchWords();
    actions.updateWords(words[0], words[1]);
  };

  const handleSubmitWord = () => {
    if (!inputWord.trim()) return;
    actions.submitWord(inputWord.trim());
    setInputWord('');
  };

  const getRate = (odplayerId, wordIdx) => {
    return ratings[odplayerId + '_' + wordIdx];
  };

  const handleRate = (odplayerId, wordIdx, value) => {
    actions.submitRating(odplayerId, wordIdx, value);
  };

  const handleSettingsChange = (roundLength, roundsToWin) => {
    setLocalSettings({ roundLength, roundsToWin });
    actions.updateSettings(roundLength, roundsToWin);
  };

  const handleResetGame = () => {
    actions.resetGame();
    setScreen('waiting');
  };

  const handleBackToLobby = () => {
    setScreen('lobby');
    setGameCode('');
    setUsername('');
    window.location.reload();
  };

  const handleLeaveGame = () => {
    handleBackToLobby();
  };

  // Components
  const WinDots = ({ odplayerId }) => (
    <div className="flex gap-1">
      {Array.from({ length: localSettings.roundsToWin }).map((_, i) => (
        <div key={i} className={`win-dot ${i < (roundWins[odplayerId] || 0) ? 'win-dot-filled' : ''}`} />
      ))}
    </div>
  );

  const LeaveButton = () => (
    <button 
      onClick={handleLeaveGame} 
      className="absolute top-4 left-4 btn-paper px-3 py-1 rounded-sm font-hand text-sm z-10"
    >
      ← Leave
    </button>
  );

  const ConnectionStatus = () => (
    <div className="fixed top-4 right-4 flex items-center gap-2 tag-paper px-3 py-1 z-50">
      <div className={`connection-dot ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="font-hand text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
    </div>
  );

  const Notifications = () => (
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

  const Scoreboard = ({ highlight }) => {
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
  };

  // SCREENS

  // Lobby
  if (screen === 'lobby' || !gameState) {
    return (
      <div className="min-h-screen paper-bg flex items-center justify-center p-4">
        <ConnectionStatus />
        <Notifications />
        <div className="paper-card rounded-sm p-8 max-w-md w-full relative" style={{ transform: 'rotate(-0.5deg)' }}>
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
        </div>
      </div>
    );
  }

  // Waiting - Host
  if (screen === 'waiting' && isHost) {
    return (
      <div className="min-h-screen paper-bg p-4">
        <ConnectionStatus />
        <Notifications />
        <div className="max-w-2xl mx-auto paper-card rounded-sm p-6 relative" style={{ transform: 'rotate(0.3deg)' }}>
          <LeaveButton />
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
            <h3 className="font-hand text-lg mb-3">Players ({activePlayers.length})</h3>
            {activePlayers.length === 0 ? (
              <p className="text-gray-400 text-center py-4 font-hand">Waiting for players to join...</p>
            ) : (
              <div className="space-y-2">
                {activePlayers.map((p, i) => (
                  <div key={p.id} className="flex justify-between tag-paper p-3" style={{ transform: `rotate(${i % 2 === 0 ? -0.3 : 0.4}deg)` }}>
                    <span className="font-hand">{p.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hand-drawn-box-alt p-4 mb-4 bg-white">
            <button onClick={() => setShowSettings(!showSettings)} className="flex justify-between w-full font-hand text-lg">
              <span>Settings</span>
              <span>{showSettings ? '−' : '+'}</span>
            </button>
            {showSettings ? (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-hand mb-2">Round Length: {localSettings.roundLength}s</label>
                  <input 
                    type="range" 
                    min="10" 
                    max="120" 
                    step="5" 
                    value={localSettings.roundLength} 
                    onChange={e => handleSettingsChange(Number(e.target.value), localSettings.roundsToWin)} 
                    className="w-full" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-hand mb-2">Rounds to Win: {localSettings.roundsToWin}</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(n => (
                      <button 
                        key={n} 
                        onClick={() => handleSettingsChange(localSettings.roundLength, n)} 
                        className={`flex-1 py-2 rounded-sm font-hand ${localSettings.roundsToWin === n ? 'btn-paper btn-dark' : 'btn-paper'}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2 font-hand">{localSettings.roundLength}s rounds, first to {localSettings.roundsToWin}</p>
            )}
          </div>

          <button 
            onClick={handleStartPreRound} 
            disabled={activePlayers.length < 2 || isLoadingWords} 
            className="w-full btn-paper btn-accent py-3 rounded-sm font-hand"
          >
            {isLoadingWords ? 'Loading...' : activePlayers.length < 2 ? 'Need at least 2 players' : 'Start Game'}
          </button>
        </div>
      </div>
    );
  }

  // Waiting - Player
  if (screen === 'waiting' && !isHost) {
    const host = gameState?.players?.find(p => p.isHost);
    return (
      <div className="min-h-screen paper-bg flex items-center justify-center p-4">
        <ConnectionStatus />
        <Notifications />
        <div className="paper-card rounded-sm p-8 max-w-md w-full text-center relative" style={{ transform: 'rotate(-0.4deg)' }}>
          <LeaveButton />
          <h2 className="font-sketch text-3xl mb-2 pt-6">You're In!</h2>
          <div className="pencil-line w-24 mx-auto mb-4"></div>
          <p className="text-gray-500 mb-6 font-hand text-lg">Waiting for {host?.name} to start...</p>
          <div className="hand-drawn-box p-4 bg-white">
            <div className="flex flex-wrap justify-center gap-2">
              {activePlayers.map((p, i) => (
                <span key={p.id} className={`px-3 py-1 font-hand ${p.id === playerId ? 'tag-dark' : 'tag-paper'}`} style={{ transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}>
                  {p.name}{p.id === playerId ? ' (you)' : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pre-round - Host
  if (screen === 'preround' && isHost) {
    return (
      <div className="min-h-screen paper-bg p-4">
        <ConnectionStatus />
        <Notifications />
        <div className="max-w-2xl mx-auto paper-card rounded-sm p-6 relative" style={{ transform: 'rotate(-0.2deg)' }}>
          <LeaveButton />
          <div className="flex justify-between items-start mb-4 pt-8">
            <div>
              <p className="text-sm text-gray-500 font-hand">Host View</p>
              <h2 className="font-sketch text-3xl">Round {gameState.roundNumber}</h2>
            </div>
            <div className="text-sm text-gray-500 text-right font-hand">
              <p>{localSettings.roundLength}s round</p>
              <p>First to {localSettings.roundsToWin}</p>
            </div>
          </div>

          <div className="flex justify-center gap-3 mb-6">
            {activePlayers.map((p, i) => (
              <div key={p.id} className="flex items-center gap-2 tag-paper px-3 py-2" style={{ transform: `rotate(${i % 2 === 0 ? -0.5 : 0.5}deg)` }}>
                <span className="text-sm font-hand">{p.name}</span>
                <WinDots odplayerId={p.id} />
              </div>
            ))}
          </div>

          <div className="words-banner rounded-sm p-8 mb-4 text-center" style={{ transform: 'rotate(0.2deg)' }}>
            <p className="text-sm text-gray-500 mb-3 font-hand">This Round's Words</p>
            <div className="flex items-center justify-center gap-6">
              <span className="font-sketch text-4xl">{gameState.words[0]}</span>
              <span className="font-hand text-2xl text-gray-400">&</span>
              <span className="font-sketch text-4xl">{gameState.words[1]}</span>
            </div>
          </div>

          <button onClick={handleRegenerateWords} disabled={isLoadingWords} className="w-full btn-paper py-3 rounded-sm font-hand mb-4">
            {isLoadingWords ? 'Loading...' : 'Generate Different Words'}
          </button>

          <button onClick={() => actions.startPlaying()} className="w-full btn-paper btn-accent py-4 rounded-sm font-hand text-lg">
            Start Round
          </button>
        </div>
      </div>
    );
  }

  // Pre-round - Player
  if (screen === 'preround' && !isHost) {
    const host = gameState?.players?.find(p => p.isHost);
    return (
      <div className="min-h-screen paper-bg flex items-center justify-center p-4">
        <ConnectionStatus />
        <Notifications />
        <div className="paper-card rounded-sm p-8 max-w-lg w-full text-center relative" style={{ transform: 'rotate(0.3deg)' }}>
          <LeaveButton />
          <p className="text-sm text-gray-500 font-hand mb-2 pt-6">Round {gameState.roundNumber}</p>
          <h2 className="font-sketch text-3xl mb-4">Get Ready!</h2>

          <div className="flex justify-center gap-2 mb-6">
            <span className="text-sm text-gray-500 font-hand">Your wins:</span>
            <WinDots odplayerId={playerId} />
          </div>

          <div className="words-banner rounded-sm p-6 mb-6" style={{ transform: 'rotate(-0.3deg)' }}>
            <p className="text-sm text-gray-500 mb-2 font-hand">This Round's Words</p>
            <div className="flex items-center justify-center gap-4">
              <span className="font-sketch text-3xl">{gameState.words[0]}</span>
              <span className="font-hand text-xl text-gray-400">&</span>
              <span className="font-sketch text-3xl">{gameState.words[1]}</span>
            </div>
          </div>

          <div className="hand-drawn-box p-4 bg-white">
            <p className="text-gray-500 font-hand">Waiting for {host?.name} to start...</p>
          </div>
        </div>
      </div>
    );
  }

  // Playing - Host
  if (screen === 'playing' && isHost) {
    return (
      <div className="min-h-screen paper-bg p-4">
        <ConnectionStatus />
        <Notifications />
        <div className="max-w-2xl mx-auto paper-card rounded-sm p-6 relative" style={{ transform: 'rotate(0.2deg)' }}>
          <LeaveButton />
          <div className="flex justify-between items-center mb-4 pt-8">
            <div>
              <p className="text-sm text-gray-500 font-hand">Host View</p>
              <h2 className="font-sketch text-2xl">Round {gameState.roundNumber}</h2>
            </div>
            <div className={`font-sketch text-4xl ${timeLeft <= 10 ? 'text-red-600' : ''}`}>{timeLeft}s</div>
          </div>

          <div className="flex justify-center gap-3 mb-4">
            {activePlayers.map((p, i) => (
              <div key={p.id} className="flex items-center gap-2 tag-paper px-3 py-1" style={{ transform: `rotate(${i % 2 === 0 ? -0.4 : 0.4}deg)` }}>
                <span className="text-sm font-hand">{p.name}</span>
                <WinDots odplayerId={p.id} />
              </div>
            ))}
          </div>

          <div className="words-banner rounded-sm p-6 mb-4 text-center" style={{ transform: 'rotate(-0.2deg)' }}>
            <div className="flex items-center justify-center gap-4">
              <span className="font-sketch text-3xl">{gameState.words[0]}</span>
              <span className="font-hand text-xl text-gray-400">&</span>
              <span className="font-sketch text-3xl">{gameState.words[1]}</span>
            </div>
          </div>

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
          </div>

          <button onClick={() => actions.endRound()} className="w-full btn-paper btn-dark py-3 rounded-sm font-hand">
            End Round & Judge
          </button>
        </div>
      </div>
    );
  }

  // Playing - Player
  if (screen === 'playing' && !isHost) {
    return (
      <div className="min-h-screen paper-bg flex items-center justify-center p-4">
        <ConnectionStatus />
        <Notifications />
        <div className="paper-card rounded-sm p-8 max-w-lg w-full relative" style={{ transform: 'rotate(-0.3deg)' }}>
          <LeaveButton />
          <div className="flex justify-between items-center mb-4 pt-8">
            <div>
              <p className="text-sm text-gray-500 font-hand">Round {gameState.roundNumber}</p>
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
        </div>
      </div>
    );
  }

  // Judging - Host
  if (screen === 'judging' && isHost) {
    const toJudge = activePlayers.filter(p => submissions[p.id]);
    const allRated = toJudge.every(p => getRate(p.id, 0) !== undefined && getRate(p.id, 1) !== undefined);
    
    const scores = toJudge
      .filter(p => getRate(p.id, 0) !== undefined && getRate(p.id, 1) !== undefined)
      .map(p => ({
        id: p.id,
        name: p.name,
        total: getRate(p.id, 0) + getRate(p.id, 1)
      }))
      .sort((a, b) => a.total - b.total);
    
    const hasTie = scores.length >= 2 && scores[0].total === scores[1].total;
    const tiedPlayers = hasTie ? scores.filter(s => s.total === scores[0].total) : [];

    return (
      <div className="min-h-screen paper-bg p-4">
        <ConnectionStatus />
        <Notifications />
        <div className="max-w-2xl mx-auto paper-card rounded-sm p-6 relative" style={{ transform: 'rotate(-0.2deg)' }}>
          <LeaveButton />
          <p className="text-sm text-gray-500 font-hand mb-2 pt-8">Host View</p>
          <h2 className="font-sketch text-3xl mb-4">Rate Submissions</h2>

          <div className="flex justify-center gap-3 mb-4">
            {activePlayers.map((p, i) => (
              <div key={p.id} className="flex items-center gap-2 tag-paper px-3 py-1" style={{ transform: `rotate(${i % 2 === 0 ? -0.3 : 0.3}deg)` }}>
                <span className="text-sm font-hand">{p.name}</span>
                <WinDots odplayerId={p.id} />
              </div>
            ))}
          </div>

          <div className="words-banner rounded-sm p-4 mb-6 text-center" style={{ transform: 'rotate(0.2deg)' }}>
            <p className="text-sm text-gray-500 mb-1 font-hand">Rate connections to:</p>
            <span className="font-sketch text-xl">{gameState.words[0]}</span>
            <span className="mx-3 text-gray-400 font-hand">&</span>
            <span className="font-sketch text-xl">{gameState.words[1]}</span>
          </div>

          {toJudge.length === 0 ? (
            <p className="text-center text-gray-500 py-8 font-hand">No submissions</p>
          ) : (
            <div className="space-y-6 mb-6">
              {toJudge.map((p, idx) => (
                <div key={p.id} className="hand-drawn-box p-4 bg-white" style={{ transform: `rotate(${idx % 2 === 0 ? -0.2 : 0.2}deg)` }}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-hand text-gray-600">{p.name}</span>
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
                {tiedPlayers.map(p => p.name).join(' & ')} tied at {tiedPlayers[0].total} pts
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
        </div>
      </div>
    );
  }

  // Judging - Player
  if (screen === 'judging' && !isHost) {
    const host = gameState?.players?.find(p => p.isHost);
    return (
      <div className="min-h-screen paper-bg flex items-center justify-center p-4">
        <ConnectionStatus />
        <Notifications />
        <div className="paper-card rounded-sm p-8 max-w-md w-full text-center relative" style={{ transform: 'rotate(0.3deg)' }}>
          <LeaveButton />
          <h2 className="font-sketch text-3xl mb-2 pt-6">Judging...</h2>
          <div className="pencil-line w-24 mx-auto mb-4"></div>
          <p className="text-gray-500 mb-4 font-hand">{host?.name} is rating submissions</p>
          
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
        </div>
      </div>
    );
  }

  // Results - Host
  if (screen === 'results' && isHost) {
    return (
      <div className="min-h-screen paper-bg p-4">
        <ConnectionStatus />
        <Notifications />
        <div className="max-w-2xl mx-auto paper-card rounded-sm p-6 relative" style={{ transform: 'rotate(-0.3deg)' }}>
          <LeaveButton />
          <p className="text-sm text-gray-500 font-hand mb-2 pt-8">Host View</p>
          <h2 className="font-sketch text-3xl mb-4">Round {gameState.roundNumber} Results</h2>

          {roundResults.length > 0 && (
            <div className="hand-drawn-box p-4 mb-4 bg-white text-center" style={{ transform: 'rotate(0.3deg)' }}>
              <p className="text-sm text-gray-500 font-hand">Round Winner</p>
              <p className="font-sketch text-2xl">{roundResults[0].name}</p>
              <p className="font-hand text-gray-600">"{roundResults[0].word}" — {roundResults[0].total} pts ({roundResults[0].r1}+{roundResults[0].r2})</p>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-hand text-lg mb-3">Round Scores</h3>
            <div className="hand-drawn-box-alt p-3 mb-3 text-center bg-white">
              <span className="font-sketch">{gameState.words[0]}</span>
              <span className="mx-2 text-gray-400 font-hand">&</span>
              <span className="font-sketch">{gameState.words[1]}</span>
            </div>
            <div className="space-y-2">
              {roundResults.map((r, i) => (
                <div key={r.id} className={`flex justify-between p-3 ${i === 0 ? 'hand-drawn-box bg-white' : 'tag-paper'}`} style={{ transform: `rotate(${i % 2 === 0 ? -0.2 : 0.3}deg)` }}>
                  <div className="flex items-center gap-3">
                    <span className="font-hand text-gray-400">#{i+1}</span>
                    <div>
                      <p className="font-hand">{r.name}</p>
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
          </div>

          <div className="mb-6">
            <Scoreboard />
          </div>

          <button onClick={handleStartPreRound} disabled={isLoadingWords} className="w-full btn-paper btn-accent py-3 rounded-sm font-hand text-lg">
            {isLoadingWords ? 'Loading...' : 'Next Round'}
          </button>
        </div>
      </div>
    );
  }

  // Results - Player
  if (screen === 'results' && !isHost) {
    const myResult = roundResults.find(r => r.id === playerId);
    const myRank = roundResults.findIndex(r => r.id === playerId) + 1;

    return (
      <div className="min-h-screen paper-bg flex items-center justify-center p-4">
        <ConnectionStatus />
        <Notifications />
        <div className="paper-card rounded-sm p-8 max-w-lg w-full relative" style={{ transform: 'rotate(0.2deg)' }}>
          <LeaveButton />
          <h2 className="font-sketch text-3xl text-center mb-2 pt-6">Round {gameState.roundNumber} Results</h2>
          <div className="pencil-line w-24 mx-auto mb-4"></div>

          {myRank === 1 && (
            <div className="hand-drawn-box p-4 mb-4 bg-white text-center" style={{ transform: 'rotate(-0.3deg)' }}>
              <p className="font-sketch text-2xl text-green-700">You won this round!</p>
            </div>
          )}

          {myResult && myRank !== 1 && (
            <div className="text-center p-4 tag-paper mb-4">
              <p className="text-sm text-gray-500 font-hand">You placed</p>
              <p className="font-sketch text-4xl">#{myRank}</p>
              <p className="font-hand text-gray-600">"{myResult.word}" — {myResult.total} pts</p>
            </div>
          )}

          <div className="mb-4">
            <h3 className="font-hand text-lg mb-2">Round Scores</h3>
            <div className="space-y-2">
              {roundResults.map((r, i) => (
                <div key={r.id} className={`flex justify-between p-3 ${r.id === playerId ? 'hand-drawn-box bg-white' : i === 0 ? 'hand-drawn-box-alt bg-white' : 'tag-paper'}`} style={{ transform: `rotate(${i % 2 === 0 ? -0.2 : 0.2}deg)` }}>
                  <div className="flex items-center gap-3">
                    <span className="font-hand text-gray-400">#{i+1}</span>
                    <div>
                      <span className="font-hand">{r.name}</span>
                      <p className="text-xs text-gray-500 font-hand">"{r.word}"</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-sketch text-lg">{r.total}</span>
                    <p className="text-xs text-gray-400 font-hand">{r.r1}+{r.r2}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Scoreboard highlight={playerId} />

          <p className="text-center text-gray-500 mt-4 text-sm font-hand">Waiting for next round...</p>
        </div>
      </div>
    );
  }

  // Game Over
  if (screen === 'gameover') {
    const isWinner = gameState?.winner?.id === playerId;
    return (
      <div className="min-h-screen paper-bg flex items-center justify-center p-4">
        <ConnectionStatus />
        <Notifications />
        <div className="paper-card rounded-sm p-8 max-w-lg w-full text-center relative" style={{ transform: 'rotate(-0.4deg)' }}>
          <LeaveButton />
          <h2 className="font-sketch text-4xl mb-2 pt-6">{isWinner ? 'You Win!' : 'Game Over'}</h2>
          <div className="pencil-line w-32 mx-auto mb-4"></div>
          <p className="font-hand text-xl text-gray-600 mb-6">
            {gameState?.winner?.name} wins the game!
          </p>

          <div className="hand-drawn-box p-4 mb-6 bg-white">
            <h3 className="font-hand text-lg mb-3">Final Standings</h3>
            <div className="space-y-2">
              {Object.entries(roundWins)
                .sort(([,a], [,b]) => b - a)
                .map(([id, wins], i) => {
                  const p = gameState?.players?.find(pl => pl.id === id);
                  return (
                    <div key={id} className="flex justify-between tag-paper p-2" style={{ transform: `rotate(${i % 2 === 0 ? -0.3 : 0.3}deg)` }}>
                      <span className="font-hand">{p?.name}</span>
                      <span className="font-sketch">{wins} {wins === 1 ? 'win' : 'wins'}</span>
                    </div>
                  );
                })}
            </div>
          </div>

          {isHost ? (
            <button onClick={handleResetGame} className="w-full btn-paper btn-dark py-3 rounded-sm font-hand text-lg">
              Play Again
            </button>
          ) : (
            <button onClick={handleBackToLobby} className="w-full btn-paper btn-dark py-3 rounded-sm font-hand text-lg">
              Back to Lobby
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}