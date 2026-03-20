"use client"

import { useState } from "react"
import MonacoEditor from "@monaco-editor/react"
import { useTheme } from "../context/ThemeContext"

const CodingChallenge = ({ challenge, onComplete }) => {
  const { isDark } = useTheme()
  const [code, setCode] = useState(challenge.starterCode || "")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState([])
  const [showHint, setShowHint] = useState(false)

  const runCode = async () => {
    setIsRunning(true)
    setOutput("Running code...")

    try {
      // Simulate code execution - in real app, this would use a secure sandbox
      setTimeout(() => {
        const mockOutput = `Code executed successfully!\n\nOutput:\n${code.includes("console.log") ? "Hello, World!" : "No output"}`
        setOutput(mockOutput)

        // Run test cases
        const results =
          challenge.testCases?.map((testCase, index) => ({
            id: index,
            description: testCase.description,
            passed: Math.random() > 0.3, // Mock test results
            expected: testCase.expected,
            actual: testCase.expected, // Mock actual result
          })) || []

        setTestResults(results)
        setIsRunning(false)

        // Check if challenge is completed
        const allPassed = results.every((test) => test.passed)
        if (allPassed && results.length > 0) {
          onComplete({
            completed: true,
            code: code,
            score: 100,
          })
        }
      }, 2000)
    } catch (error) {
      setOutput(`Error: ${error.message}`)
      setIsRunning(false)
    }
  }

  const resetCode = () => {
    setCode(challenge.starterCode || "")
    setOutput("")
    setTestResults([])
  }

  const showSolution = () => {
    setCode(challenge.solution || "")
  }

  return (
    <div className="coding-challenge">
      {/* Challenge Header */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ color: "var(--primary)", marginBottom: "1rem" }}>{challenge.title}</h2>
        <p style={{ color: "var(--muted-foreground)", marginBottom: "1rem" }}>{challenge.description}</p>

        {challenge.difficulty && (
          <div style={{ marginBottom: "1rem" }}>
            <span
              className={`badge ${
                challenge.difficulty === "Easy"
                  ? "badge-success"
                  : challenge.difficulty === "Medium"
                    ? "badge-warning"
                    : "badge-error"
              }`}
            >
              {challenge.difficulty}
            </span>
          </div>
        )}

        <div
          style={{
            background: "var(--muted)",
            padding: "1rem",
            borderRadius: "var(--radius)",
            marginBottom: "1rem",
          }}
        >
          <h4 style={{ marginBottom: "0.5rem" }}>Instructions:</h4>
          <p>{challenge.instructions}</p>
        </div>

        {challenge.hints && (
          <div>
            <button
              onClick={() => setShowHint(!showHint)}
              className="btn btn-outline"
              style={{ fontSize: "0.9rem", padding: "0.5rem 1rem" }}
            >
              {showHint ? "Hide Hint" : "Show Hint"} 💡
            </button>
            {showHint && (
              <div
                style={{
                  background: "var(--accent)",
                  padding: "1rem",
                  borderRadius: "var(--radius)",
                  marginTop: "1rem",
                }}
              >
                <p>
                  <strong>Hint:</strong> {challenge.hints}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Code Editor */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h3>Code Editor</h3>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={resetCode}
              className="btn btn-outline"
              style={{ fontSize: "0.9rem", padding: "0.5rem 1rem" }}
            >
              Reset
            </button>
            <button
              onClick={runCode}
              className="btn btn-primary"
              disabled={isRunning}
              style={{ fontSize: "0.9rem", padding: "0.5rem 1rem" }}
            >
              {isRunning ? "Running..." : "Run Code"} ▶️
            </button>
          </div>
        </div>

        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}
        >
          <MonacoEditor
            height="400px"
            language={challenge.language || "javascript"}
            theme={isDark ? "vs-dark" : "vs-light"}
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: "on",
              tabSize: 2,
            }}
          />
        </div>
      </div>

      {/* Output and Test Results */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Output */}
        <div className="card">
          <h3 style={{ marginBottom: "1rem" }}>Output</h3>
          <pre
            style={{
              background: "var(--muted)",
              padding: "1rem",
              borderRadius: "var(--radius)",
              minHeight: "150px",
              overflow: "auto",
              fontSize: "0.9rem",
              whiteSpace: "pre-wrap",
            }}
          >
            {output || 'Click "Run Code" to see output...'}
          </pre>
        </div>

        {/* Test Results */}
        <div className="card">
          <h3 style={{ marginBottom: "1rem" }}>Test Results</h3>
          {testResults.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {testResults.map((test) => (
                <div
                  key={test.id}
                  style={{
                    padding: "0.75rem",
                    borderRadius: "var(--radius)",
                    background: test.passed ? "#10B981" : "#EF4444",
                    color: "white",
                    fontSize: "0.9rem",
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
                    {test.passed ? "✅" : "❌"} {test.description}
                  </div>
                  {!test.passed && (
                    <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>
                      Expected: {test.expected}
                      <br />
                      Got: {test.actual}
                    </div>
                  )}
                </div>
              ))}

              <div style={{ marginTop: "1rem", textAlign: "center" }}>
                {testResults.every((test) => test.passed) ? (
                  <div style={{ color: "#10B981", fontWeight: "bold" }}>🎉 All tests passed! Challenge completed!</div>
                ) : (
                  <div style={{ color: "#EF4444" }}>
                    {testResults.filter((test) => test.passed).length} / {testResults.length} tests passed
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p style={{ color: "var(--muted-foreground)", fontStyle: "italic" }}>
              Run your code to see test results...
            </p>
          )}
        </div>
      </div>

      {/* Solution */}
      <div className="card" style={{ marginTop: "1.5rem" }}>
        <details>
          <summary
            style={{
              cursor: "pointer",
              color: "var(--primary)",
              fontWeight: "600",
              marginBottom: "1rem",
            }}
          >
            💡 Show Solution
          </summary>
          <div style={{ marginTop: "1rem" }}>
            <button onClick={showSolution} className="btn btn-secondary" style={{ marginBottom: "1rem" }}>
              Load Solution into Editor
            </button>
            <pre
              style={{
                background: "var(--muted)",
                padding: "1rem",
                borderRadius: "var(--radius)",
                overflow: "auto",
                fontSize: "0.9rem",
              }}
            >
              <code>{challenge.solution}</code>
            </pre>
          </div>
        </details>
      </div>
    </div>
  )
}

export default CodingChallenge
