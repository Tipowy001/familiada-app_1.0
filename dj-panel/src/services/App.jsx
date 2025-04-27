import React, { useState } from 'react';
import TeamSelector from './components/TeamSelector';
import QuestionManager from './components/QuestionManager';

function App() {
  const [startingTeam, setStartingTeam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentTeam, setCurrentTeam] = useState(null); 
  const [scores, setScores] = useState({ czerwoni: 0, niebiescy: 0 });
  const [errors, setErrors] = useState(0);

  return (
    <div style={{ backgroundColor: 'black', minHeight: '100vh', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: 'yellow' }}>PANEL DJ-A</h1>
      {!startingTeam ? (
        <TeamSelector setStartingTeam={(team) => {
          setStartingTeam(team);
          setCurrentTeam(team);
        }} />
      ) : (
        <QuestionManager
          questions={questions}
          setQuestions={setQuestions}
          currentQuestion={currentQuestion}
          setCurrentQuestion={setCurrentQuestion}
          currentTeam={currentTeam}
          setCurrentTeam={setCurrentTeam
