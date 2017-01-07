<html>
<head>
</head>
<body>
<h1 onClick="start();">Start Playing</h1>
</body>
<script>// create web audio api context
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// create Oscillator node
var oscillator = audioCtx.createOscillator();

oscillator.type = 'square';
oscillator.frequency.value = 440; // value in hertz
amp = audioCtx.createGain();
amp.gain.value = 0;
oscillator.connect(amp);
amp.connect(audioCtx.destination);

function start(){
amp.gain.value = 0.1;
oscillator.start();
}
</script>
</html>