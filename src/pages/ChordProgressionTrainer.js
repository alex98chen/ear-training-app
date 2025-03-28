import React, { useState } from 'react';
import {
  playChord,
  stopChord,
  loadPianoSound
} from '../audio/playAudio';
import {
  generateChordProgression,
  getInversionWithOctaves
} from '../utils/musicTheory';
import * as Tone from 'tone';

const NOTES = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
const MAJOR_ROMAN_NUMERALS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

function ChordProgressionTrainer() {
  const [key, setKey] = useState('C');
  const [bpm, setBpm] = useState(80);
  const [progression, setProgression] = useState([]);
  const [guesses, setGuesses] = useState(['', '', '', '']);
  const [feedback, setFeedback] = useState('');
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [includeBass, setIncludeBass] = useState(false);
  const [useInversions, setUseInversions] = useState(false);
  const [randomizeKey, setRandomizeKey] = useState(false);

  const playProgressionAtBpm = async (prog, bpm) => {
    const delayMs = (60 / bpm) * 1000;

    for (let i = 0; i < prog.length; i++) {
      const chord = prog[i];
      stopChord();

      const bass = includeBass ? [`${chord.rootNote}2`] : [];
      const notesToPlay = chord.invertedNotes || chord.notes;

      playChord([...bass, ...notesToPlay]);
      await new Promise(res => setTimeout(res, delayMs));
    }

    stopChord();
  };

  const handlePlayProgression = async () => {
    await Tone.start();
    await loadPianoSound();

    const selectedKey = randomizeKey
      ? NOTES[Math.floor(Math.random() * NOTES.length)]
      : key;

    setKey(selectedKey);

    let newProgression = generateChordProgression(selectedKey, 4);

    if (useInversions) {
      newProgression = newProgression.map(chord => {
        const inversion = Math.floor(Math.random() * 3);
        const invertedNotes = getInversionWithOctaves(chord.notes, inversion);
        return { ...chord, invertedNotes };
      });
    }

    setProgression(newProgression);
    setGuesses(['', '', '', '']);
    setFeedback('');
    setRevealAnswer(false);

    console.log('Chord Progression:');
    newProgression.forEach((chord, i) => {
      const notes = chord.invertedNotes || chord.notes;
      console.log(`${i + 1}: ${chord.rootNote} ${chord.quality} - ${notes.join(', ')}`);
    });

    await playProgressionAtBpm(newProgression, bpm);
  };

  const handleRepeat = async () => {
    if (progression.length > 0) {
      await Tone.start();
      await loadPianoSound();
      await playProgressionAtBpm(progression, bpm);
    }
  };

  const handleGuessChange = (index, value) => {
    const newGuesses = [...guesses];
    newGuesses[index] = value;
    setGuesses(newGuesses);
  };

  const handleSubmitGuess = () => {
    if (guesses.some(g => g === '')) {
      setFeedback('⚠️ Please make a guess for all chords.');
      return;
    }

    const correctLabels = progression.map(chord =>
      MAJOR_ROMAN_NUMERALS[chord.degreeIndex]
    );

    const isCorrect = guesses.every((guess, i) => guess === correctLabels[i]);

    if (isCorrect) {
      setFeedback('✅ All correct!');
      setRevealAnswer(true);
    } else {
      setFeedback('❌ Incorrect — try again.');
      setRevealAnswer(false);
    }
  };

  return (
    <div>
      <h1>Chord Progression Trainer</h1>

      <div style={{ marginTop: '1em' }}>
        <label>Select Key: </label>
        <select value={key} onChange={(e) => setKey(e.target.value)}>
          {NOTES.map(note => (
            <option key={note} value={note}>{note}</option>
          ))}
        </select>
        <span style={{ marginLeft: '1em', fontStyle: 'italic' }}>Current Key: {key}</span>
      </div>

      <div style={{ marginTop: '1em' }}>
        <label>BPM: </label>
        <input
          type="number"
          min="30"
          max="300"
          value={bpm}
          onChange={(e) => setBpm(parseInt(e.target.value, 10))}
        />
      </div>

      <div style={{ marginTop: '1em' }}>
        <label>
          <input
            type="checkbox"
            checked={includeBass}
            onChange={(e) => setIncludeBass(e.target.checked)}
          />
          Include Bass Note
        </label>
      </div>

      <div style={{ marginTop: '1em' }}>
        <label>
          <input
            type="checkbox"
            checked={useInversions}
            onChange={(e) => setUseInversions(e.target.checked)}
          />
          Use Inversions
        </label>
      </div>

      <div style={{ marginTop: '1em' }}>
        <label>
          <input
            type="checkbox"
            checked={randomizeKey}
            onChange={(e) => setRandomizeKey(e.target.checked)}
          />
          Randomize Key
        </label>
      </div>

      <div style={{ marginTop: '1.5em' }}>
        <button onClick={handlePlayProgression}>Play Progression</button>
        <button onClick={handleRepeat} disabled={progression.length === 0}>Repeat</button>
      </div>

      {progression.length > 0 && (
        <div style={{ marginTop: '2em' }}>
          <h3>Guess the chord progression:</h3>
          {guesses.map((guess, i) => (
            <div key={i} style={{ marginBottom: '0.5em' }}>
              <label>Chord {i + 1}: </label>
              <select
                value={guess}
                onChange={(e) => handleGuessChange(i, e.target.value)}
              >
                <option value="">-- Choose --</option>
                {MAJOR_ROMAN_NUMERALS.map(label => (
                  <option key={label} value={label}>{label}</option>
                ))}
              </select>
            </div>
          ))}

          <button onClick={handleSubmitGuess}>Submit Guess</button>

          {feedback && (
            <div style={{ marginTop: '1em' }}>{feedback}</div>
          )}

          {!feedback.startsWith('✅') && (
            <button style={{ marginTop: '1em' }} onClick={() => setRevealAnswer(true)}>
              Reveal Answer
            </button>
          )}

          {revealAnswer && (
            <div style={{ marginTop: '1em' }}>
              <h4>Correct Progression:</h4>
              <ol>
                {progression.map((chord, i) => (
                  <li key={i}>
                    {MAJOR_ROMAN_NUMERALS[chord.degreeIndex]} – {chord.rootNote} {chord.quality}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ChordProgressionTrainer;

