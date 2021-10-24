import {socket} from "./game.mjs"
export default class InputHandler {
    constructor(player){
        document.addEventListener("keydown",event =>{
            switch(event.key){
                case 'ArrowLeft':
                case 'a':
                    player.movePlayer("left")
                    socket.emit('move',"left",{speed:7,x:player.x,y:player.y})//todo
                    break

                case 'ArrowRight':
                case 'd':
                    player.movePlayer("right")
                    socket.emit('move',"right",{speed:7,x:player.x,y:player.y})
                    break

                case 'ArrowUp':
                case 'w':
                    player.movePlayer ("up")
                    socket.emit('move',"up",{speed:7,x:player.x,y:player.y})
                    break
                
                case 'ArrowDown':
                case 's':
                    player.movePlayer("down")
                    socket.emit('move',"down",{speed:7,x:player.x,y:player.y})
                    break
            }
        })

        document.addEventListener("keyup",event =>{
           switch(event.key){
               
                case 'ArrowLeft':
                case 'a':
                   if(player.xSpeed < 0)player.movePlayer("STOP",0) //if moving left. makes transition smoother
                   socket.emit('move',"STOP",{speed:0,x:player.x,y:player.y})
                   break
                   
                case 'ArrowRight':
                case 'd':
                   if(player.xSpeed > 0)player.movePlayer("STOP",0)
                    socket.emit('move',"STOP",{speed:0,x:player.x,y:player.y})
                   break
                
                case 'ArrowUp':
                case 'w':
                    if(player.ySpeed < 0)player.movePlayer("STOP",0)
                    socket.emit('move',"STOP",{speed:0,x:player.x,y:player.y})
                    break
                
                case 'ArrowDown':
                case 's':
                    if(player.ySpeed > 0)player.movePlayer("STOP",0)
                     socket.emit('move',"STOP",{speed:0,x:player.x,y:player.y})
                    break
           }
        })   
    }
}