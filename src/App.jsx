import React, { useState, useEffect } from 'react';

const BOT_WORDS = ['bridge', 'connection', 'balance', 'harmony', 'nature', 'force', 'energy', 'space', 'time', 'water', 'air', 'earth', 'spirit', 'wave', 'flow'];

export default function TwoBirdsOneWord() {
  // Game config
  const [roundLength, setRoundLength] = useState(30);
  const [roundsToWin, setRoundsToWin] = useState(3);
  const [showSettings, setShowSettings] = useState(false);
  
  // Game state
  const [screen, setScreen] = useState('lobby'); // lobby, waiting, preround, playing, judging, results, gameover
  const [gameCode, setGameCode] = useState('');
  const [username, setUsername] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isLoadingWords, setIsLoadingWords] = useState(false);
  
  // Players
  const [players, setPlayers] = useState([]);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [hostId, setHostId] = useState(null);
  
  // Round state
  const [roundNumber, setRoundNumber] = useState(0);
  const [word1, setWord1] = useState('');
  const [word2, setWord2] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [submissions, setSubmissions] = useState({});
  const [inputWord, setInputWord] = useState('');
  
  // Ratings - flat structure: { vistorid_0: 3, playerId_1: 2 }
  const [ratings, setRatings] = useState({});
  
  // Scores
  const [roundWins, setRoundWins] = useState({});
  const [totalPoints, setTotalPoints] = useState({});
  const [roundResults, setRoundResults] = useState([]);
  const [winner, setWinner] = useState(null);

  // Timer
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) {
      if (timerActive && timeLeft <= 0) {
        setTimerActive(false);
        setScreen('judging');
      }
      return;
    }
    const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(t);
  }, [timerActive, timeLeft]);

  // Helpers
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const isHost = currentPlayer?.isHost;
  const activePlayers = players.filter(p => !p.isHost);
  const hasSubmitted = Boolean(submissions[currentPlayerId]);

  const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const fetchWords = async () => {
    setIsLoadingWords(true);
    try {
      const res = await fetch('https://random-word-api.herokuapp.com/word?number=2&length=5');
      const words = await res.json();
      setWord1(words[0]);
      setWord2(words[1]);
    } catch {
      const fallback = ['ocean', 'fire', 'dream', 'stone', 'cloud', 'river', 'flame', 'storm'];
      setWord1(fallback[Math.floor(Math.random() * fallback.length)]);
      setWord2(fallback[Math.floor(Math.random() * fallback.length)]);
    }
    setIsLoadingWords(false);
  };

  const createGame = () => {
    if (!username.trim()) return;
    const id = 'host_' + Date.now();
    const code = generateCode();
    setGameCode(code);
    setCurrentPlayerId(id);
    setHostId(id);
    setPlayers([{ id, name: username.trim(), isHost: true }]);
    setScreen('waiting');
  };

  const joinGame = () => {
    if (!username.trim()) return;
    const id = 'player_' + Date.now();
    setCurrentPlayerId(id);
    setPlayers(prev => [...prev, { id, name: username.trim(), isHost: false }]);
    setRoundWins(prev => ({ ...prev, [id]: 0 }));
    setScreen('waiting');
  };

  const addBot = () => {
    const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
    const used = players.map(p => p.name);
    const available = names.filter(n => !used.includes(n));
    if (!available.length) return;
    const id = 'bot_' + Date.now();
    setPlayers(prev => [...prev, { id, name: available[0], isHost: false, isBot: true }]);
    setRoundWins(prev => ({ ...prev, [id]: 0 }));
  };

  const startPreRound = async () => {
    await fetchWords();
    setSubmissions({});
    setRatings({});
    setInputWord('');
    setRoundNumber(prev => prev + 1);
    
    // Initialize roundWins for all players if not set
    const newRoundWins = { ...roundWins };
    activePlayers.forEach(p => {
      if (newRoundWins[p.id] === undefined) {
        newRoundWins[p.id] = 0;
      }
    });
    setRoundWins(newRoundWins);
    
    setScreen('preround');
  };

  const startPlaying = () => {
    setTimeLeft(roundLength);
    setTimerActive(true);
    setScreen('playing');
    
    // Bot submissions
    players.filter(p => p.isBot).forEach(bot => {
      setTimeout(() => {
        setSubmissions(prev => ({
          ...prev,
          [bot.id]: BOT_WORDS[Math.floor(Math.random() * BOT_WORDS.length)]
        }));
      }, Math.random() * (roundLength * 500) + 2000);
    });
  };

  const submitWord = () => {
    if (!inputWord.trim()) return;
    setSubmissions(prev => ({ ...prev, [currentPlayerId]: inputWord.trim().toLowerCase() }));
    setInputWord('');
  };

  const endRoundEarly = () => {
    setTimerActive(false);
    setScreen('judging');
  };

  const handleRate = (playerId, wordIdx, value) => {
    const key = playerId + '_' + wordIdx;
    setRatings(prev => ({ ...prev, [key]: value }));
  };

  const getRate = (playerId, wordIdx) => {
    return ratings[playerId + '_' + wordIdx];
  };

  const finishJudging = () => {
    const results = activePlayers
      .filter(p => submissions[p.id] && getRate(p.id, 0) !== undefined && getRate(p.id, 1) !== undefined)
      .map(p => ({
        id: p.id,
        name: p.name,
        word: submissions[p.id],
        r1: getRate(p.id, 0),
        r2: getRate(p.id, 1),
        total: getRate(p.id, 0) + getRate(p.id, 1)
      }))
      .sort((a, b) => a.total - b.total);

    setRoundResults(results);

    // Update points
    const newPoints = { ...totalPoints };
    results.forEach(r => {
      newPoints[r.id] = (newPoints[r.id] || 0) + r.total;
    });
    setTotalPoints(newPoints);

    // Round winner
    if (results.length > 0) {
      const winnerId = results[0].id;
      const newWins = { ...roundWins, [winnerId]: (roundWins[winnerId] || 0) + 1 };
      setRoundWins(newWins);

      if (newWins[winnerId] >= roundsToWin) {
        setWinner(players.find(p => p.id === winnerId));
        setScreen('gameover');
        return;
      }
    }
    setScreen('results');
  };

  const resetGame = () => {
    setScreen('lobby');
    setPlayers([]);
    setCurrentPlayerId(null);
    setHostId(null);
    setRoundWins({});
    setTotalPoints({});
    setRoundNumber(0);
    setWinner(null);
    setGameCode('');
    setUsername('');
    setSubmissions({});
    setRatings({});
    setRoundResults([]);
    setWord1('');
    setWord2('');
    setRoundLength(30);
    setRoundsToWin(3);
  };

  // Render helpers
  const WinDots = ({ playerId }) => (
    <div className="flex gap-1">
      {Array.from({ length: roundsToWin }).map((_, i) => (
        <div key={i} className={`w-3 h-3 rounded-full ${i < (roundWins[playerId] || 0) ? 'bg-green-500' : 'bg-slate-300'}`} />
      ))}
    </div>
  );

  const Scoreboard = ({ highlight }) => {
    // Get all active players and ensure they have a roundWins entry
    const playersWithWins = activePlayers.map(p => ({
      ...p,
      wins: roundWins[p.id] || 0,
      points: totalPoints[p.id] || 0
    })).sort((a, b) => b.wins - a.wins);

    return (
      <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
        <h3 className="font-semibold text-center text-indigo-800 mb-3">🏆 Scoreboard (First to {roundsToWin})</h3>
        {playersWithWins.length === 0 ? (
          <p className="text-center text-slate-500 py-2">No players yet</p>
        ) : (
          <div className="space-y-2">
            {playersWithWins.map((p, i) => (
              <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg ${highlight === p.id ? 'bg-indigo-100 border border-indigo-300' : 'bg-white'}`}>
                <div className="flex items-center gap-2">
                  <span className="w-6 text-center">{i === 0 && p.wins > 0 ? '👑' : ''}</span>
                  <span className="font-medium">{p.name}{highlight === p.id ? ' (you)' : ''}</span>
                  {p.isBot && <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full">Bot</span>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {Array.from({ length: roundsToWin }).map((_, j) => (
                      <div key={j} className={`w-4 h-4 rounded-full ${j < p.wins ? 'bg-green-500' : 'bg-slate-300'}`} />
                    ))}
                  </div>
                  <div className="text-right min-w-24">
                    <p className="font-bold text-lg">{p.wins} {p.wins === 1 ? 'win' : 'wins'}</p>
                    <p className="text-xs text-slate-400">{p.points} total pts</p>
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
  if (screen === 'lobby') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-2">🐦 Two Birds One Word 🐦</h1>
          <p className="text-slate-500 text-center mb-6">Find one word that connects two random words!</p>
          
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full p-3 border-2 border-slate-200 rounded-lg mb-4"
            maxLength={20}
          />
          
          {!isJoining ? (
            <div className="space-y-3">
              <button onClick={createGame} disabled={!username.trim()} className="w-full bg-amber-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50">
                🎯 Host a Game
              </button>
              <button onClick={() => setIsJoining(true)} disabled={!username.trim()} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50">
                🎮 Join as Player
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Game code"
                value={gameCode}
                onChange={e => setGameCode(e.target.value.toUpperCase())}
                className="w-full p-3 border-2 border-slate-200 rounded-lg text-center text-xl tracking-widest"
                maxLength={6}
              />
              <button onClick={joinGame} disabled={!username.trim() || gameCode.length < 4} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50">
                Join
              </button>
              <button onClick={() => setIsJoining(false)} className="w-full text-slate-500 py-2">Back</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Waiting - Host
  if (screen === 'waiting' && isHost) {
    return (
      <div className="min-h-screen bg-amber-50 p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-amber-600 font-medium">HOST VIEW</p>
              <h2 className="text-2xl font-bold">Game Lobby</h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Code</p>
              <p className="text-3xl font-mono font-bold text-amber-600">{gameCode}</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <h3 className="font-semibold mb-3">Players ({activePlayers.length})</h3>
            {activePlayers.length === 0 ? (
              <p className="text-slate-400 text-center py-4">Waiting for players...</p>
            ) : (
              <div className="space-y-2">
                {activePlayers.map(p => (
                  <div key={p.id} className="flex justify-between bg-white p-3 rounded-lg border">
                    <span>{p.name}</span>
                    {p.isBot && <span className="bg-slate-200 text-xs px-2 py-1 rounded-full">Bot</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-amber-50 rounded-xl p-4 mb-4 border border-amber-200">
            <button onClick={() => setShowSettings(!showSettings)} className="flex justify-between w-full">
              <span className="font-semibold text-amber-800">⚙️ Settings</span>
              <span>{showSettings ? '▲' : '▼'}</span>
            </button>
            {showSettings ? (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Round Length: {roundLength}s</label>
                  <input type="range" min="10" max="120" step="5" value={roundLength} onChange={e => setRoundLength(Number(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Rounds to Win: {roundsToWin}</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setRoundsToWin(n)} className={`flex-1 py-2 rounded-lg font-semibold ${roundsToWin === n ? 'bg-amber-500 text-white' : 'bg-white border'}`}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-amber-700 mt-2">{roundLength}s rounds · First to {roundsToWin}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={addBot} className="flex-1 bg-slate-200 py-3 rounded-lg font-medium">+ Add Bot</button>
            <button onClick={startPreRound} disabled={activePlayers.length < 1 || isLoadingWords} className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50">
              {isLoadingWords ? 'Loading...' : 'Start Game'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Waiting - Player
  if (screen === 'waiting' && !isHost) {
    const host = players.find(p => p.isHost);
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">🎮</div>
          <h2 className="text-2xl font-bold mb-2">You're In!</h2>
          <p className="text-slate-500 mb-6">Waiting for <span className="font-semibold text-amber-600">{host?.name}</span> to start...</p>
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex flex-wrap justify-center gap-2">
              {activePlayers.map(p => (
                <span key={p.id} className={`px-3 py-1 rounded-full text-sm ${p.id === currentPlayerId ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>
                  {p.name}{p.id === currentPlayerId ? ' (you)' : ''}
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
      <div className="min-h-screen bg-amber-50 p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-amber-600 font-medium">HOST VIEW</p>
              <h2 className="text-2xl font-bold">Round {roundNumber}</h2>
            </div>
            <div className="text-sm text-slate-500 text-right">
              <p>{roundLength}s round</p>
              <p>First to {roundsToWin}</p>
            </div>
          </div>

          <div className="flex justify-center gap-3 mb-6">
            {activePlayers.filter(p => !p.isBot).map(p => (
              <div key={p.id} className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-full">
                <span className="text-sm font-medium">{p.name}</span>
                <WinDots playerId={p.id} />
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-8 mb-4 text-center text-white">
            <p className="text-sm opacity-80 mb-3">This Round's Words</p>
            <div className="flex items-center justify-center gap-6">
              <span className="text-4xl font-bold">{word1}</span>
              <span className="text-3xl opacity-60">&</span>
              <span className="text-4xl font-bold">{word2}</span>
            </div>
          </div>

          <button onClick={fetchWords} disabled={isLoadingWords} className="w-full bg-slate-200 py-3 rounded-lg font-medium mb-4">
            {isLoadingWords ? 'Loading...' : '🎲 Generate Different Words'}
          </button>

          <button onClick={startPlaying} className="w-full bg-green-500 text-white py-4 rounded-lg font-bold text-lg">
            ▶️ Start Round
          </button>
        </div>
      </div>
    );
  }

  // Pre-round - Player
  if (screen === 'preround' && !isHost) {
    const host = players.find(p => p.isHost);
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
          <p className="text-sm text-indigo-600 font-medium mb-2">Round {roundNumber}</p>
          <h2 className="text-2xl font-bold mb-4">Get Ready!</h2>

          <div className="flex justify-center gap-2 mb-6">
            <span className="text-sm text-slate-500">Your wins:</span>
            <WinDots playerId={currentPlayerId} />
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 mb-6 text-white">
            <p className="text-sm opacity-80 mb-2">This Round's Words</p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-2xl font-bold">{word1}</span>
              <span className="text-xl opacity-60">&</span>
              <span className="text-2xl font-bold">{word2}</span>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <p className="text-amber-700">Waiting for <span className="font-semibold">{host?.name}</span> to start...</p>
          </div>
        </div>
      </div>
    );
  }

  // Playing - Host
  if (screen === 'playing' && isHost) {
    return (
      <div className="min-h-screen bg-amber-50 p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-amber-600 font-medium">HOST VIEW</p>
              <h2 className="text-xl font-bold">Round {roundNumber}</h2>
            </div>
            <div className={`text-3xl font-mono font-bold ${timeLeft <= 10 ? 'text-red-500' : ''}`}>{timeLeft}s</div>
          </div>

          <div className="flex justify-center gap-3 mb-4">
            {activePlayers.filter(p => !p.isBot).map(p => (
              <div key={p.id} className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full">
                <span className="text-sm font-medium">{p.name}</span>
                <WinDots playerId={p.id} />
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 mb-4 text-center text-white">
            <div className="flex items-center justify-center gap-4">
              <span className="text-3xl font-bold">{word1}</span>
              <span className="text-2xl opacity-60">&</span>
              <span className="text-3xl font-bold">{word2}</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <h3 className="font-semibold mb-3">Submissions ({Object.keys(submissions).length}/{activePlayers.length})</h3>
            <div className="space-y-2">
              {activePlayers.map(p => (
                <div key={p.id} className="flex justify-between bg-white p-3 rounded-lg border">
                  <span>{p.name}</span>
                  <span className={submissions[p.id] ? 'text-green-600 font-medium' : 'text-slate-400'}>
                    {submissions[p.id] ? '✓ Submitted' : 'Waiting...'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={endRoundEarly} className="w-full bg-amber-500 text-white py-3 rounded-lg font-semibold">
            End Round & Judge
          </button>
        </div>
      </div>
    );
  }

  // Playing - Player
  if (screen === 'playing' && !isHost) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-indigo-600 font-medium">Round {roundNumber}</p>
              <h2 className="text-xl font-bold">Submit Your Word!</h2>
            </div>
            <div className={`text-3xl font-mono font-bold ${timeLeft <= 10 ? 'text-red-500' : ''}`}>{timeLeft}s</div>
          </div>

          <div className="flex justify-center gap-2 mb-4">
            <span className="text-sm text-slate-500">Your wins:</span>
            <WinDots playerId={currentPlayerId} />
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 mb-6 text-center text-white">
            <p className="text-sm opacity-80 mb-2">Find one word that connects:</p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-2xl font-bold">{word1}</span>
              <span className="text-xl opacity-60">&</span>
              <span className="text-2xl font-bold">{word2}</span>
            </div>
          </div>

          {hasSubmitted ? (
            <div className="text-center py-6 bg-green-50 rounded-xl border-2 border-green-200">
              <div className="text-3xl mb-2">✓</div>
              <p className="text-green-700 font-semibold text-lg">Submitted!</p>
              <p className="text-green-600 mt-1">"{submissions[currentPlayerId]}"</p>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Type your word..."
                value={inputWord}
                onChange={e => setInputWord(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitWord()}
                className="w-full p-4 border-2 border-slate-200 rounded-xl text-lg"
                maxLength={30}
              />
              <button onClick={submitWord} disabled={!inputWord.trim()} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-50">
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

    return (
      <div className="min-h-screen bg-amber-50 p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <p className="text-sm text-amber-600 font-medium mb-2">HOST VIEW</p>
          <h2 className="text-2xl font-bold mb-4">Rate Submissions</h2>

          <div className="flex justify-center gap-3 mb-4">
            {activePlayers.filter(p => !p.isBot).map(p => (
              <div key={p.id} className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full">
                <span className="text-sm font-medium">{p.name}</span>
                <WinDots playerId={p.id} />
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-4 mb-6 text-center text-white">
            <p className="text-sm opacity-80 mb-1">Rate connections to:</p>
            <span className="text-xl font-bold">{word1}</span>
            <span className="mx-3 opacity-60">&</span>
            <span className="text-xl font-bold">{word2}</span>
          </div>

          {toJudge.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No submissions</p>
          ) : (
            <div className="space-y-6 mb-6">
              {toJudge.map(p => (
                <div key={p.id} className="bg-slate-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium text-slate-600">{p.name}</span>
                    <span className="text-xl font-bold text-indigo-600">"{submissions[p.id]}"</span>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-slate-500 mb-2">
                      <span className="font-semibold text-indigo-600">{word1}</span> → <span className="font-semibold">{submissions[p.id]}</span>
                    </p>
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => handleRate(p.id, 0, v)}
                          className={getRate(p.id, 0) === v ? 'flex-1 py-2 rounded-lg font-bold bg-indigo-600 text-white' : 'flex-1 py-2 rounded-lg font-bold bg-white border-2 border-slate-200'}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-slate-500 mb-2">
                      <span className="font-semibold text-purple-600">{word2}</span> → <span className="font-semibold">{submissions[p.id]}</span>
                    </p>
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => handleRate(p.id, 1, v)}
                          className={getRate(p.id, 1) === v ? 'flex-1 py-2 rounded-lg font-bold bg-purple-600 text-white' : 'flex-1 py-2 rounded-lg font-bold bg-white border-2 border-slate-200'}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {getRate(p.id, 0) !== undefined && getRate(p.id, 1) !== undefined && (
                    <div className="text-center bg-white rounded-lg py-2">
                      <span className="text-slate-500">Total: </span>
                      <span className="font-bold">{getRate(p.id, 0) + getRate(p.id, 1)} pts</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <p className="text-sm text-center text-slate-400 mb-4">1 = Perfect · 5 = Poor · Lowest wins!</p>

          <button onClick={finishJudging} disabled={!allRated && toJudge.length > 0} className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50">
            Reveal Results
          </button>
        </div>
      </div>
    );
  }

  // Judging - Player
  if (screen === 'judging' && !isHost) {
    const host = players.find(p => p.isHost);
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">⚖️</div>
          <h2 className="text-xl font-bold mb-2">Judging...</h2>
          <p className="text-slate-500 mb-4">{host?.name} is rating submissions</p>
          
          <div className="flex justify-center gap-2 mb-4">
            <span className="text-sm text-slate-500">Your wins:</span>
            <WinDots playerId={currentPlayerId} />
          </div>

          {hasSubmitted && (
            <div className="bg-indigo-50 rounded-xl p-4">
              <p className="text-sm text-slate-500">Your word</p>
              <p className="text-xl font-bold text-indigo-600">"{submissions[currentPlayerId]}"</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Results - Host
  if (screen === 'results' && isHost) {
    return (
      <div className="min-h-screen bg-amber-50 p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <p className="text-sm text-amber-600 font-medium mb-2">HOST VIEW</p>
          <h2 className="text-2xl font-bold mb-4">Round {roundNumber} Results</h2>

          {roundResults.length > 0 && (
            <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4 mb-4 text-center">
              <p className="text-sm text-yellow-700">Round Winner</p>
              <p className="text-xl font-bold text-yellow-800">{roundResults[0].name}</p>
              <p className="text-yellow-600">"{roundResults[0].word}" — {roundResults[0].total} pts ({roundResults[0].r1}+{roundResults[0].r2})</p>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-semibold mb-3">Round Scores</h3>
            <div className="bg-slate-50 rounded-xl p-3 mb-3 text-center text-sm">
              <span className="text-indigo-600 font-medium">{word1}</span>
              <span className="mx-2 text-slate-400">&</span>
              <span className="text-purple-600 font-medium">{word2}</span>
            </div>
            <div className="space-y-2">
              {roundResults.map((r, i) => (
                <div key={r.id} className={`flex justify-between p-3 rounded-xl ${i === 0 ? 'bg-green-50 border border-green-200' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${i === 0 ? 'text-green-600' : 'text-slate-400'}`}>#{i+1}</span>
                    <div>
                      <p className="font-semibold">{r.name}</p>
                      <p className="text-indigo-600 text-sm">"{r.word}"</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{r.total}</p>
                    <p className="text-xs text-slate-400">{r.r1}+{r.r2}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <Scoreboard />
          </div>

          <button onClick={startPreRound} disabled={isLoadingWords} className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50">
            {isLoadingWords ? 'Loading...' : 'Next Round'}
          </button>
        </div>
      </div>
    );
  }

  // Results - Player
  if (screen === 'results' && !isHost) {
    const myResult = roundResults.find(r => r.id === currentPlayerId);
    const myRank = roundResults.findIndex(r => r.id === currentPlayerId) + 1;

    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full">
          <h2 className="text-2xl font-bold text-center mb-2">Round {roundNumber} Results</h2>

          {myRank === 1 && (
            <div className="bg-green-100 border-2 border-green-400 rounded-xl p-4 mb-4 text-center">
              <p className="text-2xl">🎉</p>
              <p className="text-green-700 font-bold">You won this round!</p>
            </div>
          )}

          {myResult && myRank !== 1 && (
            <div className="text-center p-4 rounded-xl mb-4 bg-slate-50">
              <p className="text-sm text-slate-500">You placed</p>
              <p className="text-4xl font-bold">#{myRank}</p>
              <p className="text-indigo-600 mt-1">"{myResult.word}" — {myResult.total} pts</p>
            </div>
          )}

          <div className="mb-4">
            <h3 className="font-semibold mb-2 text-sm">Round Scores</h3>
            <div className="space-y-2">
              {roundResults.map((r, i) => (
                <div key={r.id} className={`flex justify-between p-3 rounded-lg ${r.id === currentPlayerId ? 'bg-indigo-100 border border-indigo-300' : i === 0 ? 'bg-green-50 border border-green-200' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${i === 0 ? 'text-green-600' : 'text-slate-400'}`}>#{i+1}</span>
                    <div>
                      <span className="font-medium">{r.name}</span>
                      <p className="text-xs text-indigo-600">"{r.word}"</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">{r.total}</span>
                    <p className="text-xs text-slate-400">{r.r1}+{r.r2}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Scoreboard highlight={currentPlayerId} />

          <p className="text-center text-slate-500 mt-4 text-sm">Waiting for next round...</p>
        </div>
      </div>
    );
  }

  // Game Over
  if (screen === 'gameover') {
    const isWinner = winner?.id === currentPlayerId;
    return (
      <div className={`min-h-screen ${isHost ? 'bg-amber-50' : 'bg-indigo-50'} flex items-center justify-center p-4`}>
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
          <div className="text-6xl mb-4">{isWinner ? '🎉' : '🏆'}</div>
          <h2 className="text-3xl font-bold mb-2">{isWinner ? 'You Win!' : 'Game Over!'}</h2>
          <p className="text-xl text-slate-600 mb-6">
            <span className="font-bold text-indigo-600">{winner?.name}</span> wins!
          </p>

          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold mb-3">Final Standings</h3>
            <div className="space-y-2">
              {Object.entries(roundWins)
                .sort(([,a], [,b]) => b - a)
                .map(([id, wins]) => {
                  const p = players.find(pl => pl.id === id);
                  return (
                    <div key={id} className="flex justify-between">
                      <span>{p?.name}</span>
                      <span className="font-bold">{wins} wins</span>
                    </div>
                  );
                })}
            </div>
          </div>

          <button onClick={resetGame} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold">
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return null;
}