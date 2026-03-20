const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    firstName: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    lastName: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        achievements: { type: Boolean, default: true },
      },
      language: {
        type: String,
        default: "en",
      },
    },
    stats: {
      totalPoints: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
      streak: { type: Number, default: 0 },
      lastActivity: { type: Date, default: Date.now },
      skillsCompleted: { type: Number, default: 0 },
      challengesCompleted: { type: Number, default: 0 },
      certificatesEarned: { type: Number, default: 0 },
    },
    badges: [
      {
        name: String,
        description: String,
        icon: String,
        earnedAt: { type: Date, default: Date.now },
        category: String,
      },
    ],
    achievements: [
      {
        title: String,
        description: String,
        points: Number,
        unlockedAt: { type: Date, default: Date.now },
      },
    ],
    // Add to userSchema
skillsProgress: [
  {
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: "Skill" },
    status: { type: String, enum: ["in_progress", "completed"], default: "in_progress" },
    startDate: { type: Date, default: Date.now },
    completionDate: Date,
    modulesProgress: [
      {
        moduleId: { type: mongoose.Schema.Types.ObjectId },
        status: { type: String, enum: ["pending", "in_progress", "completed"], default: "pending" },
        challengeDays: Number,
        startDate: Date,
        expectedEndDate: Date,
        completionDate: Date,
        lessonsProgress: [
          {
            lessonId: { type: mongoose.Schema.Types.ObjectId },
            completed: { type: Boolean, default: false },
            completedDate: Date,
            score: Number,
          },
        ],
      },
    ],
  },
],
certificates: [
  {
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: "Skill" },
    issuedDate: { type: Date, default: Date.now },
    certificateId: { type: String },  // e.g., "userId-skillId-timestamp"
  },
],
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update user level based on points
userSchema.methods.updateLevel = function () {
  const newLevel = Math.floor(this.stats.totalPoints / 1000) + 1;
  if (newLevel > this.stats.level) {
    this.stats.level = newLevel;
    return true; // Level up occurred
  }
  return false;
};

// Update streak and last activity
userSchema.methods.updateActivity = function () {
  const today = new Date().setHours(0, 0, 0, 0);
  const last = new Date(this.stats.lastActivity).setHours(0, 0, 0, 0);

  if (last < today) {
    // If last activity was yesterday → increase streak
    if (last === today - 86400000) {
      this.stats.streak += 1;
    } else {
      // Not consecutive day → streak reset
      this.stats.streak = 1;
    }
    this.stats.lastActivity = new Date();
  }
};

// Add points + update activity + check level up
userSchema.methods.addPoints = function (points) {
  this.stats.totalPoints += points;

  // Update streak and lastActivity
  this.updateActivity();

  // Recalculate level
  return this.updateLevel();
};

module.exports = mongoose.model("User", userSchema)
