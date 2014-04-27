/////////////////// Pre-set values for game ////////////////////
var options = {
  height: 600,
  width: 600,
  radius: 10,
  score: 0,
  collisionNum: 0,
  collisionObj: {},
  duration: 1000,
  numEnemies: 15,
  data: function() { return d3.range(this.numEnemies) } //creates range of this length
}
////////////////////////////////////////////////////////////


///////////////////// Manage the score //////////////////////
var updateScore = function(){
  options.highScore = Math.max(options.score, options.highScore);
  d3.select('#currentScore').text(options.score);
};

setInterval(updateScore, 100);
////////////////////////////////////////////////////////////


///////// Creating SVG, gameboard, and the enemies /////////
var svg = d3.select("body").append("svg")
  .attr("width", options.width)
  .attr("height", options.height)
  .attr("class", "gameArea")

svg.append('filter') // For placing the ghost images on the circles
  .attr('id','image')
  .attr('width','100%')
  .attr('height','100%')
  .append('feImage')
  .attr('xlink:href','Ghost.png');

svg.append('filter') // For placing the pacman image on the hero circle
  .attr('id','pacman')
  .attr('width','100%')
  .attr('height','100%')
  .append('feImage')
  .attr('xlink:href','Pacman.png');

var gameboard = d3.select(".gameArea"); // Creating gameboard selector

var enemies = gameboard.selectAll('.enemies')
                .data(options.data())
                .enter().append("circle")
                .attr("class", "enemies")
                .attr("cx", function(d) { return Math.random()*options.width*0.95;})
                .attr("cy", function(d) { return Math.random()*options.height*0.95;})
                .attr("r", options.radius)
                .attr("filter", "url(#image)");
////////////////////////////////////////////////////////////


////////////////// Create hero, draggable //////////////////
var hero = gameboard.selectAll(".hero")
  .data([{cx: options.width/2, cy: options.height/2}]); // where the hero starts

hero.enter().append("circle")
  .attr("class", "hero")
  .attr("cx", function(d) { return d.cx;})
  .attr("cy", function(d) { return d.cy;})
  .attr("r", options.radius*2)
  .attr('filter','url(#pacman)');

var dragHero = d3.behavior.drag()
  .on('drag', function(d,i){
    d.cx += d3.event.dx;
    d.cy += d3.event.dy;
    d3.select(this).attr('cx', d.cx).attr('cy',d.cy);
  });

hero.call(dragHero);
////////////////////////////////////////////////////////////


///////////////// Enable moving of enemies /////////////////
var moveAround = function(nodes) {

  // enter + update
  enemies.transition().duration(options.duration)
    .attr("cx", function(d) { return Math.random()*options.width*0.95;})
    .attr("cy", function(d) { return Math.random()*options.height*0.95;})
    .each('end', function() {moveAround(d3.select(this))})
}

// Run moveAround to fly the enemies around the gameboard!
moveAround(options.data());////
////////////////////////////////////////////////////////////


///////////////// Detect our collisions!! /////////////////
var eating = false; // to account for each eating loop happening simultaneously
var eatEnemies = function() {
  var eaten = false;
  enemies.each(function() {
    var cx = d3.select(this).attr("cx");
    var cy = d3.select(this).attr("cy");
    var heroX = d3.select(hero[0][0]).attr('cx');
    var heroY = d3.select(hero[0][0]).attr('cy');
    // Math to calculate if enemy is close enough to be eaten
    if(Math.abs(heroX-cx) < 2*options.radius && 
      Math.abs(heroY-cy) < 2*options.radius)  {
        eaten = true;
        d3.select(this)
          .remove();
    }
  });

  if(eaten && eating !== eaten && options.score != options.numEnemies) {
      options.score++;    
  }
  eating = eaten;
};

d3.timer(eatEnemies); //d3 timer runs constantly/repeatedly
////////////////////////////////////////////////////////////

