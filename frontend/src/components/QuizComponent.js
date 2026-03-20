"use client"

import React, { useState } from "react"

const QuizComponent = ({ questions, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes

  React.useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      handleSubmitQuiz()
    }
  }, [timeLeft, showResults])

  const handleAnswerSelect = (answerIndex) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestion]: answerIndex,
    })
  }

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmitQuiz = () => {
    setShowResults(true)
    const score = calculateScore()
    onComplete(score)
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correct++
      }
    })
    return {
      correct,
      total: questions.length,
      percentage: (correct / questions.length) * 100,
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (showResults) {
    const score = calculateScore()
    return (
      <div className="quiz-results card" style={{ textAlign: "center" }}>
        <h2 style={{ color: "var(--primary)", marginBottom: "1rem" }}>Quiz Complete!</h2>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
          {score.percentage >= 80 ? "🎉" : score.percentage >= 60 ? "👍" : "📚"}
        </div>
        <p style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Score: {score.correct}/{score.total} ({score.percentage.toFixed(0)}%)
        </p>
        <p style={{ color: "var(--muted-foreground)", marginBottom: "2rem" }}>
          {score.percentage >= 80
            ? "Excellent work! You have mastered this topic."
            : score.percentage >= 60
              ? "Good job! Review the topics you missed."
              : "Keep studying and try again when you're ready."}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {questions.map((question, index) => (
            <div
              key={index}
              className="card"
              style={{
                padding: "1rem",
                border: `2px solid ${userAnswers[index] === question.correctAnswer ? "#10B981" : "#EF4444"}`,
              }}
            >
              <h4 style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>Question {index + 1}</h4>
              <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                {userAnswers[index] === question.correctAnswer ? "Correct" : "Incorrect"}
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]

  return (
    <div className="quiz-component">
      {/* Quiz Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          padding: "1rem",
          background: "var(--muted)",
          borderRadius: "var(--radius)",
        }}
      >
        <div>
          <h3 style={{ color: "var(--primary)" }}>
            Question {currentQuestion + 1} of {questions.length}
          </h3>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: timeLeft < 60 ? "#EF4444" : "var(--foreground)",
            }}
          >
            ⏱️ {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar" style={{ marginBottom: "2rem" }}>
        <div className="progress-fill" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}></div>
      </div>

      {/* Question */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 style={{ marginBottom: "1.5rem", color: "var(--foreground)" }}>{currentQ.question}</h2>

        {currentQ.image && (
          <img
            src={currentQ.image || "/placeholder.svg"}
            alt="Question illustration"
            style={{
              width: "100%",
              maxWidth: "400px",
              height: "auto",
              marginBottom: "1.5rem",
              borderRadius: "var(--radius)",
            }}
          />
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {currentQ.options.map((option, index) => (
            <label
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                padding: "1rem",
                borderRadius: "var(--radius)",
                border: "2px solid var(--border)",
                background: userAnswers[currentQuestion] === index ? "var(--accent)" : "var(--card)",
                transition: "all 0.3s ease",
              }}
            >
              <input
                type="radio"
                name={`question-${currentQuestion}`}
                value={index}
                checked={userAnswers[currentQuestion] === index}
                onChange={() => handleAnswerSelect(index)}
                style={{ marginRight: "1rem", transform: "scale(1.2)" }}
              />
              <span style={{ fontSize: "1.1rem" }}>{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          onClick={handlePreviousQuestion}
          className="btn btn-outline"
          disabled={currentQuestion === 0}
          style={{ opacity: currentQuestion === 0 ? 0.5 : 1 }}
        >
          ← Previous
        </button>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          {questions.map((_, index) => (
            <div
              key={index}
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background:
                  userAnswers[index] !== undefined
                    ? "var(--primary)"
                    : index === currentQuestion
                      ? "var(--accent)"
                      : "var(--border)",
                cursor: "pointer",
              }}
              onClick={() => setCurrentQuestion(index)}
            />
          ))}
        </div>

        {currentQuestion === questions.length - 1 ? (
          <button
            onClick={handleSubmitQuiz}
            className="btn btn-primary"
            disabled={Object.keys(userAnswers).length < questions.length}
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="btn btn-primary"
            disabled={userAnswers[currentQuestion] === undefined}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  )
}

export default QuizComponent
