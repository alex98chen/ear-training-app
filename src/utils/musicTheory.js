import * as Tone from 'tone';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MAJOR_SCALE_STEPS = [0, 2, 4, 5, 7, 9, 11];

export const getNoteIndex = (note) => NOTES.indexOf(note);
export const transpose = (startIndex, semitones) => (startIndex + semitones) % 12;
export const noteNameFromIndex = (index) => NOTES[index % 12];

export const classifyTriad = (root, third, fifth) => {
  const t = (third - root + 12) % 12;
  const f = (fifth - root + 12) % 12;
  if (t === 4 && f === 7) return 'major';
  if (t === 3 && f === 7) return 'minor';
  if (t === 3 && f === 6) return 'diminished';
  return 'unknown';
};

export const getDiatonicChordsInKey = (tonicNote) => {
  const tonicIdx = getNoteIndex(tonicNote);
  const scale = MAJOR_SCALE_STEPS.map(step => (tonicIdx + step) % 12);

  return scale.map((rootIdx, i) => {
    const thirdIdx = scale[(i + 2) % scale.length];
    const fifthIdx = scale[(i + 4) % scale.length];
    const quality = classifyTriad(rootIdx, thirdIdx, fifthIdx);

    const root = noteNameFromIndex(rootIdx);
    const third = noteNameFromIndex(thirdIdx);
    const fifth = noteNameFromIndex(fifthIdx);

    return {
      degreeIndex: i,
      rootNote: root,
      quality,
      notes: [`${root}4`, `${third}4`, `${fifth}4`],
    };
  });
};

export const getInversionWithOctaves = (notes, inversion) => {
  const reordered = [...notes.slice(inversion), ...notes.slice(0, inversion)];

  return reordered.map((note, i) => {
    const pitch = parseInt(note.slice(-1), 10);
    const base = note.slice(0, -1);

    const newOctave = i >= (3 - inversion) ? pitch + 1 : pitch;

    return `${base}${newOctave}`;
  });
};

export const getRandomInversion = (notes) => {
  const inversion = Math.floor(Math.random() * 3);
  return getInversionWithOctaves(notes, inversion);
};

export const generateChordProgression = (key, length = 4) => {
  const chords = getDiatonicChordsInKey(key);
  const scaleNotes = new Set(chords.map(c => c.notes).flat().map(n => n.replace(/\d/, ''))); // all 7 pitch classes

  let attempts = 0;
  while (attempts < 1000) {
    const progression = [];

    // Always include at least one I chord
    progression.push(chords[0]);

    for (let i = 1; i < length; i++) {
      const randomChord = chords[Math.floor(Math.random() * chords.length)];
      progression.push(randomChord);
    }

    // Collect all notes in this progression
    const usedNotes = new Set(progression.flatMap(c => c.notes.map(n => n.replace(/\d/, ''))));

    // Check if all scale notes are used
    const allUsed = Array.from(scaleNotes).every(n => usedNotes.has(n));
    if (allUsed) {
      return progression.sort(()=> Math.random() -0.5);
    }

    attempts++;
  }

  console.warn("Couldn't generate progression using all notes after 1000 attempts.");
  return chords.slice(0, length); // fallback
};


export const getGuitarVoicing = (notes) => {
  const voicingPatterns = [
    ['1', '5', '1', '3', '5', '1'],
    ['1', '3', '5', '1', '3'],
    ['1', '5', '1', '3', '5'],
    ['1', '5', '1', '3'],
    ['1', '3', '5', '1', '5', '1']
  ];

  const pattern = voicingPatterns[Math.floor(Math.random() * voicingPatterns.length)];

  const pitchClasses = {
    '1': notes[0].slice(0, -1),
    '3': notes[1].slice(0, -1),
    '5': notes[2].slice(0, -1),
  };

  const minMidi = Tone.Frequency('E2').toMidi(); // 40
  const maxMidi = Tone.Frequency('E6').toMidi(); // 88

  const rootClass = pitchClasses['1'];

  for (let base = minMidi; base <= Tone.Frequency('C4').toMidi(); base++) {
    const baseNote = Tone.Frequency(base, 'midi').toNote();

    if (!baseNote.startsWith(rootClass) || base < minMidi) {
      continue;
    }

    let currentMidi = base;
    const voiced = [];

    for (const degree of pattern) {
      const pitchClass = pitchClasses[degree];

      let found = false;
      for (let midi = currentMidi; midi <= maxMidi; midi++) {
        const note = Tone.Frequency(midi, 'midi').toNote();
        if (note.startsWith(pitchClass) && midi >= minMidi) {
          voiced.push(note);
          currentMidi = midi + 1;
          found = true;
          break;
        }
      }

      if (!found) break;
    }

    if (voiced.length === pattern.length) {
      return voiced;
    }
  }

  return notes; // fallback
};

export const getArpeggio = (notes) => {
  // Shuffle the notes randomly
  const shuffledNotes = [...notes].sort(() => Math.random() - 0.5);
  
  // Randomly select one note to repeat
  const repeatIndex = Math.floor(Math.random() * shuffledNotes.length);
  const arpeggio = [...shuffledNotes, shuffledNotes[repeatIndex]];

  // Shuffle the arpeggio to randomize the position of the repeated note
  return arpeggio.sort(() => Math.random() - 0.5);
};

export const getTriadVoicing = (notes, previousRoot = null) => {
  const rootNote = notes[0];
  const thirdNote = notes[1];
  const fifthNote = notes[2];

  // Get the pitch class (note without octave)
  const rootClass = rootNote.slice(0, -1);
  
  // Define valid range for root note
  const minMidi = Tone.Frequency('E2').toMidi();
  const maxMidi = Tone.Frequency('E4').toMidi();
  
  // Find valid octaves for this root note
  const validOctaves = [];
  for (let octave = 2; octave <= 4; octave++) {
    const testNote = `${rootClass}${octave}`;
    const testMidi = Tone.Frequency(testNote).toMidi();
    if (testMidi >= minMidi && testMidi <= maxMidi) {
      validOctaves.push(octave);
    }
  }

  let bestRootOctave;
  if (previousRoot && validOctaves.length > 0) {
    const prevMidi = Tone.Frequency(previousRoot).toMidi();
    
    // Filter octaves to those within an octave (12 semitones) of previous root
    const nearbyOctaves = validOctaves.filter(octave => {
      const testNote = `${rootClass}${octave}`;
      const testMidi = Tone.Frequency(testNote).toMidi();
      const distance = Math.abs(testMidi - prevMidi);
      return distance <= 12;
    });

    // If we have nearby octaves, randomly choose from them
    if (nearbyOctaves.length > 0) {
      bestRootOctave = nearbyOctaves[Math.floor(Math.random() * nearbyOctaves.length)];
    } else {
      // If no nearby octaves, choose from all valid octaves
      bestRootOctave = validOctaves[Math.floor(Math.random() * validOctaves.length)];
    }
  } else {
    // For first chord, randomly choose from any valid octave
    bestRootOctave = validOctaves[Math.floor(Math.random() * validOctaves.length)];
  }

  // If no valid octaves found (shouldn't happen), fallback to octave 3
  if (!bestRootOctave) bestRootOctave = 3;

  // Create the root note in the chosen octave
  const voicedRoot = `${rootClass}${bestRootOctave}`;
  const rootMidi = Tone.Frequency(voicedRoot).toMidi();

  // Voice the third and fifth above the root
  let thirdMidi = Tone.Frequency(`${thirdNote.slice(0, -1)}${bestRootOctave}`).toMidi();
  let fifthMidi = Tone.Frequency(`${fifthNote.slice(0, -1)}${bestRootOctave}`).toMidi();

  // If third is below root, raise it an octave
  while (thirdMidi <= rootMidi) {
    thirdMidi += 12;
  }

  // If fifth is below third, raise it an octave
  while (fifthMidi <= thirdMidi) {
    fifthMidi += 12;
  }

  return [
    voicedRoot,
    Tone.Frequency(thirdMidi, 'midi').toNote(),
    Tone.Frequency(fifthMidi, 'midi').toNote()
  ];
};

export const getVoicing = (notes, style = 'triad', previousRoot = null) => {
  if (style === 'arpeggio') {
    return getArpeggio(notes);
  } else if (style === 'triad') {
    return getTriadVoicing(notes, previousRoot);
  }
  return getGuitarVoicing(notes);
};
