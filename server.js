require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const helmet = require("helmet")
const nocache = require("nocache")
const cors   = require('cors')
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();
app.use(nocache())
app.use(helmet.noSniff())
app.use(helmet.xssFilter())
app.use(helmet.hidePoweredBy({ setTo: 'PHP 7.4.3' }))
app.use(cors({origin:"https://www.freecodecamp.org"}))



app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Index page (static HTML)
app.route('/')
  .get(function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function() {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});
// createCoin funtion for reuse in game start and ridCoin/newCoin
const createCoin = () => {
  return {
    x: Math.floor(Math.random() * 400),
    y: Math.floor(Math.random() * 640 / 1.25),
    id: new Date().getTime(),
    value: 1
  }
}
//spin up socket.io with this server
const io = require('socket.io')(server)
let gameState = {
  players: [],
  coin: createCoin()
}
io.on('connection', (socket) => {
  console.log(`user ${socket.id} has connected`)
  socket.emit('start', gameState)
  
  //new remote player
  socket.on('newPlayer', (newPlayer) => {
    gameState.players = [...gameState.players, newPlayer]
    socket.broadcast.emit('remoteNewPlayer', newPlayer)
  })
  //move remote player
  socket.on('move', (dir, movePlayer) => {
    socket.broadcast.emit('move', { id: socket.id, dir, speed: movePlayer.speed, x: movePlayer.x, y: movePlayer.y })
    //update gameState by finding index of player 
    let updateI = gameState.players.findIndex(player => player.id === socket.id)
    //and copying applicable properties
    gameState.players[updateI] = { ...gameState.players[updateI], ...movePlayer }
  })
  let controlPoints =[]
  socket.on('ridCoin', (coinID) => {
    //change position of coin
    gameState.coin = createCoin()
    // send position of new coin to all including sender using io.emit
    io.emit('newCoin', gameState.coin)
    //points
    if(!controlPoints.some(id => id === coinID)){
    controlPoints = [...controlPoints,coinID]
    const awardPlayer = gameState.players.find(player => player.id === socket.id)
    awardPlayer.score += awardPlayer.score + gameState.coin.value
    io.emit('awardPoints',awardPlayer)
    }
  })

  socket.on('disconnect', () => {
    //remove the dissconected player
    gameState.players = gameState.players.filter((player) => {
      return player.id !== socket.id
    })
    socket.broadcast.emit('ridPlayer', socket.id)
  })
})

module.exports = app; // For testing
