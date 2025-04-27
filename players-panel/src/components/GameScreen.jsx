import React, { useEffect, useState } from 'react';
import socket from '../services/socket';
import './GameScreen.css';

const GameScreen = () => {
  const [question, setQuestion] = useState(null);
  const [revealedAnswers, setRevealedAnswers] = useState([]);
  const [animatedAnswers, setAnimatedAnswers] = useState({});
  const [scores, setScores] = useState({ czerwoni: 0, niebiescy: 0 });
  const [errors, setErrors] = useState({ czerwoni: 0, niebiescy: 0 });
  const [currentTeam, setCurrentTeam] = useState(null);
  const [switchMessage, setSwitchMessage] = useState(null);

  const playSound = (soundFile) => {
    const audio = new Audio(soundFile);
    audio.play().catch((e) => console.log('Audio play error:', e));
  };

  useEffect(() => {
    socket.on('connect', () => {
      console.log('✅ Połączono z serwerem');
    });

    socket.on('receive_question', (data) => {
      setQuestion(data);
      setRevealedAnswers([]);
      setAnimatedAnswers({});
      setErrors({ czerwoni: 0, niebiescy: 0 });
      setSwitchMessage(null);
    });

    socket.on('show_answer', (data) => {
      const answerText = question.answers[data.index].answer.toUpperCase();

      let currentText = '';
      let i = 0;

      const interval = setInterval(() => {
        currentText += answerText[i];
        setAnimatedAnswers(prev => ({
          ...prev,
          [data.index]: currentText
        }));

        i++;
        if (i >= answerText.length) {
          clearInterval(interval);
        }
      }, 30);

      setRevealedAnswers(prev => [...prev, data.index]);
      playSound('/sounds/correct.mp3');
    });

    socket.on('update_scores', (data) => {
      setScores(data);
    });

    socket.on('wrong_answer', (data) => {
      setErrors((prev) => ({
        ...prev,
        [currentTeam]: data.errors
      }));
      playSound('/sounds/wrong.mp3');
    });

    socket.on('current_team', (data) => {
      setCurrentTeam(data.team);
    });

    socket.on('reveal_all', () => {
      if (question) {
        const allIndexes = question.answers.map((_, idx) => idx);
        let delay = 0;

        allIndexes.forEach((idx) => {
          setTimeout(() => {
            setRevealedAnswers(prev => [...prev, idx]);
            setAnimatedAnswers(prev => ({
              ...prev,
              [idx]: question.answers[idx].answer.toUpperCase()
            }));
          }, delay);
          delay += 300; // co 300ms kolejna odpowiedź
        });
      }
    });

    socket.on('switch_team', (data) => {
      setCurrentTeam(data.team);
      setSwitchMessage(`Zmiana drużyny na ${data.team.toUpperCase()}!`);
      playSound('/sounds/switch.mp3');
      setTimeout(() => {
        setSwitchMessage(null);
      }, 4000);
    });

    return () => {
      socket.off('connect');
      socket.off('receive_question');
      socket.off('show_answer');
      socket.off('update_scores');
      socket.off('wrong_answer');
      socket.off('current_team');
      socket.off('reveal_all');
      socket.off('switch_team');
    };
  }, [question, currentTeam]);

  const renderErrors = (team) => {
    const crosses = [];
    const teamErrors = errors[team] || 0;

    if (teamErrors >= 3) {
      crosses.push(<div key="big-x" className="big-x">X</div>);
    } else {
      for (let i = 0; i < teamErrors; i++) {
        crosses.push(<div key={i} className="small-x">X</div>);
      }
    }

    return (
      <div className="errors-container">{crosses}</div>
    );
  };

  const renderCurrentTeam = () => {
    if (!currentTeam) return null;

    const teamName = currentTeam === 'czerwoni'
      ? <span className="team-red">CZERWONI</span>
      : <span className="team-blue">NIEBIESCY</span>;

    return (
      <div className="current-team">
        Aktualnie odpowiadają: {teamName}
      </div>
    );
  };

  return (
    <div className="game-container">
      <div className="header">
        <h1>FAMILIADA</h1>
      </div>

      <div className="question">
        {question ? question.question : 'Oczekiwanie na pytanie...'}
      </div>

      {renderCurrentTeam()}

      {switchMessage && (
        <div className="switchMessage">
          <h2>{switchMessage}</h2>
        </div>
      )}

      <div className="main-board">
        <div className="errors-left">{renderErrors('czerwoni')}</div>

        <div className="answers-board">
          {question?.answers.map((ans, idx) => (
            <div key={idx} className="answer-row">
              <div className="answer-number-circle">{idx + 1}</div>
              <div className="answer-text">
                {revealedAnswers.includes(idx) ? (
                  <span className="animated-text">{animatedAnswers[idx] || ''}</span>
                ) : '......'}
              </div>
              <div className="answer-points">
                {revealedAnswers.includes(idx) ? ans.points : ''}
              </div>
            </div>
          ))}
        </div>

        <div className="errors-right">{renderErrors('niebiescy')}</div>
      </div>

      <div className="sum-section">
        <div className="sum-team">
          <div className="sum-label">CZERWONI</div>
          <div className="sum-points">{scores.czerwoni}</div>
        </div>
        <div className="sum-team">
          <div className="sum-label">NIEBIESCY</div>
          <div className="sum-points">{scores.niebiescy}</div>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
