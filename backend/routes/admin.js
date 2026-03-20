const express = require("express");
const mongoose = require("mongoose");
const { adminAuth } = require("../middleware/auth");
const Skill = require("../models/Skill");
const User = require("../models/User");

const router = express.Router();


router.get("/stats", adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      "stats.lastActivity": { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });
    const totalSkills = await Skill.countDocuments();
    const completedCourses = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$stats.skillsCompleted" } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalSkills,
        completedCourses: completedCourses[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch stats", error: err.message });
  }
});

router.get("/skills", adminAuth, async (req, res) => {
  try {
    const skills = await Skill.find().sort({ createdAt: -1 });
    res.json({ success: true, skills });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch skills", error: err.message });
  }
});


router.post("/skills", adminAuth, async (req, res) => {
  try {
    const { name, description, level, estimatedHours, icon, color, tags } = req.body;

    if (!name || !description || !level) {
      return res.status(400).json({
        success: false,
        message: "Name, description, and level are required",
      });
    }

    const newSkill = new Skill({
      name,
      description,
      level,
      estimatedHours: estimatedHours || 10,
      icon: icon || "📚",
      color: color || "#1230AE",
      tags: tags || [],
      modules: [],
      isActive: true,
    });

    await newSkill.save();

    res.status(201).json({
      success: true,
      message: "Skill created successfully",
      skill: newSkill,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create skill", error: err.message });
  }
});


router.put("/skills/:skillId", adminAuth, async (req, res) => {
  try {
    const { skillId } = req.params;
    const { name, description, level, estimatedHours, icon, color, tags, isActive } = req.body;

    if (!mongoose.isValidObjectId(skillId)) {
      return res.status(400).json({ success: false, message: "Invalid skill ID" });
    }

    const updatedSkill = await Skill.findByIdAndUpdate(
      skillId,
      {
        name,
        description,
        level,
        estimatedHours,
        icon,
        color,
        tags,
        isActive,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedSkill) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }

    res.json({
      success: true,
      message: "Skill updated successfully",
      skill: updatedSkill,
    });
  } catch (err) {
  console.error("Module update FULL ERROR:", {
    message: err.message,
    name: err.name,
    stack: err.stack,
    validationErrors: err.errors ? Object.fromEntries(Object.entries(err.errors).map(([path, e]) => [path, e.message])) : null,
  });
  res.status(500).json({ success: false, message: "Failed to update module", error: err.message, details: err.errors ? Object.keys(err.errors) : null });
}
});

router.delete("/skills/:skillId", adminAuth, async (req, res) => {
  try {
    const { skillId } = req.params;

    if (!mongoose.isValidObjectId(skillId)) {
      return res.status(400).json({ success: false, message: "Invalid skill ID" });
    }

    const deletedSkill = await Skill.findByIdAndDelete(skillId);

    if (!deletedSkill) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }

    res.json({ success: true, message: "Skill deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete skill", error: err.message });
  }
});


router.post("/skills/:skillId/modules", adminAuth, async (req, res) => {
  try {
    const { skillId } = req.params;
    const { title, description, type, estimatedTime, lessons = [] } = req.body;  
    if (!mongoose.isValidObjectId(skillId)) {
      return res.status(400).json({ success: false, message: "Invalid skill ID" });
    }

 
    if (!title || !description || !type || lessons.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Title, description, type, and at least one lesson are required" 
      });
    }

    const skill = await Skill.findById(skillId);
    if (!skill) return res.status(404).json({ success: false, message: "Skill not found" });

    const newModule = {
      title,
      description,
      type: type || "lesson",
      estimatedTime: estimatedTime || 30,
      order: skill.modules.length + 1,
      lessons,  
      difficultyLevels: ["easy", "medium", "hard"],
    };

    skill.modules.push(newModule);
    await skill.save();

    res.status(201).json({
      success: true,
      message: "Module added successfully",
      module: skill.modules[skill.modules.length - 1],
      skill,
    });
  }catch (err) {
  console.error("Module creation FULL ERROR:", {
    message: err.message,
    name: err.name,
    stack: err.stack,
    validationErrors: err.errors ? Object.fromEntries(Object.entries(err.errors).map(([path, e]) => [path, e.message])) : null,
  });
  res.status(500).json({ success: false, message: "Failed to add module", error: err.message, details: err.errors ? Object.keys(err.errors) : null });
}
});

router.put("/skills/:skillId/modules/:moduleId", adminAuth, async (req, res) => {
  try {
    const { skillId, moduleId } = req.params;
    const { title, description, estimatedTime, type, lessons = [] } = req.body;

    if (!mongoose.isValidObjectId(skillId) || !mongoose.isValidObjectId(moduleId)) {
      return res.status(400).json({ success: false, message: "Invalid skill or module ID" });
    }

    const skill = await Skill.findById(skillId);
    if (!skill) return res.status(404).json({ success: false, message: "Skill not found" });

    const module = skill.modules.id(moduleId);
    if (!module) return res.status(404).json({ success: false, message: "Module not found" });


    if (title) module.title = title;
    if (description) module.description = description;
    if (type) module.type = type;
    if (estimatedTime !== undefined) module.estimatedTime = estimatedTime;


    if (Array.isArray(lessons)) {
      module.lessons = lessons;
    }

    module.updatedAt = new Date();
    await skill.save();

    res.json({
      success: true,
      message: "Module updated successfully",
      module,
      skill,
    });
  } catch (err) {
    console.error("Module update error:", err);
    res.status(500).json({ success: false, message: "Failed to update module", error: err.message });
  }
});



router.delete("/skills/:skillId/modules/:moduleId", adminAuth, async (req, res) => {
  try {
    const { skillId, moduleId } = req.params;

    if (!mongoose.isValidObjectId(skillId) || !mongoose.isValidObjectId(moduleId)) {
      return res.status(400).json({ success: false, message: "Invalid skill or module ID" });
    }

    const skill = await Skill.findById(skillId);
    if (!skill) return res.status(404).json({ success: false, message: "Skill not found" });

    skill.modules.id(moduleId).deleteOne();
    await skill.save();

    res.json({ success: true, message: "Module deleted successfully", skill });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete module", error: err.message });
  }
});


router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch users", error: err.message });
  }
});

module.exports = router;