import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
cors: {
origin: "http://localhost:5173",
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
    game.state = 'judging';
    broadcastGameState(gameCode);
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

const player = {
    id: socket.id,
    name: playerName,
    isHost: false
};

game.players.push(player);
game.roundWins[socket.id] = 0;

socket.join(code);
socket.gameCode = code;
socket.playerId = socket.id;

socket.emit('gameJoined', { code, playerId: socket.id });
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

const activePlayers = game.players.filter(p => !p.isHost);

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
if (!gameCode) return;

const game = games.get(gameCode);
if (!game) return;

// Remove player from game
game.players = game.players.filter(p => p.id !== socket.id);

// If host left, end the game
if (game.hostId === socket.id) {
    stopTimer(gameCode);
    io.to(gameCode).emit('hostLeft');
    games.delete(gameCode);
    console.log(`Game ${gameCode} ended - host left`);
} else {
    broadcastGameState(gameCode);
    console.log(`Player left game ${gameCode}`);
}
});
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});