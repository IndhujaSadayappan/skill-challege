const express = require("express");
const Skill = require("../models/Skill");

const router = express.Router();

// PUBLIC: GET active skills for navbar/home (no auth)
router.get("/skills", async (req, res) => {
  try {
    const skills = await Skill.find({ isActive: true })
      .sort({ name: 1 })  // Alphabetical
      .select("name icon _id description level tags color modules");  

    console.log(`Public skills fetched: ${skills.length}`);
    res.json({ success: true, skills });
  } catch (err) {
    console.error("Public skills error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch skills" });
  }
});

// ⭐ PUBLIC: GET single skill by ID (needed for Start Learning & SkillDetails.js)
router.get("/skills/:id", async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }

    console.log(`Fetched skill: ${skill.name}`);
    res.json({ success: true, skill });
  } catch (err) {
    console.error("Public skill fetch error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch skill" });
  }
});

module.exports = router;
