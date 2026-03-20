"use client"

import { useState } from "react"

const LeaderboardWidget = () => {
  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, username: "CodeMaster", points: 2450, avatar: "👨‍💻" },
    { rank: 2, username: "WebWizard", points: 2380, avatar: "🧙‍♀️" },
    { rank: 3, username: "AlgoAce", points: 2250, avatar: "🎯" },
    { rank: 4, username: "ReactRocket", points: 2100, avatar: "🚀" },
    { rank: 5, username: "CSSNinja", points: 1950, avatar: "🥷" },
    { rank: 6, username: "JSJedi", points: 1850, avatar: "⚔️" },
    { rank: 7, username: "DataDragon", points: 1750, avatar: "🐉" },
    { rank: 8, username: "PyPioneer", points: 1650, avatar: "🐍" },
  ])

  const [timeframe, setTimeframe] = useState("weekly")

  return (
    <div className="leaderboard-widget card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ color: "var(--primary)" }}>🏆 Leaderboard</h3>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          style={{
            padding: "0.5rem",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            background: "var(--background)",
            color: "var(--foreground)",
          }}
        >
          <option value="weekly">This Week</option>
          <option value="monthly">This Month</option>
          <option value="alltime">All Time</option>
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {leaderboard.slice(0, 5).map((user, index) => (
          <div
            key={user.rank}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "0.75rem",
              background: user.rank <= 3 ? "var(--accent)" : "var(--muted)",
              borderRadius: "var(--radius)",
              border: user.rank <= 3 ? "1px solid var(--primary)" : "1px solid var(--border)",
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background:
                  user.rank === 1 ? "#FFD700" : user.rank === 2 ? "#C0C0C0" : user.rank === 3 ? "#CD7F32" : "#6B7280",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: "0.8rem",
              }}
            >
              {user.rank}
            </div>

            <div style={{ fontSize: "1.5rem" }}>{user.avatar}</div>

            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: "600", marginBottom: "0.25rem" }}>{user.username}</p>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>{user.points} points</p>
            </div>

            {user.rank <= 3 && (
              <div style={{ fontSize: "1.2rem" }}>{user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : "🥉"}</div>
            )}
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <button
          className="btn btn-outline"
          style={{ fontSize: "0.9rem", padding: "0.5rem 1rem" }}
          onClick={() => alert("Full leaderboard feature coming soon!")}
        >
          View Full Leaderboard
        </button>
      </div>
    </div>
  )
}

export default LeaderboardWidget
