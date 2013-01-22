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

var moose = new Sprite("sprites/moose_walk.png", "down", 0, 0, 0, mooseCoords);
var policeCar = new Sprite("sprites/police_car.png", "off", 0, 0, 0,
                           policeCoords);

function Sprite(src, state, frame, x, y, coords) {
  this.image = new Image();
  this.image.src = src;
  this.state = state;
  this.frame = frame;
  this.x = x;
  this.y = y
  this.coords = coords;
}

function draw(sprite) {
  var coords = sprite.coords[sprite.state][sprite.frame];
  //(sprite, srcx, srcy, srcw, srch, destx, desty, destw, desth)
  ctx.drawImage(sprite.image, coords.x, coords.y, coords.w, coords.h,
                sprite.x, sprite.y, coords.w, coords.h);
}

function redrawAll() {
  ctx.clearRect(0, 0, 400, 400);
  //draw(moose);
  draw(policeCar);
}

function onTimer() {
  console.log(policeCar.state);
  var xOffset = 4;
  var yOffset = 4;
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
