import React from 'react';

const TeamSelector = ({ setStartingTeam }) => {
  return (
    <div style={styles.container}>
      <h2>Wybierz drużynę rozpoczynającą</h2>
      <button style={styles.buttonRed} onClick={() => setStartingTeam('czerwoni')}>Czerwoni</button>
      <button style={styles.buttonBlue} onClick={() => setStartingTeam('niebiescy')}>Niebiescy</button>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    marginTop: '50px',
    color: 'yellow',
  },
  buttonRed: {
    margin: '10px',
    padding: '10px 20px',
    backgroundColor: 'red',
    color: 'white',
    fontSize: '18px',
    border: 'none',
    borderRadius: '5px',
  },
  buttonBlue: {
    margin: '10px',
    padding: '10px 20px',
    backgroundColor: 'blue',
    color: 'white',
    fontSize: '18px',
    border: 'none',
    borderRadius: '5px',
  }
};

export default TeamSelector;
