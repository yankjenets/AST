var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var intervalId;
var timerDelay = 100;

var mooseState = 0;
setInterval(function() {
  mooseState = (mooseState + 1) % 3;
}, 100);
var moose = new Image();
moose.src = 'sprites/moose_walk.png';


function drawMoose() {
  switch(mooseState) {
    case 0:
      ctx.drawImage(moose, 25, 29, 14, 34, 0, 0, 14, 34);
      break;
    case 1:
      ctx.drawImage(moose, 89, 28, 14, 34, 0, 0, 14, 34);
      break;
    case 2:
      ctx.drawImage(moose, 153, 29, 14, 34, 0, 0, 14, 34);
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

function run() {
  intervalId = setInterval(onTimer, timerDelay);
}

run();
