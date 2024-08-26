const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let gameState = {
    grid: Array(5).fill(null).map(() => Array(5).fill(null)),
    players: [],
    currentPlayer: 0,
};

const CHARACTER_TYPES = {
    PAWN: 'P',
    HERO1: 'H1',
    HERO2: 'H2',
};

function initializeGame() {
    gameState.grid = Array(5).fill(null).map(() => Array(5).fill(null));
    gameState.players = [
        { id: 1, characters: [] },
        { id: 2, characters: [] },
    ];
    gameState.currentPlayer = 0;

    // Example initialization: Set up characters for both players
    gameState.players[0].characters = [
        { type: CHARACTER_TYPES.PAWN, position: [0, 0] },
        { type: CHARACTER_TYPES.HERO1, position: [0, 1] },
        { type: CHARACTER_TYPES.HERO2, position: [0, 2] },
    ];
    gameState.players[1].characters = [
        { type: CHARACTER_TYPES.PAWN, position: [4, 0] },
        { type: CHARACTER_TYPES.HERO1, position: [4, 1] },
        { type: CHARACTER_TYPES.HERO2, position: [4, 2] },
    ];

    // Place characters on the grid
    gameState.players.forEach((player, index) => {
        player.characters.forEach(character => {
            gameState.grid[character.position[0]][character.position[1]] = {
                player: index + 1,
                type: character.type,
            };
        });
    });
}

function handleMove(playerId, characterIndex, move) {
    // Implement move logic here, validate moves and update gameState accordingly

    // Example move handling:
    let player = gameState.players.find(p => p.id === playerId);
    if (player) {
        let character = player.characters[characterIndex];
        // Move validation and update
    }

    // Broadcast updated game state to all clients
    broadcastGameState();
}

function broadcastGameState() {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'update',
                state: gameState,
            }));
        }
    });
}

wss.on('connection', ws => {
    ws.on('message', message => {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'initialize':
                initializeGame();
                broadcastGameState();
                break;
            case 'move':
                handleMove(data.playerId, data.characterIndex, data.move);
                break;
        }
    });

    // Send the initial game state
    ws.send(JSON.stringify({
        type: 'update',
        state: gameState,
    }));
});

console.log('WebSocket server running on ws://localhost:8080');
