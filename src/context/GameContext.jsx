/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { ANON_LABELS } from '../data/wordModes';
import { useAutoSubmit } from '../hooks/useAutoSubmit';
import { useFetchWords } from '../hooks/useFetchWords';
import { useGameSocket } from '../hooks/useGameSocket';

const GameContext = createContext(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used within GameProvider');
  }
  return ctx;
}

export function GameProvider({ children }) {
  const { isConnected, playerId, gameState, error, timeLeft, notifications, actions } = useGameSocket();

  const [screen, setScreen] = useState('lobby');
  const [username, setUsername] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [inputWord, setInputWord] = useState('');
  const [localSettings, setLocalSettings] = useState({ roundLength: 30, roundsToWin: 3, wordMode: 'easy' });
  const [showSettings, setShowSettings] = useState(false);

  const { isLoadingWords, fetchWords } = useFetchWords();

  useEffect(() => {
    if (gameState) {
      setScreen(gameState.state);
      if (gameState.settings) {
        setLocalSettings({
          roundLength: gameState.settings.roundLength ?? 30,
          roundsToWin: gameState.settings.roundsToWin ?? 3,
          wordMode: gameState.settings.wordMode ?? 'easy'
        });
      }
    }
  }, [gameState]);

  useEffect(() => {
    if (!(error?.includes('host') && error.includes('left'))) return;
    const timeoutId = setTimeout(() => {
      setScreen('lobby');
      setGameCode('');
      setUsername('');
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [error]);

  useAutoSubmit({
    timeLeft,
    gameState,
    playerId,
    inputWord,
    setInputWord,
    submitWord: actions.submitWord
  });

  const isHost = playerId && gameState?.hostId === playerId;
  const isJudge = playerId && gameState?.judgeId === playerId;
  const judge = gameState?.players?.find(p => p.id === gameState?.judgeId);
  const activePlayers = gameState?.players?.filter(p => p.id !== gameState?.judgeId) || [];
  const hasSubmitted = Boolean(gameState?.submissions?.[playerId]);
  const roundWins = gameState?.roundWins || {};
  const totalPoints = gameState?.totalPoints || {};
  const submissions = gameState?.submissions || {};
  const ratings = gameState?.ratings || {};
  const roundResults = gameState?.roundResults || [];
  const judgeOrder = gameState?.judgeOrder || [];
  const wordMode = localSettings.wordMode || 'easy';

  const getAnonLabel = (playerIdForLabel) => {
    const idx = judgeOrder.indexOf(playerIdForLabel);
    if (idx < 0) return '?';
    return ANON_LABELS[idx % ANON_LABELS.length];
  };

  const getRate = (odplayerId, wordIdx) => ratings[odplayerId + '_' + wordIdx];

  const handleCreateGame = () => {
    if (!username.trim()) return;
    actions.createGame(username.trim());
  };

  const handleJoinGame = () => {
    if (!username.trim() || !gameCode) return;
    actions.joinGame(gameCode, username.trim());
  };

  const handleStartPreRound = async () => {
    const words = await fetchWords(localSettings.wordMode);
    actions.startPreRound(words[0], words[1]);
  };

  const handleRegenerateWords = async () => {
    const words = await fetchWords(localSettings.wordMode);
    actions.updateWords(words[0], words[1]);
  };

  const handleSubmitWord = () => {
    if (!inputWord.trim()) return;
    actions.submitWord(inputWord.trim());
    setInputWord('');
  };

  const handleRate = (odplayerId, wordIdx, value) => {
    actions.submitRating(odplayerId, wordIdx, value);
  };

  const handleSettingsChange = (roundLength, roundsToWin, nextWordMode = localSettings.wordMode) => {
    setLocalSettings({ roundLength, roundsToWin, wordMode: nextWordMode });
    actions.updateSettings(roundLength, roundsToWin, nextWordMode);
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

  const value = {
    isConnected,
    playerId,
    gameState,
    timeLeft,
    actions,
    screen,
    username,
    setUsername,
    gameCode,
    setGameCode,
    isJoining,
    setIsJoining,
    inputWord,
    setInputWord,
    isLoadingWords,
    localSettings,
    showSettings,
    setShowSettings,
    notifications,
    isHost,
    isJudge,
    judge,
    activePlayers,
    hasSubmitted,
    roundWins,
    totalPoints,
    submissions,
    ratings,
    roundResults,
    judgeOrder,
    wordMode,
    getAnonLabel,
    getRate,
    handleCreateGame,
    handleJoinGame,
    handleStartPreRound,
    handleRegenerateWords,
    handleSubmitWord,
    handleRate,
    handleSettingsChange,
    handleResetGame,
    handleBackToLobby,
    handleLeaveGame: handleBackToLobby
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}
