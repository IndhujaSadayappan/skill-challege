"use client"

import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import axios from "axios"

const SkillDetails = () => {
  const { skillId } = useParams()
  const [skill, setSkill] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const toSlug = (title) => {
    if (!title || typeof title !== "string") return "unknown-module"
    return title.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
  }

  useEffect(() => {
    if (!skillId) {
      setError("Skill ID not found in URL")
      setLoading(false)
      return
    }

    const fetchSkill = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/skills/${skillId}`)
        if (res.data.success) {
          const fetchedSkill = res.data.skill
          // Ensure modules have lessons fallback
          fetchedSkill.modules = fetchedSkill.modules?.map(m => ({
            ...m,
            lessons: m.lessons || []
          })) || []
          setSkill(fetchedSkill)
        } else {
          setError(res.data.message || "Skill not found")
        }
      } catch (err) {
        console.error("Failed to fetch skill:", err.message)
        setError("Failed to fetch skill details")
      } finally {
        setLoading(false)
      }
    }

    fetchSkill()
  }, [skillId])

  if (loading) return <p className="text-center mt-10">Loading skill...</p>
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>
  if (!skill) return null

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-3xl font-bold mb-4 text-indigo-600">{skill.name}</h1>
      <p className="text-gray-700 mb-6">{skill.description}</p>

      <h2 className="text-2xl font-semibold mb-3 text-gray-800">Modules</h2>
      {skill.modules && skill.modules.length > 0 ? (
        <ul className="space-y-4">
          {skill.modules.map((module) => (
            <li key={module._id} className="p-4 border rounded-lg hover:shadow-md transition">
              {module?.title ? (
                <Link
  to={`/skills/${skill._id}/module/${module._id}`}
  className="text-indigo-600 hover:underline font-medium"
>
  {module.title}
</Link>

              ) : (
                <span className="text-gray-500 italic">No title available</span>
              )}
              {module?.description && (
                <p className="text-gray-600 mt-1">{module.description}</p>
              )}
              {module.lessons && module.lessons.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {module.lessons.length} lesson{module.lessons.length > 1 ? 's' : ''}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No modules available for this skill yet.</p>
      )}
    </div>
  )
}

export default SkillDetails