"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const httpServer = http_1.createServer();
httpServer.listen(4000, () => {
    console.log('listening on *:4000');
});
const io = new socket_io_1.Server(httpServer, {
    cors: {
        credentials: false
    }
});
let connCounter = 0;
let roomCounter = 0;
let names = [];
io.on('connection', (socket) => {
    socket.once('Nickname', (name) => {
        const nickname = name;
        names.push(nickname);
    });
    console.log('a user connected');
    socket.once('gameChoice', (choice) => {
        console.log(choice, 'was chosen');
        if (choice == 'Online') {
            let lobbyInfo = {
                name: 'T-T-T Arena',
                opponent: null
            };
            socket.emit('lobbySetup', lobbyInfo);
            connCounter += 1;
            console.log('Number of online players:', connCounter);
            if (connCounter % 2 == 0) {
                const room = 'room' + roomCounter.toString();
                socket.join(room);
                let online = {
                    xPlayer: names[connCounter - 1],
                    board: {
                        squares: Array(9).fill(null),
                        xIsNext: true,
                        status: null
                    }
                };
                io.to('room' + roomCounter.toString()).emit('gameStart', online);
                roomCounter += 1;
                console.log('Number of full rooms:', roomCounter);
                socket.on('turn', (data) => {
                    turn(data.index, data.board, socket, room);
                });
            }
            else {
                const room = 'room' + roomCounter.toString();
                socket.join(room);
                console.log('Number of full rooms:', roomCounter);
                socket.emit('lobbySetup', lobbyInfo);
                socket.on('turn', (data) => {
                    turn(data.index, data.board, socket, room);
                });
            }
        }
        // offline
        else {
            let board = {
                squares: Array(9).fill(null),
                xIsNext: true,
                status: null,
            };
            socket.emit('gameSetup', board);
            const room = null;
            socket.on('turn', (index) => {
                turn(index, board, socket, room);
            });
        }
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
function turn(index, board, socket, room) {
    console.log(index);
    if (board.squares[index] == null) {
        board.squares[index] = board.xIsNext ? 'X' : 'O';
        board.xIsNext = !board.xIsNext;
    }
    const winner = calculateWinner(board.squares);
    console.log('Winner?:', winner);
    if (winner) {
        board.status = winner;
    }
    if (room) {
        io.to(room).emit('update', board);
    }
    else {
        socket.emit('update', board);
    }
}
// function used to see if a player won
function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}
