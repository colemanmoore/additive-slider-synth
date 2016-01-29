  
/**
 * Additive synthesizer module
 * @author yyyounggg
 */

var Synth = (function() {

  var Synth = {

    init: init,

    changeNote: changeNote,

    changePartial: changePartial,

    changeVoiceGain: changeVoiceGain,

    changeMasterGain: changeMasterGain,

    voices: function() {
      return voices;
    },

    keyToFrequency: keyToFrequency
  };

  var ctx = new (window.AudioContext || window.webkitAudioContext)();
  var
    convolver = ctx.createConvolver(),
    masterGain = ctx.createGain(),
    voices = [];


  /**
   *
   * @param numberOfVoices
   */
  function init(numberOfVoices) {
    voices = [];

    var i = 0;
    while (i < numberOfVoices) {

      var osc = initVco({
        partial: i+1
      });

      var gain = initVca();
      osc.connect(gain);

      voices.push({
        partial: i+1,
        osc: osc,
        vca: gain
      });

      i++;
    }

    initReverb(voices);
    masterGain.connect(ctx.destination);
  }


  /**
   *
   * @param cfg
   * @returns oscillator
   */
  function initVco(cfg) {
    var
      o = ctx.createOscillator(),
      params = cfg || {};

    o.type = params.wave || 'sine';
    o.frequency.value = 0;
    o.start();

    return o;
  }


  /**
   *
   */
  function initVca() {
    var g = ctx.createGain();
    g.gain.value = 0.0;
    g.connect(masterGain);
    return g;
  }


  /**
   *
   */
  function initReverb() {
    convolver.connect(masterGain);
    voices.forEach(function(voice) {
      voice.vca.connect(convolver);
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
    voices.forEach(function(voice) {
      voice.osc.frequency.value = root * voice.partial;
    })
  }

  function changeVoiceGain(slider, newVal) {
    slider.vca.gain.value = newVal / voices.length;
  }

  function changeMasterGain(newVal) {
    masterGain.gain.value = Math.min(Math.max(newVal, 0.0), 1.0);
  }

  function changePartial() {

  }

  var
    keyboardMapping = {
      65: 'a',
      83: 'd',
      68: 'e',
      70: 'f',
      71: 'g',
      72: 'a',
      74: 'b',
      75: 'c8',
      76: 'd8'
    },
    frequencyMap = {
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
      c8: 523.2,
      d8: 595.4
    };

  function keyToFrequency(keyCode) {
    var note = keyboardMapping[keyCode];
    if (note) {
      var freq = frequencyMap[note];
      if (freq) {
        return freq;
      }
    }
  }

  return Synth

})();