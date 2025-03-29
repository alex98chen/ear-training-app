import React, { useState } from 'react';
import {
  playChord,
  playBass,
  stopBass,
  stopAll,
  loadPianoSound,
} from '../audio/playAudio';
import {
  generateChordProgression,
  getInversionWithOctaves,
  getGuitarVoicing
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
  const [randomizeKey, setRandomizeKey] = useState(false);
  const [voicingStyle, setVoicingStyle] = useState('triad');
  const [enableRhythm, setEnableRhythm] = useState(false);
  const [rhythmPattern, setRhythmPattern] = useState('d.du.udu');
  const [bassPattern, setBassPattern] = useState('d.......');
  const [strumGapMs, setStrumGapMs] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);

    
  const playProgressionAtBpm = async (prog, bpm) => {
    const tickMs = (60 / bpm / 2) * 1000; // 8th note
  
    setIsPlaying(true);
  
    for (let i = 0; i < prog.length; i++) {
      const chord = prog[i];
      stopBass(); // still need to manually stop bass
  
      const chordNotes = chord.voicedNotes || chord.notes;


      const getBassNoteInRange = (rootNote) => {
        const minMidi = Tone.Frequency('B0').toMidi();
        const maxMidi = Tone.Frequency('A2').toMidi();
      
        // Check octaves 0 through 5 (arbitrary safe range)
        const validOctaves = [];
      
        for (let octave = 0; octave <= 5; octave++) {
          const note = `${rootNote}${octave}`;
          const midi = Tone.Frequency(note).toMidi();
      
          if (midi >= minMidi && midi <= maxMidi) {
            validOctaves.push(octave);
          }
        }
      
        if (validOctaves.length === 0) {
          return `${rootNote}2`; // fallback
        }
      
        const chosenOctave = validOctaves[Math.floor(Math.random() * validOctaves.length)];
        return `${rootNote}${chosenOctave}`;
      };
 
      const bassNote = includeBass ? getBassNoteInRange(chord.rootNote) : null;
  
      const chordPattern = enableRhythm ? rhythmPattern.padEnd(8, '.').slice(0, 8) : 'd.......';
      const bassPatternStr = enableRhythm ? bassPattern.padEnd(8, '.').slice(0, 8) : 'd.......';
  
      for (let step = 0; step < 8; step++) {
        const c = chordPattern[step];
        const b = bassPatternStr[step];
  
  
        // Trigger new chord
        if (c === 'd' || c === 'u') {
          const direction = c === 'd' ? 'down' : 'up';
  
          // Count how many dots follow this to know how long to ring
          let sustain = 0;
          for (let j = step + 1; j < 8; j++) {
            if (chordPattern[j] === '.') sustain++;
            else break;
          }
  
          const durationMs = (1 + sustain) * tickMs;
          playChord(chordNotes, direction, strumGapMs, durationMs);
        }
  
        // Handle bass
        if ((b === 'd' || b === 'u') && bassNote) {
          playBass(bassNote, tickMs);
        } else if (b === 'x') {
          stopBass();
        }
  
        await new Promise(res => setTimeout(res, tickMs));
      }
  
      stopBass(); // explicitly stop bass between chords
    }
  
    stopAll();
    setIsPlaying(false);
  };


  const handlePlayProgression = async () => {
    if (isPlaying) return;
    await Tone.start();
    await loadPianoSound();

    const selectedKey = randomizeKey
      ? NOTES[Math.floor(Math.random() * NOTES.length)]
      : key;

    setKey(selectedKey);

    let newProgression = generateChordProgression(selectedKey, 4);

    newProgression = newProgression.map(chord => {
      let voicedNotes = chord.notes;
      if (voicingStyle === 'inversion') {
        const inversion = Math.floor(Math.random() * 3);
        voicedNotes = getInversionWithOctaves(chord.notes, inversion);
      } else if (voicingStyle === 'guitar') {
        voicedNotes = getGuitarVoicing(chord.notes);
      }
      return { ...chord, voicedNotes };
    });

    setProgression(newProgression);
    setGuesses(['', '', '', '']);
    setFeedback('');
    setRevealAnswer(false);

    console.log('Chord Progression:');
    newProgression.forEach((chord, i) => {
      console.log(`${i + 1}: ${chord.rootNote} ${chord.quality} - ${chord.voicedNotes.join(', ')}`);
    });

    await playProgressionAtBpm(newProgression, bpm);
  };

  const handleRepeat = async () => {
    if (progression.length === 0 || isPlaying) return;
    await Tone.start();
    await loadPianoSound();
    await playProgressionAtBpm(progression, bpm);
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
          Voicing Style:
          <select value={voicingStyle} onChange={(e) => setVoicingStyle(e.target.value)}>
            <option value="triad">Triads</option>
            <option value="inversion">Inversions</option>
            <option value="guitar">Guitar Voicing</option>
          </select>
        </label>
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
            checked={enableRhythm}
            onChange={(e) => setEnableRhythm(e.target.checked)}
          />
          Enable Rhythm
        </label>

        <input
          type="text"
          value={rhythmPattern}
          onChange={(e) => setRhythmPattern(e.target.value)}
          disabled={!enableRhythm}
          style={{ marginLeft: '0.5em', width: '120px' }}
        />
        <span style={{ marginLeft: '0.5em', fontSize: '0.9em', fontStyle: 'italic' }}>
          (8 chars: d/u/x/.)
        </span>
      </div>

      {enableRhythm && (
        <div style={{ marginTop: '1em' }}>
          <label>
            Bass Rhythm:
            <input
              type="text"
              value={bassPattern}
              onChange={(e) => setBassPattern(e.target.value)}
              style={{ marginLeft: '0.5em', width: '120px' }}
            />
          </label>
          <span style={{ marginLeft: '0.5em', fontSize: '0.9em', fontStyle: 'italic' }}>
            (8 chars: d/x/.)
          </span>
        </div>
      )}

      <div style={{ marginTop: '1em' }}>
        <label>
          Strum Gap (ms): 
          <input
            type="number"
            min="0"
            max="150"
            value={strumGapMs}
            onChange={(e) => setStrumGapMs(parseInt(e.target.value, 10))}
            style={{ marginLeft: '0.5em', width: '60px' }}
          />
        </label>
        <span style={{ marginLeft: '0.5em', fontSize: '0.9em', fontStyle: 'italic' }}>
          (0 = block chord)
        </span>
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
        <button onClick={handlePlayProgression} disabled={isPlaying}>
          Play New Progression
        </button>
        <button onClick={handleRepeat} disabled={progression.length === 0 || isPlaying}>
          Repeat
        </button>
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

          {feedback && <div style={{ marginTop: '1em' }}>{feedback}</div>}

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

