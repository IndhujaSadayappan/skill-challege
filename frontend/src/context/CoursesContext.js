"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"

const CoursesContext = createContext()

export const useCoursesContext = () => {
  const context = useContext(CoursesContext)
  if (!context) {
    throw new Error("useCoursesContext must be used within a CoursesProvider")
  }
  return context
}

export const CoursesProvider = ({ children }) => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const API_URL = `${process.env.REACT_APP_API_URL}/api`

  // Fetch all skills from API
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/skills/`, {
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        setCourses(data.skills)
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Add new course
  const addCourse = useCallback(async (courseData) => {
    try {
      const response = await fetch(`${API_URL}/admin/skills`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData),
      })
      const data = await response.json()
      if (data.success) {
        setCourses((prev) => [data.skill, ...prev])
        return { success: true, skill: data.skill }
      }
      return { success: false, error: data.message }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  // Update course
  const updateCourse = useCallback(async (skillId, courseData) => {
    try {
      const response = await fetch(`${API_URL}/admin/skills/${skillId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData),
      })
      const data = await response.json()
      if (data.success) {
        setCourses((prev) => prev.map((c) => (c._id === skillId ? data.skill : c)))
        return { success: true, skill: data.skill }
      }
      return { success: false, error: data.message }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  // Delete course
  const deleteCourse = useCallback(async (skillId) => {
    try {
      const response = await fetch(`${API_URL}/admin/skills/${skillId}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        setCourses((prev) => prev.filter((c) => c._id !== skillId))
        return { success: true }
      }
      return { success: false, error: data.message }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  // Add module to course
  const addModule = useCallback(async (skillId, moduleData) => {
    try {
      const response = await fetch(`${API_URL}/admin/skills/${skillId}/modules`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moduleData),
      })
      const data = await response.json()
      if (data.success) {
        setCourses((prev) => prev.map((c) => (c._id === skillId ? data.skill : c)))
        return { success: true, module: data.module }
      }
      return { success: false, error: data.message }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const value = {
    courses,
    loading,
    error,
    fetchCourses,
    addCourse,
    updateCourse,
    deleteCourse,
    addModule,
  }

  return <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>
}
