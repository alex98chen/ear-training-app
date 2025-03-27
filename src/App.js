import React, { useState } from 'react';
import * as Tone from 'tone';
import { loadPianoSound, playDrone, stopDrone } from './audio/playAudio';

function App() {
  const [soundLoaded, setSoundLoaded] = useState(false);

  const handleLoadSound = async () => {
    console.log("Clicked Load Piano Sound");

    await Tone.start();
    console.log("Tone started");

    await loadPianoSound();
    console.log("Piano loaded");

    setSoundLoaded(true);
  };

  const handlePlayChord = () => {
    playDrone(['C4', 'E4', 'G4']); // Play C major chord
  };

  return (
    <div>
      <h1>Piano Drone App</h1>
      {!soundLoaded ? (
        <button onClick={handleLoadSound}>Load Piano Sound</button>
      ) : (
        <>
          <button onClick={handlePlayChord}>Play Drone</button>
          <button onClick={stopDrone}>Stop Drone</button>
        </>
      )}
    </div>
  );
}

export default App;

