import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div>
      <h1>Welcome to the Ear Training App</h1>
      <p>Choose a mode:</p>
      <Link to="/trainer">
        <button>Start Training</button>
      </Link>	  
      <Link to="/progression">
        <button>Chord Progression Trainer</button>
       </Link>
    </div>
  );
}

export default HomePage;

