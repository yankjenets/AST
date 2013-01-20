var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var intervalId;
var timerDelay = 16.67;

var mooseState = 0;
setInterval(function() {
  mooseState = (mooseState + 1) % 3;
}, 100);
var moose = new Image();
moose.src = 'sprites/moose_walk.png';
var mooseX = 0;
var mooseY = 0;


function drawMoose() {
  switch(mooseState) {
    case 0:
      //(sprite, srcX, srcY, srcW, srcH, destX, destY, destW, destH)
      ctx.drawImage(moose, 25, 29, 14, 34, mooseX, mooseY, 14, 34);
      break;
    case 1:
      ctx.drawImage(moose, 89, 28, 14, 34, mooseX, mooseY, 14, 34);
      break;
    case 2:
      ctx.drawImage(moose, 153, 29, 14, 34, mooseX, mooseY, 14, 34);
      break;
    default:
      break;
  }
}

function redrawAll() {
  ctx.clearRect(0, 0, 400, 400);
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
      mooseY -= yOffset;
      break;
    case aCode:
      mooseX -= xOffset;
      break;
    case sCode:
      mooseY += yOffset;
      break;
    case dCode:
      mooseX += xOffset;
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
