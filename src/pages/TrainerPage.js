import React, { useState } from 'react';
import * as Tone from 'tone';
import {
  loadPianoSound,
  playDrone,
  playChord,
  stopDrone
} from '../audio/playAudio';

import {
  getDiatonicChordsInKey,
  getInversionWithOctaves
} from '../utils/musicTheory';

const NOTES = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
const MAJOR_ROMAN_NUMERALS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

function TrainerPage() {
  const [soundLoaded, setSoundLoaded] = useState(false);
  const [droneNote, setDroneNote] = useState('C');
  const [currentChord, setCurrentChord] = useState(null);
  const [inversionIndex, setInversionIndex] = useState(null);
  const [userGuess, setUserGuess] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleLoadSound = async () => {
    await Tone.start();
    await loadPianoSound();
    setSoundLoaded(true);
  };

  const handlePlayDrone = () => {
    playDrone(`${droneNote}2`);
  };

  const handlePlayChord = () => {
    const chords = getDiatonicChordsInKey(droneNote);
    const selectedChord = chords[Math.floor(Math.random() * chords.length)];

    const inversion = Math.floor(Math.random() * 3);
    const inverted = getInversionWithOctaves(selectedChord.notes, inversion);

    playChord(inverted);
    setCurrentChord({ ...selectedChord, notes: inverted });
    setInversionIndex(inversion);
    setUserGuess('');
    setFeedback('');
  };

  const inversionLabel = (index) => {
    if (index === 0) return 'Root Position';
    if (index === 1) return '1st Inversion';
    if (index === 2) return '2nd Inversion';
    return '';
  };

  const handleGuessSubmit = () => {
    if (!currentChord) return;

    const correctLabel = MAJOR_ROMAN_NUMERALS[currentChord.degreeIndex];
    const notesPlayed = currentChord.notes.join(', ');
    const invLabel = inversionLabel(inversionIndex);

    if (userGuess === correctLabel) {
      setFeedback(`✅ Correct! Chord was ${correctLabel} (${invLabel}): ${notesPlayed}`);
    } else {
      setFeedback(`❌ Incorrect. It was ${correctLabel} (${invLabel}): ${notesPlayed}`);
    }
  };

  return (
    <div>
      <h1>Piano Ear Training</h1>

      {!soundLoaded ? (
        <button onClick={handleLoadSound}>Load Piano Sound</button>
      ) : (
        <>
          <label>Select Key: </label>
          <select value={droneNote} onChange={(e) => setDroneNote(e.target.value)}>
            {NOTES.map(note => (
              <option key={note} value={note}>{note}</option>
            ))}
          </select>

          <div style={{ marginTop: '1em' }}>
            <button onClick={handlePlayDrone}>Play Drone</button>
            <button onClick={handlePlayChord}>Play Chord</button>
            <button onClick={stopDrone}>Stop Drone</button>
          </div>

          {currentChord && (
            <div style={{ marginTop: '1em' }}>
              <label>Guess the chord degree: </label>
              <select value={userGuess} onChange={(e) => setUserGuess(e.target.value)}>
                <option value="">-- Choose --</option>
                {MAJOR_ROMAN_NUMERALS.map(numeral => (
                  <option key={numeral} value={numeral}>{numeral}</option>
                ))}
              </select>
              <button onClick={handleGuessSubmit} disabled={!userGuess}>Submit</button>
              <div style={{ marginTop: '0.5em' }}>{feedback}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TrainerPage;

