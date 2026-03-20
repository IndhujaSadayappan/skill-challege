const mongoose = require("mongoose")

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["lesson", "quiz", "coding", "video"],
      required: true,
    },
    order: { type: Number, required: true },
    estimatedTime: { type: Number, default: 15 }, // in minutes

    // Lesson content
    content: {
      text: String,
      html: String,
      videoUrl: String,
      resources: [
        {
          title: String,
          url: String,
          type: String,
        },
      ],
    },

    // Quiz content
    quiz: {
      questions: [
        {
          question: { type: String, required: true },
          options: [String],
          correct: { type: Number, required: true },
          explanation: String,
        },
      ],
      passingScore: { type: Number, default: 70 },
    },

    // Coding challenge content
    coding: {
      description: String,
      instructions: String,
      starterCode: String,
      solution: String,
      language: { type: String, default: "html" },
      testCases: [
        {
          input: String,
          expectedOutput: String,
        },
      ],
    },
  },
  {
    timestamps: true,
  },
)

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    order: { type: Number, required: true },
    estimatedTime: { type: String, default: "2 weeks" },
    isLocked: { type: Boolean, default: false },
    lessons: [lessonSchema],
  },
  {
    timestamps: true,
  },
)

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    duration: { type: String, required: true },
    thumbnail: String,
    isActive: { type: Boolean, default: true },
    modules: [moduleSchema],

    // Course metadata
    prerequisites: [String],
    learningOutcomes: [String],
    tags: [String],

    // Statistics
    stats: {
      enrolledUsers: { type: Number, default: 0 },
      completedUsers: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      totalRatings: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  },
)

// Update module count before saving
courseSchema.pre("save", function (next) {
  this.totalModules = this.modules.length
  next()
})

module.exports = mongoose.model("Course", courseSchema)
