"use client"

import { useState, useEffect } from "react"
import MonacoEditor from "@monaco-editor/react"
import { useTheme } from "../context/ThemeContext"

const AdminModuleEditor = ({ module, onSave, onCancel }) => {
  const { isDark } = useTheme()
  const [moduleData, setModuleData] = useState(
    module || {
      title: "",
      description: "",
      domain: "web-development",
      difficulty: "beginner",
      duration: "",
      sections: [],
    }
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [modules, setModules] = useState([])
  const [showModulesList, setShowModulesList] = useState(false)

  const [activeSection, setActiveSection] = useState(0)

  // API Configuration
  const API_BASE_URL = process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL}`

  // Helper function to get authentication token
  const getAuthToken = () => {
    return localStorage.getItem('token') || getCookie('token')
  }

  // Helper function to get cookie value
  const getCookie = (name) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
  }

  // Generic API call function
  const apiCall = async (endpoint, options = {}) => {
    const token = getAuthToken()
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }

    const config = {
      credentials: 'include',
      headers: { ...defaultHeaders, ...options.headers },
      ...options
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error)
      throw error
    }
  }

  // Load all modules for management
  const loadAllModules = async () => {
    setIsLoading(true)
    try {
      const data = await apiCall('/api/modules')
      setModules(data.data || [])
    } catch (err) {
      setError(`Failed to load modules: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Save module to database (CREATE or UPDATE)
  const saveModuleToDatabase = async () => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Validate required fields
      if (!moduleData.title?.trim()) {
        throw new Error("Module title is required")
      }
      if (!moduleData.description?.trim()) {
        throw new Error("Module description is required")
      }
      if (!moduleData.duration?.trim()) {
        throw new Error("Module duration is required")
      }

      // Validate sections
      if (moduleData.sections.length === 0) {
        throw new Error("At least one section is required")
      }

      // Validate each section
      for (let i = 0; i < moduleData.sections.length; i++) {
        const section = moduleData.sections[i]
        if (!section.title?.trim()) {
          throw new Error(`Section ${i + 1} title is required`)
        }
        
        if (section.type === 'quiz' && (!section.content?.questions || section.content.questions.length === 0)) {
          throw new Error(`Section ${i + 1} (Quiz) must have at least one question`)
        }
        
        if (section.type === 'lesson' && !section.content?.trim()) {
          throw new Error(`Section ${i + 1} (Lesson) content is required`)
        }
        
        if (section.type === 'coding' && !section.content?.instructions?.trim()) {
          throw new Error(`Section ${i + 1} (Coding) instructions are required`)
        }
      }

      const token = getAuthToken()
      if (!token) {
        throw new Error("Authentication required. Please login as admin.")
      }

      // Determine if it's an update or create operation
      const isUpdate = module && module._id
      const endpoint = isUpdate ? `/api/modules/${module._id}` : '/api/modules'
      const method = isUpdate ? 'PUT' : 'POST'

      const data = await apiCall(endpoint, {
        method,
        body: JSON.stringify(moduleData)
      })

      setSuccess(isUpdate ? 'Module updated successfully!' : 'Module created successfully!')
      
      // Call the parent onSave callback with the saved data
      if (onSave) {
        onSave(data.data)
      }

      // Reset form if it was a create operation
      if (!isUpdate) {
        setModuleData({
          title: "",
          description: "",
          domain: "web-development",
          difficulty: "beginner",
          duration: "",
          sections: [],
        })
        setActiveSection(0)
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Delete module
  const deleteModule = async (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module?')) {
      return
    }

    try {
      await apiCall(`/api/modules/${moduleId}`, { method: 'DELETE' })
      setSuccess('Module deleted successfully!')
      await loadAllModules() // Refresh the list
    } catch (err) {
      setError(`Failed to delete module: ${err.message}`)
    }
  }

  // Load a specific module for editing
  const loadModuleForEdit = async (moduleId) => {
    setIsLoading(true)
    try {
      const data = await apiCall(`/api/modules/${moduleId}`)
      setModuleData(data.data)
      setActiveSection(0)
      setShowModulesList(false)
    } catch (err) {
      setError(`Failed to load module: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Create new module
  const createNewModule = () => {
    setModuleData({
      title: "",
      description: "",
      domain: "web-development",
      difficulty: "beginner",
      duration: "",
      sections: [],
    })
    setActiveSection(0)
    setShowModulesList(false)
    setError("")
    setSuccess("")
  }

  // Load modules on component mount
  useEffect(() => {
    if (showModulesList) {
      loadAllModules()
    }
  }, [showModulesList])

  const handleModuleChange = (field, value) => {
    setModuleData({ ...moduleData, [field]: value })
  }

  const handleSectionChange = (index, field, value) => {
    const updatedSections = [...moduleData.sections]
    updatedSections[index] = { ...updatedSections[index], [field]: value }
    setModuleData({ ...moduleData, sections: updatedSections })
  }

  const addSection = (type) => {
    const newSection = {
      type,
      title: "",
      content:
        type === "lesson"
          ? ""
          : type === "quiz"
          ? { questions: [] }
          : { instructions: "", starterCode: "", solution: "" },
    }
    setModuleData({ ...moduleData, sections: [...moduleData.sections, newSection] })
    setActiveSection(moduleData.sections.length)
  }

  const removeSection = (index) => {
    const updatedSections = moduleData.sections.filter((_, i) => i !== index)
    setModuleData({ ...moduleData, sections: updatedSections })
    if (activeSection >= updatedSections.length) setActiveSection(Math.max(0, updatedSections.length - 1))
  }

  const addQuestion = () => {
    const section = moduleData.sections[activeSection]
    if (section && section.type === "quiz") {
      const questions = [...(section.content?.questions || [])]
      questions.push({ question: "", options: ["", "", "", ""], correct: 0 })
      handleSectionChange(activeSection, "content", { questions })
    }
  }

  const removeQuestion = (questionIndex) => {
    const section = moduleData.sections[activeSection]
    if (section && section.type === "quiz") {
      const questions = [...(section.content?.questions || [])]
      questions.splice(questionIndex, 1)
      handleSectionChange(activeSection, "content", { questions })
    }
  }

  const updateQuestion = (questionIndex, field, value) => {
    const section = moduleData.sections[activeSection]
    if (section && section.type === "quiz") {
      const questions = [...(section.content?.questions || [])]
      if (field === "question") {
        questions[questionIndex].question = value
      } else if (field === "correct") {
        questions[questionIndex].correct = value
      } else if (field.startsWith("option-")) {
        const optionIndex = parseInt(field.split("-")[1])
        questions[questionIndex].options[optionIndex] = value
      }
      handleSectionChange(activeSection, "content", { questions })
    }
  }

  const renderSectionEditor = () => {
    const section = moduleData.sections[activeSection]
    if (!section) return <p>No section selected. Add a section to get started.</p>

    switch (section.type) {
      case "lesson":
        return (
          <div>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Title *</label>
              <input
                type="text"
                className="form-input"
                value={section.title}
                onChange={(e) => handleSectionChange(activeSection, "title", e.target.value)}
                placeholder="Enter lesson title"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Content (HTML) *</label>
              <MonacoEditor
                height="400px"
                language="html"
                theme={isDark ? "vs-dark" : "vs-light"}
                value={section.content}
                onChange={(value) => handleSectionChange(activeSection, "content", value || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on"
                }}
              />
            </div>
          </div>
        )
      
      case "quiz":
        return (
          <div>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Quiz Title *</label>
              <input
                type="text"
                className="form-input"
                value={section.title}
                onChange={(e) => handleSectionChange(activeSection, "title", e.target.value)}
                placeholder="Enter quiz title"
              />
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <button className="btn btn-outline" onClick={addQuestion}>
                Add Question
              </button>
            </div>

            {(section.content?.questions || []).map((q, idx) => (
              <div key={idx} className="card" style={{ marginBottom: "1rem", padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <label><strong>Question {idx + 1}</strong></label>
                  <button
                    className="btn"
                    onClick={() => removeQuestion(idx)}
                    style={{ 
                      backgroundColor: "#ff4444", 
                      color: "white", 
                      padding: "0.25rem 0.5rem",
                      fontSize: "0.8rem"
                    }}
                  >
                    Remove
                  </button>
                </div>
                
                <div className="form-group" style={{ marginBottom: "1rem" }}>
                  <input
                    type="text"
                    className="form-input"
                    value={q.question}
                    onChange={(e) => updateQuestion(idx, "question", e.target.value)}
                    placeholder="Enter your question"
                  />
                </div>
                
                <div>
                  <label><strong>Options:</strong></label>
                  {q.options.map((opt, oidx) => (
                    <div key={oidx} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "center" }}>
                      <input
                        type="text"
                        className="form-input"
                        value={opt}
                        onChange={(e) => updateQuestion(idx, `option-${oidx}`, e.target.value)}
                        placeholder={`Option ${oidx + 1}`}
                        style={{ flex: 1 }}
                      />
                      <label style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <input
                          type="radio"
                          name={`correct-${idx}`}
                          checked={q.correct === oidx}
                          onChange={() => updateQuestion(idx, "correct", oidx)}
                        />
                        Correct
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {(section.content?.questions || []).length === 0 && (
              <p style={{ color: "#666", fontStyle: "italic" }}>No questions added yet. Click "Add Question" to create your first question.</p>
            )}
          </div>
        )
      
      case "coding":
        return (
          <div>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Title *</label>
              <input
                type="text"
                className="form-input"
                value={section.title}
                onChange={(e) => handleSectionChange(activeSection, "title", e.target.value)}
                placeholder="Enter coding exercise title"
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Instructions *</label>
              <textarea
                className="form-input"
                value={section.content.instructions || ""}
                onChange={(e) =>
                  handleSectionChange(activeSection, "content", {
                    ...section.content,
                    instructions: e.target.value,
                  })
                }
                placeholder="Provide clear instructions for the coding exercise"
                rows="4"
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Starter Code</label>
              <MonacoEditor
                height="200px"
                language="javascript"
                theme={isDark ? "vs-dark" : "vs-light"}
                value={section.content.starterCode || ""}
                onChange={(value) =>
                  handleSectionChange(activeSection, "content", { ...section.content, starterCode: value || "" })
                }
                options={{
                  minimap: { enabled: false },
                  fontSize: 14
                }}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Solution</label>
              <MonacoEditor
                height="200px"
                language="javascript"
                theme={isDark ? "vs-dark" : "vs-light"}
                value={section.content.solution || ""}
                onChange={(value) =>
                  handleSectionChange(activeSection, "content", { ...section.content, solution: value || "" })
                }
                options={{
                  minimap: { enabled: false },
                  fontSize: 14
                }}
              />
            </div>
          </div>
        )
      
      default:
        return <p>Unknown section type</p>
    }
  }

  // Render modules management view
  if (showModulesList) {
    return (
      <div className="admin-module-editor" style={{ padding: "2rem 0" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <h1>Module Management</h1>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button className="btn btn-outline" onClick={() => setShowModulesList(false)}>
                Back to Editor
              </button>
              <button className="btn btn-primary" onClick={createNewModule}>
                Create New Module
              </button>
            </div>
          </div>

          {error && (
            <div style={{ 
              background: '#fee', 
              color: '#c33', 
              padding: '1rem', 
              borderRadius: '4px', 
              marginBottom: '1rem',
              border: '1px solid #fcc'
            }}>
              {error}
            </div>
          )}
          
          {success && (
            <div style={{ 
              background: '#efe', 
              color: '#393', 
              padding: '1rem', 
              borderRadius: '4px', 
              marginBottom: '1rem',
              border: '1px solid #cfc'
            }}>
              {success}
            </div>
          )}

          {isLoading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>Loading modules...</div>
          ) : (
            <div className="modules-grid" style={{ display: 'grid', gap: '1rem' }}>
              {modules.map((mod) => (
                <div key={mod._id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h3>{mod.title}</h3>
                      <p style={{ color: '#666', marginBottom: '1rem' }}>{mod.description}</p>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        <span><strong>Domain:</strong> {mod.domain}</span>
                        <span><strong>Difficulty:</strong> {mod.difficulty}</span>
                        <span><strong>Duration:</strong> {mod.duration}</span>
                      </div>
                      <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        <strong>Sections:</strong> {mod.sections.length}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#999' }}>
                        Created: {new Date(mod.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-outline" 
                        onClick={() => loadModuleForEdit(mod._id)}
                        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn" 
                        onClick={() => deleteModule(mod._id)}
                        style={{ 
                          fontSize: '0.9rem', 
                          padding: '0.5rem 1rem',
                          backgroundColor: '#ff4444',
                          color: 'white',
                          border: 'none'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {modules.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  No modules found. Click "Create New Module" to create your first module.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render main editor view
  return (
    <div className="admin-module-editor" style={{ padding: "2rem 0" }}>
      <div className="container">
        {/* Error/Success Messages */}
        {error && (
          <div style={{ 
            background: '#fee', 
            color: '#c33', 
            padding: '1rem', 
            borderRadius: '4px', 
            marginBottom: '1rem',
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ 
            background: '#efe', 
            color: '#393', 
            padding: '1rem', 
            borderRadius: '4px', 
            marginBottom: '1rem',
            border: '1px solid #cfc'
          }}>
            {success}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "2rem" }}>
          {/* Sidebar */}
          <div>
            <div className="card" style={{ marginBottom: "1rem" }}>
              <h3>Module Settings</h3>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Module Title"
                  value={moduleData.title}
                  onChange={(e) => handleModuleChange("title", e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Description *</label>
                <textarea
                  className="form-input"
                  placeholder="Module Description"
                  value={moduleData.description}
                  onChange={(e) => handleModuleChange("description", e.target.value)}
                  rows="3"
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Domain</label>
                <select 
                  className="form-input"
                  value={moduleData.domain} 
                  onChange={(e) => handleModuleChange("domain", e.target.value)}
                >
                  <option value="web-development">Web Development</option>
                  <option value="programming">Programming</option>
                  <option value="verbal-skills">Verbal Skills</option>
                  <option value="aptitude">Aptitude</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Difficulty</label>
                <select 
                  className="form-input"
                  value={moduleData.difficulty} 
                  onChange={(e) => handleModuleChange("difficulty", e.target.value)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Duration *</label>
                <input
                  type="text"
                  placeholder="e.g., 2 hours"
                  className="form-input"
                  value={moduleData.duration}
                  onChange={(e) => handleModuleChange("duration", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Sections List */}
            <div className="card">
              <h4>Sections</h4>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <select
                  className="form-input"
                  onChange={(e) => {
                    if (e.target.value) {
                      addSection(e.target.value)
                      e.target.value = ""
                    }
                  }}
                >
                  <option value="">Add Section</option>
                  <option value="lesson">Lesson</option>
                  <option value="quiz">Quiz</option>
                  <option value="coding">Coding</option>
                </select>
              </div>
              <div>
                {moduleData.sections.map((s, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.5rem",
                      background: activeSection === idx ? "#e0e0e0" : "#f8f8f8",
                      cursor: "pointer",
                      marginBottom: "0.25rem",
                      borderRadius: "4px"
                    }}
                    onClick={() => setActiveSection(idx)}
                  >
                    <span>{s.title || `${s.type} ${idx + 1}`}</span>
                    <button 
                      style={{ 
                        background: "#ff4444", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "50%", 
                        width: "20px", 
                        height: "20px",
                        cursor: "pointer"
                      }}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        removeSection(idx) 
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {moduleData.sections.length === 0 && (
                  <p style={{ color: "#666", fontSize: "0.9rem", fontStyle: "italic" }}>
                    No sections added yet. Use the dropdown above to add your first section.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Main Editor */}
          <div>
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h2>{moduleData.sections[activeSection]?.title || "Section Editor"}</h2>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button 
                    className="btn btn-outline" 
                    onClick={() => setShowModulesList(true)}
                  >
                    Manage Modules
                  </button>
                  <button 
                    className="btn btn-outline" 
                    onClick={onCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={saveModuleToDatabase}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : (module ? 'Update Module' : 'Save Module')}
                  </button>
                </div>
              </div>
              {renderSectionEditor()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminModuleEditor