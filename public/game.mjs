import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import InputHandler from './input.mjs'
let info = document.getElementById("info")
let pid = document.getElementById("pid")
export const socket = io()
const canvas = document.getElementById('game-window');
const ctx = canvas.getContext('2d');
let frameID;

class Game {
  constructor(gameWidth, gameHeight) {
    this.gameWidth = gameWidth
    this.gameHeight = gameHeight
    this.gameState ={
      players:[],
      coin:{}
    } 
  }
}

const GAME_WIDTH = 400
const GAME_HEIGHT = 600

let game = new Game(GAME_WIDTH, GAME_HEIGHT)
socket.on('start',({players,coin}) => {
  cancelAnimationFrame(frameID)
  //create new coin ob with position sent from server
  game.gameState.coin = new Collectible(coin) 
  //grab players from server make a local object for method access
  game.gameState.players = players.map((player, i, arr) =>{
    return new Player(player.gameWidth, player.gameHeight, game, player.id)
   })
   //get current player position from sever
   game.gameState.players.forEach((player,i,arr) => {
     arr[i].x = players[i].x
     arr[i].y =players[i].y
   })
  
  // add local player to gamestate as new player
  game.gameState.players = [...game.gameState.players,new Player(GAME_WIDTH,GAME_HEIGHT, game,socket.id)]
  // tell client which player is the localPlayer
  const localPlayer = game.gameState.players[game.gameState.players.length-1]
     pid.innerHTML = `Player ID: ${localPlayer.id}`
   // set up controls for localPlayer 
  new InputHandler(localPlayer)
  const sentPlayer = {...localPlayer}
  sentPlayer.game = null //remove circular reference
  //hey server new player:
  socket.emit('newPlayer', sentPlayer)

 
// if additional sever enters game add to local gameState
 socket.on('remoteNewPlayer',(newPlayer) => {
   //if player not in game add them
    if(!game.gameState.players.some(player => player.id === newPlayer.id)) {
      //make newPlayer new Player
      let remotePlayer = new Player(GAME_WIDTH, GAME_HEIGHT,game, newPlayer.id)
      game.gameState.players = [...game.gameState.players, remotePlayer]
      }
   })

  socket.on('newCoin', (newCoin) =>{
    game.gameState.coin = new Collectible(newCoin)
  })
  
  socket.on('move',(serverPlayer)=>{
    game.gameState.players.forEach((player) =>{
      if(player.id === serverPlayer.id){
         player.movePlayer(serverPlayer.dir, serverPlayer.speed)

         //skip to server's x,y for synch
         player.x = serverPlayer.x
         player.y = serverPlayer.y
      }
    })
  })

  socket.on('awardPoints',(awardPlayer)=>{
    let updateI = game.gameState.players.findIndex(player => player.id === awardPlayer.id)
    //increase score and then calculateRank
    game.gameState.players[updateI].score = awardPlayer.score
    const tempArr = [...game.gameState.players]
    info.innerHTML =`Rank: ${localPlayer.calculateRank(tempArr)}`
  })
  //remove any player that disconnects from server
  socket.on('ridPlayer',id => game.gameState.players = game.gameState.players.filter((player) => {
      return player.id !== id
    }))
   gameLoop()
})


let lastTime = 0

const gameLoop = (timestamp) => {
  let deltaTime = timestamp - lastTime
  lastTime = timestamp
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
  game.gameState.players.forEach((ob)=>{
    ob.update(deltaTime)
    })
    game.gameState.players.forEach((ob)=>{
    ob.draw(ctx)
    })
  game.gameState.coin.draw(ctx)
  frameID = requestAnimationFrame(gameLoop)
}


