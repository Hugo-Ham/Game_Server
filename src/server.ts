import { createServer } from 'http';
import { Server, Socket } from "socket.io";

//starting the server

const httpServer = createServer();

httpServer.listen(4000, () => {
  console.log('listening on *:4000');
});

const io = new Server(httpServer, {
  cors: {
    credentials: false
  }
});

// defining variable to count number of connected players (connCounter) and number of full rooms (roomCounter)
let connCounter = 0;
let roomCounter = 0;

// array of strings that will hold the nicknames of the users
let names: string[] = []

// Waiting for connection on client side 
io.on('connection', (socket) => {

  // waiting for Nickname
  socket.once('Nickname', (name: any) => {
    const nickname = name
    names.push(nickname)
  })

  // Telle the terminal that a user connected
  console.log('a user connected');

  // waiting for the player's choice, either 'Offline' or 'Online'
  socket.once('gameChoice', (choice: String) => {

    // Online mode
    if (choice == 'Online') {

      // create lobby infor 
      let lobbyInfo = {
        name: 'T-T-T Arena',
        opponent: null
      }

      // send lobby info
      socket.emit('lobbySetup', lobbyInfo)

      connCounter += 1

      console.log('Number of online players:', connCounter)

      // if all players can be paired with another player
      if (connCounter % 2 == 0) {
        const room = 'room' + roomCounter.toString()

        // join existing room
        socket.join(room)

        // define the board and who is the xPlayer
        let online = {
          xPlayer: names[connCounter - 1],
          board: {
            squares: Array(9).fill(null),
            xIsNext: true,
            status: null
          }
        }

        // send information to players in the room 
        io.to('room' + roomCounter.toString()).emit('gameStart', online)

        roomCounter += 1
        console.log('Number of full rooms:', roomCounter)

        // waiting for turn from either of the players
        socket.on('turn', (data: any) => {
          turn(data.index, data.board, socket, room)
        })
      }

      // in this case there is one player missing for all players to paired
      else {
        const room = 'room' + roomCounter.toString()

        // create a room and join it
        socket.join(room)

        console.log('Number of full rooms:', roomCounter)
        socket.emit('lobbySetup', lobbyInfo)
        socket.on('turn', (data: any) => {
          turn(data.index, data.board, socket, room)
        })
      }
    }

    // Offline
    else {

      // define board
      let board = {
        squares: Array(9).fill(null),
        xIsNext: true,
        status: null,
      }

      // send board
      socket.emit('gameSetup', board)
      const room = null

      // wait for turn from the only player
      socket.on('turn', (index: any) => {
        turn(index, board, socket, room)
      })
    }
  })

  // to know when a player disconnects 
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});


// function that handles the input from the player side 
function turn(index: any, board: any, socket: any, room: any) {
  if (board.squares[index] == null) {
    board.squares[index] = board.xIsNext ? 'X' : 'O';
    board.xIsNext = !board.xIsNext
  }
  const winner = calculateWinner(board.squares)

  if (winner) {
    board.status = winner
  }
  if (room) {
    io.to(room).emit('update', board)
  }
  else {
    socket.emit('update', board)
  }

}

// function used to see if a player won
function calculateWinner(squares: any[]) {
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