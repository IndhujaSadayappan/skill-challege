const mongoose = require("mongoose")

const certificateSchema = new mongoose.Schema(
  {
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
    certificateId: {
      type: String,
      required: true,
      unique: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    issueDate: { type: Date, default: Date.now },
    expiryDate: Date,

    // Certificate details
    details: {
      skillName: String,
      completionDate: Date,
      totalScore: Number,
      timeSpent: Number, // in hours
      modulesCompleted: Number,
      grade: {
        type: String,
        enum: ["A+", "A", "B+", "B", "C+", "C"],
        required: true,
      },
    },

    // Verification
    verificationCode: { type: String, required: true },
    isVerified: { type: Boolean, default: true },
    verificationUrl: String,

    // Certificate design
    template: {
      type: String,
      enum: ["classic", "modern", "elegant", "professional"],
      default: "professional",
    },
    colors: {
      primary: { type: String, default: "#1230AE" },
      secondary: { type: String, default: "#6C48C5" },
      accent: { type: String, default: "#C68FE6" },
    },

    // Sharing and display
    isPublic: { type: Boolean, default: false },
    shareUrl: String,
    downloadCount: { type: Number, default: 0 },

    // Metadata
    metadata: {
      generatedBy: String,
      version: { type: String, default: "1.0" },
      format: { type: String, default: "PDF" },
    },
  },
  {
    timestamps: true,
  },
)

// Generate unique certificate ID
certificateSchema.pre("save", function (next) {
  if (!this.certificateId) {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    this.certificateId = `CERT-${timestamp}-${random}`.toUpperCase()
  }

  if (!this.verificationCode) {
    this.verificationCode = Math.random().toString(36).substr(2, 12).toUpperCase()
  }

  if (!this.shareUrl) {
    this.shareUrl = `/certificates/verify/${this.certificateId}`
  }

  if (!this.verificationUrl) {
    this.verificationUrl = `/api/certificates/verify/${this.verificationCode}`
  }

  next()
})

// Index for efficient queries
certificateSchema.index({ userId: 1, skillId: 1 })
certificateSchema.index({ certificateId: 1 })
certificateSchema.index({ verificationCode: 1 })

module.exports = mongoose.model("Certificate", certificateSchema)
