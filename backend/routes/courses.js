const express = require("express")
const router = express.Router()
const Course = require("../models/Course")
const Progress = require("../models/Progress")
const auth = require("../middleware/auth")

// Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true })
      .select("title description category difficulty duration thumbnail modules")
      .populate("modules", "title description order isLocked")

    res.json(courses)
  } catch (error) {
    console.error("Error fetching courses:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get courses by category
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params
    const courses = await Course.find({
      category: category.replace("-", " "),
      isActive: true,
    }).populate("modules", "title description order isLocked")

    res.json(courses)
  } catch (error) {
    console.error("Error fetching courses by category:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get single course with user progress
router.get("/:courseId", auth, async (req, res) => {
  try {
    const { courseId } = req.params
    const userId = req.user.id

    const course = await Course.findById(courseId).populate({
      path: "modules",
      populate: {
        path: "lessons",
        model: "Lesson",
      },
    })

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Get user progress for this course
    const progress = await Progress.findOne({
      userId,
      courseId,
    })

    // Determine which modules are unlocked based on progress
    const modulesWithProgress = course.modules.map((module, index) => {
      const isUnlocked = index === 0 || (progress && progress.completedModules.includes(module._id))
      return {
        ...module.toObject(),
        isUnlocked,
      }
    })

    res.json({
      ...course.toObject(),
      modules: modulesWithProgress,
      userProgress: progress,
    })
  } catch (error) {
    console.error("Error fetching course:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get module with lessons
router.get("/:courseId/modules/:moduleId", auth, async (req, res) => {
  try {
    const { courseId, moduleId } = req.params
    const userId = req.user.id

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    const module = await Course.findOne({ _id: courseId, "modules._id": moduleId }, { "modules.$": 1 }).populate(
      "modules.lessons",
    )

    if (!module || !module.modules[0]) {
      return res.status(404).json({ message: "Module not found" })
    }

    // Check if user has access to this module
    const progress = await Progress.findOne({ userId, courseId })
    const moduleIndex = course.modules.findIndex((m) => m._id.toString() === moduleId)

    const hasAccess =
      moduleIndex === 0 ||
      (progress &&
        progress.completedModules.some((id) =>
          course.modules.slice(0, moduleIndex).some((m) => m._id.toString() === id.toString()),
        ))

    if (!hasAccess) {
      return res.status(403).json({ message: "Module locked. Complete previous modules first." })
    }

    res.json({
      module: module.modules[0],
      courseTitle: course.title,
      userProgress: progress,
    })
  } catch (error) {
    console.error("Error fetching module:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update user progress
router.post("/:courseId/progress", auth, async (req, res) => {
  try {
    const { courseId } = req.params
    const { moduleId, lessonId, completed, score } = req.body
    const userId = req.user.id

    let progress = await Progress.findOne({ userId, courseId })

    if (!progress) {
      progress = new Progress({
        userId,
        courseId,
        completedModules: [],
        completedLessons: [],
        currentModule: moduleId,
        currentLesson: lessonId,
        overallProgress: 0,
      })
    }

    // Update lesson completion
    if (lessonId && completed) {
      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId)
      }
    }

    // Update module completion
    if (moduleId && completed) {
      if (!progress.completedModules.includes(moduleId)) {
        progress.completedModules.push(moduleId)
      }
    }

    // Update current position
    if (moduleId) progress.currentModule = moduleId
    if (lessonId) progress.currentLesson = lessonId

    // Calculate overall progress
    const course = await Course.findById(courseId).populate("modules")
    const totalModules = course.modules.length
    const completedModules = progress.completedModules.length
    progress.overallProgress = Math.round((completedModules / totalModules) * 100)

    // Add score if provided
    if (score !== undefined) {
      progress.scores = progress.scores || {}
      progress.scores[lessonId || moduleId] = score
    }

    progress.lastAccessed = new Date()
    await progress.save()

    res.json({ message: "Progress updated successfully", progress })
  } catch (error) {
    console.error("Error updating progress:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
