/**
 * Additive synth with slider harmonic controls and keyboard note control
 */

Synth.init(12);

/* UI ********/

if (document.readyState != 'loading'){
  setupUI();
} else {
  document.addEventListener('DOMContentLoaded', setupUI);
}

function setupUI() {
  var sliderHeight = 300, sliderWidth = 40,
    controls = document.getElementById('spectrum-controls');

  Synth.voices().forEach(function(slider) {

    var div = document.createElement('div');
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
      Synth.changeVoiceGain(slider, (value / sliderHeight));

      // Double click will silence harmonic
      if (click.detail > 1) {

        Synth.changeVoiceGain(slider, 0.0);

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
    var freq = Synth.keyToFrequency(key.keyCode);
    if (freq) {
      Synth.changeNote(freq);
      Synth.changeMasterGain(1.0);
      sparkle();
    }
  }

  function keyUpHandle() {
    //Synth.changeMasterGain(0.0);
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