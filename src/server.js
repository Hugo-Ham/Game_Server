"use strict";
exports.__esModule = true;
var https_1 = require("https");
var socket_io_1 = require("socket.io");
var express_1 = require("express");
var app = express_1["default"]();
var httpServer = https_1.createServer();
var io = new socket_io_1.Server(httpServer, {});
// app.get('/', (req, res) => {
//   const winner = calculateWinner(Array(9).fill(null))
//   res.emit('winner', winner)
// });
httpServer.listen(3003, function () {
    console.log('listening on *:3003');
});
io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('winnerReq', function (square) {
        var winner = calculateWinner(square);
        socket.emit('winner', winner);
    });
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});
function calculateWinner(squares) {
    var lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (var i = 0; i < lines.length; i++) {
        var _a = lines[i], a = _a[0], b = _a[1], c = _a[2];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}
