import * as Tone from 'tone';

let synth = null;
let reverb = null;
let droneNotes = new Set();
let chordNotes = new Set();
let bassNotes = new Set();

export const loadPianoSound = async () => {
  if (synth) return;

  reverb = new Tone.Reverb({ decay: 3, preDelay: 0.01, wet: 0.3 }).toDestination();

  synth = new Tone.PolySynth(Tone.Synth, {
    maxPolyphony: 20,
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
};

export const stopDrone = () => {
  if (droneNotes.size > 0) {
    synth.triggerRelease(Array.from(droneNotes), Tone.now());
    droneNotes.clear();
  }
};

// Chord
export const playChord = (notes, direction = 'none', strumGap = 0) => {
  stopChord();

  const arr = Array.isArray(notes) ? notes : [notes];
  const ordered = direction === 'up' ? [...arr].reverse() : arr;

  ordered.forEach((note, i) => {
    const time = Tone.now() + i * (strumGap / 1000);
    synth.triggerAttack(note, time);
    chordNotes.add(note);
  });

  console.log(`[playChord] Triggered (${direction}):`, arr);
};

export const stopChord = () => {
  if (chordNotes.size > 0) {
    synth.triggerRelease(Array.from(chordNotes), Tone.now());
    console.log('[stopChord] Released:', Array.from(chordNotes));
    chordNotes.clear();
  }
};

export const playBass = (note) => {
  stopBass();
  synth.triggerAttack(note, Tone.now());
  bassNotes.add(note);
  console.log('[playBass] Triggered:', note);
};

export const stopBass = () => {
  if (bassNotes.size > 0) {
    synth.triggerRelease(Array.from(bassNotes), Tone.now());
    console.log('[stopBass] Released:', Array.from(bassNotes));
    bassNotes.clear();
  }
};

export const stopAll = () => {
  stopChord();
  stopBass();
  stopDrone();
};
