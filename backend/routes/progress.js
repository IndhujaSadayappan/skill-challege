const express = require("express")
const Progress = require("../models/Progress")
const User = require("../models/User")
const Skill = require("../models/Skill")
const Certificate = require("../models/Certificate")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Get user's overall progress
router.get("/", auth, async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.userId })
      .populate("skillId", "name category icon color")
      .sort({ lastAccessedAt: -1 })

    // Calculate overall stats
    const stats = {
      totalSkills: progress.length,
      completedSkills: progress.filter((p) => p.status === "completed").length,
      inProgressSkills: progress.filter((p) => p.status === "in-progress").length,
      totalTimeSpent: progress.reduce((sum, p) => sum + p.totalTimeSpent, 0),
      averageProgress:
        progress.length > 0 ? Math.round(progress.reduce((sum, p) => sum + p.overallProgress, 0) / progress.length) : 0,
    }

    res.json({
      success: true,
      progress,
      stats,
    })
  } catch (error) {
    console.error("Get progress error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching progress",
    })
  }
})

// Update module progress
router.post("/module/:skillId/:moduleId", auth, async (req, res) => {
  try {
    const { skillId, moduleId } = req.params
    const { status, score, timeSpent, quizResults, codingResults } = req.body

    let progress = await Progress.findOne({
      userId: req.userId,
      skillId: skillId,
    })

    if (!progress) {
      // Create new progress record
      const skill = await Skill.findById(skillId)
      progress = new Progress({
        userId: req.userId,
        skillId: skillId,
        moduleProgress: skill.modules.map((module) => ({
          moduleId: module._id,
          status: "not-started",
        })),
      })
    }

    // Find and update module progress
    const moduleProgressIndex = progress.moduleProgress.findIndex((mp) => mp.moduleId.toString() === moduleId)

    if (moduleProgressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Module not found in progress",
      })
    }

    const moduleProgress = progress.moduleProgress[moduleProgressIndex]

    // Update module progress
    if (status) moduleProgress.status = status
    if (score !== undefined) moduleProgress.score = Math.max(moduleProgress.score, score)
    if (timeSpent) moduleProgress.timeSpent += timeSpent

    moduleProgress.attempts += 1
    moduleProgress.lastAttemptAt = new Date()

    if (status === "completed") {
      moduleProgress.completedAt = new Date()
    }

    // Add quiz results
    if (quizResults) {
      moduleProgress.quizResults.push({
        attemptNumber: moduleProgress.attempts,
        ...quizResults,
      })
    }

    // Add coding results
    if (codingResults) {
      moduleProgress.codingResults.push({
        attemptNumber: moduleProgress.attempts,
        ...codingResults,
      })
    }

    // Update overall progress
    progress.calculateProgress()
    progress.totalScore = progress.moduleProgress.reduce((sum, mp) => sum + mp.score, 0)
    progress.totalTimeSpent = progress.moduleProgress.reduce((sum, mp) => sum + mp.timeSpent, 0)
    progress.lastAccessedAt = new Date()

    // Update streak
    progress.updateStreak()

    // Check if skill is completed
    if (progress.overallProgress === 100 && progress.status !== "completed") {
      progress.status = "completed"
      progress.completedAt = new Date()

      // Award points to user
      const user = await User.findById(req.userId)
      const pointsEarned = 500 // Bonus points for completing skill
      const leveledUp = user.addPoints(pointsEarned)
      await user.save()

      // Generate certificate
      const skill = await Skill.findById(skillId)
      const certificate = new Certificate({
        userId: req.userId,
        skillId: skillId,
        title: `${skill.name} Completion Certificate`,
        description: `Certificate of completion for ${skill.name}`,
        details: {
          skillName: skill.name,
          completionDate: new Date(),
          totalScore: progress.totalScore,
          timeSpent: Math.round(progress.totalTimeSpent / 60), // Convert to hours
          modulesCompleted: progress.moduleProgress.filter((mp) => mp.status === "completed").length,
          grade:
            progress.totalScore >= 90 ? "A+" : progress.totalScore >= 80 ? "A" : progress.totalScore >= 70 ? "B+" : "B",
        },
      })
      await certificate.save()

      // Update user stats
      user.stats.certificatesEarned += 1
      user.stats.skillsCompleted += 1
      await user.save()

      return res.json({
        success: true,
        progress,
        skillCompleted: true,
        certificate: certificate._id,
        leveledUp,
        pointsEarned,
      })
    }

    await progress.save()

    res.json({
      success: true,
      progress,
    })
  } catch (error) {
    console.error("Update progress error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating progress",
    })
  }
})

router.post("/lesson/:skillId/:moduleId/:lessonId", auth, async (req, res) => {
  try {
    const { skillId, moduleId, lessonId } = req.params
    const { status, score, timeSpent } = req.body

    let progress = await Progress.findOne({
      userId: req.userId,
      skillId: skillId,
    })

    if (!progress) {
      const skill = await Skill.findById(skillId)
      progress = new Progress({
        userId: req.userId,
        skillId: skillId,
        moduleProgress: skill.modules.map((module) => ({
          moduleId: module._id,
          lessonProgress: [],
        })),
      })
    }

    // Find module progress
    const moduleProgress = progress.moduleProgress.find((mp) => mp.moduleId.toString() === moduleId)

    if (!moduleProgress) {
      return res.status(404).json({
        success: false,
        message: "Module not found in progress",
      })
    }

    // Find or create lesson progress
    let lessonProgress = moduleProgress.lessonProgress.find((lp) => lp.lessonId.toString() === lessonId)

    if (!lessonProgress) {
      lessonProgress = {
        lessonId: lessonId,
        status: "not-started",
        score: 0,
        timeSpent: 0,
        attempts: 0,
      }
      moduleProgress.lessonProgress.push(lessonProgress)
    }

    // Update lesson progress
    if (status) lessonProgress.status = status
    if (score !== undefined) lessonProgress.score = Math.max(lessonProgress.score, score)
    if (timeSpent) lessonProgress.timeSpent += timeSpent
    lessonProgress.attempts += 1
    lessonProgress.lastAttemptAt = new Date()

    if (status === "completed") {
      lessonProgress.completedAt = new Date()
    }

    // Update module progress
    const completedLessons = moduleProgress.lessonProgress.filter((lp) => lp.status === "completed").length
    moduleProgress.overallProgress = Math.round((completedLessons / moduleProgress.lessonProgress.length) * 100)

    if (moduleProgress.overallProgress === 100 && moduleProgress.status !== "completed") {
      moduleProgress.status = "completed"
      moduleProgress.completedAt = new Date()
    } else if (moduleProgress.overallProgress > 0) {
      moduleProgress.status = "in-progress"
    }

    moduleProgress.lastAccessedAt = new Date()
    progress.lastAccessedAt = new Date()

    // Calculate overall skill progress
    progress.calculateProgress()

    // Award points for lesson completion
    if (status === "completed" && !lessonProgress.completedAt) {
      const user = await User.findById(req.userId)
      const pointsEarned = score >= 80 ? 100 : score >= 60 ? 50 : 25
      user.addPoints(pointsEarned)
      await user.save()
    }

    await progress.save()

    res.json({
      success: true,
      progress,
      message: "Lesson progress updated",
    })
  } catch (error) {
    console.error("Update lesson progress error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating lesson progress",
    })
  }
})

router.get("/module/:skillId/:moduleId/lessons", auth, async (req, res) => {
  try {
    const { skillId, moduleId } = req.params
    const Lesson = require("../models/Lesson")

    const lessons = await Lesson.find({ skillId, moduleId }).sort({ order: 1 })

    let progress = await Progress.findOne({
      userId: req.userId,
      skillId: skillId,
    })

    if (!progress) {
      progress = new Progress({
        userId: req.userId,
        skillId: skillId,
        moduleProgress: [],
      })
    }

    const moduleProgress = progress.moduleProgress.find((mp) => mp.moduleId.toString() === moduleId)

    // Map lessons with user progress
    const lessonsWithProgress = lessons.map((lesson) => {
      const lessonProgress = moduleProgress?.lessonProgress?.find(
        (lp) => lp.lessonId.toString() === lesson._id.toString(),
      ) || {
        status: "not-started",
        score: 0,
        attempts: 0,
      }

      return {
        ...lesson.toObject(),
        userProgress: lessonProgress,
      }
    })

    res.json({
      success: true,
      lessons: lessonsWithProgress,
    })
  } catch (error) {
    console.error("Get lessons error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching lessons",
    })
  }
})

// Get progress analytics
router.get("/analytics", auth, async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.userId }).populate("skillId", "name category")

    // Calculate analytics
    const analytics = {
      weeklyProgress: [],
      categoryBreakdown: {},
      performanceMetrics: {
        averageScore: 0,
        totalTimeSpent: 0,
        completionRate: 0,
        streakData: {
          current: 0,
          longest: 0,
        },
      },
      recentActivity: [],
    }

    // Category breakdown
    progress.forEach((p) => {
      const category = p.skillId.category
      if (!analytics.categoryBreakdown[category]) {
        analytics.categoryBreakdown[category] = {
          total: 0,
          completed: 0,
          inProgress: 0,
          timeSpent: 0,
        }
      }

      analytics.categoryBreakdown[category].total += 1
      analytics.categoryBreakdown[category].timeSpent += p.totalTimeSpent

      if (p.status === "completed") {
        analytics.categoryBreakdown[category].completed += 1
      } else if (p.status === "in-progress") {
        analytics.categoryBreakdown[category].inProgress += 1
      }
    })

    // Performance metrics
    if (progress.length > 0) {
      analytics.performanceMetrics.averageScore = Math.round(
        progress.reduce((sum, p) => sum + p.totalScore, 0) / progress.length,
      )
      analytics.performanceMetrics.totalTimeSpent = progress.reduce((sum, p) => sum + p.totalTimeSpent, 0)
      analytics.performanceMetrics.completionRate = Math.round(
        (progress.filter((p) => p.status === "completed").length / progress.length) * 100,
      )

      // Get streak data from the most recent progress
      const latestProgress = progress.sort((a, b) => b.lastAccessedAt - a.lastAccessedAt)[0]
      if (latestProgress.streak) {
        analytics.performanceMetrics.streakData = latestProgress.streak
      }
    }

    res.json({
      success: true,
      analytics,
    })
  } catch (error) {
    console.error("Get analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching analytics",
    })
  }
})

module.exports = router
