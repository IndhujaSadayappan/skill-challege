const mongoose = require("mongoose");

// NEW: Lesson sub-schema (matches frontend structure)
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["lesson", "video", "quiz", "coding"], 
    default: "lesson",
    required: true 
  },
  content: {
    text: String,  // For text-based lessons
    videoUrl: String,  // For video lessons
    quiz: {
      questions: [{
        question: { type: String, required: true },
        options: [{ type: String }],  // Array of strings, e.g., ["A", "B", "C"]
        correct: { type: Number, min: 0, required: true },  // 0-based index
      }],
    },
    coding: {
      instructions: String,  // Renamed from 'text' for clarity
      starterCode: String,
      language: { type: String, default: "javascript" },
    },
  },
  estimatedTime: { type: Number, default: 15 },  // Per lesson
  order: { type: Number, default: 1 },  // For sorting lessons
  createdAt: { type: Date, default: Date.now },
}, { _id: true });  // Auto _id for each lesson

// UPDATED: Module schema (now includes lessons)
const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["lesson", "project", "quiz"], 
    default: "lesson",
    required: true 
  },
  estimatedTime: { type: Number, required: true, min: 1 },
  order: { type: Number, default: 1 },  // For sorting modules
  lessons: [lessonSchema],  // NEW: Embed lessons array
  difficultyLevels: { type: [String], default: ["easy", "medium", "hard"] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { _id: true });

// UPDATED: Skill schema (unchanged mostly, but modules now have lessons)
const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: "📚" },
  color: { type: String, default: "#1230AE" },
  estimatedHours: { type: Number, required: true, min: 1 },
  level: { 
    type: String, 
    enum: ["beginner", "intermediate", "advanced"], 
    required: true 
  },
  tags: [{ type: String }],
  modules: [moduleSchema],  // Now supports nested lessons
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Skill", skillSchema);