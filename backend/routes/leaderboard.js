const express = require("express")
const User = require("../models/User")
const Progress = require("../models/Progress")
const Skill = require("../models/Skill")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Get global leaderboard
router.get("/global", auth, async (req, res) => {
  try {
    const { timeframe = "alltime", limit = 50 } = req.query

    const users = await User.find({ isActive: true })
      .select("username firstName lastName stats avatar badges")
      .sort({ "stats.totalPoints": -1 })
      .limit(Number.parseInt(limit))

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      userId: user._id,
      username: user.username,
      name: `${user.firstName} ${user.lastName || ""}`.trim(),
      avatar: user.avatar || "👤",
      points: user.stats.totalPoints,
      level: user.stats.level,
      skillsCompleted: user.stats.skillsCompleted,
      certificatesEarned: user.stats.certificatesEarned,
      badges: user.badges.length,
      streak: user.stats.streak,
    }))

    // Get current user's rank
    const currentUserRank = leaderboard.find((u) => u.userId.toString() === req.userId)

    res.json({
      success: true,
      leaderboard,
      currentUserRank: currentUserRank || { rank: "Unranked", points: 0, level: 1 },
    })
  } catch (error) {
    console.error("Get leaderboard error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// Get category-based leaderboard
router.get("/category/:skillId", auth, async (req, res) => {
  try {
    const { skillId } = req.params
    const { limit = 50 } = req.query

    const skill = await Skill.findById(skillId)
    if (!skill) {
      return res.status(404).json({ success: false, message: "Skill not found" })
    }

    // Get all progress records for this skill, sorted by overall progress
    const skillProgress = await Progress.find({ skillId })
      .populate("userId", "username firstName lastName avatar stats badges")
      .sort({ totalScore: -1, overallProgress: -1 })
      .limit(Number.parseInt(limit))

    const leaderboard = skillProgress.map((progress, index) => ({
      rank: index + 1,
      userId: progress.userId._id,
      username: progress.userId.username,
      name: `${progress.userId.firstName} ${progress.userId.lastName || ""}`.trim(),
      avatar: progress.userId.avatar || "👤",
      skillName: skill.name,
      points: progress.totalScore,
      progress: progress.overallProgress,
      timeSpent: Math.round(progress.totalTimeSpent / 3600), // Convert to hours
      modulesCompleted: progress.moduleProgress.filter((mp) => mp.status === "completed").length,
      completedAt: progress.completedAt,
    }))

    res.json({
      success: true,
      skillName: skill.name,
      leaderboard,
    })
  } catch (error) {
    console.error("Get category leaderboard error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching category leaderboard",
    })
  }
})

module.exports = router
