// fork getUserMedia for multiple browser versions, for the future
// when more browsers support MediaRecorder

navigator.getUserMedia = ( navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);

// set up basic variables for app

var record = document.querySelector('.record');
var stop = document.querySelector('.stop');
var soundClips = document.querySelector('.sound-clips');
var canvas = document.querySelector('.visualizer');
var canvasRd = document.querySelector('.visualizer-rd');

// disable stop button while not recording

stop.disabled = true;

// visualiser setup - create web audio api context and canvas

var audioCtx = new (window.AudioContext || webkitAudioContext)();
var canvasCtx = canvas.getContext("2d");
var canvasCtxRd = canvasRd.getContext("2d");

//main block for doing the audio recording

if (navigator.getUserMedia) {
  console.log('getUserMedia supported.');

  var constraints = { audio: true };
  var chunks = [];

  var onSuccess = function(stream) {
    var mediaRecorder = new MediaRecorder(stream);

    visualize(stream);

    record.onclick = function() {
      mediaRecorder.start();
      console.log(mediaRecorder.state);
      console.log("recorder started");
      record.style.background = "red";

      stop.disabled = false;
      record.disabled = true;
    }

    stop.onclick = function() {
      mediaRecorder.stop();
      console.log(mediaRecorder.state);
      console.log("recorder stopped");
      record.style.background = "";
      record.style.color = "";
      // mediaRecorder.requestData();

      stop.disabled = true;
      record.disabled = false;
    }

    mediaRecorder.onstop = function(e) {
      console.log("data available after MediaRecorder.stop() called.");

      var clipName = prompt('Enter a name for your sound clip?','My unnamed clip');
      console.log(clipName);
      var clipContainer = document.createElement('article');
      var clipLabel = document.createElement('p');
      var audio = document.createElement('audio');
      var deleteButton = document.createElement('button');
     
      clipContainer.classList.add('clip');
      audio.setAttribute('controls', '');
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'delete';

      if(clipName === null) {
        clipLabel.textContent = 'My unnamed clip';
      } else {
        clipLabel.textContent = clipName;
      }

      clipContainer.appendChild(audio);
      clipContainer.appendChild(clipLabel);
      clipContainer.appendChild(deleteButton);
      soundClips.appendChild(clipContainer);

      audio.controls = true;
      var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
      chunks = [];
      var audioURL = window.URL.createObjectURL(blob);
      audio.src = audioURL;
      console.log("recorder stopped");

      deleteButton.onclick = function(e) {
        evtTgt = e.target;
        evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
      }

      clipLabel.onclick = function() {
        var existingName = clipLabel.textContent;
        var newClipName = prompt('Enter a new name for your sound clip?');
        if(newClipName === null) {
          clipLabel.textContent = existingName;
        } else {
          clipLabel.textContent = newClipName;
        }
      }
    }

    mediaRecorder.ondataavailable = function(e) {
      chunks.push(e.data);
    }
  }

  var onError = function(err) {
    console.log('The following error occured: ' + err);
  }

  navigator.getUserMedia(constraints, onSuccess, onError);
} else {
   console.log('getUserMedia not supported on your browser!');
}

function visualize(stream) {
  var source = audioCtx.createMediaStreamSource(stream);

  var analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  //analyser.fftSize = 32;
  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);

console.log(dataArray);
  source.connect(analyser);
  //analyser.connect(audioCtx.destination);
  
  WIDTH = canvas.width;
  HEIGHT = canvas.height;

   WIDTHRD = canvasRd.width;
  HEIGHTRD = canvasRd.height;

  draw();
  //drawRd();

  function draw() {

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);
    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.beginPath();

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    var sliceWidth = WIDTH * 1.0 / bufferLength;
    var x = 0;


    for(var i = 0; i < bufferLength; i++) {
 
      var v = dataArray[i] / 128.0;
      var y = v * HEIGHT/2;

      if(i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
        //canvasCtx.moveTo(x,HEIGHT/2);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();

//path2
    /*canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();

    canvasCtx.beginPath();

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    var sliceWidth = WIDTH * 1.0 / bufferLength;
    var x = 0;


    for(var i = 0; i < bufferLength; i++) {
 
      if(dataArray[i] > 128) {
        var v = dataArray[i] / 128.0 + 1;
        //var v = 1.3;
      }else{
        var v = 1;
      }
      var y = v * HEIGHT/2;

      if(i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
        //canvasCtx.moveTo(x,HEIGHT/2);
      }

      x += sliceWidth;
    }*/


  }

  function getLow() {

    requestAnimationFrame(getLow);

    analyser.getByteTimeDomainData(dataArray);

    var lowestNum = Math.min(...dataArray);
    var vL = (lowestNum / 128)-1;
    var yL = vL * (HEIGHTRD/2);

    return yL;

  }

    function getHigh() {

    requestAnimationFrame(getHigh);

    analyser.getByteTimeDomainData(dataArray);

    var highestNum = Math.max(...dataArray);
    var vH = (highestNum / 128)-1;
    var yH = vH * (HEIGHTRD/2);

    return yH;

  }

  window.setInterval(drawRd, 20);

  function drawRdTest(){
    yH = getHigh();
  yL = getLow();

  document.getElementById("waveformNum").innerHTML = 'Hign Number:' + yH + ' Low Number:' + yL + '';
  }

  var xSW = 0;

  canvasCtxRd.fillStyle = 'rgb(200, 200, 200)';
    canvasCtxRd.fillRect(0, 0, WIDTH, HEIGHT);
  
  function drawRd(){
  //document.getElementById("waveformNum").innerHTML = drawRd();

  yH = getHigh();
  yL = getLow();


sliceWidth = WIDTH * 1/100;

      canvasCtxRd.fillStyle = 'rgb(0, 0, 0)';
    canvasCtxRd.fillRect(xSW, HEIGHTRD/2, WIDTHRD/100, yL);

    canvasCtxRd.fillStyle = 'rgb(0, 0, 0)';
    canvasCtxRd.fillRect(xSW, HEIGHTRD/2, WIDTHRD/100, yH);

    canvasCtxRd.beginPath();              
    canvasCtxRd.lineWidth = "1";
    canvasCtxRd.strokeStyle = "green";  // Green path
    canvasCtxRd.moveTo(xSW, HEIGHTRD);
    canvasCtxRd.lineTo(xSW, 0);
    canvasCtxRd.stroke();  // Draw it

      xSW += sliceWidth;

}
}

