const mongoose = require("mongoose")

const lessonProgressSchema = new mongoose.Schema({
  lessonId: { type: mongoose.Schema.Types.ObjectId, required: true },
  status: {
    type: String,
    enum: ["not-started", "in-progress", "completed"],
    default: "not-started",
  },
  score: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 }, // in seconds
  attempts: { type: Number, default: 0 },
  completedAt: Date,
  lastAttemptAt: Date,
})

const moduleProgressSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, required: true },
  status: {
    type: String,
    enum: ["not-started", "in-progress", "completed"],
    default: "not-started",
  },
  lessonProgress: [lessonProgressSchema],
  overallProgress: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 },
  completedAt: Date,
  lastAccessedAt: Date,
})

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  skillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Skill",
    required: true,
  },
  moduleProgress: [moduleProgressSchema],
  overallProgress: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["not-started", "in-progress", "completed"],
    default: "not-started",
  },
  totalScore: { type: Number, default: 0 },
  totalTimeSpent: { type: Number, default: 0 },
  completedAt: Date,
  lastAccessedAt: { type: Date, default: Date.now },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

progressSchema.methods.calculateProgress = function () {
  if (this.moduleProgress.length === 0) {
    this.overallProgress = 0
    return
  }

  const completedModules = this.moduleProgress.filter((mp) => mp.status === "completed").length
  this.overallProgress = Math.round((completedModules / this.moduleProgress.length) * 100)
}

progressSchema.methods.updateStreak = function () {
  const now = new Date()
  const lastAccess = this.lastAccessedAt

  if (!lastAccess) {
    this.streak = 1
    return
  }

  const daysDifference = Math.floor((now - new Date(lastAccess)) / (1000 * 60 * 60 * 24))

  if (daysDifference === 1) {
    this.streak = (this.streak || 0) + 1
  } else if (daysDifference > 1) {
    this.streak = 1
  }
}

module.exports = mongoose.model("Progress", progressSchema)
