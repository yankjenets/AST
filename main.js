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

var delta = 3;
var endGame = false;

var roadLines = new RoadLines(6);
var moose = new Sprite("sprites/moose_walk.png", "right", 0, 50, 150, mooseCoords);
var policeCar = new Sprite("sprites/police_car.png", "off", 0, 0, 0,
                           policeCoords);
var explosion = new Sprite("sprites/explosion.png", "on", 0, 0, 0, explosionCoords);

var obstacles = new Array(moose);

var sirenBar = new Object();
sirenBar.x = 0;
sirenBar.y = 575;
sirenBar.h = 25;
sirenBar.max = 300;
sirenBar.percent = 1;
sirenBar.fillStyle = "red";

function Sprite(src, state, frame, x, y, coords) {
  this.image = new Image();
  this.image.src = src;
  this.state = state;
  this.frame = frame;
  this.x = x;
  this.y = y
  this.coords = coords;
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
  ctx.strokestyle = "red";
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
    for(var i = 0; i<obstacles.length; i++){
      if(clboxIntersect(sprite, obstacles[i])){
        return true;
      }
    }
      return false;
}
////////////////////////////////////
/** Scrolling background objects **/
////////////////////////////////////

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

function draw(sprite) {
  var coords = sprite.coords[sprite.state][sprite.frame];
  //(sprite, srcx, srcy, srcw, srch, destx, desty, destw, desth)
  ctx.drawImage(sprite.image, coords.x, coords.y, coords.w, coords.h,
                sprite.x, sprite.y, coords.w, coords.h);
}

function drawSirenBar() {
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //draw(moose);
  drawRoad();
  roadLines.update();
  roadLines.drawLines();
  drawSirenBar();
  draw(moose);
  draw(policeCar);
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
  var xOffset;
  var yOffset;
  if(policeCar.state == "on") {
    if(sirenBar.percent > 0) {
      sirenBar.percent -= 0.01;
    }
    xOffset = 6;
    yOffset = 6;
  } else {
    if(sirenBar.percent < 1) {
      sirenBar.percent += 0.01;
    }
    xOffset = 4;
    yOffset = 4;
  }
  if(keys[wCode]) {
    policeCar.y -= yOffset;
  }
  if(keys[aCode]) {
    policeCar.x -= xOffset;
  }
  if(keys[sCode]) {
    policeCar.y += yOffset;
  }
  if(keys[dCode]) {
    policeCar.x += xOffset;
  }
  if(keys[spaceCode]) {
    policeCar.state = "on";
    policeCar.frame = (policeCar.frame + 1) % 8;
  } else {
    policeCar.state = "off";
    policeCar.frame = 0;
  }

  redrawAll();
  endGame = checkCollisions(policeCar);
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
