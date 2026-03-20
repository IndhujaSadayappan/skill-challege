"use client"

import { useState } from "react"
import { Link } from "react-router-dom"

const GlobalLeaderboard = () => {
  const [activeRegion, setActiveRegion] = useState("global")
  const [activeCategory, setActiveCategory] = useState("overall")

  return (
    <div className="global-leaderboard" style={{ padding: "2rem 0" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ color: "var(--primary)", marginBottom: "0.5rem" }}>🌍 Global Leaderboard</h1>
          <p style={{ color: "var(--muted-foreground)" }}>See how you rank against learners from around the world</p>
        </div>

        {/* Quick Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div className="card" style={{ textAlign: "center" }}>
            <h3 style={{ color: "var(--primary)", fontSize: "2rem" }}>50K+</h3>
            <p style={{ color: "var(--muted-foreground)" }}>Active Learners</p>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <h3 style={{ color: "#10B981", fontSize: "2rem" }}>180+</h3>
            <p style={{ color: "var(--muted-foreground)" }}>Countries</p>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <h3 style={{ color: "#F59E0B", fontSize: "2rem" }}>1M+</h3>
            <p style={{ color: "var(--muted-foreground)" }}>Modules Completed</p>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <h3 style={{ color: "#EF4444", fontSize: "2rem" }}>25K+</h3>
            <p style={{ color: "var(--muted-foreground)" }}>Certificates Issued</p>
          </div>
        </div>

        <div className="card">
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <h2 style={{ color: "var(--primary)", marginBottom: "1rem" }}>Coming Soon!</h2>
            <p style={{ color: "var(--muted-foreground)", marginBottom: "2rem" }}>
              The global leaderboard is currently under development. Soon you'll be able to compete with learners from
              around the world, join international competitions, and see regional rankings.
            </p>
            <Link to="/leaderboard" className="btn btn-primary">
              View Current Leaderboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GlobalLeaderboard
