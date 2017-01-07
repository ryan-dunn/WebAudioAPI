<html>
<head>
</head>
<body>
<div id="id"></div><br>
<div id="soundStatus"></div>
<div id="gain"></div>

<canvas class="visualizerfreq" width="600" height="100"></canvas>
<br>
<canvas class="visualizerdecibel" width="600" height="100"></canvas>
<h2>ToneGen controls</h2>
<p onClick="startTone(200);">Start tone 450hz</p>
<p onClick="stopTone();">Stop tone</p>

<h2>Mic controls</h2>
<p onClick="voiceMute()">Mute button</p>
<!--<script type="text/javascript" src="webaudio_tools.js"></script>-->
<script type="text/javascript" src="mic.js"></script>
</body>
</html>