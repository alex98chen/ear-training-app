import React, { useEffect } from 'react';
import { playDrone } from './audio/playAudio';

function App() {
  useEffect(() => {
    playDrone("A4"); // Play drone note when the app loads
  }, []);

  return (
    <div className="App">
      <h1>Ear Training App</h1>
      <p>Listen to the drone note and guess the chord!</p>
    </div>
  );
}

export default App;

