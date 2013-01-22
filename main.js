var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

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
  draw(moose);
  draw(policeCar);
}

function onTimer() {
  redrawAll();
}

function onKeyDown(event) {
  var wCode = 87;
  var aCode = 65;
  var sCode = 83;
  var dCode = 68;
  var xOffset = 10;
  var yOffset = 10;
  switch(event.keyCode) {
    case wCode:
      policeCar.y -= yOffset;
      policeCar.frame = (policeCar.frame + 1) % 1;
      break;
    case aCode:
      policeCar.x -= xOffset;
      policeCar.frame = (policeCar.frame + 1) % 1;
      break;
    case sCode:
      policeCar.y += yOffset;
      policeCar.frame = (policeCar.frame + 1) % 1;
      break;
    case dCode:
      policeCar.x += xOffset;
      policeCar.frame = (policeCar.frame + 1) % 1;
      break;
    default:
      break;
  }
}

function run() {
  canvas.addEventListener('keydown', onKeyDown, false);
  canvas.setAttribute('tabindex', '0');
  canvas.focus();
  intervalId = setInterval(onTimer, timerDelay);
}

run();
