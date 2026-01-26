import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
cors: {
    origin: ["https://two-birds-one-word-1.onrender.com",
            "http://localhost:5173",
            "https://twobirdsoneword.com",

    ],
    methods: ["GET", "POST"]
}
});

// Store active games
const games = new Map();

// Game structure
function createGame(hostId, hostName, code) {
return {
    code,
    hostId,
    players: [{ id: hostId, name: hostName, isHost: true }],
    settings: {
    roundLength: 30,
    roundsToWin: 3
    },
    state: 'waiting', // waiting, preround, playing, judging, results, gameover
    roundNumber: 0,
    words: ['', ''],
    submissions: {},
    ratings: {},
    roundWins: {},
    totalPoints: {},
    roundResults: [],
    winner: null,
    timeLeft: 30,
    timerInterval: null
};
}

function generateCode() {
return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getActivePlayers(game) {
return game.players.filter(p => !p.isHost);
}

function broadcastGameState(gameCode) {
const game = games.get(gameCode);
if (!game) return;

// Send full game state to all players in the room
io.to(gameCode).emit('gameState', {
    code: game.code,
    hostId: game.hostId,
    players: game.players,
    settings: game.settings,
    state: game.state,
    roundNumber: game.roundNumber,
    words: game.words,
    submissions: game.submissions,
    ratings: game.ratings,
    roundWins: game.roundWins,
    totalPoints: game.totalPoints,
    roundResults: game.roundResults,
    winner: game.winner,
    timeLeft: game.timeLeft
});
}

function startTimer(gameCode) {
const game = games.get(gameCode);
if (!game) return;

// Clear existing timer
if (game.timerInterval) {
    clearInterval(game.timerInterval);
}

game.timeLeft = game.settings.roundLength;

game.timerInterval = setInterval(() => {
    game.timeLeft--;
    io.to(gameCode).emit('timerUpdate', game.timeLeft);

    if (game.timeLeft <= 0) {
    clearInterval(game.timerInterval);
    game.timerInterval = null;
    
    // Give a brief grace period for last-second submissions
    setTimeout(() => {
        const currentGame = games.get(gameCode);
        if (currentGame && currentGame.state === 'playing') {
        currentGame.state = 'judging';
        broadcastGameState(gameCode);
        }
    }, 500); // 500ms grace period
    }
}, 1000);
}

function stopTimer(gameCode) {
const game = games.get(gameCode);
if (!game) return;

if (game.timerInterval) {
    clearInterval(game.timerInterval);
    game.timerInterval = null;
}
}

// Check if game should end due to not enough players
function checkPlayerCount(gameCode, leavingPlayerName) {
const game = games.get(gameCode);
if (!game) return false;

const activePlayers = getActivePlayers(game);

// If we're in a game state (not waiting) and only 1 or fewer players remain
if (game.state !== 'waiting' && activePlayers.length < 2) {
    stopTimer(gameCode);
    
    // Notify all remaining players
    io.to(gameCode).emit('gameEndedNotEnoughPlayers', {
    message: `${leavingPlayerName} left. Not enough players to continue.`,
    playerName: leavingPlayerName
    });
    
    // Reset game to waiting state
    game.state = 'waiting';
    game.roundNumber = 0;
    game.words = ['', ''];
    game.submissions = {};
    game.ratings = {};
    game.roundResults = [];
    game.winner = null;
    
    broadcastGameState(gameCode);
    console.log(`Game ${gameCode} reset - not enough players`);
    return true;
}

return false;
}

io.on('connection', (socket) => {
console.log('User connected:', socket.id);

// Create a new game
socket.on('createGame', ({ playerName }) => {
    const code = generateCode();
    const game = createGame(socket.id, playerName, code);
    games.set(code, game);

    socket.join(code);
    socket.gameCode = code;
    socket.playerId = socket.id;
    socket.playerName = playerName;

    socket.emit('gameCreated', { code, playerId: socket.id });
    broadcastGameState(code);

    console.log(`Game ${code} created by ${playerName}`);
});

// Join existing game
socket.on('joinGame', ({ code, playerName }) => {
    const game = games.get(code);

    if (!game) {
    socket.emit('error', { message: 'Game not found' });
    return;
    }

    if (game.state !== 'waiting') {
    socket.emit('error', { message: 'Game already in progress' });
    return;
    }

    // Check for duplicate names
    const trimmedName = playerName.trim();
    const existingNames = game.players.map(p => p.name);
    
    if (existingNames.includes(trimmedName)) {
    socket.emit('error', { message: 'That name is already taken. Please choose a different name.' });
    return;
    }

    const player = {
    id: socket.id,
    name: trimmedName,
    isHost: false
    };

    game.players.push(player);
    game.roundWins[socket.id] = 0;

    socket.join(code);
    socket.gameCode = code;
    socket.playerId = socket.id;
    socket.playerName = playerName;

    socket.emit('gameJoined', { code, playerId: socket.id });
    
    // Notify others that player joined
    socket.to(code).emit('playerJoined', { playerName, playerId: socket.id });
    
    broadcastGameState(code);

    console.log(`${playerName} joined game ${code}`);
});

// Update settings (host only)
socket.on('updateSettings', ({ roundLength, roundsToWin }) => {
    const game = games.get(socket.gameCode);
    if (!game || game.hostId !== socket.id) return;

    game.settings.roundLength = roundLength;
    game.settings.roundsToWin = roundsToWin;
    broadcastGameState(socket.gameCode);
});

// Start pre-round (host only)
socket.on('startPreRound', ({ word1, word2 }) => {
    const game = games.get(socket.gameCode);
    if (!game || game.hostId !== socket.id) return;

    game.roundNumber++;
    game.words = [word1, word2];
    game.submissions = {};
    game.ratings = {};
    game.state = 'preround';

    // Initialize round wins for new players
    game.players.forEach(p => {
    if (!p.isHost && game.roundWins[p.id] === undefined) {
        game.roundWins[p.id] = 0;
    }
    });

    broadcastGameState(socket.gameCode);
});

// Update words (host only)
socket.on('updateWords', ({ word1, word2 }) => {
    const game = games.get(socket.gameCode);
    if (!game || game.hostId !== socket.id) return;

    game.words = [word1, word2];
    broadcastGameState(socket.gameCode);
});

// Start playing (host only)
socket.on('startPlaying', () => {
    const game = games.get(socket.gameCode);
    if (!game || game.hostId !== socket.id) return;

    game.state = 'playing';
    broadcastGameState(socket.gameCode);
    startTimer(socket.gameCode);
});

// Submit word (players only)
socket.on('submitWord', ({ word }) => {
    const game = games.get(socket.gameCode);
    if (!game || game.state !== 'playing') return;

    game.submissions[socket.id] = word.toLowerCase().trim();
    broadcastGameState(socket.gameCode);
});

// End round early (host only)
socket.on('endRound', () => {
    const game = games.get(socket.gameCode);
    if (!game || game.hostId !== socket.id) return;

    stopTimer(socket.gameCode);
    game.state = 'judging';
    broadcastGameState(socket.gameCode);
});

// Submit rating (host only)
socket.on('submitRating', ({ playerId, wordIndex, rating }) => {
    const game = games.get(socket.gameCode);
    if (!game || game.hostId !== socket.id) return;

    const key = playerId + '_' + wordIndex;
    game.ratings[key] = rating;
    broadcastGameState(socket.gameCode);
});

// Finish judging (host only)
socket.on('finishJudging', () => {
    const game = games.get(socket.gameCode);
    if (!game || game.hostId !== socket.id) return;

    const activePlayers = getActivePlayers(game);

    const results = activePlayers
    .filter(p => {
        const r1 = game.ratings[p.id + '_0'];
        const r2 = game.ratings[p.id + '_1'];
        return game.submissions[p.id] && r1 !== undefined && r2 !== undefined;
    })
    .map(p => ({
        id: p.id,
        name: p.name,
        word: game.submissions[p.id],
        r1: game.ratings[p.id + '_0'],
        r2: game.ratings[p.id + '_1'],
        total: game.ratings[p.id + '_0'] + game.ratings[p.id + '_1']
    }))
    .sort((a, b) => a.total - b.total);

    game.roundResults = results;

    // Update total points
    results.forEach(r => {
    game.totalPoints[r.id] = (game.totalPoints[r.id] || 0) + r.total;
    });

    // Determine round winner
    if (results.length > 0) {
    const winnerId = results[0].id;
    game.roundWins[winnerId] = (game.roundWins[winnerId] || 0) + 1;
    
    if (game.roundWins[winnerId] >= game.settings.roundsToWin) {
        game.winner = game.players.find(p => p.id === winnerId);
        game.state = 'gameover';
        broadcastGameState(socket.gameCode);
        return;
    }
    }

    game.state = 'results';
    broadcastGameState(socket.gameCode);
});

// Reset game (host only)
socket.on('resetGame', () => {
    const game = games.get(socket.gameCode);
    if (!game || game.hostId !== socket.id) return;

    game.state = 'waiting';
    game.roundNumber = 0;
    game.words = ['', ''];
    game.submissions = {};
    game.ratings = {};
    game.roundWins = {};
    game.totalPoints = {};
    game.roundResults = [];
    game.winner = null;

    // Reset round wins for all players
    game.players.forEach(p => {
    if (!p.isHost) {
        game.roundWins[p.id] = 0;
    }
    });

    broadcastGameState(socket.gameCode);
});

// Handle disconnect
socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    const gameCode = socket.gameCode;
    const playerName = socket.playerName || 'A player';
    
    if (!gameCode) return;

    const game = games.get(gameCode);
    if (!game) return;

    // Check if this is the host leaving
    const isHost = game.hostId === socket.id;
    
    // Remove player from game
    game.players = game.players.filter(p => p.id !== socket.id);
    
    // Also remove their submissions and ratings if in a round
    delete game.submissions[socket.id];
    delete game.ratings[socket.id + '_0'];
    delete game.ratings[socket.id + '_1'];

    if (isHost) {
    // Host left - end the game for everyone
    stopTimer(gameCode);
    io.to(gameCode).emit('hostLeft', { 
        message: 'The host has left the game.',
        hostName: playerName
    });
    games.delete(gameCode);
    console.log(`Game ${gameCode} ended - host left`);
    } else {
    // Regular player left
    // Notify others
    io.to(gameCode).emit('playerLeft', { 
        playerName, 
        playerId: socket.id 
    });
    
    // Check if we still have enough players to continue
    const gameEnded = checkPlayerCount(gameCode, playerName);
    
    if (!gameEnded) {
        // Game continues, just broadcast updated state
        broadcastGameState(gameCode);
    }
    
    console.log(`${playerName} left game ${gameCode}`);
    }
});
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});