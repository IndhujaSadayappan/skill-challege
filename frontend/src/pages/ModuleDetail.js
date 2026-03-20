"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import MonacoEditor from "@monaco-editor/react"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"

const ModuleDetail = () => {
  const { skillId, moduleId } = useParams()  // Now uses module._id from Skills.js link
  const { user } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const [module, setModule] = useState(null)
  const [courseTitle, setCourseTitle] = useState("")  // Or skill.name
  const [currentLesson, setCurrentLesson] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [codeAnswer, setCodeAnswer] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [lessonProgress, setLessonProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      fetchModule()
    }
  }, [skillId, moduleId, user])

  useEffect(() => {
    if (module && module.lessons && module.lessons[currentLesson]?.type === "coding") {
      setCodeAnswer(module.lessons[currentLesson].content.coding?.starterCode || "")
    }
  }, [currentLesson, module])

  const fetchModule = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/skills/${skillId}/modules/${moduleId}`, {  // Updated endpoint
        credentials: "include",
      })

      const data = await response.json()

      if (response.ok) {
        setModule(data.module)  // Assumes { success: true, module: { lessons: [...] } }
        setCourseTitle(data.skillName || "")  // Or fetch skill name
      } else {
        setError(data.message || "Failed to fetch module")
      }
    } catch (error) {
      console.error("Error fetching module:", error)
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = async (lessonId, completed, score = null) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/skills/${skillId}/progress`, {  // Updated for skills
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moduleId,
          lessonId,  // NEW: Per-lesson progress
          completed,
          score,
        }),
      })
    } catch (error) {
      console.error("Error updating progress:", error)
    }
  }

  const handleQuizAnswer = (questionIndex, answerIndex) => {
    setUserAnswers({
      ...userAnswers,
      [questionIndex]: answerIndex,
    })
  }

  const handleNextLesson = async () => {
    const currentLessonData = module.lessons[currentLesson]

    // Update progress for current lesson
    let score = null
    if (currentLessonData.type === "quiz") {
      const results = checkQuizAnswers()
      score = results.percentage
    }

    await updateProgress(currentLessonData._id, true, score)

    if (currentLesson < module.lessons.length - 1) {
      setCurrentLesson(currentLesson + 1)
      setLessonProgress(((currentLesson + 1) / module.lessons.length) * 100)
      setUserAnswers({})
    } else {
      // Module completed
      await updateProgress(moduleId, true)
      setShowResults(true)
      setLessonProgress(100)
    }
  }

  const handlePreviousLesson = () => {
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1)
    }
  }

  const checkQuizAnswers = () => {
    const currentLessonData = module.lessons[currentLesson]
    if (currentLessonData.type !== "quiz") return { correct: 0, total: 0, percentage: 0 }

    let correct = 0
    currentLessonData.content.quiz.questions.forEach((question, index) => {
      if (userAnswers[index] === question.correct) {
        correct++
      }
    })

    return {
      correct,
      total: currentLessonData.content.quiz.questions.length,
      percentage: (correct / currentLessonData.content.quiz.questions.length) * 100,
    }
  }

  const runCode = () => {
    alert("Code execution feature would be implemented with a secure sandbox environment.")
  }

  if (!user) {
    return (
      <div className="container" style={{ padding: "2rem 0", textAlign: "center" }}>
        <h1>Please Login</h1>
        <p>You need to be logged in to access learning modules.</p>
        <button onClick={() => navigate("/login")} className="btn btn-primary">
          Login
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: "2rem 0", textAlign: "center" }}>
        <div className="loading">Loading module...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container" style={{ padding: "2rem 0", textAlign: "center" }}>
        <div style={{ color: "var(--destructive)" }}>Error: {error}</div>
        <button onClick={fetchModule} className="btn btn-primary" style={{ marginTop: "1rem" }}>
          Retry
        </button>
      </div>
    )
  }

  if (!module) {
    return (
      <div className="container" style={{ padding: "2rem 0", textAlign: "center" }}>
        <h1>Module Not Found</h1>
        <button onClick={() => navigate(`/skills/${skillId}`)} className="btn btn-primary">
          Back to Skill
        </button>
      </div>
    )
  }

  if (showResults) {
    return (
      <div className="container" style={{ padding: "2rem 0" }}>
        <div className="card" style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
          <h1 style={{ color: "var(--primary)", marginBottom: "1rem" }}>🎉 Module Completed!</h1>
          <h2 style={{ marginBottom: "1rem" }}>{module.title}</h2>
          <p style={{ fontSize: "1.1rem", marginBottom: "2rem", color: "var(--muted-foreground)" }}>
            Congratulations! You've successfully completed this module.
          </p>

          <div style={{ marginBottom: "2rem" }}>
            <div className="progress-bar" style={{ marginBottom: "1rem" }}>
              <div className="progress-fill" style={{ width: "100%" }}></div>
            </div>
            <p>Progress: 100% Complete</p>
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate(`/skills/${skillId}`)} className="btn btn-primary">
              Back to Skill
            </button>
            <button onClick={() => navigate("/dashboard")} className="btn btn-secondary">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentLessonData = module.lessons ? module.lessons[currentLesson] : null

  return (
    <div className="module-detail" style={{ padding: "1rem 0" }}>
      <div className="container">
        {/* Module Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <nav style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>
                <span>{courseTitle}</span> → <span style={{ color: "var(--primary)" }}>{module.title}</span>
              </nav>
              <h1 style={{ color: "var(--primary)", marginBottom: "0.5rem" }}>{module.title}</h1>
              <p style={{ color: "var(--muted-foreground)" }}>{module.description}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>
                Lesson {currentLesson + 1} of {module.lessons?.length || 0}
              </p>
              <div className="progress-bar" style={{ width: "200px" }}>
                <div className="progress-fill" style={{ width: `${lessonProgress}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* NEW: Sidebar + Main Layout */}
        <div style={{ display: "flex", gap: "2rem" }}>
          {/* Sidebar: Lessons Navigation with Progress */}
          <aside style={{ width: "250px", background: "var(--muted)", padding: "1rem", borderRadius: "var(--radius)", maxHeight: "70vh", overflowY: "auto" }}>
            <h3 style={{ marginBottom: "1rem", color: "var(--primary)" }}>Lessons Progress</h3>
            {module.lessons?.map((lesson, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem",
                  borderRadius: "var(--radius)",
                  background: index === currentLesson ? "var(--primary)" : "transparent",
                  color: index === currentLesson ? "white" : "var(--foreground)",
                  cursor: "pointer",
                  marginBottom: "0.5rem",
                  transition: "all 0.2s ease",
                }}
                onClick={() => setCurrentLesson(index)}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: index < currentLesson ? "#10B981" : (index === currentLesson ? "var(--primary)" : "var(--border)"),  // Green for completed, primary for current, gray for pending
                  }}
                />
                {lesson.title}
              </div>
            ))}
          </aside>

          {/* Main Content: Current Lesson */}
          <main style={{ flex: 1 }}>
            {currentLessonData ? (
              <>
                <h2 style={{ color: "var(--primary)", marginBottom: "1.5rem" }}>{currentLessonData.title}</h2>

                {/* Text/Video Lesson */}
                {(currentLessonData.type === "lesson" || currentLessonData.type === "video") && (
                  <div style={{ lineHeight: "1.6" }}>
                    {currentLessonData.content.text && (
                      <div dangerouslySetInnerHTML={{ __html: currentLessonData.content.text }} />
                    )}
                    {currentLessonData.content.videoUrl && (
                      <div style={{ marginTop: "2rem" }}>
                        <video controls style={{ width: "100%", maxWidth: "800px", borderRadius: "var(--radius)" }}>
                          <source src={currentLessonData.content.videoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                  </div>
                )}

                {/* Quiz */}
                {currentLessonData.type === "quiz" && (
                  <div>
                    {currentLessonData.content.quiz.questions.map((question, qIndex) => (
                      <div key={qIndex} style={{ marginBottom: "2rem" }}>
                        <h4 style={{ marginBottom: "1rem", color: "var(--foreground)" }}>
                          {qIndex + 1}. {question.question}
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          {question.options.map((option, oIndex) => (
                            <label
                              key={oIndex}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                                padding: "0.5rem",
                                borderRadius: "var(--radius)",
                                border: "1px solid var(--border)",
                                background: userAnswers[qIndex] === oIndex ? "var(--accent)" : "transparent",
                              }}
                            >
                              <input
                                type="radio"
                                name={`question-${qIndex}`}
                                value={oIndex}
                                checked={userAnswers[qIndex] === oIndex}
                                onChange={() => handleQuizAnswer(qIndex, oIndex)}
                                style={{ marginRight: "0.5rem" }}
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    {Object.keys(userAnswers).length === currentLessonData.content.quiz.questions.length && (
                      <div
                        style={{
                          marginTop: "2rem",
                          padding: "1rem",
                          background: "var(--muted)",
                          borderRadius: "var(--radius)",
                        }}
                      >
                        <h4>Quiz Results:</h4>
                        {(() => {
                          const results = checkQuizAnswers()
                          return (
                            <p>
                              You scored {results.correct} out of {results.total} ({results.percentage.toFixed(0)}%){' '}
                              {results.percentage >= 70 ? " - Great job! 🎉" : " - Keep practicing! 📚"}
                            </p>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {/* Coding Challenge */}
                {currentLessonData.type === "coding" && (
                  <div>
                    <p style={{ marginBottom: "1rem", color: "var(--muted-foreground)" }}>
                      {currentLessonData.content.coding.instructions}
                    </p>

                    <div
                      style={{
                        marginBottom: "1rem",
                        padding: "1rem",
                        background: "var(--muted)",
                        borderRadius: "var(--radius)",
                      }}
                    >
                      <h4 style={{ marginBottom: "0.5rem" }}>Instructions:</h4>
                      <p>{currentLessonData.content.coding.instructions}</p>
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <h4>Code Editor:</h4>
                        <button
                          onClick={runCode}
                          className="btn btn-secondary"
                          style={{ fontSize: "0.9rem", padding: "0.5rem 1rem" }}
                        >
                          Run Code
                        </button>
                      </div>

                      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                        <MonacoEditor
                          height="300px"
                          language={currentLessonData.content.coding.language || "javascript"}
                          theme={isDark ? "vs-dark" : "vs-light"}
                          value={codeAnswer}
                          onChange={(value) => setCodeAnswer(value || "")}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: "on",
                            roundedSelection: false,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                          }}
                        />
                      </div>
                    </div>

                    <details style={{ marginTop: "1rem" }}>
                      <summary style={{ cursor: "pointer", color: "var(--primary)", fontWeight: "600" }}>
                        Show Solution
                      </summary>
                      <pre
                        style={{
                          background: "var(--muted)",
                          padding: "1rem",
                          borderRadius: "var(--radius)",
                          marginTop: "0.5rem",
                          overflow: "auto",
                        }}
                      >
                        <code>{currentLessonData.content.coding.solution || "// Solution here"}</code>
                      </pre>
                    </details>
                  </div>
                )}
              </>
            ) : (
              <p>No lesson content available.</p>
            )}
          </main>
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2rem" }}>
          <button
            onClick={handlePreviousLesson}
            className="btn btn-outline"
            disabled={currentLesson === 0}
            style={{ opacity: currentLesson === 0 ? 0.5 : 1 }}
          >
            ← Previous
          </button>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            {module.lessons?.map((_, index) => (
              <div
                key={index}
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: index <= currentLesson ? "var(--primary)" : "var(--border)",
                  cursor: "pointer",
                }}
                onClick={() => setCurrentLesson(index)}
              />
            ))}
          </div>

          <button
            onClick={handleNextLesson}
            className="btn btn-primary"
            disabled={
              (currentLessonData?.type === "quiz" &&
                Object.keys(userAnswers).length < (currentLessonData.content.quiz.questions?.length || 0)) ||
              (currentLessonData?.type === "coding" && !codeAnswer.trim())
            }
          >
            {currentLesson === (module.lessons?.length - 1 || 0) ? "Complete Module" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModuleDetail