const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MAJOR_SCALE_STEPS = [0, 2, 4, 5, 7, 9, 11];

export const getNoteIndex = (note) => NOTES.indexOf(note);
export const transpose = (startIndex, semitones) => (startIndex + semitones) % 12;
export const noteNameFromIndex = (index) => NOTES[index % 12];

export const classifyTriad = (root, third, fifth) => {
  const t = (third - root + 12) % 12;
  const f = (fifth - root + 12) % 12;
  if (t === 4 && f === 7) return 'maj';
  if (t === 3 && f === 7) return 'min';
  if (t === 3 && f === 6) return 'dim';
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

    // If it's one of the moved notes (now on top), raise it an octave
    const newOctave = i >= (3 - inversion) ? pitch + 1 : pitch;

    return `${base}${newOctave}`;
  });
};

export const getRandomInversion = (notes) => {
  const inversion = Math.floor(Math.random() * 3); // 0 = root, 1 = 1st, 2 = 2nd
  return getInversionWithOctaves(notes, inversion);
};

export const generateChordProgression = (key, length = 4) => {
  const chords = getDiatonicChordsInKey(key);

  // Always include the I chord (degreeIndex === 0)
  const IChord = chords[0];
  const otherChords = chords.slice(1); // Exclude I

  // Pick (length - 1) random other chords
  const shuffled = [...otherChords].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, length - 1);

  // Randomly insert the I chord somewhere in the result
  const insertIndex = Math.floor(Math.random() * length);
  selected.splice(insertIndex, 0, IChord);

  return selected;
};
