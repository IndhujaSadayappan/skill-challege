"use client"

import { useState, useRef } from "react"
import { useAuth } from "../context/AuthContext"

const CertificateGenerator = ({ courseData, onDownload }) => {
  const { user } = useAuth()
  const canvasRef = useRef(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const generateCertificate = async () => {
    setIsGenerating(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // Set canvas size
    canvas.width = 1200
    canvas.height = 800

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, "#1230AE")
    gradient.addColorStop(1, "#6C48C5")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Border
    ctx.strokeStyle = "#FFF7F7"
    ctx.lineWidth = 8
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80)

    // Inner border
    ctx.strokeStyle = "#C68FE6"
    ctx.lineWidth = 4
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120)

    // Title
    ctx.fillStyle = "#FFF7F7"
    ctx.font = "bold 48px Arial"
    ctx.textAlign = "center"
    ctx.fillText("CERTIFICATE OF COMPLETION", canvas.width / 2, 180)

    // Subtitle
    ctx.font = "24px Arial"
    ctx.fillText("This is to certify that", canvas.width / 2, 240)

    // User name
    ctx.font = "bold 56px Arial"
    ctx.fillStyle = "#C68FE6"
    ctx.fillText(user?.username || "Student Name", canvas.width / 2, 320)

    // Course completion text
    ctx.fillStyle = "#FFF7F7"
    ctx.font = "24px Arial"
    ctx.fillText("has successfully completed the course", canvas.width / 2, 380)

    // Course name
    ctx.font = "bold 36px Arial"
    ctx.fillStyle = "#C68FE6"
    ctx.fillText(courseData.title, canvas.width / 2, 440)

    // Skills learned
    ctx.fillStyle = "#FFF7F7"
    ctx.font = "20px Arial"
    ctx.fillText("Skills mastered:", canvas.width / 2, 500)

    // Skills list
    ctx.font = "18px Arial"
    const skills = courseData.skills || ["HTML", "CSS", "JavaScript"]
    const skillsText = skills.join(" • ")
    ctx.fillText(skillsText, canvas.width / 2, 530)

    // Date and signature area
    ctx.font = "18px Arial"
    ctx.textAlign = "left"
    ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, 120, 650)
    ctx.fillText("Certificate ID: " + generateCertificateId(), 120, 680)

    ctx.textAlign = "right"
    ctx.fillText("SkillMaster Platform", canvas.width - 120, 650)
    ctx.fillText("Verified Certificate", canvas.width - 120, 680)

    // Logo placeholder (you would load an actual image here)
    ctx.fillStyle = "#FFF7F7"
    ctx.font = "bold 24px Arial"
    ctx.textAlign = "center"
    ctx.fillText("🎓", canvas.width / 2, 600)

    setIsGenerating(false)
  }

  const generateCertificateId = () => {
    return "SM-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substr(2, 5).toUpperCase()
  }

  const downloadCertificate = () => {
    const canvas = canvasRef.current
    const link = document.createElement("a")
    link.download = `${courseData.title.replace(/\s+/g, "_")}_Certificate.png`
    link.href = canvas.toDataURL()
    link.click()

    if (onDownload) {
      onDownload({
        courseTitle: courseData.title,
        certificateId: generateCertificateId(),
        downloadDate: new Date().toISOString(),
      })
    }
  }

  return (
    <div className="certificate-generator">
      <div className="card" style={{ textAlign: "center" }}>
        <h3 style={{ color: "var(--primary)", marginBottom: "1rem" }}>Generate Your Certificate</h3>
        <p style={{ color: "var(--muted-foreground)", marginBottom: "2rem" }}>
          Congratulations on completing {courseData.title}! Generate and download your certificate below.
        </p>

        <canvas
          ref={canvasRef}
          style={{
            maxWidth: "100%",
            height: "auto",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            marginBottom: "2rem",
          }}
        />

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button onClick={generateCertificate} className="btn btn-primary" disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate Certificate"}
          </button>
          <button onClick={downloadCertificate} className="btn btn-secondary">
            Download Certificate
          </button>
        </div>
      </div>
    </div>
  )
}

export default CertificateGenerator
