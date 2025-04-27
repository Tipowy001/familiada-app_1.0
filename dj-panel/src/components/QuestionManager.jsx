import React, { useState } from "react";
import socket from "../services/socket";

const QuestionManager = ({
  questions, setQuestions,
  currentQuestion, setCurrentQuestion,
  currentTeam, setCurrentTeam,
  scores, setScores,
  errors, setErrors
}) => {
  const [manualQuestion, setManualQuestion] = useState("");
  const [manualAnswers, setManualAnswers] = useState([{ answer: "", points: 0 }]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const loadJSONFile = (e) => {
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      const loadedQuestions = JSON.parse(event.target.result);
      setQuestions(loadedQuestions);
      setCurrentQuestion(loadedQuestions[0]);
      setCurrentQuestionIndex(0);
      socket.emit("send_question", loadedQuestions[0]);
      socket.emit("current_team", { team: currentTeam });
    };
    fileReader.readAsText(e.target.files[0]);
  };

  const handleManualSubmit = () => {
    const question = { question: manualQuestion, answers: manualAnswers };
    setQuestions([question]);
    setCurrentQuestion(question);
    setCurrentQuestionIndex(0);
    socket.emit("send_question", question);
    socket.emit("current_team", { team: currentTeam });
  };

  const revealAnswer = (index) => {
    if (!currentQuestion || !currentQuestion.answers) return;
    const answer = currentQuestion.answers[index];
    const updatedScores = { ...scores };
    updatedScores[currentTeam] += answer.points;
    setScores(updatedScores);

    socket.emit("show_answer", { index });
    socket.emit("update_scores", updatedScores);
  };

  const handleRevealAll = () => {
    socket.emit("reveal_all");
  };

  const registerError = () => {
    const newErrors = errors + 1;
    setErrors(newErrors);
    socket.emit("wrong_answer", { errors: newErrors });

    if (newErrors >= 3) {
      const nextTeam = currentTeam === "czerwoni" ? "niebiescy" : "czerwoni";
      setCurrentTeam(nextTeam);
      socket.emit("switch_team", { team: nextTeam });
      socket.emit("current_team", { team: nextTeam });
      setErrors(0);
    }
  };

  const resetGame = () => {
    setQuestions([]);
    setCurrentQuestion(null);
    setCurrentTeam(null);
    setScores({ czerwoni: 0, niebiescy: 0 });
    setErrors(0);
    setManualQuestion("");
    setManualAnswers([{ answer: "", points: 0 }]);
    setCurrentQuestionIndex(0);

    socket.emit("send_question", null);
    socket.emit("update_scores", { czerwoni: 0, niebiescy: 0 });
    socket.emit("wrong_answer", { errors: 0 });
    socket.emit("current_team", { team: null });
  };

  const handleNextQuestion = () => {
    if (questions.length === 0) return;
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= questions.length) {
      alert("Brak więcej pytań.");
      return;
    }
    const nextQuestion = questions[nextIndex];
    setCurrentQuestion(nextQuestion);
    setCurrentQuestionIndex(nextIndex);
    setErrors(0);

    socket.emit("send_question", nextQuestion);
    socket.emit("wrong_answer", { errors: 0 });
  };

  const handleAnswerChange = (index, field, value) => {
    const updatedAnswers = [...manualAnswers];
    updatedAnswers[index][field] = value;
    setManualAnswers(updatedAnswers);
  };

  const addAnswerField = () => {
    setManualAnswers([...manualAnswers, { answer: "", points: 0 }]);
  };

  return (
    <div className="list" style={{ textAlign: 'center' }}>
      <h2 className="title">FAMILIADA</h2>

      <h3>Treść pytania: {currentQuestion?.question || "Brak pytania"}</h3>
      <h4>Aktualnie odpowiadają: <span style={{ color: '#3498db' }}>{currentTeam?.toUpperCase() || "BRAK"}</span></h4>

      <div style={{ margin: '20px 0', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
        {currentQuestion?.answers.map((ans, idx) => (
          <button
            key={idx}
            className="button"
            onClick={() => revealAnswer(idx)}
          >
            {ans.answer.toUpperCase()} ({ans.points})
          </button>
        ))}
      </div>

      <div className="button-group">
        <button className="button button-danger" onClick={registerError}>BŁĄD</button>
        <button className="button button-danger" onClick={resetGame}>RESET GRY</button>
        <button className="button" onClick={handleNextQuestion}>NASTĘPNE PYTANIE</button>
        <button className="button" onClick={handleRevealAll}>ODKRYJ WSZYSTKIE</button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <p>CZERWONI: {scores.czerwoni}</p>
        <p>NIEBIESCY: {scores.niebiescy}</p>
      </div>

      <div className="" style={{ marginTop: '30px' }}>
        <h3>Załaduj nowe pytanie lub wpisz ręcznie:</h3>

        <input
          type="file"
          accept=".json"
          onChange={loadJSONFile}
          className="input"
        />

        <input
          type="text"
          placeholder="Treść pytania"
          value={manualQuestion}
          onChange={(e) => setManualQuestion(e.target.value)}
          className="input"
        />

        {manualAnswers.map((ans, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder={`Odpowiedź ${idx + 1}`}
              value={ans.answer}
              onChange={(e) => handleAnswerChange(idx, "answer", e.target.value)}
              className="input"
            />
            <input
              type="number"
              placeholder="Punkty"
              value={ans.points}
              onChange={(e) => handleAnswerChange(idx, "points", parseInt(e.target.value))}
              className="input"
            />
          </div>
        ))}

        <div className="button-group">
          <button className="button" onClick={addAnswerField}>Dodaj odpowiedź</button>
          <button className="button" onClick={handleManualSubmit}>Zatwierdź pytanie</button>
        </div>
      </div>
    </div>
  );
};

export default QuestionManager;
