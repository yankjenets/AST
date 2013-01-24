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

var policeCar = new Sprite("sprites/police_car.png", "off", 0, 0, 0,
                           policeCoords, 1, 3);
var sirenBar = new Object();
sirenBar.x = 0;
sirenBar.y = 0;
sirenBar.h = 25;
sirenBar.max = 300;
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
  if(policeCar.state == "on") {
    if(sirenBar.percent > 0) {
      sirenBar.percent -= 0.01;
    }
    policeCar.speed = 6;
  } else {
    if(sirenBar.percent < 1) {
      sirenBar.percent += 0.01;
    }
    policeCar.speed = 3;
  }
  if(keys[wCode]) {
    policeCar.y -= policeCar.speed;
  }
  if(keys[aCode]) {
    policeCar.x -= policeCar.speed;
  }
  if(keys[sCode]) {
    policeCar.y += policeCar.speed;
  }
  if(keys[dCode]) {
    policeCar.x += policeCar.speed;
  }
  if(keys[spaceCode]) {
    policeCar.state = "on";
    policeCar.frame = (policeCar.frame + 1) % 8;
  } else {
    policeCar.state = "off";
    policeCar.frame = 0;
  }
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
  ctx.strokeStyle = "black";
  ctx.strokeRect(sirenBar.x, sirenBar.y, sirenBar.max,
               sirenBar.h);
  ctx.fillStyle = sirenBar.fillStyle;
  ctx.fillRect(sirenBar.x, sirenBar.y, sirenBar.max * sirenBar.percent,
               sirenBar.h);
}

function drawRoad() {
  ctx.fillStyle = "grey";
  ctx.fillRect(25, 0, 350, 600)
}

function redrawAll() {
  var i;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRoad();
  roadLines.drawLines();
  drawSirenBar();
  draw(policeCar);
  for(i = 0; i < mooses.length; i++) {
    draw(mooses[i], 2);
  }
}

function onTimer() {
  if(frame % 100 == 0) {
    console.log("spawning moose");
    spawnMoose();
  }
  updateStationary();
  roadLines.update();
  updatePoliceCar();
  if(frame % 10 == 0) {
    updateMooses();
  }

  redrawAll();
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
