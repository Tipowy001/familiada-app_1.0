// /src/components/QuestionManager.jsx
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
    <div className="min-h-screen bg-black text-yellow-400 flex flex-col items-center py-8 space-y-8 font-mono">
      <h1 className="text-4xl font-bold text-shadow">FAMILIADA</h1>
      <h2 className="text-2xl">Treść pytania: {currentQuestion?.question || "Brak pytania"}</h2>
      <h3 className="text-xl">Aktualnie odpowiadają: <span className="text-cyan-400">{currentTeam?.toUpperCase() || "BRAK"}</span></h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {currentQuestion?.answers.map((ans, idx) => (
          <button
            key={idx}
            onClick={() => revealAnswer(idx)}
            className="border-2 border-yellow-400 bg-black p-4 rounded-xl text-xl w-40 hover:bg-yellow-400 hover:text-black"
          >
            {ans.answer.toUpperCase()} ({ans.points})
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <button onClick={registerError} className="border-2 border-red-500 text-red-500 px-6 py-3 rounded-xl hover:bg-red-500 hover:text-black">BŁĄD</button>
        <button onClick={resetGame} className="border-2 border-white text-white px-6 py-3 rounded-xl hover:bg-white hover:text-black">RESET GRY</button>
        <button onClick={handleNextQuestion} className="border-2 border-green-500 text-green-500 px-6 py-3 rounded-xl hover:bg-green-500 hover:text-black">NASTĘPNE PYTANIE</button>
        <button onClick={handleRevealAll} className="border-2 border-orange-400 text-orange-400 px-6 py-3 rounded-xl hover:bg-orange-400 hover:text-black">ODKRYJ WSZYSTKIE</button>
      </div>

      <div className="text-center space-y-2">
        <p>CZERWONI: {scores.czerwoni}</p>
        <p>NIEBIESCY: {scores.niebiescy}</p>
      </div>

      <div className="w-full max-w-md border-t border-yellow-400 pt-8">
        <h3 className="text-xl mb-4">Załaduj nowe pytanie lub wpisz ręcznie:</h3>

        <input
          type="file"
          accept=".json"
          onChange={loadJSONFile}
          className="block w-full text-center mb-4"
        />

        <input
          type="text"
          placeholder="Treść pytania"
          value={manualQuestion}
          onChange={(e) => setManualQuestion(e.target.value)}
          className="block w-full p-2 rounded bg-black border-2 border-yellow-400 text-yellow-400 mb-4"
        />

        {manualAnswers.map((ans, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder={`Odpowiedź ${idx + 1}`}
              value={ans.answer}
              onChange={(e) => handleAnswerChange(idx, "answer", e.target.value)}
              className="flex-1 p-2 rounded bg-black border-2 border-yellow-400 text-yellow-400"
            />
            <input
              type="number"
              placeholder="Punkty"
              value={ans.points}
              onChange={(e) => handleAnswerChange(idx, "points", parseInt(e.target.value))}
              className="w-24 p-2 rounded bg-black border-2 border-yellow-400 text-yellow-400"
            />
          </div>
        ))}

        <div className="flex gap-4 justify-center mt-4">
          <button onClick={addAnswerField} className="border-2 border-yellow-400 text-yellow-400 px-4 py-2 rounded-xl hover:bg-yellow-400 hover:text-black">Dodaj odpowiedź</button>
          <button onClick={handleManualSubmit} className="border-2 border-yellow-400 text-yellow-400 px-4 py-2 rounded-xl hover:bg-yellow-400 hover:text-black">Zatwierdź pytanie</button>
        </div>
      </div>
    </div>
  );
};

export default QuestionManager;
