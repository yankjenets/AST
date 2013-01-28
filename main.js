var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

//Keyboard variables
var keys = new Object();
var wCode = 87;
var aCode = 65;
var sCode = 83;
var dCode = 68;
var hCode = 72;
var spaceCode = 32;

//Timing variables
var intervalId;
var timerDelay = 16.67;   //60 fps
var frame = 0;

//Controls how fast the game is going
var delta = 3;	

//Game state constants
var MAIN_MENU = 1;
var INSTRUCTIONS = 2;
var IN_GAME = 3;
var PAUSED = 4;
var GAME_OVER = 5;

//current state of the game
var gameState = MAIN_MENU;			

//Object that keeps track of players score
var score = new Score(0);

//Objects within the game
var allObstacles = [];
var mooses = [];
var roadLines = new RoadLines(6);
var policeCar = new Sprite("sprites/police_car.png", "off", 0, 175, 200,
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
  mooses.push(moose);
  allObstacles.push(moose);
};

/* Sprite(src, state, frame, x, y, coords, numFrames, speed)
 *
 * CONSTRUCTOR
 * Creates a sprite object with the attributes passed in
 * Sprite objects are used for in-game animations
 */
function Sprite(src, state, frame, x, y, coords, numFrames, speed) {
  this.image = new Image();
  this.image.src = src;
  this.state = state;
  this.frame = frame;
  this.x = x;
  this.y = y
  this.coords = coords;
  this.numFrames = numFrames;
  this.speed = speed;
}

function updateMooses() {
  var i;
  for(i = mooses.length - 1; i >= 0; i--) {
    if(mooses[i].x < -100 ||
       mooses[i].x > canvas.width + 100 ||
       mooses[i].y > canvas.height + 100) {
      mooses.splice(i, 1);
      continue;
    }
    switch(mooses[i].state) {
      case "down":
        mooses[i].y += mooses[i].speed;
        break;
      case "up":
        mooses[i].y -= mooses[i].speed;
        break;
      case "right":
        mooses[i].x += mooses[i].speed;
        break;
      case "left":
        mooses[i].x -= mooses[i].speed;
        break;
    }
    mooses[i].frame = (mooses[i].frame + 1) % mooses[i].numFrames;
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
    if (policeCar.y < canvas.height - h - 5)
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
      sirenBar.percent += 0.01;
    }
    policeCar.speed = 3;
    policeCar.frame = 0;
  }
}

//*****************************
// Collision Box Objects
// ****************************

//Returns true if 2 sprites intersect
function clboxIntersect(sprite1, sprite2){
  var coords1 = sprite1.coords[sprite1.state][sprite1.frame];
  var coords2 = sprite2.coords[sprite2.state][sprite2.frame];
  var sp1_right = sprite1.x + coords1.w;
  var sp1_bottom = sprite1.y + coords1.h;
  var sp2_right = sprite2.x + coords2.w; 
  var sp2_bottom = sprite2.y + coords2.h;

  
  return !(sprite1.x > sp2_right || sp1_right < sprite2.x ||
          sprite1.y > sp2_bottom || sp1_bottom < sprite2.y);
}

//Just for debugging
function drawClbox(box){
  var coords = box.coords[box.state][box.frame];
  ctx.strokestyle = "FF0000";
  ctx.strokeRect(box.x, box.y, box.coords.w, box.coords.h);
}

//Explosion drawn on car if it hits any obstacles
function drawExplosion(sprite, exp_sprite){
  //exp_sprite.x = Math.floor((sprite.x+sprite.coords.h)/2);
  //exp_sprite.y = Math.floor((sprite.y+sprite.coords.h)/2);
  exp_sprite.x = sprite.x;
  exp_sprite.y = sprite.y;

  var coords = exp_sprite.coords[exp_sprite.state][exp_sprite.frame];
  console.log("Exp_coords.x"+coords.x+" Exp_coords.y:"+coords.y);

  ctx.drawImage(exp_sprite.image, coords.x, coords.y, coords.w, coords.h,
                exp_sprite.x, exp_sprite.y, coords.w, coords.h);
}

//Runs through allObjects to check if they hit police car
function checkCollisions(sprite){
  var i;
  for(i = 0; i < allObstacles.length; i++) {
    if(clboxIntersect(sprite, allObstacles[i])) {
      return true;
    }
  }
  return false;
}

////////////////////////////////////

////////////////////////////////////
/** Scrolling background objects **/
////////////////////////////////////

function updateStationary() {
  var i;
  for(i = 0; i < allObstacles.length; i++) {
    allObstacles[i].y += delta;
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
  this.lines = new Array(2 * numLines);

  //populates lines array
  for (var i = 0; i < 2 * numLines; i++) {
    this.lines[i] = new Line(185, -600 + (100*i));
  }

  /* update()
   *
   * updates container by updating each individual line
   */
  this.update = function() {
    for (var i = 0; i < 2 * numLines; i++) {
      this.lines[i].update(delta);
    }
  };

  /* draw()
   *
   * draws all roadLines by drawing each individual one
   */
  this.drawLines = function() {
    for (var i = 0; i < 2 * numLines; i++) {
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
  
  //State of the scrolling animation
  this.state = 0;

  /* update(delta)
   *
   * Determines the new location of Line using its state
   */
  this.update = function(delta) {
    if (this.state === 99) {
      this.state = 0;
    } else {
      this.state++;
    }

	//update coordinates
    this.livex = this.startx;
    this.livey = this.starty + (this.state * delta);
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
  
  //display location
  this.x = 260;
  this.y = canvas.height - 5;
  
  /* update()
   *
   * updates score by adding delta to it
   */
  this.update = function() {
    this.score += delta;
  }
  
  /* draw()
   *
   * Fills text to display score using the display characteristics and location
   */
  this.draw = function() {
     ctx.font = this.font;
     ctx.fillStyle = this.fillStyle;
     ctx.fillText("Score: " + this.score, this.x, this.y);
  }
}

////////////////////////////////////

function draw(sprite) {
  var scale = 1;
  if(arguments.length > 1) {
    scale = arguments[1];
  }
  if(!sprite.coords[sprite.state]) {
    console.log(sprite);
  }
  var coords = sprite.coords[sprite.state][sprite.frame];
  //(sprite, srcx, srcy, srcw, srch, destx, desty, destw, desth)
  ctx.drawImage(sprite.image, coords.x, coords.y, coords.w, coords.h,
                sprite.x, sprite.y, coords.w * scale, coords.h * scale);
}

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

/* runMainMenu()
 *
 * Controls function and behavior of the opening main menu
 */
function runMainMenu() {
  drawMainMenu();
  
  if(keys[spaceCode]) {
    gameState = IN_GAME;
  } else if (keys[hCode]) {
    gameState = INSTRUCTIONS;
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
}

/* runInstructions()
 *
 * Controls function and behavior of the instruction menu
 */
function runInstructions() {
  drawInstructions();
  
  if(keys[spaceCode]) {
    gameState = IN_GAME;
  }
}

function drawInstructions() {
  var main_img = new Image();
  main_img.src = "sprites/AST_instructions.png";
  ctx.drawImage(main_img, 0, 0);
}

function redrawAll() {
  var i;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRoad();
  roadLines.drawLines();
  drawSirenBar();
  draw(policeCar);
  for(i = 0; i < mooses.length; i++) {
    draw(mooses[i]);
  }
  score.draw();
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
      finishGame();
      break;
    case DEFAULT:
      throw "Invalid Game State!";
  }
}


function finishGame() {
  redrawAll();

  Explosion_state = explosion.speed;
  if(explosion.frame < 7){
    if(explosion.speed%10 == 9){
      explosion.frame = (explosion.frame + 1) % 8;
      explosion.speed = 0;
    }
    else {
      drawExplosion(policeCar, explosion);
      explosion.speed++;
      console.log("ExplosionState:"+Explosion_state);
    } 
  }
  ctx.font="18px sans-serif";
  ctx.linewidth=1;
  ctx.strokeText("Game Over", 200, 200);
}

function continueGame() {
  if(frame % 100 == 0) {
    spawnMoose();
  }
  updateStationary();
  roadLines.update();
  score.update();
  updatePoliceCar();
  if(frame % 10 == 0) {
    updateMooses();
  }

  redrawAll();
  frame++;
  console.log("Collisions:"+checkCollisions(policeCar));
  if (checkCollisions(policeCar)) {
    gameState = GAME_OVER;
  }
  console.log("GameState:"+gameState);
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
