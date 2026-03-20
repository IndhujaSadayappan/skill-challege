"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"

const Leaderboard = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overall")
  const [leaderboardData, setLeaderboardData] = useState([])
  const [currentUserRank, setCurrentUserRank] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/leaderboard/global`, {
          credentials: "include",
        })
        const data = await res.json()

        if (data.success) {
          setLeaderboardData(data.leaderboard)
          setCurrentUserRank(data.currentUserRank)
        } else {
          setError(data.message || "Failed to fetch leaderboard")
        }
      } catch (err) {
        console.error(err)
        setError("Error fetching leaderboard data")
      } finally {
        setLoading(false)
      }
    }

    if (user) fetchLeaderboard()
  }, [user])

  const getRankIcon = (rank) => {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return `#${rank}`
  }

  const getRankColor = (rank) => {
    if (rank === 1) return "#FFD700"
    if (rank === 2) return "#C0C0C0"
    if (rank === 3) return "#CD7F32"
    return "#64748b"
  }

  const renderLeaderboardTable = () => (
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeader}>
            <th style={styles.th}>Rank</th>
            <th style={styles.th}>User</th>
            <th style={styles.th}>Points</th>
            <th style={styles.th}>Level</th>
            <th style={styles.th}>Completed</th>
            <th style={styles.th}>Streak</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData.length > 0 ? (
            leaderboardData.map((player) => (
              <tr
                key={player.rank}
                style={{
                  ...styles.tableRow,
                  backgroundColor: player.userId === user?._id ? "#f0f9ff" : "transparent",
                }}
              >
                <td style={styles.td}>
                  <div style={{ color: getRankColor(player.rank), fontWeight: "bold", fontSize: "1.2rem" }}>
                    {getRankIcon(player.rank)}
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={styles.userInfo}>
                    <div style={styles.avatar}>{player.avatar}</div>
                    <div>
                      <p style={styles.username}>{player.username}</p>
                      {player.userId === user?._id && <span style={styles.yourBadge}>You</span>}
                    </div>
                  </div>
                </td>
                <td style={{ ...styles.td, fontWeight: "600", color: "#6366f1" }}>{player.points.toLocaleString()}</td>
                <td style={styles.td}>
                  <span style={styles.levelBadge}>{player.level}</span>
                </td>
                <td style={styles.td}>{player.skillsCompleted}</td>
                <td style={styles.td}>
                  <span>🔥 {player.streak}</span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ ...styles.td, textAlign: "center", padding: "2rem" }}>
                No users on leaderboard yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )

  if (!user) {
    return (
      <div style={styles.container}>
        <p>Please log in to view the leaderboard</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Leaderboard</h1>
        <p style={styles.subtitle}>Compete with learners worldwide and climb the ranks!</p>
      </div>

      {/* User Rank Card */}
      {currentUserRank && (
        <div style={styles.userRankCard}>
          <div style={styles.userRankContent}>
            <div style={styles.userRankSection}>
              <p style={styles.userRankLabel}>Your Rank</p>
              <p style={styles.userRankValue}>#{currentUserRank.rank}</p>
            </div>
            <div style={styles.userRankSection}>
              <p style={styles.userRankLabel}>Points</p>
              <p style={styles.userRankValue}>{currentUserRank.points.toLocaleString()}</p>
            </div>
            <div style={styles.userRankSection}>
              <p style={styles.userRankLabel}>Level</p>
              <p style={styles.userRankValue}>{currentUserRank.level}</p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading leaderboard...</p>
        </div>
      ) : error ? (
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
        </div>
      ) : (
        <div>
          <h2 style={styles.sectionTitle}>Global Rankings</h2>
          {renderLeaderboardTable()}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 0.5rem 0",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#64748b",
    margin: "0",
  },
  userRankCard: {
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "2rem",
    borderRadius: "12px",
    marginBottom: "2rem",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },
  userRankContent: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "2rem",
  },
  userRankSection: {
    textAlign: "center",
  },
  userRankLabel: {
    fontSize: "0.9rem",
    opacity: 0.9,
    margin: "0 0 0.5rem 0",
  },
  userRankValue: {
    fontSize: "1.8rem",
    fontWeight: "700",
    margin: "0",
  },
  sectionTitle: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "1.5rem",
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflow: "auto",
    border: "1px solid #e2e8f0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    backgroundColor: "#f8fafc",
    borderBottom: "2px solid #e2e8f0",
  },
  th: {
    padding: "1rem",
    textAlign: "left",
    fontWeight: "600",
    color: "#1e293b",
  },
  tableRow: {
    borderBottom: "1px solid #e2e8f0",
    transition: "background-color 0.2s ease",
  },
  td: {
    padding: "1rem",
    color: "#374151",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  avatar: {
    fontSize: "1.5rem",
  },
  username: {
    fontWeight: "600",
    margin: "0 0 0.25rem 0",
  },
  yourBadge: {
    display: "inline-block",
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    padding: "0.2rem 0.6rem",
    borderRadius: "4px",
    fontSize: "0.7rem",
    fontWeight: "600",
  },
  levelBadge: {
    display: "inline-block",
    backgroundColor: "#f3f4f6",
    color: "#1e293b",
    padding: "0.3rem 0.7rem",
    borderRadius: "12px",
    fontWeight: "600",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "300px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "1rem",
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "1.5rem",
    borderRadius: "12px",
    textAlign: "center",
  },
  errorText: {
    margin: "0",
  },
}

export default Leaderboard
