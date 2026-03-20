"use client"

import { useState, useEffect } from "react"
import "./AdminContentManager.css"

const AdminContentManager = () => {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedModule, setSelectedModule] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("courses")

  // Form states
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "Beginner",
    duration: "",
    thumbnail: "",
    prerequisites: [],
    learningOutcomes: [],
    tags: [],
  })

  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
    order: 0,
    estimatedTime: "1 week",
  })

  const [lessonForm, setLessonForm] = useState({
    title: "",
    type: "lesson",
    order: 0,
    estimatedTime: 15,
    content: {
      text: "",
      videoUrl: "",
      resources: [],
    },
  })

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/courses`, {
        credentials: "include",
      })

      if (!response.ok) throw new Error("Failed to fetch courses")

      const data = await response.json()
      setCourses(data.data || [])
      setError("")
    } catch (err) {
      setError(err.message)
      console.error("Error fetching courses:", err)
    } finally {
      setLoading(false)
    }
  }

  // Create new course
  const handleCreateCourse = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/courses`, {
        
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseForm),
      })

      if (!response.ok) throw new Error("Failed to create course")

      const data = await response.json()
      setCourses([data.data, ...courses])
      setCourseForm({
        title: "",
        description: "",
        category: "",
        difficulty: "Beginner",
        duration: "",
        thumbnail: "",
        prerequisites: [],
        learningOutcomes: [],
        tags: [],
      })
      setSuccess("Course created successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Add module to course
  const handleAddModule = async (e) => {
    e.preventDefault()
    if (!selectedCourse) {
      setError("Please select a course first")
      return
    }

    try {
      setLoading(true)

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/courses/${selectedCourse._id}/modules`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moduleForm),
      })

      if (!response.ok) throw new Error("Failed to add module")

      const data = await response.json()
      setCourses(courses.map((c) => (c._id === selectedCourse._id ? data.data : c)))
      setSelectedCourse(data.data)
      setModuleForm({
        title: "",
        description: "",
        order: 0,
        estimatedTime: "1 week",
      })
      setSuccess("Module added successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Add lesson to module
  const handleAddLesson = async (e) => {
    e.preventDefault()
    if (!selectedCourse || !selectedModule) {
      setError("Please select a course and module first")
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin/courses/${selectedCourse._id}/modules/${selectedModule._id}/lessons`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(lessonForm),
        },
      )

      if (!response.ok) throw new Error("Failed to add lesson")

      const data = await response.json()
      setCourses(courses.map((c) => (c._id === selectedCourse._id ? data.data : c)))
      setSelectedCourse(data.data)
      setLessonForm({
        title: "",
        type: "lesson",
        order: 0,
        estimatedTime: 15,
        content: {
          text: "",
          videoUrl: "",
          resources: [],
        },
      })
      setSuccess("Lesson added successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Delete course
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return

    try {
      setLoading(true)

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/courses/${courseId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) throw new Error("Failed to delete course")

      setCourses(courses.filter((c) => c._id !== courseId))
      setSelectedCourse(null)
      setSuccess("Course deleted successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-content-manager">
      {/* Header */}
      <div className="acm-header">
        <h1>Content Management</h1>
        <p>Create and manage courses, modules, and lessons</p>
      </div>

      {/* Alerts */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Tab Navigation */}
      <div className="acm-tabs">
        <button
          className={`tab-btn ${activeTab === "courses" ? "active" : ""}`}
          onClick={() => setActiveTab("courses")}
        >
          Courses
        </button>
        <button
          className={`tab-btn ${activeTab === "modules" ? "active" : ""}`}
          onClick={() => setActiveTab("modules")}
        >
          Modules & Lessons
        </button>
      </div>

      {/* Courses Tab */}
      {activeTab === "courses" && (
        <div className="acm-section">
          <div className="acm-form-container">
            <h2>Create New Course</h2>
            <form onSubmit={handleCreateCourse} className="acm-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Course Title *</label>
                  <input
                    type="text"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    placeholder="e.g., Web Development Fundamentals"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <input
                    type="text"
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    placeholder="e.g., Web Development"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Difficulty Level</label>
                  <select
                    value={courseForm.difficulty}
                    onChange={(e) => setCourseForm({ ...courseForm, difficulty: e.target.value })}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Duration *</label>
                  <input
                    type="text"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    placeholder="e.g., 4 weeks"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Describe the course content and objectives"
                  rows="4"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Creating..." : "Create Course"}
              </button>
            </form>
          </div>

          {/* Courses List */}
          <div className="acm-list-container">
            <h2>Existing Courses</h2>
            {courses.length === 0 ? (
              <p className="empty-state">No courses yet. Create one to get started!</p>
            ) : (
              <div className="courses-grid">
                {courses.map((course) => (
                  <div
                    key={course._id}
                    className={`course-card ${selectedCourse?._id === course._id ? "selected" : ""}`}
                    onClick={() => setSelectedCourse(course)}
                  >
                    <div className="course-card-header">
                      <h3>{course.title}</h3>
                      <span className={`badge badge-${course.difficulty.toLowerCase()}`}>{course.difficulty}</span>
                    </div>
                    <p className="course-category">{course.category}</p>
                    <p className="course-description">{course.description}</p>
                    <div className="course-meta">
                      <span>{course.modules.length} modules</span>
                      <span>{course.duration}</span>
                    </div>
                    <div className="course-actions">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCourse(course._id)
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modules & Lessons Tab */}
      {activeTab === "modules" && (
        <div className="acm-section">
          {!selectedCourse ? (
            <div className="empty-state">
              <p>Select a course from the Courses tab to manage its modules and lessons</p>
            </div>
          ) : (
            <>
              <div className="selected-course-info">
                <h2>{selectedCourse.title}</h2>
                <p>{selectedCourse.description}</p>
              </div>

              {/* Add Module Form */}
              <div className="acm-form-container">
                <h3>Add New Module</h3>
                <form onSubmit={handleAddModule} className="acm-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Module Title *</label>
                      <input
                        type="text"
                        value={moduleForm.title}
                        onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                        placeholder="e.g., HTML Basics"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Order *</label>
                      <input
                        type="number"
                        value={moduleForm.order}
                        onChange={(e) => setModuleForm({ ...moduleForm, order: Number.parseInt(e.target.value) })}
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description *</label>
                    <textarea
                      value={moduleForm.description}
                      onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                      placeholder="Describe what students will learn in this module"
                      rows="3"
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Adding..." : "Add Module"}
                  </button>
                </form>
              </div>

              {/* Modules List */}
              <div className="acm-list-container">
                <h3>Modules</h3>
                {selectedCourse.modules.length === 0 ? (
                  <p className="empty-state">No modules yet. Add one above!</p>
                ) : (
                  <div className="modules-list">
                    {selectedCourse.modules.map((module) => (
                      <div
                        key={module._id}
                        className={`module-item ${selectedModule?._id === module._id ? "selected" : ""}`}
                        onClick={() => setSelectedModule(module)}
                      >
                        <div className="module-header">
                          <h4>
                            Module {module.order + 1}: {module.title}
                          </h4>
                          <span className="lesson-count">{module.lessons.length} lessons</span>
                        </div>
                        <p className="module-description">{module.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Lesson Form */}
              {selectedModule && (
                <div className="acm-form-container">
                  <h3>Add Lesson to: {selectedModule.title}</h3>
                  <form onSubmit={handleAddLesson} className="acm-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Lesson Title *</label>
                        <input
                          type="text"
                          value={lessonForm.title}
                          onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                          placeholder="e.g., Introduction to HTML"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Lesson Type *</label>
                        <select
                          value={lessonForm.type}
                          onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value })}
                        >
                          <option value="lesson">Lesson</option>
                          <option value="quiz">Quiz</option>
                          <option value="coding">Coding Challenge</option>
                          <option value="video">Video</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Order *</label>
                        <input
                          type="number"
                          value={lessonForm.order}
                          onChange={(e) => setLessonForm({ ...lessonForm, order: Number.parseInt(e.target.value) })}
                          min="0"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Estimated Time (minutes)</label>
                        <input
                          type="number"
                          value={lessonForm.estimatedTime}
                          onChange={(e) =>
                            setLessonForm({ ...lessonForm, estimatedTime: Number.parseInt(e.target.value) })
                          }
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Lesson Content</label>
                      <textarea
                        value={lessonForm.content.text}
                        onChange={(e) =>
                          setLessonForm({
                            ...lessonForm,
                            content: { ...lessonForm.content, text: e.target.value },
                          })
                        }
                        placeholder="Enter lesson content (supports markdown)"
                        rows="4"
                      />
                    </div>

                    <div className="form-group">
                      <label>Video URL (optional)</label>
                      <input
                        type="url"
                        value={lessonForm.content.videoUrl}
                        onChange={(e) =>
                          setLessonForm({
                            ...lessonForm,
                            content: { ...lessonForm.content, videoUrl: e.target.value },
                          })
                        }
                        placeholder="https://youtube.com/..."
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? "Adding..." : "Add Lesson"}
                    </button>
                  </form>
                </div>
              )}

              {/* Lessons List */}
              {selectedModule && (
                <div className="acm-list-container">
                  <h3>Lessons in {selectedModule.title}</h3>
                  {selectedModule.lessons.length === 0 ? (
                    <p className="empty-state">No lessons yet. Add one above!</p>
                  ) : (
                    <div className="lessons-list">
                      {selectedModule.lessons.map((lesson, index) => (
                        <div key={lesson._id} className="lesson-item">
                          <div className="lesson-header">
                            <h5>
                              Lesson {index + 1}: {lesson.title}
                            </h5>
                            <span className={`badge badge-${lesson.type}`}>{lesson.type}</span>
                          </div>
                          <p className="lesson-time">{lesson.estimatedTime} minutes</p>
                          {lesson.content.text && (
                            <p className="lesson-preview">{lesson.content.text.substring(0, 100)}...</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminContentManager
