var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var keys = new Object();
var wCode = 87;
var aCode = 65;
var sCode = 83;
var dCode = 68;
var spaceCode = 32;

var intervalId;
var timerDelay = 16.67;   //60 fps
var frame = 0;

var delta = 3;
var endGame = false;

var score = new Score(0);

var allObstacles = [];
var mooses = [];
var roadLines = new RoadLines(6);

//non-inclusive on high
function randomInt(low, high) {
  return Math.floor((Math.random() * (high - low)) + low);
}

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

function drawClbox(box){
  var coords = box.coords[box.state][box.frame];
  ctx.strokestyle = "FF0000";
  ctx.strokeRect(box.x, box.y, box.coords.w, box.coords.h);
}

function drawExplosion(sprite, exp_sprite){
  //Calculate midpoint of sprite
  //Also stops clock if done -> game over
  exp_sprite.x = Math.floor((sprite.x+sprite.coords.w)/2);
  exp_sprite.y = Math.floor((sprite.y+sprite.coords.h)/2);

  var coords = exp_sprite.coords[exp_sprite.state][exp_sprite.frame];

  ctx.drawImage(sprite.image, coords.x, coords.y, coords.w, coords.h,
                sprite.x, sprite.y, coords.w, coords.h);
  exp_sprite.frame++;
}

function checkCollisions(sprite){
  var i;
  for(i = 0; i < mooses.length; i++) {
    if(clboxIntersect(sprite, mooses[i])) {
      return true;
    }
  }
  return false;
}

////////////////////////////////////
/** Scrolling background objects **/
////////////////////////////////////

function updateStationary() {
  var i;
  for(i = 0; i < allObstacles.length; i++) {
    allObstacles[i].y += delta;
  }
}

function RoadLines(numLines) {
  this.lines = new Array(2 * numLines);

  for (var i = 0; i < 2 * numLines; i++) {
    this.lines[i] = new Line(185, -600 + (100*i));
  }

  this.update = function() {
    for (var i = 0; i < 2 * numLines; i++) {
      this.lines[i].update(delta);
    }
  };

  this.drawLines = function() {
    for (var i = 0; i < 2 * numLines; i++) {
      this.lines[i].drawLine();
    }
  };
}

function Line(x, y) {
  this.startx = x;
  this.starty = y;
  this.livex = x;
  this.livey = y;
  this.state = 0;

  this.update = function(delta) {
    if (this.state === 99) {
      this.state = 0;
    } else {
      this.state++;
    }

    this.livex = this.startx;
    this.livey = this.starty + (this.state * delta);
  };

  this.drawLine = function() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.livex, this.livey, 30, 50);
  }
}



///////////////////////////////////

///////////////////////////////////
////////** Score Object **/////////
///////////////////////////////////

function Score(initScore) {
  this.score = initScore;
  
  this.font = "bold 20px Ariel";
  this.fillStyle = "red";
  
  this.x = 260;
  this.y = canvas.height - 5;
  
  this.update = function() {
    this.score += delta;
  }
  
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

function drawRoad() {
  ctx.fillStyle = "grey";
  ctx.fillRect(25, 0, canvas.width - 50, canvas.height)
}

function redrawAll() {
  var i;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRoad();
  roadLines.drawLines();
  drawSirenBar();
  draw(policeCar);
  for(i = 0; i < mooses.length; i++) {
    draw(mooses[i], 2);
  }
  score.draw();
}

function onTimer() { 
  if(!endGame) {
    continueGame();
  }
  else{
    finishGame();
  }
}

function finishGame() {
  var state = 0;
   
  ctx.font="18px sans-serif";
  ctx.linewidth=1;
  ctx.strokeText("Game Over", 200, 200);
  state++;
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
  endGame = checkCollisions(policeCar);
  frame++;
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
