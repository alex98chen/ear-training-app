import * as Tone from 'tone';

let synth;
let reverb;
let currentNote = null;

export const loadPianoSound = async () => {
  reverb = new Tone.Reverb({
    decay: 3,   // how long the room rings out
    preDelay: 0.01,
    wet: 0.3    // how "wet" the reverb sounds
  }).toDestination();

  // Create the synth and connect it to the reverb
  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: "amsine",
      modulationType: "triangle",
      harmonicity: 2
    },
    envelope: {
      attack: 0.005,   // instant hammer hit
      decay: 0.4,
      sustain: 0.2,
      release: 2.0
    }
  }).connect(reverb);

  await reverb.generate(); // makes sure the reverb is ready
  console.log("Piano-style synth with reverb is ready.");
};

export const playDrone = (note) => {
  if (!synth) return;

  currentNote = note;
  synth.triggerAttack(note);
};

export const stopDrone = () => {
  if (synth && currentNote) {
    synth.triggerRelease(currentNote);
    currentNote = null;
  }
};

