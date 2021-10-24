import {socket} from "./game.mjs"
const colors = ['black','blue','red','purple','orange']

export default class Player {
  constructor(gameWidth,gameHeight,game, id) {
    this.gameWidth = gameWidth
    this.gameHeight = gameHeight
    this.width = 20
    this.height = 20

    this.xSpeed = 0
    this.ySpeed = 0

    this.x = this.gameWidth / 2 - this.width / 2,
    this.y = this.gameHeight - this.height
    this.score = 0
    this.id = id
    this.game = game// make coin available so coin position can be known
    this.color =0
    
  }

  movePlayer(dir, speed = 7) {
    this.xSpeed = 0
    this.ySpeed = 0
    if (dir === "left") {
      this.xSpeed -= speed
    }
    if (dir === "right") {
      this.xSpeed += speed
    }

    if (dir === "up") {
      this.ySpeed -= speed
    }

    if (dir === "down") {
      this.ySpeed += speed
    }
    if (dir === "STOP") {
      this.xSpeed = 0
      this.ySpeed = 0
    }

  }
  collision(item) {
    let playerBottom = this.y + this.height
    let playerTop = this.y

    let obTop = item.y
    let obBottom = item.y + item.height
    let obRside = item.x + item.width
    let obLside = item.x

    if ((this.x <= obRside &&
        this.x + this.height >= obLside &&
        playerTop <= obBottom &&
        playerBottom >= obTop)
    ) {
      this.game.gameState.coin.height = 0
      this.game.gameState.coin.width = 0
      return true
    } else {
      return false
    }
  }

calculateRank(arr) {

 const sorted = arr.sort((left,right)=>{
    return left.score - right.score
  })
  let myRank;
  if(this.score === 0)myRank = arr.length -1
  else{
    myRank = sorted.findIndex((player)=>{
      return (player.id === this.id)})
  }
  return `${myRank + 1} / ${arr.length}`
}

update(deltaTime){
  this.x += this.xSpeed
  this.y += this.ySpeed
  // keep player in bounds x
  if (this.x < 0) this.x = 0
  if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width
  // keep player in bounds y
  if (this.y + this.height > this.gameHeight) this.y = this.gameHeight - this.height
  if (this.y < 0) this.y = 0

  //local collison logic
  if(this.collision(this.game.gameState.coin)){
            console.log("collision")
            socket.emit('ridCoin',this.game.gameState.coin.id)
            
    }

}

  draw(ctx){
  this.color = colors[this.game.gameState.players.findIndex(player=>player.id===this.id)]
  ctx.fillStyle = this.color
  ctx.fillRect(this.x, this.y, this.width, this.height)
}
}

