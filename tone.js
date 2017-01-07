// Example showing how to produce a tone using Web Audio API.
// Load the file webaudio_tools.js before loading this file.
// This code will write to a DIV with an id="soundStatus".
var oscillator;
var amp;

// Create an oscillator and an amplifier.
function initAudio()
{
    // Use audioContext from webaudio_tools.js
    if( audioContext )
    {
        oscillator = audioContext.createOscillator();
        fixOscillator(oscillator);
        oscillator.frequency.value = 440;
        amp = audioContext.createGain();
        amp.gain.value = 0;
    
        // Connect oscillator to amp and amp to the mixer of the audioContext.
        // This is like connecting cables between jacks on a modular synth.
        oscillator.connect(amp);
        amp.connect(audioContext.destination);
        oscillator.start(0);
        writeMessageToID( "soundStatus", "<p>Audio initialized.</p>");
    }
}

// Set the frequency of the oscillator and start it running.
function startTone( frequency )
{
    var now = audioContext.currentTime;
    
    oscillator.frequency.setValueAtTime(frequency, now);
    
    // Ramp up the gain so we can hear the sound.
    // We can ramp smoothly to the desired value.
    // First we should cancel any previous scheduled events that might interfere.
    amp.gain.cancelScheduledValues(now);
    // Anchor beginning of ramp at current value.
    amp.gain.setValueAtTime(amp.gain.value, now);
    amp.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1);

    /* function forCanvas(stream) {
         source = oscillator;
       }

       forCanvas();*/
    
    writeMessageToID( "soundStatus", "<p>Play tone at frequency = " + frequency  + "</p>");
}

function stopTone()
{
    var now = audioContext.currentTime;
    amp.gain.cancelScheduledValues(now);
    amp.gain.setValueAtTime(amp.gain.value, now);
    amp.gain.linearRampToValueAtTime(0.0, audioContext.currentTime + 1.0);
    writeMessageToID( "soundStatus", "<p>Stop tone.</p>");
}

//ADDED VISUAL

var analyser = audioContext.createAnalyser();
analyser.minDecibels = -90;
analyser.maxDecibels = -10;
analyser.smoothingTimeConstant = 0.85;

var canvasFreq = document.querySelector('.visualizerfreq');
var canvasCtxFreq = canvasFreq.getContext("2d");

function visualize() {
  source = oscillator;
  source.connect(analyser);

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
        //writeMessageToID("gain", dataArray[i]);
      }

      canvasCtxFreq.lineTo(canvasFreq.width, canvasFreq.height/2);
      canvasCtxFreq.stroke();
    };

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
  initAudio();
  visualize();
}

// init once the page has finished loading.
window.onload = startYerEngines;
