// Example showing how to produce a tone using Web Audio API.
// Load the file webaudio_tools.js before loading this file.
// This code will write to a DIV with an id="soundStatus".

function createAudioContext()
{
  var contextClass = (window.AudioContext ||
      window.webkitAudioContext ||
      window.mozAudioContext ||
      window.oAudioContext);
  if (contextClass) {
    return new contextClass();
  } else {
    alert("Sorry. WebAudio API not supported. Try using the Google Chrome or Safari browser.");
    return null;
  }
}

function writeMessageToID(id,message)
{
  // Voodoo for browser compatibility.
  d = document;
  re = d.all ? d.all[id] : d.getElementById(id);
  if (re) {
    re.innerHTML = message;
  }
}

// Start off by initializing a new audioContext.
var audioContext =  createAudioContext();

    // Use audioContext from webaudio_tools.js
    if( audioContext )
    {
var analyser = audioContext.createAnalyser();
var gainNode = audioContext.createGain();
var delayNode = audioContext.createDelay(2.5);
var distortion = audioContext.createWaveShaper();

var source;
var stream;
if (navigator.mediaDevices) {
    console.log('getUserMedia supported.');
navigator.getUserMedia(
  {
    audio:true
  },

function(stream){
  console.log('source connected');
source = audioContext.createMediaStreamSource(stream);
source.connect(analyser);
  source.connect(gainNode);
  source.connect(distortion);
  //source.connect(delayNode);
  //delayNode.connect(audioContext.destination);
  gainNode.connect(audioContext.destination);
  distortion.connect(audioContext.destination);
  visualize();
},

function(err) {
         console.log('The following gUM error occured: ' + err);
      }
);

gainNode.gain.value = 1
analyser.minDecibels = -90;
analyser.maxDecibels = -10;
analyser.smoothingTimeConstant = 0.85;
//delayNode.delayTime.value = 5.0;

//start distortion testing
function makeDistortionCurve(amount) {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  console.log(curve);
  return curve;
};

distortion.curve = makeDistortionCurve(400);
distortion.oversample = '4x';

//end distortion testing

} else { console.log("not supported");}
        

        writeMessageToID( "soundStatus", "<p>Audio initialized.</p>");

        /*function voiceMute() {
  if(mute.id == "") {
    gainNode.gain.value = 0;
    mute.id = "activated";
    mute.innerHTML = "Unmute";
    writeMessageToID( "soundStatus", "<p>Audio muted.</p>");
  } else {
    gainNode.gain.value = 1;
    mute.id = "";
    mute.innerHTML = "Mute";
    writeMessageToID( "soundStatus", "<p>Audio initialized.</p>");
  }
}*/

    }


//ADDED VISUAL

var canvasFreq = document.querySelector('.visualizerfreq');
var canvasCtxFreq = canvasFreq.getContext("2d");


function visualize() {
  WIDTH = canvasFreq.width;
  HEIGHT = canvasFreq.height;


  //var visualSetting = visualSelect.value;
  var visualSetting = "sinewave";
  console.log(visualSetting);

  if(visualSetting == "sinewave") {
    analyser.fftSize = 2048;
    var bufferLength = analyser.fftSize;
    console.log(bufferLength);
    var dataArray = new Uint8Array(bufferLength);

    canvasCtxFreq.clearRect(0, 0, WIDTH, HEIGHT);

    function draw() {

      drawVisual = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      canvasCtxFreq.fillStyle = 'rgb(200, 200, 200)';
      canvasCtxFreq.fillRect(0, 0, WIDTH, HEIGHT);

      canvasCtxFreq.lineWidth = 2;
      canvasCtxFreq.strokeStyle = 'rgb(0, 0, 0)';

      canvasCtxFreq.beginPath();

      var sliceWidth = WIDTH * 1.0 / bufferLength;
      var x = 0;

      for(var i = 0; i < bufferLength; i++) {
   
        var v = dataArray[i] / 128.0;
        var y = v * HEIGHT/2;

        if(i === 0) {
          canvasCtxFreq.moveTo(x, y);
        } else {
          canvasCtxFreq.lineTo(x, y);
        }

        x += sliceWidth;
        writeMessageToID("gain", dataArray[i]);
      }

      canvasCtxFreq.lineTo(canvasFreq.width, canvasFreq.height/2);
      canvasCtxFreq.stroke();
    };
console.log(gainNode.gain.value);
    draw();

  } else if(visualSetting == "frequencybars") {
    analyser.fftSize = 256;
    var bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);
    var dataArray = new Uint8Array(bufferLength);

    canvasCtxFreq.clearRect(0, 0, WIDTH, HEIGHT);

    function draw() {
      drawVisual = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      canvasCtxFreq.fillStyle = 'rgb(0, 0, 0)';
      canvasCtxFreq.fillRect(0, 0, WIDTH, HEIGHT);

      var barWidth = (WIDTH / bufferLength) * 2.5;
      var barHeight;
      var x = 0;

      for(var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        canvasCtxFreq.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
        canvasCtxFreq.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2);

        x += barWidth + 1;
      }
    };

    draw();

  } else if(visualSetting == "off") {
    canvasCtxFreq.clearRect(0, 0, WIDTH, HEIGHT);
    canvasCtxFreq.fillStyle = "red";
    canvasCtxFreq.fillRect(0, 0, WIDTH, HEIGHT);
  }

}

var startYerEngines = function(){
  //initAudio();
  visualize();
}
// init once the page has finished loading.
window.onload = startYerEngines;
