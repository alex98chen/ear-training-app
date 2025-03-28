import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TrainerPage from './pages/TrainerPage';
import ChordProgressionTrainer from './pages/ChordProgressionTrainer'; // ✅ Add this line

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/trainer" element={<TrainerPage />} />
        <Route path="/progression" element={<ChordProgressionTrainer />} /> {/* ✅ Add this route */}
      </Routes>
    </Router>
  );
}

export default App;

