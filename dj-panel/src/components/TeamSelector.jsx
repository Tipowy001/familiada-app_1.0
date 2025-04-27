import React from 'react';

function TeamSelector({ setStartingTeam }) {
  return (
    <div className="list" style={{ textAlign: 'center' }}>
      <h2 className="title">Wybierz drużynę, która zaczyna:</h2>
      <div className="button-group">
        <button
          className="button"
          onClick={() => setStartingTeam('czerwoni')}
        >
          Czerwoni
        </button>
        <button
          className="button"
          onClick={() => setStartingTeam('niebiescy')}
        >
          Niebiescy
        </button>
      </div>
    </div>
  );
}

export default TeamSelector;
