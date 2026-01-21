import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

export function useGameSocket() {
const socketRef = useRef(null);
const [isConnected, setIsConnected] = useState(false);
const [playerId, setPlayerId] = useState(null);
const [gameState, setGameState] = useState(null);
const [error, setError] = useState(null);
const [timeLeft, setTimeLeft] = useState(0);

// Initialize socket connection
useEffect(() => {
    socketRef.current = io(WS_URL);

    socketRef.current.on('connect', () => {
    console.log('Connected to server');
    setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
    console.log('Disconnected from server');
    setIsConnected(false);
    });

    socketRef.current.on('gameCreated', ({ code, playerId }) => {
    setPlayerId(playerId);
    });

    socketRef.current.on('gameJoined', ({ code, playerId }) => {
    setPlayerId(playerId);
    });

    socketRef.current.on('gameState', (state) => {
    setGameState(state);
    setTimeLeft(state.timeLeft);
    });

    socketRef.current.on('timerUpdate', (time) => {
    setTimeLeft(time);
    });

    socketRef.current.on('error', ({ message }) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
    });

    // Host left - game ends for everyone
    socketRef.current.on('hostLeft', ({ message, hostName }) => {
    console.log('Host left the game');
    setError(`${hostName || 'Host'} left the game. Game ended.`);
    setGameState(null);
    setPlayerId(null);
    });

    // Not enough players - game resets to waiting
    socketRef.current.on('gameEndedNotEnoughPlayers', ({ message }) => {
    console.log('Game ended - not enough players');
    setError(message);
    // Game state will be updated via gameState event
    });

    // Player joined notification (optional - App.jsx handles via state diff)
    socketRef.current.on('playerJoined', ({ playerName }) => {
    console.log(`${playerName} joined the game`);
    });

    // Player left notification (optional - App.jsx handles via state diff)
    socketRef.current.on('playerLeft', ({ playerName }) => {
    console.log(`${playerName} left the game`);
    });

    return () => {
    socketRef.current?.disconnect();
    };
}, []);

// Actions
const createGame = useCallback((playerName) => {
    socketRef.current?.emit('createGame', { playerName });
}, []);

const joinGame = useCallback((code, playerName) => {
    socketRef.current?.emit('joinGame', { code, playerName });
}, []);

const updateSettings = useCallback((roundLength, roundsToWin) => {
    socketRef.current?.emit('updateSettings', { roundLength, roundsToWin });
}, []);

const startPreRound = useCallback((word1, word2) => {
    socketRef.current?.emit('startPreRound', { word1, word2 });
}, []);

const updateWords = useCallback((word1, word2) => {
    socketRef.current?.emit('updateWords', { word1, word2 });
}, []);

const startPlaying = useCallback(() => {
    socketRef.current?.emit('startPlaying');
}, []);

const submitWord = useCallback((word) => {
    socketRef.current?.emit('submitWord', { word });
}, []);

const endRound = useCallback(() => {
    socketRef.current?.emit('endRound');
}, []);

const submitRating = useCallback((playerId, wordIndex, rating) => {
    socketRef.current?.emit('submitRating', { playerId, wordIndex, rating });
}, []);

const finishJudging = useCallback(() => {
    socketRef.current?.emit('finishJudging');
}, []);

const resetGame = useCallback(() => {
    socketRef.current?.emit('resetGame');
}, []);

return {
    isConnected,
    playerId,
    gameState,
    error,
    timeLeft,
    actions: {
    createGame,
    joinGame,
    updateSettings,
    startPreRound,
    updateWords,
    startPlaying,
    submitWord,
    endRound,
    submitRating,
    finishJudging,
    resetGame
    }
};
}