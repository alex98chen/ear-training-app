import * as Tone from 'tone';

let synth = null;
let reverb = null;
let droneNotes = new Set();
let chordNotes = new Set();

export const loadPianoSound = async () => {
  if (synth) return;

  reverb = new Tone.Reverb({ decay: 3, preDelay: 0.01, wet: 0.3 }).toDestination();

  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'amsine', modulationType: 'triangle', harmonicity: 2 },
    envelope: { attack: 0.005, decay: 0.4, sustain: 0.2, release: 2.0 }
  }).connect(reverb);

  await reverb.generate();
};

// Drone

export const playDrone = (notes) => {
  stopDrone();
  const arr = Array.isArray(notes) ? notes : [notes];
  arr.forEach(note => {
    synth.triggerAttack(note, Tone.now());
    droneNotes.add(note);
  });
  console.log('[playDrone] Triggered:', arr);
};

export const stopDrone = () => {
  if (droneNotes.size > 0) {
    const toStop = Array.from(droneNotes);
    synth.triggerRelease(toStop, Tone.now());
    console.log('[stopDrone] Released:', toStop);
    droneNotes.clear();
  }
};

// Chord

export const playChord = (notes) => {
  stopChord();
  const arr = Array.isArray(notes) ? notes : [notes];
  arr.forEach(note => {
    synth.triggerAttack(note, Tone.now());
    chordNotes.add(note);
  });
  console.log('[playChord] Triggered:', arr);
};

export const stopChord = () => {
  if (chordNotes.size > 0) {
    const toStop = Array.from(chordNotes);
    synth.triggerRelease(toStop, Tone.now());
    console.log('[stopChord] Released:', toStop);
    chordNotes.clear();
  }
};

