/* Alaskan State Troopers - the Game
 *
 * Based off of the hit National Geographic television show.
 *
 * Designed and developed by:
 * Daniel Deutsch - ddeutsch
 * Tyler Healy - thealy
 * Michael Hankowsky - mhankows
 */

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

//Keyboard variables
var keys = new Object();
var wCode = 87;
var aCode = 65;
var sCode = 83;
var dCode = 68;
var hCode = 72;
var rCode = 82;
var spaceCode = 32;
var oneCode = 49;
var twoCode = 50;
var threeCode = 51;
var fourCode = 52;
var numpadOneCode = 97;
var numpadTwoCode = 98;
var numpadThreeCode = 99;
var numpadFourCode = 100;

//Timing variables
var intervalId;
var timerDelay = 16.67;   //60 fps
var frame = 0;

//Determines how long the game has been running
var gameCounter = 0;

//Controls how fast the game is going
var delta = 1;

//1 for easy, 2 for medium, 3 for hard, 4 for very hard
var difficulty = 1;
var MAX_DIFFICULTY = 4;
var multiplier = 0;

//Game state constants
var MAIN_MENU = 1;
var INSTRUCTIONS = 2;
var IN_GAME = 3;
var PAUSED = 4;
var GAME_OVER = 5;

//current state of the game
var gameState = MAIN_MENU;

//Local high score of the game
var highscore = 0;

//Object that keeps track of players score
var score = new Score(0);

//Objects within the game
var allObstacles = [];
var mooses = [];
var enemyCars = [];
var bonusScores = [];
var explodeCars = [];
var handcuffs = [];
var trees = new Tree_List(15);
var roadLines = new RoadLines(7);
var policeCar = new Sprite("sprites/police_car.png", "off", 0, 175, 400,
                           policeCoords, 1, 3);
var explosion = new Sprite("sprites/explosion.png", "on", 0, 0, 0,
                           explosionCoords, 8, 0);

var sirenBar = new Object();
sirenBar.x = 0;
sirenBar.y = 575;
sirenBar.h = 25;
sirenBar.max = 250;
sirenBar.percent = 1;
sirenBar.fillStyle = "red";

/* randomInt(low, high)
 *
 * RETURNS a random integer between low inclusive and high exclusive
 */
function randomInt(low, high) {
  return Math.floor((Math.random() * (high - low)) + low);
}

/* spawnMoose()
 *
 * Creates a moose obstacle at a random x location facing a random direction
 * with a random speed
 */
function spawnMoose() {
  var x = randomInt(0, 400);
  var y = -100;
  var state;
  var rand = randomInt(0, 4);
  switch (randomInt(0, 4)) {
    case 0:
      state = "up";
      break;
    case 1:
      state = "down";
      break;
    case 2:
      state = "left";
      break;
    case 3:
      state = "right";
      break;
  }
  var speed = randomInt(8, 15);
  var moose = new Sprite("sprites/moose_walk.png", state, 0, x, y,
                         mooseCoords, 3, speed);
  allObstacles.push([moose, "moose"]);
};

function spawnCar() {
  var x = randomInt(50, 350);
  var y = -100;
  var car;
  switch (randomInt(0, difficulty)) {
    case 0:
      car = new Sprite("sprites/truck.png", "on", 0, x, y,
                       truckCoords, 1, 1);
      break;
    case 1:
      car = new Sprite("sprites/grey_car.png", "on", 0, x, y,
                       greyCarCoords, 1, 2);
      break;
    case 2:
      car = new Sprite("sprites/blue_car.png", "on", 0, x, y,
                       blueCarCoords, 1, 3);
      break;
    default:
      car = new Sprite("sprites/yellow_car.png", "on", 0, x, y,
                       yellowCarCoords, 1, 4);
      break;
  }
  if(randomInt(0, 3) == 2) {
    allObstacles.push([car, "drunk-car"]);
  } else {
    allObstacles.push([car, "sober-car"]);
  }
}

/* Sprite(src, state, frame, x, y, coords, numFrames, speed)
 *
 * CONSTRUCTOR
 * Creates a sprite object with the attributes passed in
 * Sprite objects are used for in-game animations
 */
function Sprite(src, state, frame1, x, y, coords, numFrames, speed) {
  this.image = new Image();
  this.image.src = src;
  this.state = state;
  this.frame = frame1;
  this.x = x;
  this.y = y
  this.coords = coords;
  this.numFrames = numFrames;
  this.speed = speed;
  this.createdOn = frame;
}

function updateObstacles() {
  var i;
  for(i = allObstacles.length - 1; i >= 0; i--) {
    var ob = allObstacles[i];
    if(ob[0].x < -100 ||
       ob[0].x > canvas.width + 100) {
      allObstacles.splice(i, 1);
      continue;
    }
    if(ob[0].y > canvas.height &&
       ob[1] == "drunk-car") {
      bonusScores.push([ob[0].x, canvas.height - 60, 100, -1000]);
      multiplier = 0;
      score.score -= 1000;
      allObstacles.splice(i, 1);
      continue;
    }
    if(ob[1] == "moose") {
      if(frame % 10 == 0) {
        switch(ob[0].state) {
          case "down":
            ob[0].y += ob[0].speed;
            break;
          case "up":
            ob[0].y -= ob[0].speed;
            break;
          case "right":
            ob[0].x += ob[0].speed;
            break;
          case "left":
            ob[0].x -= ob[0].speed;
            break;
        }
        ob[0].frame = (ob[0].frame + 1) % ob[0].numFrames;
      }
    } else if(ob[1] == "sober-car") {
      ob[0].y += ob[0].speed;
      ob[0].frame = (ob[0].frame + 1) % ob[0].numFrames;
    } else if(ob[1] == "drunk-car") {
      ob[0].y += ob[0].speed;
      ob[0].x += 2 * Math.sin((frame - ob[0].createdOn) / 10);
      ob[0].frame = (ob[0].frame + 1) % ob[0].numFrames;
    }
  }
}

function updatePoliceCar() {
  var h = policeCar.coords[policeCar.state][policeCar.frame].h;
  var w = policeCar.coords[policeCar.state][policeCar.frame].w;

  if(keys[wCode]) {
    if (policeCar.y > 5)
      policeCar.y -= policeCar.speed;
  }
  if(keys[aCode]) {
    if (policeCar.x > 30)
    policeCar.x -= policeCar.speed;
  }
  if(keys[sCode]) {
    if (policeCar.y < canvas.height - h - 30)
      policeCar.y += policeCar.speed;
  }
  if(keys[dCode]) {
    if (policeCar.x < 370 - w)
      policeCar.x += policeCar.speed;
  }
  if(keys[spaceCode]) {
    policeCar.state = "on";
  } else {
    policeCar.state = "off";
  }

  if(policeCar.state == "on") {
    if(sirenBar.percent > 0) {
      sirenBar.percent -= 0.01;
      policeCar.speed = 6;
      policeCar.frame = (policeCar.frame + 1) % 8;
    } else {
      policeCar.state = "off";
      policeCar.speed = 3;
      policeCar.frame = 0;
    }
  } else {
    if(sirenBar.percent < 1) {
      sirenBar.percent += 0.002;
    }
    policeCar.speed = 3;
    policeCar.frame = 0;
  }
}

function updateExplodeCars() {
  for(var i = 0; i < explodeCars.length; i++) {
    if(explodeCars[i][0].speed >= 79) {
      explodeCars.splice(i, 1);
    } else {
      explodeCars[i][0].speed++;
      explodeCars[i][2].frame = Math.floor(explodeCars[i][0].speed / 10);
      drawExplosion(explodeCars[i][0], explodeCars[i][2]);
    }
  }
}

//*****************************
// Collision Box Objects
// ****************************

//Returns true if 2 sprites intersect
function clboxIntersect(sprite1, sprite2, offset) {
  var coords1 = sprite1.coords[sprite1.state][sprite1.frame];
  var coords2 = sprite2.coords[sprite2.state][sprite2.frame];
  var sp1_right = sprite1.x + coords1.w;
  var sp1_bottom = sprite1.y + coords1.h;
  var sp2_right = sprite2.x + coords2.w;
  var sp2_bottom = sprite2.y + coords2.h + offset;


  return !(sprite1.x > sp2_right || sp1_right < sprite2.x ||
          sprite1.y > sp2_bottom || sp1_bottom < (sprite2.y + offset));
}

//Explosion drawn on car if it hits any obstacles
function drawExplosion(sprite, exp_sprite){
  exp_sprite.x = sprite.x;
  exp_sprite.y = sprite.y;

  var coords = exp_sprite.coords[exp_sprite.state][exp_sprite.frame];

  ctx.drawImage(exp_sprite.image, coords.x, coords.y, coords.w, coords.h,
                exp_sprite.x, exp_sprite.y, coords.w, coords.h);
}

/* checkCollisions(sprite)
 *
 * Runs through allObstacles to check if they hit police car
 */
function checkCollisions(sprite){
  var i;
  for(i = 0; i < allObstacles.length; i++) {
    if(clboxIntersect(sprite, allObstacles[i][0], 0)) {
      return true;
    }
  }

  for(i = 0; i < explodeCars.length; i++) {
    if(clboxIntersect(sprite, explodeCars[i][0], 0)) {
      return true;
    }
  }
  return false;
}

/* checkDrunkCollision(sprite)
 *
 * loops through all "drunk" cars and sees if there is a collision with
 * the given sprite
 */
function checkDrunkCollisions(sprite){
  var i;
  for(i = allObstacles.length - 1; i >= 0; i--) {
    var ob = allObstacles[i][0];
    if((policeCar.state == "on") &&
       (allObstacles[i][1] == "drunk-car") &&
       (clboxIntersect(sprite, ob, ob.coords[ob.state][ob.frame].h))) {
      multiplier += 1;
      bonusScores.push([ob.x, ob.y, 100, "+" + difficulty * 500 * multiplier]);
      bonusScores.push([ob.x, ob.y - 20, 100, "x" + multiplier]);
      score.score += difficulty * 500 * multiplier;
      drawHandcuffs(allObstacles[i][0].x, allObstacles[i][0].y);
      allObstacles.splice(i, 1);
    }
  }
}

/* checkMooseCollisions()
 *
 * Checks to see if two moose collide. If so, turn both around.
 */
function checkObstacleCollisions() {
  var ob1;
  var ob2;

  for (var i = 0; i < allObstacles.length; i++) {
    ob1 = allObstacles[i];

    for (var j = i+1; j < allObstacles.length; j++) {
      ob2 = allObstacles[j];

      if (clboxIntersect(ob1[0], ob2[0], 0)) {
        if (ob1[1] === "moose" && ob2[1] === "moose") {
          if (ob1.state !== ob2.state) {
            turnMooseAround(ob1[0]);
          }
          turnMooseAround(ob2[0]);
        } else {
          if (ob1[1] !== "moose") {
            ob1[0].speed = 0;
            ob1[2] = new Sprite("sprites/explosion.png", "on", 0, 0, 0,
                                 explosionCoords, 8, 0);
            explodeCars.push(ob1);
            allObstacles.splice(i, 1);

            if (ob2[1] !== "moose") {
              ob2[0].speed = 0;
              ob2[2] = new Sprite("sprites/explosion.png", "on", 0, 0, 0,
                                   explosionCoords, 8, 0);
              explodeCars.push(ob2);
              allObstacles.splice(j-1, 1);
            } else {
              if (ob2[0].x < ob1[0].x) {
                ob2[0].state = "left";
                ob2[0].x -= 10;
              } else {
                ob2[0].state = "right";
                ob2[0].x += 10;
              }
            }
          } else if (ob2[1] !== "moose") {
            ob2[0].speed = 0;
            ob2[2] = new Sprite("sprites/explosion.png", "on", 0, 0, 0,
                                explosionCoords, 8, 0);
            explodeCars.push(ob2);
            allObstacles.splice(j, 1);
              
            if (ob1[0].x < ob2[0].x) {
              ob1[0].state = "left";
              ob1[0].x -= 10;
            } else {
              ob1[0].state = "right";
              ob1[0].x += 10;
            }
          }
        }
      }
    }
  }
}

/* turnMooseAround(ob)
 *
 * Changes the direction of ob and moves it changeDis to avoid another collision
 */
function turnMooseAround(ob) {
  var changeDis = 50;

  if (ob.state === "up") {
    ob.state = "down";
    ob.y += changeDis;
  } else if (ob.state === "down") {
    ob.state = "up";
    ob.y -= changeDis;
  } else if (ob.state === "left") {
    ob.state = "right";
    ob.x += changeDis;
  } else {
    ob.state = "left";
    ob.x -= changeDis;
  }
}

////////////////////////////////////
/** Scrolling background objects **/
////////////////////////////////////

function Tree_List(numTrees){
  this.image = new Image();
  this.image.src = "sprites/tree.png";
  this.trees = new Array(numTrees);

  var i;
  for(i=0; i<numTrees; i+=2){
    this.trees[i] = new Tree(-20, (50*i));
    this.trees[i+1] = new Tree(380, (50*i));
  }

  this.draw = function(){
    for(var i=0; i<numTrees; i++)
      this.trees[i].draw(this.image);
  };

  this.update = function(){
    for(var i=0; i<numTrees; i++){
      this.trees[i].update();
    }
  };

}

/* Tree(x, y)
 *
 * CONSTRUCTOR: Creates a new and simple tree object
 */
function Tree(x, y){

  this.cur_x = x;
  this.cur_y = y;


  this.update = function(){
    if(this.cur_y > 600){
      this.cur_y = -100;
    }
    this.cur_y += delta;
  };

  this.draw = function(img){
    ctx.drawImage(img, this.cur_x, this.cur_y);
  }
}
/* updateStationary()
 *
 * updates cars and mooses to move with respect to road.
 */
function updateStationary() {
  var i;
  for(i = 0; i < allObstacles.length; i++) {
    allObstacles[i][0].y += delta;
  }
  for(i = 0; i < explodeCars.length; i++) {
    explodeCars[i][0].y += delta;
  }
}

/* RoadLines(numLines)
 *
 * CONSTRUCTOR
 * Creates a container that contains 2*numLines Line objects
 */
function RoadLines(numLines) {
  /* numLines determines how many are on the road to start
   * twice as many are in the container so that scrolling appears continuous
   */
  this.lines = new Array(numLines);

  //populates lines array
  for (var i = 0; i < numLines; i++) {
    this.lines[i] = new Line(185, (100*i));
  }

  /* update()
   *
   * updates container by updating each individual line
   */
  this.update = function() {
    for (var i = 0; i <  numLines; i++) {
      this.lines[i].update(delta);
    }
  };

  /* draw()
   *
   * draws all roadLines by drawing each individual one
   */
  this.drawLines = function() {
    for (var i = 0; i <  numLines; i++) {
      this.lines[i].drawLine();
    }
  };
}

/* Line(x, y)
 *
 * CONSTRUCTOR
 * Creates a Line object with initial coordinates (x, y)
 * The Line object is displayed on the road and is used in scrolling to
 * make it appear as if the car is travelling
 */
function Line(x, y) {
  //Initial coordinates
  this.startx = x;
  this.starty = y;

  //Current coordinates
  this.livex = x;
  this.livey = y;

  /* update(delta)
   *
   * Determines the new location of Line using its state
   */
  this.update = function(delta) {
    if (this.livey >= 600) {
      this.livey -= 700;
    }

	//update coordinates
    this.livex = this.startx;
    this.livey += delta;
    //this.livey = this.starty + (this.state * delta);
  };

  /* drawLine
   *
   * Fills a yellow, 30x50 rectangle at the current coordinates
   */
  this.drawLine = function() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.livex, this.livey, 30, 50);
  }
}

///////////////////////////////////
////////** Score Object **/////////
///////////////////////////////////

/* Score(initScore)
 *
 * CONSTRUCTOR
 * Creates an object that keeps track of the player's score as well as
 * data that controls how the score is displayed
 */
function Score(initScore) {
  this.score = initScore;

  //display characteristics
  this.font = "bold 20px Ariel";
  this.fillStyle = "red";
  this.textAlign = "start";

  //display location
  this.x = 260;
  this.y = canvas.height - 5;

  /* reset()
   *
   * resets the score to 0
   */
  this.reset = function() {
    this.score = 0;
  }

  /* update()
   *
   * updates score by adding delta to it
   */
  this.update = function() {
    this.score += difficulty * delta;
  }

  /* draw()
   *
   * Fills text to display score using the display characteristics and location
   */
  this.draw = function() {
     ctx.font = this.font;
     ctx.textAlign = this.textAlign;
     ctx.fillStyle = this.fillStyle;
     ctx.fillText("Score: " + this.score, this.x, this.y);
  }
}

////////////////////////////////////

/* drawSprite
 *
 * draws sprite with the objects cords and dimensions
 */
function draw(sprite) {
  var scale = 1;
  if(arguments.length > 1) {
    scale = arguments[1];
  }
  var coords = sprite.coords[sprite.state][sprite.frame];
  //(sprite, srcx, srcy, srcw, srch, destx, desty, destw, desth)
  ctx.drawImage(sprite.image, coords.x, coords.y, coords.w, coords.h,
                sprite.x, sprite.y, coords.w * scale, coords.h * scale);
}

/* drawSirenBar()
 *
 * draws the bar on bottom
 */
function drawSirenBar() {
  ctx.fillStyle = "white";
  ctx.fillRect(sirenBar.x, sirenBar.y, sirenBar.max, sirenBar.h);
  ctx.strokeStyle = "black";
  ctx.strokeRect(sirenBar.x, sirenBar.y, sirenBar.max,
               sirenBar.h);
  ctx.fillStyle = sirenBar.fillStyle;
  ctx.fillRect(sirenBar.x, sirenBar.y, sirenBar.max * sirenBar.percent,
               sirenBar.h);
}

/* drawRoad()
 *
 * Draws a grey rectangle spanning most of the canvas to represent the road
 */
function drawRoad() {
  ctx.fillStyle = "grey";
  ctx.fillRect(25, 0, canvas.width - 50, canvas.height)
}

function drawDifficulty() {
  ctx.fillStyle = "red";
  ctx.font = "bold 20px Ariel";
  ctx.textAlign = "start";

  ctx.fillText("Difficulty: " + difficulty, 260, canvas.height - 30);
}

/* drawHandcuffs()
 *
 * Draws handcuffs after a car is caught
 */
function drawHandcuffs(x, y){
  var new_x = Math.round(x);
  var new_y = Math.round(y);
  var cuffs = new Sprite("sprites/handcuffs.png", "on", 0, new_x, new_y, cuffCords, 1, 0);
  draw(cuffs);
  handcuffs.push(cuffs);
}

/* updateHandcuffs()
 *
 * updates all cuffs, takes out old ones
 */
function updateHandcuffs(){
  var i;
  for(i=handcuffs.length -1; i>=0; i--){
    var cuf = handcuffs[i];
    if(cuf.speed == 20){
      handcuffs.splice(i,1);
    } else {
      draw(handcuffs[i]);
      cuf.speed++;
    }
  }
}

/* runMainMenu()
 *
 * Controls function and behavior of the opening main menu
 */
function runMainMenu() {
  drawMainMenu();

  if(keys[oneCode] || keys[numpadOneCode]) {
    difficulty = 1;
    drawDifficulty();
  }
  if(keys[twoCode] || keys[numpadTwoCode]) {
    difficulty = 2;
    drawDifficulty();
  }
  if(keys[threeCode] || keys[numpadThreeCode]) {
    difficulty = 3;
    drawDifficulty();
  }
  if(keys[fourCode] || keys[numpadFourCode]) {
    difficulty = 4;
    drawDifficulty();
  }
  if(keys[spaceCode]) {
    gameState = IN_GAME;
    keys[spaceCode] = 0;
  } else if (keys[hCode]) {
    gameState = INSTRUCTIONS;
    keys[hCode] = 0;
  }
}

/* drawMainMenu()
 *
 * Draws the main menu graphics and text
 */
function drawMainMenu() {
  var mainImage = new Image();
  mainImage.src = "sprites/AST_menu.png";
  ctx.drawImage(mainImage, 0, 0);
  drawDifficulty();
}

/* runInstructions()
 *
 * Controls function and behavior of the instruction menu
 */
function runInstructions() {
  drawInstructions();

  if(keys[spaceCode]) {
    gameState = IN_GAME;
    keys[spaceCode] = 0;
  }
}

function drawInstructions() {
  var main_img = new Image();
  main_img.src = "sprites/AST_instructions.png";
  ctx.drawImage(main_img, 0, 0);
}

function drawBonusScores() {
  var i;
  ctx.font = "bold 20px Ariel";
  ctx.textAlign = "start";
  for(i = bonusScores.length - 1; i >= 0; i--) {
    if(bonusScores[i][2] > 0) {
      if(bonusScores[i][3] > 0) {
        ctx.fillStyle = "green";
      } else {
        ctx.fillStyle = "red";
      }
      ctx.fillText(bonusScores[i][3], bonusScores[i][0], bonusScores[i][1]);
      bonusScores[i][2] -= 1;
    } else {
      bonusScores.splice(i, 1);
    }
  }
}

function drawEndexplosion(){
  if(explosion.state == "on"){
    if(explosion.frame == 6){
      explosion.state = "off"
      explosion.frame = 0;
    }
    else if(explosion.speed%10 == 9){
      explosion.frame = (explosion.frame + 1) % 8;
      explosion.speed = 0;
    }
    else {
      drawExplosion(policeCar, explosion);
      explosion.speed++;
    }
  }
  else{
    drawExplosion(policeCar, explosion);
    explosion.frame = Math.floor(explosion.speed);
    explosion.speed = (explosion.speed + .1) % 3;
  }
}

function resetExplosion() {
  explosion.state = "on";
  explosion.speed = 0;
  explosion.frame = 0;
}

function redrawAll() {
  var i;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRoad();
  roadLines.drawLines();
  draw(policeCar);
  for(i = 0; i < allObstacles.length; i++) {
    draw(allObstacles[i][0]);
  }
  drawBonusScores();
  for(i = 0; i < explodeCars.length; i++) {
    draw(explodeCars[i][0]);
  }
  updateExplodeCars();
  updateHandcuffs();
  trees.draw();
  drawSirenBar();
  score.draw();
  drawDifficulty();
}

//***********************************
//Start the main game methods
//***********************************

/* onTimer()
 *
 * At each interval, the state of the game is checked and the appropriate
 * function is called.
 */
function onTimer() {
  switch(gameState) {
    case MAIN_MENU:
      runMainMenu();
      break;
    case INSTRUCTIONS:
      runInstructions();
      break;
    case IN_GAME:
      continueGame();
      break;
    case PAUSED: break;
    case GAME_OVER:
      runEnd();
      break;
    case DEFAULT:
      throw "Invalid Game State!";
  }
}

function resetGame(){
  allObstacles = [];
  explodeCars = [];
  policeCar.x = 175;
  policeCar.y = 400;
  explosion.frame = 0;
  delta = 1;
  gameCounter = 0;
  if(score.score > highscore){
    highscore = score.score;
  }
  score.reset();
  sirenBar.percent = 1;
  multiplier = 0;
  resetExplosion();
}

function runEnd() {
  drawEnd();

  if(keys[hCode]){
    resetGame();
    gameState = MAIN_MENU;
    keys[hCode] = 0;
  } else if(keys[rCode]){
    resetGame();
    gameState = IN_GAME;
    keys[rCode] = 0;
  }
}

function drawEnd() {
  redrawAll();

  drawEndexplosion();

  ctx.fillStyle = "blue";
  ctx.font="60px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", 200, 200);

  if(score.score > highscore){
    ctx.font="40px sans-serif";
    ctx.fillText("New HighScore!!!!", 200, 240);
    ctx.font="30px sans-serif";
    ctx.fillText("Old HighScore: "+ highscore, 200, 280);
  }
  else{
  ctx.font="30px sans-serif";
  ctx.fillText("HighScore: "+ highscore, 200, 280);
  }

  ctx.font="20px sans-serif";
  ctx.fillText("Press H to go to the main menu", 200, 330);
  ctx.fillText("Press R to restart", 200, 350);
}

function continueGame() {
  if(frame % (90 - (2 * delta * difficulty)) == 0) {
    //spawnMoose();
    spawnCar();
  }
  if (frame % (130 - (2 * delta * difficulty)) == 0) {
    spawnMoose();
  }
  updateStationary();
  roadLines.update();
  score.update();
  trees.update();
  updatePoliceCar();
  updateObstacles();
  checkObstacleCollisions();
  checkDrunkCollisions(policeCar);

  if (gameCounter <= 4500) {
    gameCounter++;
  }

  delta = Math.floor(gameCounter / 300) + 1;

  redrawAll();
  frame++;
  if (checkCollisions(policeCar)) {
    gameState = GAME_OVER;
    keys[spaceCode] = 0;
  }
}

function onKeyDown(event) {
  var code = event.keyCode;
  keys[code] = 1;
}

function onKeyUp(event) {
  var code = event.keyCode;
  keys[code] = 0;
}

function run() {
  canvas.addEventListener('keydown', onKeyDown, false);
  canvas.addEventListener('keyup', onKeyUp, false);
  canvas.setAttribute('tabindex', '0');
  canvas.focus();
  intervalId = setInterval(onTimer, timerDelay);
}

run();
