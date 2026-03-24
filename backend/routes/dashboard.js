const express = require("express");
const { auth } = require("../middleware/auth");
const Skill = require("../models/Skill");
const User = require("../models/User");
// PDF Document and Certificate Generation have been removed to reduce project dependencies
const fs = require("fs");
const path = require("path");

const router = express.Router();

console.log("✅ DASHBOARD ROUTES LOADED (With Start-Skill)");

// Helper: Add points to user stats
const addPointsToUser = (user, points) => {
  if (user.addPoints) {
    user.addPoints(points);
  } else {
    user.stats.totalPoints = (user.stats.totalPoints || 0) + points;
    user.stats.level = Math.floor(user.stats.totalPoints / 1000) + 1;
  }
};

// GET /api/dashboard
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Find current active skill
    let currentProgress = user.skillsProgress.find(p => p.status === "in_progress");

    // Find all completed skills
    let completedSkills = user.skillsProgress.filter(p => p.status === "completed");

    // Optional: If you need Skill Names in the dashboard immediately, populating them here helps
    // For now, we return the raw structure as requested

    res.json({
      success: true,
      dashboard: {
        stats: user.stats,
        badges: user.badges,
        achievements: user.achievements,
        certificates: user.certificates,
        currentProgress,
        completedSkills,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// POST /api/dashboard/start-skill (ADDED THIS ROUTE)
router.post("/start-skill", auth, async (req, res) => {
  try {
    const { skillId } = req.body;
    const user = await User.findById(req.userId);

    // Check if already started
    const existing = user.skillsProgress.find(p => p.skillId.toString() === skillId);
    if (existing) {
      return res.status(400).json({ success: false, message: "Skill already started" });
    }

    // Ensure only 1 skill active at a time? (Optional rule, enforce if needed)
    // const activeSkill = user.skillsProgress.find(p => p.status === "in_progress");
    // if (activeSkill) return res.status(400).json({ success: false, message: "Finish current skill first" });

    // Add new progress
    user.skillsProgress.push({
      skillId,
      status: "in_progress",
      startedAt: new Date(),
      modulesProgress: []
    });

    await user.save();
    res.json({ success: true, message: "Skill started!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// POST /api/dashboard/set-challenge
router.post("/set-challenge", auth, async (req, res) => {
  try {
    const { skillId, moduleId, challengeDays } = req.body;
    const user = await User.findById(req.userId);

    // Auto-enroll if missing
    let skillProgress = user.skillsProgress.find(p => p.skillId.toString() === skillId);
    if (!skillProgress) {
      user.skillsProgress.push({
        skillId: skillId,
        status: 'in_progress',
        startedAt: new Date(),
        modulesProgress: []
      });
      skillProgress = user.skillsProgress[user.skillsProgress.length - 1];
    }

    let moduleProgress = skillProgress.modulesProgress.find(m => m.moduleId.toString() === moduleId);

    if (moduleProgress) {
      moduleProgress.challengeDays = challengeDays;
      moduleProgress.challengeStartDate = new Date();
    } else {
      skillProgress.modulesProgress.push({
        moduleId,
        challengeDays,
        challengeStartDate: new Date(),
        status: "in_progress",
        lessonsProgress: []
      });
    }

    await user.save();
    res.json({ success: true, message: "Challenge set!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

// POST /api/dashboard/complete-lesson
router.post("/complete-lesson", auth, async (req, res) => {
  try {
    const { skillId, moduleId, lessonId } = req.body;
    const user = await User.findById(req.userId);

    // Ensure structures exist
    let skillProg = user.skillsProgress.find(p => p.skillId.toString() === skillId);
    if (!skillProg) {
      user.skillsProgress.push({ skillId, status: 'in_progress', modulesProgress: [] });
      skillProg = user.skillsProgress[user.skillsProgress.length - 1];
    }

    let moduleProg = skillProg.modulesProgress.find(m => m.moduleId.toString() === moduleId);
    if (!moduleProg) {
      skillProg.modulesProgress.push({ moduleId, status: 'in_progress', lessonsProgress: [] });
      moduleProg = skillProg.modulesProgress.find(m => m.moduleId.toString() === moduleId);
    }

    let lessonProg = moduleProg.lessonsProgress.find(l => l.lessonId.toString() === lessonId);
    if (!lessonProg) {
      moduleProg.lessonsProgress.push({ lessonId, completed: false });
      lessonProg = moduleProg.lessonsProgress.find(l => l.lessonId.toString() === lessonId);
    }

    if (lessonProg.completed) {
      return res.json({ success: true, message: "Already completed" });
    }

    lessonProg.completed = true;
    lessonProg.completedAt = new Date();
    addPointsToUser(user, 50);

    await user.save();
    await user.save();
    res.json({ success: true, user }); // <-- send updated user
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

// POST /api/dashboard/complete-module
router.post("/complete-module", auth, async (req, res) => {
  try {
    const { skillId, moduleId } = req.body;
    const user = await User.findById(req.userId);

    const skillProgress = user.skillsProgress.find(p => p.skillId.toString() === skillId);
    if (!skillProgress) return res.status(400).json({ success: false, message: "Skill not started" });

    const moduleProgress = skillProgress.modulesProgress.find(m => m.moduleId.toString() === moduleId);
    if (!moduleProgress) return res.status(404).json({ success: false, message: "Module not found" });

    // Mark all lessons complete
    let wasAlreadyComplete = true;
    moduleProgress.lessonsProgress.forEach(lesson => {
      if (!lesson.completed) {
        lesson.completed = true;
        lesson.completedAt = new Date();
        wasAlreadyComplete = false;
      }
    });

    moduleProgress.status = "completed";
    moduleProgress.completedAt = new Date();

    addPointsToUser(user, wasAlreadyComplete ? 200 : 150);

    // Check if skill complete
    const skillDef = await Skill.findById(skillId);
    if (skillDef) {
      const totalModules = skillDef.modules.length;
      const completedModulesCount = skillProgress.modulesProgress.filter(m => m.status === "completed").length;

      if (completedModulesCount >= totalModules) {
        skillProgress.status = "completed";
        skillProgress.completedAt = new Date();
        addPointsToUser(user, 1000);
        user.stats.skillsCompleted = (user.stats.skillsCompleted || 0) + 1;
        user.stats.certificatesEarned = (user.stats.certificatesEarned || 0) + 1;

        const certId = `CERT-${user._id.toString().slice(-6).toUpperCase()}-${skillId.slice(-6).toUpperCase()}`;
        user.certificates.push({
          skillId,
          skillName: skillDef.name,
          certificateId: certId,
          issuedAt: new Date()
        });
      }
    }

    await user.save();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

// POST /api/dashboard/generate-certificate (Removed to eliminate pdf-lib dependency)
router.post("/generate-certificate", auth, async (req, res) => {
  res.status(501).json({
    success: false,
    message: "PDF Certificate Generation has been disabled to save build time. Please contact admin for certificates."
  });
});

module.exports = router;