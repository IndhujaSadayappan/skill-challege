
"use client"

import { useState, useEffect } from "react"

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSkills: 0,
    completedCourses: 0,
  })

  // Skills Management State
  const [skills, setSkills] = useState([])
  const [showSkillForm, setShowSkillForm] = useState(false)
  const [editingSkillId, setEditingSkillId] = useState(null)
  const [skillFormData, setSkillFormData] = useState({
    name: "",
    description: "",
    level: "beginner",
    estimatedHours: 10,
    color: "#1230AE",
    tags: "",
  })

  // Modules Management State
  const [modules, setModules] = useState([])
  const [showModuleForm, setShowModuleForm] = useState(false)
  const [editingModuleId, setEditingModuleId] = useState(null)
  const [selectedSkillForModule, setSelectedSkillForModule] = useState("")
  const [moduleFormData, setModuleFormData] = useState({
    title: "",
    description: "",
    estimatedTime: 30,
    type: "lesson",
    lessons: [],
  })

  useEffect(() => {
    fetchStats()
    fetchSkills()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch(`${"http://3.6.91.209:5000"}/api/admin/stats`, {
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err)
    }
  }

  const fetchSkills = async () => {
    try {
      const response = await fetch(`${"http://3.6.91.209:5000"}/api/admin/skills`, {
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        setSkills(data.skills)
      }
    } catch (err) {
      console.error("Failed to fetch skills:", err)
    }
  }

  const handleSkillFormChange = (e) => {
    const { name, value } = e.target
    setSkillFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveSkill = async () => {
    if (!skillFormData.name || !skillFormData.description) {
      alert("Please fill in all required fields")
      return
    }

    const payload = {
      ...skillFormData,
      estimatedHours: parseInt(skillFormData.estimatedHours, 10) || 10,
      tags: skillFormData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
    }

    try {
      const url = editingSkillId
        ? `${"http://3.6.91.209:5000"}/api/admin/skills/${editingSkillId}`
        : `${"http://3.6.91.209:5000"}/api/admin/skills`

      const method = editingSkillId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Skill save error:", errorData)
        alert("Error: " + (errorData.message || "Failed to save skill"))
        return
      }

      const data = await response.json()
      if (data.success) {
        alert(editingSkillId ? "Skill updated successfully!" : "Skill created successfully!")
        setSkillFormData({
          name: "",
          description: "",
          level: "beginner",
          estimatedHours: 10,
          color: "#1230AE",
          tags: "",
        })
        setShowSkillForm(false)
        setEditingSkillId(null)
        fetchSkills()
      } else {
        alert("Error: " + data.message)
      }
    } catch (err) {
      console.error("Failed to save skill:", err)
      alert("Failed to save skill: " + err.message)
    }
  }

  const handleEditSkill = (skill) => {
    setSkillFormData({
      name: skill.name,
      description: skill.description,
      level: skill.level,
      estimatedHours: skill.estimatedHours,
      color: skill.color,
      tags: skill.tags ? skill.tags.join(", ") : "",
    })
    setEditingSkillId(skill._id)
    setShowSkillForm(true)
  }

  const handleDeleteSkill = async (skillId) => {
    if (window.confirm("Are you sure you want to delete this skill and all its modules?")) {
      try {
        const response = await fetch(`${"http://3.6.91.209:5000"}/api/admin/skills/${skillId}`, {
          method: "DELETE",
          credentials: "include",
        })
        const data = await response.json()
        if (data.success) {
          alert("Skill deleted successfully!")
          fetchSkills()
        } else {
          alert("Error: " + data.message)
        }
      } catch (err) {
        alert("Failed to delete skill: " + err.message)
      }
    }
  }

  const handleModuleFormChange = (e) => {
    const { name, value } = e.target
    setModuleFormData((prev) => ({ ...prev, [name]: value }))
  }

  const addLesson = () => {
    const newLesson = {
      id: Date.now() + Math.random(),
      title: `Lesson ${moduleFormData.lessons.length + 1}`,
      type: "lesson",
      content: {
        text: "",
        videoUrl: "",
        quiz: { questions: [] },
        coding: { starterCode: "", language: "javascript", instructions: "" },
      },
    }
    setModuleFormData((prev) => ({ ...prev, lessons: [...prev.lessons, newLesson] }))
  }

  const updateLessonContent = (lessonIndex, field, value) => {
    setModuleFormData((prev) => {
      const newLessons = [...prev.lessons]
      const lesson = newLessons[lessonIndex]
      if (field === "title" || field === "type") {
        lesson[field] = value
      } else if (field === "quiz.questions") {
        lesson.content.quiz.questions = value
      } else if (field.startsWith("coding.")) {
        const subField = field.split(".")[1]
        if (!lesson.content.coding) lesson.content.coding = {}
        lesson.content.coding[subField] = value
      } else {
        lesson.content[field] = value
      }
      return { ...prev, lessons: newLessons }
    })
  }

  const deleteLesson = (lessonIndex) => {
    setModuleFormData((prev) => ({
      ...prev,
      lessons: prev.lessons.filter((_, index) => index !== lessonIndex),
    }))
  }

  const handleSaveModule = async () => {
    const hasEmptyLessonTitle = moduleFormData.lessons.some(lesson => !lesson.title.trim())
    if (hasEmptyLessonTitle) {
      alert("Please fill in titles for all lessons")
      return
    }
    if (!moduleFormData.title || !moduleFormData.description || !selectedSkillForModule || moduleFormData.lessons.length === 0) {
      alert("Please fill in all required fields, select a skill, and add at least one lesson")
      return
    }

    const payload = {
      title: moduleFormData.title.trim(),
      description: moduleFormData.description.trim(),
      estimatedTime: parseInt(moduleFormData.estimatedTime, 10) || 30,
      type: moduleFormData.type,
      lessons: moduleFormData.lessons.map((lesson) => ({
        title: lesson.title.trim(),
        type: lesson.type,
        content: {
          text: lesson.content.text || "",
          videoUrl: lesson.content.videoUrl || "",
          quiz: {
            questions: (lesson.content.quiz?.questions || []).map((q) => ({
              question: q.question || "",
              options: Array.isArray(q.options) ? q.options.filter(o => o.trim()) : [],
              correct: parseInt(q.correct, 10) || 0,
            })).filter(q => q.question.trim()),
          },
          coding: {
            instructions: lesson.content.coding?.instructions || "",
            starterCode: lesson.content.coding?.starterCode || "",
            language: lesson.content.coding?.language || "javascript",
          },
        },
        estimatedTime: parseInt(lesson.estimatedTime || 15, 10),
        order: lesson.order || 1,
      })).filter(lesson => lesson.title),
    }

    if (payload.lessons.length === 0) {
      alert("No valid lessons after sanitization")
      return
    }

    try {
      const url = editingModuleId
        ? `${"http://3.6.91.209:5000"}/api/admin/skills/${selectedSkillForModule}/modules/${editingModuleId}`
        : `${"http://3.6.91.209:5000"}/api/admin/skills/${selectedSkillForModule}/modules`

      const method = editingModuleId ? "PUT" : "POST"

      console.log("Sending sanitized payload:", JSON.stringify(payload, null, 2))

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Module save error:", errorData)
        alert(`Error ${response.status}: ${errorData.message || "Failed to save module. Check console."}`)
        return
      }

      const data = await response.json()
      if (data.success) {
        alert(editingModuleId ? "Module updated successfully!" : "Module created successfully!")
        setModuleFormData({
          title: "",
          description: "",
          estimatedTime: 30,
          type: "lesson",
          lessons: [],
        })
        setShowModuleForm(false)
        setEditingModuleId(null)
        setSelectedSkillForModule("")
        fetchSkills()
      } else {
        alert("Error: " + data.message)
      }
    } catch (err) {
      console.error("Failed to save module:", err)
      alert("Failed to save module: " + err.message)
    }
  }

  const handleEditModule = (skill, module) => {
    setModuleFormData({
      title: module.title,
      description: module.description,
      estimatedTime: module.estimatedTime,
      type: module.type,
      lessons: module.lessons || [],
    })
    setEditingModuleId(module._id)
    setSelectedSkillForModule(skill._id)
    setShowModuleForm(true)
  }

  const handleDeleteModule = async (skillId, moduleId) => {
    if (window.confirm("Are you sure you want to delete this module?")) {
      try {
        const response = await fetch(`${"http://3.6.91.209:5000"}/api/admin/skills/${skillId}/modules/${moduleId}`, {
          method: "DELETE",
          credentials: "include",
        })
        const data = await response.json()
        if (data.success) {
          alert("Module deleted successfully!")
          fetchSkills()
        } else {
          alert("Error: " + data.message)
        }
      } catch (err) {
        alert("Failed to delete module: " + err.message)
      }
    }
  }

  const renderOverview = () => (
    <div style={{ display: "grid", gap: "2rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
        {[
          { key: "totalUsers", label: "Total Users", color: "#0066FF", icon: "👥" },
          { key: "activeUsers", label: "Active Users", color: "#10B981", icon: "✨" },
          { key: "totalSkills", label: "Total Skills", color: "#F59E0B", icon: "🎯" },
          { key: "completedCourses", label: "Completed Courses", color: "#FF6B6B", icon: "🏆" },
        ].map((stat) => (
          <div key={stat.key} className="stat-card" style={{
            background: "white",
            padding: "2rem",
            borderRadius: "20px",
            border: "2px solid rgba(0, 102, 255, 0.1)",
            transition: "all 0.3s ease",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden"
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)"
              e.currentTarget.style.borderColor = stat.color
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 102, 255, 0.16)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.borderColor = "rgba(0, 102, 255, 0.1)"
              e.currentTarget.style.boxShadow = "none"
            }}>
            <div style={{
              position: "absolute",
              top: "-20px",
              right: "-20px",
              width: "100px",
              height: "100px",
              background: `linear-gradient(135deg, ${stat.color}22, transparent)`,
              borderRadius: "50%"
            }}></div>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>{stat.icon}</div>
            <h3 style={{ color: stat.color, fontSize: "2.5rem", fontWeight: "800", marginBottom: "0.5rem" }}>
              {stats[stat.key].toLocaleString()}
            </h3>
            <p style={{ color: "#6B7280", fontWeight: "600", fontSize: "1rem" }}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const renderSkillsManagement = () => (
    <div style={{ display: "grid", gap: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <h2 style={{
          fontSize: "2.5rem",
          fontWeight: "800",
          background: "linear-gradient(135deg, #0066FF, #FF6B6B)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          Skills Management
        </h2>
        <button
          className="btn-toggle"
          onClick={() => {
            setShowSkillForm(!showSkillForm)
            setEditingSkillId(null)
            setSkillFormData({
              name: "",
              description: "",
              level: "beginner",
              estimatedHours: 10,
              color: "#1230AE",
              tags: "",
            })
          }}
          style={{
            padding: "1rem 2rem",
            background: showSkillForm ? "#6B7280" : "linear-gradient(135deg, #0066FF, #FF6B6B)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "1rem",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 16px rgba(0, 102, 255, 0.3)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)"
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 102, 255, 0.4)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 102, 255, 0.3)"
          }}
        >
          {showSkillForm ? "✕ Cancel" : "+ Add New Skill"}
        </button>
      </div>

      {showSkillForm && (
        <div className="form-card" style={{
          background: "white",
          padding: "2.5rem",
          borderRadius: "24px",
          border: "2px solid rgba(0, 102, 255, 0.1)",
          boxShadow: "0 4px 16px rgba(0, 102, 255, 0.12)"
        }}>
          <h3 style={{
            marginBottom: "2rem",
            fontSize: "1.8rem",
            fontWeight: "700",
            color: "#1A1A2E"
          }}>
            {editingSkillId ? "Edit Skill" : "Create New Skill"}
          </h3>
          <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="form-label" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#1A1A2E" }}>
                Skill Name *
              </label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={skillFormData.name}
                onChange={handleSkillFormChange}
                placeholder="e.g., React Basics"
                style={{
                  width: "100%",
                  padding: "1rem",
                  border: "2px solid rgba(0, 102, 255, 0.2)",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  transition: "all 0.3s ease",
                  outline: "none"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#0066FF"
                  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(0, 102, 255, 0.1)"
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0, 102, 255, 0.2)"
                  e.currentTarget.style.boxShadow = "none"
                }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="form-label" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#1A1A2E" }}>
                Description *
              </label>
              <textarea
                name="description"
                className="form-input"
                value={skillFormData.description}
                onChange={handleSkillFormChange}
                placeholder="Describe your skill"
                style={{
                  width: "100%",
                  padding: "1rem",
                  border: "2px solid rgba(0, 102, 255, 0.2)",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  minHeight: "120px",
                  resize: "vertical",
                  transition: "all 0.3s ease",
                  outline: "none",
                  fontFamily: "inherit"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#0066FF"
                  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(0, 102, 255, 0.1)"
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0, 102, 255, 0.2)"
                  e.currentTarget.style.boxShadow = "none"
                }}
              />
            </div>

            <div>
              <label className="form-label" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#1A1A2E" }}>
                Level
              </label>
              <select
                name="level"
                className="form-input"
                value={skillFormData.level}
                onChange={handleSkillFormChange}
                style={{
                  width: "100%",
                  padding: "1rem",
                  border: "2px solid rgba(0, 102, 255, 0.2)",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  outline: "none",
                  background: "white"
                }}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#1A1A2E" }}>
                Estimated Hours
              </label>
              <input
                type="number"
                name="estimatedHours"
                className="form-input"
                value={skillFormData.estimatedHours}
                onChange={handleSkillFormChange}
                min="1"
                style={{
                  width: "100%",
                  padding: "1rem",
                  border: "2px solid rgba(0, 102, 255, 0.2)",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label className="form-label" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#1A1A2E" }}>
                Color (Hex)
              </label>
              <input
                type="text"
                name="color"
                className="form-input"
                value={skillFormData.color}
                onChange={handleSkillFormChange}
                placeholder="e.g., #0066FF"
                style={{
                  width: "100%",
                  padding: "1rem",
                  border: "2px solid rgba(0, 102, 255, 0.2)",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="form-label" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#1A1A2E" }}>
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                className="form-input"
                value={skillFormData.tags}
                onChange={handleSkillFormChange}
                placeholder="e.g., React, JavaScript, Frontend"
                style={{
                  width: "100%",
                  padding: "1rem",
                  border: "2px solid rgba(0, 102, 255, 0.2)",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  outline: "none"
                }}
              />
            </div>

            <button
              className="btn-submit"
              onClick={handleSaveSkill}
              style={{
                gridColumn: "1 / -1",
                marginTop: "1rem",
                padding: "1.25rem 2rem",
                background: "linear-gradient(135deg, #0066FF, #FF6B6B)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "1.1rem",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 16px rgba(0, 102, 255, 0.3)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)"
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 102, 255, 0.4)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 102, 255, 0.3)"
              }}
            >
              {editingSkillId ? "Update Skill" : "Create Skill"}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {skills && skills.length > 0 ? (
          skills.map((skill) => (
            <div
              key={skill._id}
              className="skill-card"
              style={{
                background: "white",
                padding: "2rem",
                borderRadius: "20px",
                border: "2px solid rgba(0, 102, 255, 0.1)",
                transition: "all 0.3s ease",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)"
                e.currentTarget.style.borderColor = skill.color
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 102, 255, 0.16)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.borderColor = "rgba(0, 102, 255, 0.1)"
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              <div style={{
                position: "absolute",
                top: "-30px",
                right: "-30px",
                width: "120px",
                height: "120px",
                background: `linear-gradient(135deg, ${skill.color}22, transparent)`,
                borderRadius: "50%"
              }}></div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem", position: "relative", zIndex: 1 }}>
                <div>
                  <h3 style={{ color: "#1A1A2E", marginBottom: "0.5rem", fontSize: "1.4rem", fontWeight: "700" }}>
                    {skill.name}
                  </h3>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                    {skill.tags?.map((tag, idx) => (
                      <span key={idx} style={{
                        padding: "0.25rem 0.75rem",
                        background: `${skill.color}15`,
                        color: skill.color,
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: "600"
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p style={{ color: "#6B7280", fontSize: "0.95rem", marginBottom: "1.5rem", lineHeight: "1.6" }}>
                {skill.description}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem", padding: "1rem", background: "#F8F9FF", borderRadius: "12px" }}>
                <div>
                  <p style={{ fontSize: "0.8rem", color: "#6B7280", marginBottom: "0.25rem" }}>Level</p>
                  <p style={{ fontWeight: "700", color: "#1A1A2E", textTransform: "capitalize" }}>{skill.level}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.8rem", color: "#6B7280", marginBottom: "0.25rem" }}>Hours</p>
                  <p style={{ fontWeight: "700", color: "#1A1A2E" }}>{skill.estimatedHours}h</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.8rem", color: "#6B7280", marginBottom: "0.25rem" }}>Modules</p>
                  <p style={{ fontWeight: "700", color: "#1A1A2E" }}>{skill.modules?.length || 0}</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  className="btn-edit"
                  onClick={() => handleEditSkill(skill)}
                  style={{

                    padding: "0.5rem 1.5rem",   // shorter & wider
                    background: "white",
                    color: skill.color,
                    border: `2px solid ${skill.color}`,
                    borderRadius: "10px",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = skill.color
                    e.currentTarget.style.color = "white"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white"
                    e.currentTarget.style.color = skill.color
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteSkill(skill._id)}
                  style={{
                    flex: 1,
                    padding: "0.875rem",
                    background: "linear-gradient(135deg, #FF6B6B, #FF5252)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)"
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "4rem 2rem",
              background: "white",
              borderRadius: "20px",
              border: "2px dashed rgba(0, 102, 255, 0.2)",
            }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}></div>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", color: "#1A1A2E" }}>No skills yet</h3>
            <p style={{ color: "#6B7280" }}>Create your first skill to get started!</p>
          </div>
        )}
      </div>
    </div >
  )

  const renderModulesManagement = () => (
    <div style={{ display: "grid", gap: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <h2 style={{
          fontSize: "2.5rem",
          fontWeight: "800",
          background: "linear-gradient(135deg, #0066FF, #FF6B6B)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          Modules Management
        </h2>
        <button
          onClick={() => {
            setShowModuleForm(!showModuleForm)
            setEditingModuleId(null)
            setModuleFormData({
              title: "",
              description: "",
              estimatedTime: 30,
              type: "lesson",
              lessons: [],
            })
            setSelectedSkillForModule("")
          }}
          style={{
            padding: "1rem 2rem",
            background: showModuleForm ? "#6B7280" : "linear-gradient(135deg, #0066FF, #FF6B6B)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "1rem",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 16px rgba(0, 102, 255, 0.3)"
          }}
        >
          {showModuleForm ? "Cancel" : "+ Add New Module"}
        </button>
      </div>

      {showModuleForm && (
        <div className="form-card" style={{
          background: "white",
          padding: "2.5rem",
          borderRadius: "24px",
          border: "2px solid rgba(0, 102, 255, 0.1)",
          boxShadow: "0 4px 16px rgba(0, 102, 255, 0.12)"
        }}>
          <h3 style={{ marginBottom: "2rem", fontSize: "1.8rem", fontWeight: "700", color: "#1A1A2E" }}>
            {editingModuleId ? "Edit Module" : "Create New Module"}
          </h3>
          <div style={{ display: "grid", gap: "1.5rem" }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "600", color: "#1A1A2E" }}>Select Skill *</label>
              <select
                className="form-input"
                value={selectedSkillForModule}
                onChange={(e) => setSelectedSkillForModule(e.target.value)}
                disabled={!!editingModuleId}
                style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "2px solid rgba(0, 102, 255, 0.2)" }}
              >
                <option value="">Select a skill</option>
                {skills.map((skill) => (
                  <option key={skill._id} value={skill._id}>{skill.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "600", color: "#1A1A2E" }}>Module Title *</label>
              <input
                type="text"
                name="title"
                className="form-input"
                value={moduleFormData.title}
                onChange={handleModuleFormChange}
                placeholder="e.g., Introduction to React"
                style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "2px solid rgba(0, 102, 255, 0.2)" }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "600", color: "#1A1A2E" }}>Description *</label>
              <textarea
                name="description"
                className="form-input"
                value={moduleFormData.description}
                onChange={handleModuleFormChange}
                placeholder="Overall module description"
                style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "2px solid rgba(0, 102, 255, 0.2)", minHeight: "100px" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "600", color: "#1A1A2E" }}>Type</label>
                <select name="type" className="form-input" value={moduleFormData.type} onChange={handleModuleFormChange} style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "2px solid rgba(0, 102, 255, 0.2)" }}>
                  <option value="lesson">Lesson</option>
                  <option value="project">Project</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "600", color: "#1A1A2E" }}>Estimated Time (min)</label>
                <input
                  type="number"
                  name="estimatedTime"
                  className="form-input"
                  value={moduleFormData.estimatedTime}
                  onChange={handleModuleFormChange}
                  min="1"
                  style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "2px solid rgba(0, 102, 255, 0.2)" }}
                />
              </div>
            </div>

            <div className="lessons-builder" style={{ marginTop: "2rem", padding: "1.5rem", background: "#f8f9ff", borderRadius: "16px", border: "1px solid rgba(0, 102, 255, 0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h4 style={{ margin: 0, fontSize: "1.2rem", color: "#1A1A2E" }}>Lessons Content</h4>
                <button
                  onClick={addLesson}
                  style={{ padding: "0.5rem 1rem", background: "#0066FF", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                >
                  + Add Lesson
                </button>
              </div>

              {moduleFormData.lessons.map((lesson, index) => (
                <div key={lesson.id || index} style={{ background: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(0, 102, 255, 0.1)", marginBottom: "1rem", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h5 style={{ margin: 0, fontWeight: "700" }}>Lesson {index + 1}</h5>
                    <button onClick={() => deleteLesson(index)} style={{ border: "none", background: "none", color: "#FF6B6B", cursor: "pointer", fontSize: "0.9rem" }}>Remove</button>
                  </div>
                  <div style={{ display: "grid", gap: "1rem" }}>
                    <input
                      type="text"
                      placeholder="Lesson Title"
                      value={lesson.title}
                      onChange={(e) => updateLessonContent(index, "title", e.target.value)}
                      style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd" }}
                    />
                    <select
                      value={lesson.type}
                      onChange={(e) => updateLessonContent(index, "type", e.target.value)}
                      style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd" }}
                    >
                      <option value="lesson">Text Content</option>
                      <option value="video">Video Lesson</option>
                      <option value="quiz">Quiz Assessment</option>
                      <option value="coding">Coding Task</option>
                    </select>

                    {lesson.type === "lesson" || lesson.type === "video" ? (
                      <>
                        <textarea
                          placeholder="Lesson Content (Markdown)"
                          value={lesson.content.text}
                          onChange={(e) => updateLessonContent(index, "text", e.target.value)}
                          style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd", minHeight: "100px" }}
                        />
                        <input
                          type="url"
                          placeholder="Video URL"
                          value={lesson.content.videoUrl}
                          onChange={(e) => updateLessonContent(index, "videoUrl", e.target.value)}
                          style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ddd" }}
                        />
                      </>
                    ) : lesson.type === "quiz" ? (
                      <div style={{ padding: "1rem", background: "#f0f2f5", borderRadius: "8px" }}>
                        {lesson.content.quiz?.questions?.map((q, qIdx) => (
                          <div key={qIdx} style={{ marginBottom: "1rem", padding: "0.5rem", borderBottom: "1px solid #ccc" }}>
                            <input placeholder="Question" value={q.question} onChange={(e) => {
                              const newQs = [...lesson.content.quiz.questions];
                              newQs[qIdx].question = e.target.value;
                              updateLessonContent(index, "quiz.questions", newQs);
                            }} style={{ width: "100%", marginBottom: "0.5rem" }} />
                            <input placeholder="Options (comma-separated)" value={q.options.join(", ")} onChange={(e) => {
                              const newQs = [...lesson.content.quiz.questions];
                              newQs[qIdx].options = e.target.value.split(",").map(o => o.trim());
                              updateLessonContent(index, "quiz.questions", newQs);
                            }} style={{ width: "100%" }} />
                          </div>
                        ))}
                        <button onClick={() => {
                          const newQs = [...(lesson.content.quiz?.questions || []), { question: "", options: [], correct: 0 }];
                          updateLessonContent(index, "quiz.questions", newQs);
                        }}>+ Add Question</button>
                      </div>
                    ) : lesson.type === "coding" ? (
                      <div style={{ display: "grid", gap: "0.5rem" }}>
                        <textarea placeholder="Coding Instructions" value={lesson.content.coding.instructions} onChange={(e) => updateLessonContent(index, "coding.instructions", e.target.value)} />
                        <textarea placeholder="Starter Code" value={lesson.content.coding.starterCode} onChange={(e) => updateLessonContent(index, "coding.starterCode", e.target.value)} />
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveModule}
              style={{
                marginTop: "2rem",
                padding: "1.25rem",
                background: "linear-gradient(135deg, #0066FF, #FF6B6B)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "1.1rem",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              {editingModuleId ? "Update Module" : "Create Module"}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "2rem" }}>
        {skills?.map((skill) => (
          <div key={skill._id} className="skill-section-card" style={{
            background: "white",
            padding: "2rem",
            borderRadius: "28px",
            border: "1px solid rgba(0, 102, 255, 0.08)",
            boxShadow: "0 4px 20px rgba(0, 102, 255, 0.04)",
            position: "relative"
          }}>
            <h3 style={{
              margin: "0 0 1.5rem 0",
              color: "#1A1A2E",
              fontSize: "1.4rem",
              fontWeight: "800",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem"
            }}>
              <span style={{ width: "4px", height: "24px", background: "#0066FF", borderRadius: "10px" }}></span>
              {skill.name}
            </h3>

            <div style={{ display: "grid", gap: "1rem" }}>
              {skill.modules && skill.modules.length > 0 ? (
                skill.modules.map((module) => (
                  <div key={module._id} style={{
                    padding: "1.5rem",
                    background: "#FFFFFF",
                    borderRadius: "20px",
                    border: "2px solid #0066FF",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.25rem",
                    transition: "all 0.2s ease",
                    boxShadow: "0 6px 16px rgba(0, 102, 255, 0.08)"
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: "800", fontSize: "1.15rem", color: "#1A1A2E" }}>{module.title}</p>
                      <div style={{ display: "flex", gap: "1rem", marginTop: "0.6rem" }}>
                        <span style={{ fontSize: "0.85rem", color: "#6B7280", fontWeight: "600", background: "#f1f5f9", padding: "4px 10px", borderRadius: "8px" }}>
                          {module.lessons?.length || 0} Lessons
                        </span>
                        <span style={{ fontSize: "0.85rem", color: "#0066FF", fontWeight: "700", textTransform: "capitalize", background: "rgba(0, 102, 255, 0.08)", padding: "4px 10px", borderRadius: "8px" }}>
                          {module.type}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      display: "flex",
                      gap: "0.75rem",
                      paddingTop: "1.25rem",
                      borderTop: "1px solid rgba(0, 102, 255, 0.1)"
                    }}>
                      <button
                        onClick={() => handleEditModule(skill, module)}
                        style={{
                          flex: 1,
                          padding: "0.75rem 1rem",
                          background: "#0066FF",
                          color: "white",
                          border: "none",
                          borderRadius: "12px",
                          cursor: "pointer",
                          fontSize: "0.95rem",
                          fontWeight: "700",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#0052CC"
                          e.currentTarget.style.transform = "translateY(-2px)"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#0066FF"
                          e.currentTarget.style.transform = "translateY(0)"
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteModule(skill._id, module._id)}
                        style={{
                          flex: 1,
                          padding: "0.75rem 1rem",
                          background: "#FFF5F5",
                          color: "#FF6B6B",
                          border: "1px solid rgba(255, 107, 107, 0.3)",
                          borderRadius: "12px",
                          cursor: "pointer",
                          fontSize: "0.95rem",
                          fontWeight: "700",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#FF6B6B"
                          e.currentTarget.style.color = "white"
                          e.currentTarget.style.transform = "translateY(-2px)"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#FFF5F5"
                          e.currentTarget.style.color = "#FF6B6B"
                          e.currentTarget.style.transform = "translateY(0)"
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: "2rem", textAlign: "center", border: "2px dashed #eee", borderRadius: "20px" }}>
                  <p style={{ margin: 0, color: "#9CA3AF", fontSize: "0.9rem" }}>No content in this skill</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F8F9FF 0%, #FFFFFF 100%)",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ background: "linear-gradient(135deg, #0066FF 0%, #FF6B6B 100%)", padding: "2.5rem 0" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 2rem" }}>
          <h1 style={{ color: "white", fontSize: "2.8rem", fontWeight: "800", margin: 0 }}>Admin Dashboard</h1>
          <p style={{ color: "rgba(255,255,255,0.9)", marginTop: "0.5rem", fontSize: "1.1rem" }}>Platform Management Console</p>
        </div>
      </div>

      <div style={{ background: "white", borderBottom: "2px solid rgba(0, 102, 255, 0.1)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 2rem", display: "flex", gap: "1rem" }}>
          {["overview", "skills", "modules"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "1.5rem 2.5rem",
                background: "transparent",
                color: activeTab === tab ? "#0066FF" : "#6B7280",
                border: "none",
                borderBottom: activeTab === tab ? "4px solid #0066FF" : "4px solid transparent",
                fontSize: "1.1rem",
                fontWeight: "700",
                cursor: "pointer",
                textTransform: "capitalize"
              }}
            >
              {tab === "overview" && "Analysis"}
              {tab === "skills" && "Skills"}
              {tab === "modules" && "Content"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "3rem 2rem" }}>
        {activeTab === "overview" && renderOverview()}
        {activeTab === "skills" && renderSkillsManagement()}
        {activeTab === "modules" && renderModulesManagement()}
      </div>
    </div>
  )
}

export default AdminDashboard
