const express = require("express")
const User = require("../models/User")
const { auth, adminAuth } = require("../middleware/auth")

const router = express.Router()

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        stats: user.stats,
        preferences: user.preferences,
        badges: user.badges,
        achievements: user.achievements,
      },
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// Update user preferences
router.put("/preferences", auth, async (req, res) => {
  try {
    const { theme, notifications, language } = req.body

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          "preferences.theme": theme,
          "preferences.notifications": notifications,
          "preferences.language": language,
        },
      },
      { new: true },
    ).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      message: "Preferences updated successfully",
      preferences: user.preferences,
    })
  } catch (error) {
    console.error("Update preferences error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { firstName, lastName, username } = req.body

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: req.userId },
      })

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username is already taken",
        })
      }
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        firstName,
        lastName,
        username,
      },
      { new: true },
    ).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        stats: user.stats,
        preferences: user.preferences,
      },
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// Get user stats
router.get("/stats", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("stats badges achievements")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      stats: user.stats,
      badges: user.badges,
      achievements: user.achievements,
    })
  } catch (error) {
    console.error("Get stats error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
