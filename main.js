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
var policeCar = new Sprite("sprites/police_car_new.png", "off", 0, 0, 0,
                           policeCoords);
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
  var sp1_right = sprite1.x + sprite1.coords.w;
  var sp1_bottom = sprite1.y + sprite1.coords.h;
  var sp2_right = sprite2.x + sprite2.coords.w; 
  var sp2_bottom = sprite2.y + sprite2.coords.h;
              
  return !(sprite1.x > sp2_right || sp1_right < sprite2.x ||
          sprite1.y > sp2_bottom || sp1_bottom < sprite2.y);
}

function drawClbox(sprite){
  ctx.strokestyle = "red";
  ctx.strokeRect( box.x, box.y, box.width, box.height);
    }

function drawExplosion(sprite){
    //Calculate midpoint of sprite
    var mid_x = Math.floor( (sprite.x+sprite.coords.w)/2);
    var mid_y = Math.floor( (sprite.y+sprite.coords.h)/2);
}

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

function redrawAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //draw(moose);
  drawSirenBar();
  draw(policeCar);
}

function onTimer() {
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
