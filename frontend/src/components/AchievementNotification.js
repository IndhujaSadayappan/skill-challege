"use client"

import { useState, useEffect } from "react"

const AchievementNotification = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (achievement) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // Wait for animation to complete
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [achievement, onClose])

  if (!achievement) return null

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 1000,
        transform: isVisible ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s ease-in-out",
      }}
    >
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, var(--primary) 0%, #6C48C5 100%)",
          color: "white",
          minWidth: "300px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ fontSize: "2rem" }}>{achievement.icon}</div>
          <div style={{ flex: 1 }}>
            <h4 style={{ marginBottom: "0.5rem" }}>Achievement Unlocked!</h4>
            <p style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.25rem" }}>{achievement.title}</p>
            <p style={{ fontSize: "0.9rem", opacity: 0.9 }}>{achievement.description}</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "1.2rem",
              cursor: "pointer",
              padding: "0.25rem",
            }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

export default AchievementNotification
