import * as Tone from "tone";

export const playDrone = (note) => {
  const synth = new Tone.Synth().toDestination();
  synth.triggerAttack(note);
};

// Example of calling playDrone in the app
playDrone("A4");  // This will play the A note in the 4th octave

