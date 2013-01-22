var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var intervalId;
var timerDelay = 16.67;   //60 fps
var delta = 3;

var moose = new sprite('sprites/moose_walk.png', ["down", 0], 0, 0);
var roadLines = new RoadLines(6);
moose.coords = new Object();
//TODO refactor this ugly shit
moose.coords[["down", 0]] = {"x":25, "y":29, "w":14, "h":34};
moose.coords[["down", 1]] = {"x":89, "y":28, "w":14, "h":34};
moose.coords[["down", 2]] = {"x":153, "y":29, "w":14, "h":34};

moose.coords[["right", 0]] = {"x":13, "y":163, "w":43, "h":28};
moose.coords[["right", 1]] = {"x":78, "y":161, "w":42, "h":30};
moose.coords[["right", 2]] = {"x":141, "y":162, "w":43, "h":29};

moose.coords[["left", 0]] = {"x":9, "y":98, "w":43, "h":29};
moose.coords[["left", 1]] = {"x":73, "y":97, "w":42, "h":30};
moose.coords[["left", 2]] = {"x":137, "y":99, "w":43, "h":28};

moose.coords[["up", 0]] = {"x":25, "y":223, "w":14, "h":33};
moose.coords[["up", 1]] = {"x":89, "y":223, "w":14, "h":31};
moose.coords[["up", 2]] = {"x":153, "y":224, "w":14, "h":32};

function sprite(src, state, x, y) {
  this.image = new Image();
  this.image.src = src;
  this.state = state;
  this.x = x;
  this.y = y;
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

function drawMoose() {
  var coords = moose.coords[moose.state];
  //(sprite, srcx, srcy, srcw, srch, destx, desty, destw, desth)
  ctx.drawImage(moose.image, coords.x, coords.y, coords.w, coords.h,
                moose.x, moose.y, coords.w, coords.h);
}

function drawRoad() {
  ctx.fillStyle = "grey";
  ctx.fillRect(25, 0, 350, 600)
}

function redrawAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRoad();
  roadLines.update();
  roadLines.drawLines();
  drawMoose();
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
      moose.y -= yOffset;
      moose.state[0] = "up";
      moose.state[1] = (moose.state[1] + 1) % 3;
      break;
    case aCode:
      moose.x -= xOffset;
      moose.state[0] = "left";
      moose.state[1] = (moose.state[1] + 1) % 3;
      break;
    case sCode:
      moose.y += yOffset;
      moose.state[0] = "down";
      moose.state[1] = (moose.state[1] + 1) % 3;
      break;
    case dCode:
      moose.x += xOffset;
      moose.state[0] = "right";
      moose.state[1] = (moose.state[1] + 1) % 3;
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
