/* Synth *****/
var ctx = new (window.AudioContext || window.webkitAudioContext)();
var output = ctx.destination;
var convolver = ctx.createConvolver();

var numberOfSliders = 12,
  sliders = [],
  i = 0;

while (i < numberOfSliders) {

  var osc = initVco({
    partial: i+1
  });

  var gain = initVca();
  osc.connect(gain);

  sliders.push({
    partial: i+1,
    osc: osc,
    vca: gain
  });

  i++;
}

initReverb(sliders);

function initVco(cfg) {
  var
    o = ctx.createOscillator(),
    params = cfg || {};

  o.type = params.wave || 'sine';
  o.frequency.value = 0;
  o.start();

  return o;
}

function initVca() {
  var g = ctx.createGain();
  g.gain.value = 0.0;
  g.connect(output);
  return g;
}

function initReverb(sliders) {
  convolver.connect(output);
  sliders.forEach(function(slider) {
    slider.vca.connect(convolver);
  });

  var ajaxRequest = new XMLHttpRequest();
  ajaxRequest.open('GET', 'stalbans_a_mono.wav', true);
  ajaxRequest.responseType = 'arraybuffer';

  ajaxRequest.onload = function() {
    var irData = ajaxRequest.response;
    ctx.decodeAudioData(irData, function(buffer) {
      ctx.createBufferSource().buffer = buffer;
      convolver.buffer = buffer;
    });


  };

  ajaxRequest.send();
}

function changeNote(root) {
  sliders.forEach(function(slider) {
    slider.osc.frequency.value = root * slider.partial;
  })
}

function changeGain(slider, newVal) {

  slider.vca.gain.value = newVal / numberOfSliders;
}


/* UI ********/

if (document.readyState != 'loading'){
  setupUI();
} else {
  document.addEventListener('DOMContentLoaded', setupUI);
}

function setupUI() {
  var sliderHeight = 300, sliderWidth = 40;

  sliders.forEach(function(slider) {

    var controls = document.getElementById('spectrum-controls'),
      div = document.createElement('div');
    div.classList.add('slider');
    controls.appendChild(div);

    var s = Snap(sliderWidth, sliderHeight);
    var negativeFill = s.rect(0, 0, sliderWidth, sliderHeight - (slider.vca.gain.value * sliderHeight));
    negativeFill.attr({
      fill: '#2a282a'
    });
    s.appendTo(div);

    // Click to change gain of harmonic
    div.addEventListener('click', function(click) {
      var value = sliderHeight - click.offsetY;

      // Move the slider
      negativeFill.animate({
        height: click.offsetY
      }, 200);

      // Change the gain
      changeGain(slider, (value / sliderHeight));

      // Double click will silence harmonic
      if (click.detail > 1) {

        changeGain(slider, 0.0);

        negativeFill.stop();
        negativeFill.animate({
          height: sliderHeight
        }, 50);
      }
    });

  });

  // Set up keyboard events
  document.addEventListener('keydown', keyDownHandle);
  document.addEventListener('keyup', keyUpHandle);

  function keyDownHandle(key) {
    var note = keyboardMapping()[key.keyCode];
    if (note) {
      var freq = frequencyMap()[note];
      if (freq) {
        changeNote(freq);
        sparkle();
      }
    }
  }

  function keyUpHandle() {

  }

  function sparkle() {
    var sliders = document.getElementsByClassName('slider');
    Object.keys(sliders).forEach(function(index) {
      sliders[index].classList.add('sparkling');
      window.setTimeout(function() {
        sliders[index].classList.remove('sparkling');
      }, 100)
    });
  }

  function keyboardMapping() {
    return {
      65: 'a',
      83: 'd',
      68: 'e',
      70: 'f',
      71: 'g',
      72: 'a',
      74: 'b',
      75: 'c2',
      76: 'd2'
    }
  }

  function frequencyMap() {
    return {
      c: 261.6,
      csh: 277.2,
      d: 297.7,
      dsh: 311.1,
      e: 329.6,
      f: 349.2,
      fsh: 370,
      g: 392,
      gsh: 415.3,
      a: 440,
      ash: 466.2,
      b: 493.9,
      c2: 523.2
    }
  }
}