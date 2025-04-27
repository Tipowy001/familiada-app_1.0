import React, { useEffect, useState } from 'react';
import socket from './services/socket';
import TeamSelector from './components/TeamSelector';
import QuestionManager from './components/QuestionManager';
import './App.css';

function App() {
  const [startingTeam, setStartingTeam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [scores, setScores] = useState({ czerwoni: 0, niebiescy: 0 });
  const [errors, setErrors] = useState(0);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('✅ Socket.io: Połączono z serwerem');
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket.io: Rozłączono z serwerem');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return (
    <div className="dj-container">
      <h1 className="dj-title">🎧 PANEL DJ-A 🎧</h1>

      <button
        className="open-player-button"
        onClick={() => window.open('/player', '_blank')}
      >
        Otwórz Panel Gracza
      </button>

      <div className="dj-panel">
        {!startingTeam ? (
          <TeamSelector setStartingTeam={(team) => {
            setStartingTeam(team);
            setCurrentTeam(team);
            socket.emit('current_team', { team });
          }} />
        ) : (
          <QuestionManager
            questions={questions}
            setQuestions={setQuestions}
            currentQuestion={currentQuestion}
            setCurrentQuestion={setCurrentQuestion}
            currentTeam={currentTeam}
            setCurrentTeam={setCurrentTeam}
            scores={scores}
            setScores={setScores}
            errors={errors}
            setErrors={setErrors}
          />
        )}
      </div>
    </div>
  );
}

export default App;
