const express = require("express")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Get user certificates
router.get("/", auth, async (req, res) => {
  try {
    // Placeholder certificate data
    const certificates = [
      {
        id: "cert_1",
        skillName: "Web Development",
        completedAt: new Date(),
        certificateUrl: "/certificates/web-dev-cert.pdf",
      },
    ]

    res.json({
      success: true,
      certificates,
    })
  } catch (error) {
    console.error("Get certificates error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
