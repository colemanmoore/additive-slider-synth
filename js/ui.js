/**
 * Additive synth with slider harmonic controls and keyboard note control
 */

Synth.init(13);
Synth.initReverb('stalbans_a_mono.wav');


/* UI ********/

if (document.readyState != 'loading'){
  setupUI();
} else {
  document.addEventListener('DOMContentLoaded', setupUI);
}

function setupUI() {

  var sliderHeight = 300, sliderWidth = 40,
    controls = document.getElementById('spectrum-controls');

  Synth.voices().forEach(function(voice) {

    // Space the sider can move around in
    var sliderSlot = document.createElement('div');
    sliderSlot.classList.add('slider-slot');
    controls.appendChild(sliderSlot);

    // The slider div
    var div = document.createElement('div');
    div.classList.add('slider');
    div.classList.add('can-move');
    sliderSlot.appendChild(div);

    // Using a negative gray fill because it's easier to svg top to bottom
    var s = Snap(sliderWidth, sliderHeight);
    var negativeFill = s.rect(0, 0, sliderWidth, sliderHeight - (voice.vca.gain.value * sliderHeight));
    negativeFill.attr({
      fill: '#2a282a'
    });
    s.appendTo(div);

    // Voice events
    div.addEventListener('mousedown', mouseDownHandle);
    div.addEventListener('mouseup', mouseUpHandle);

    var xPosStart, xPosEnd, yPosStart, yPosEnd, sliderXPosition;

    function mouseDownHandle(event) {

      xPosStart = xPosEnd = event.pageX;
      yPosStart = yPosEnd = event.pageY;
      sliderXPosition = sliderXPosition || 5; // 5px is the middle of the slot, so its the default

      if (event.detail > 1) {
        // Double click will silence harmonic
        if (voice.vca.gain.value != 0.0) {
          silenceGain();
        } else {
          bringUpGainHalfway();
        }

      } else {
        div.addEventListener('mousemove', mouseMoveHandle);
      }
    }

    function mouseUpHandle(event) {
      if (Math.abs(event.pageY - yPosStart) > 4) {
        changeGain(event);
      }

      // Reset
      div.removeEventListener('mousemove', mouseMoveHandle);
    }

    function mouseMoveHandle(event) {

      xPosEnd = event.pageX;
      var xDelta = xPosEnd - xPosStart;
      if (xDelta != 0) {
        sliderXPosition += xDelta;
        var deltaInRange = Math.min(Math.max(0, sliderXPosition), 10);
        div.style.left = deltaInRange + 'px';
        changePartial(deltaInRange);
      }
      xPosStart = xPosEnd;

      yPosEnd = event.pageY;
      var yDelta = yPosEnd - yPosStart;
      if (yDelta != 0) {
        changeGain(event);
      }
    }


    function changeGain(click) {
      var value = sliderHeight - click.offsetY;

      // Move the slider
      negativeFill.animate({
        height: click.offsetY
      }, 200);

      // Change the gain
      Synth.changeVoiceGain(voice, (value / sliderHeight));
    }

    function silenceGain() {
      Synth.changeVoiceGain(voice, 0.0);

      negativeFill.stop();
      negativeFill.animate({
        height: sliderHeight
      }, 50);
    }

    function bringUpGainHalfway() {
      Synth.changeVoiceGain(voice, 0.5);

      negativeFill.stop();
      negativeFill.animate({
        height: sliderHeight / 2
      }, 500);
    }

    function changePartial(position) {
      Synth.changePartial(voice, (position - 5) * 7);
    }

  });


  // Keyboard events
  document.addEventListener('keydown', keyDownHandle);
  document.addEventListener('keyup', keyUpHandle);

  function keyDownHandle(key) {
    var freq = Synth.keyToFrequency(key.keyCode);
    if (freq) {
      Synth.changeNote(freq);
      Synth.changeMasterGain(1.0);
      sparkle();
    }
  }

  function keyUpHandle() {
    Synth.changeMasterGain(0.0);
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
}