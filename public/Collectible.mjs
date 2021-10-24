class Collectible {
  constructor(coin) {
    this.image = document.getElementById("img_coin");
    this.width = 15
    this.height =15
    //get coin position from server
    this.x = coin.x
    this.y = coin.y
    this.value = coin.value;
    this.id = coin.id;
    }

    draw(ctx){
        ctx.drawImage(this.image, this.x, this.y,this.width,this.height)
    }


}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch(e) {}

export default Collectible;
