const mongoose = require("mongoose")

const lessonSchema = new mongoose.Schema(
  {
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["text-content", "video", "quiz", "coding-challenge"],
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    estimatedTime: {
      type: Number,
      default: 15, // in minutes
    },
    // Text Content
    content: {
      text: String,
      html: String,
      resources: [
        {
          title: String,
          url: String,
          type: String,
        },
      ],
    },
    // Video Content
    video: {
      url: String,
      duration: Number, // in seconds
      thumbnail: String,
      description: String,
    },
    // Quiz Content
    quiz: {
      questions: [
        {
          question: String,
          options: [String],
          correctAnswer: Number,
          explanation: String,
        },
      ],
      passingScore: { type: Number, default: 70 },
      maxAttempts: { type: Number, default: 3 },
    },
    // Coding Challenge
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
    isPublished: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Lesson", lessonSchema)
