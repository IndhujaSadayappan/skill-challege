import { useState, useEffect } from "react";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "./UserDashboard.css";

export default function UserDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview, certificates, skills, leaderboard

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [dashRes, lbRes, skillsRes] = await Promise.all([
          axios.get("/dashboard", { withCredentials: true }),
          axios.get("/leaderboard/global", { withCredentials: true }),
          axios.get("/skills")
        ]);

        if (dashRes.data.success) setDashboardData(dashRes.data.dashboard);
        if (lbRes.data.success) setLeaderboard(lbRes.data.leaderboard);

        if (skillsRes.data.success) {
          const completedList = dashRes.data.dashboard?.completedSkills || [];
          const completedIds = completedList.map(cs => cs.skillId);
          const avail = skillsRes.data.skills.filter(s => !completedIds.includes(s._id));
          setAvailableSkills(avail);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const startSkill = async (idToStart) => {
    try {
      await axios.post("/dashboard/start-skill",
        { skillId: idToStart },
        { withCredentials: true }
      );
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to start skill");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { stats, currentProgress, completedSkills, certificates, badges } = dashboardData;

  return (
    <div className="user-dashboard">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        {/* <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">📚</div>
            <div className="logo-text">
              <div className="logo-title">LearnHub</div>
              <div className="logo-subtitle">Your Learning Portal</div>
            </div>
          </div>
        </div> */}

        <nav className="sidebar-nav">
          <div
            className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Overview</span>
          </div>

          <div
            className={`nav-item ${activeTab === "certificates" ? "active" : ""}`}
            onClick={() => setActiveTab("certificates")}
          >
            <span className="nav-icon">🏆</span>
            <span className="nav-text">Certificates</span>
          </div>

          <div
            className={`nav-item ${activeTab === "skills" ? "active" : ""}`}
            onClick={() => setActiveTab("skills")}
          >
            <span className="nav-icon">🎯</span>
            <span className="nav-text">Available Skills</span>
          </div>

          <div
            className={`nav-item ${activeTab === "leaderboard" ? "active" : ""}`}
            onClick={() => setActiveTab("leaderboard")}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Leaderboard</span>
          </div>

          {badges && badges.length > 0 && (
            <div
              className={`nav-item ${activeTab === "badges" ? "active" : ""}`}
              onClick={() => setActiveTab("badges")}
            >
              <span className="nav-icon">🎖️</span>
              <span className="nav-text">Badges</span>
            </div>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">Welcome back, {user.username}!</h1>
          <p className="dashboard-subtitle">Track your progress and continue learning</p>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card stat-points">
                <div className="stat-icon">🎯</div>
                <div className="stat-value">{stats?.totalPoints || 0}</div>
                <div className="stat-label">Total Points</div>
              </div>
              <div className="stat-card stat-level">
                <div className="stat-icon">⭐</div>
                <div className="stat-value">{stats?.level || 1}</div>
                <div className="stat-label">Level</div>
              </div>
              <div className="stat-card stat-streak">
                <div className="stat-icon">🔥</div>
                <div className="stat-value">{stats?.streak || 0}</div>
                <div className="stat-label">Day Streak</div>
              </div>
              <div className="stat-card stat-certificates">
                <div className="stat-icon">🏆</div>
                <div className="stat-value">{certificates?.length || 0}</div>
                <div className="stat-label">Certificates</div>
              </div>
            </div>

            {/* Current Skill Progress */}
            {currentProgress ? (
              <div className="current-skill-card">
                <h2 className="section-title">Currently Learning</h2>
                <Link
                  to={`/skills/${currentProgress.skillId}`}
                  className="continue-link"
                >
                  Continue Your Journey →
                </Link>
              </div>
            ) : (
              <div className="available-skills-card">
                <h2 className="section-title">Ready for Your Next Skill?</h2>
                <div className="skills-grid">
                  {availableSkills.slice(0, 4).map((skillItem) => (
                    <button
                      key={skillItem._id}
                      onClick={() => startSkill(skillItem._id)}
                      className="skill-start-btn"
                    >
                      <span className="skill-icon">{skillItem.icon || "📚"}</span>
                      <span className="skill-name">{skillItem.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Skills Preview */}
            {completedSkills && completedSkills.length > 0 && (
              <div className="section">
                <h2 className="section-heading">Recently Completed</h2>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Skill Name</th>
                        <th>Completed On</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedSkills.slice(0, 3).map((skill, index) => (
                        <tr key={index}>
                          <td className="skill-name-cell">{skill.skillName || "Skill"}</td>
                          <td>{new Date(skill.completedAt).toLocaleDateString()}</td>
                          <td>
                            <span className="score-badge">{skill.score || "100"}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* CERTIFICATES TAB */}
        {activeTab === "certificates" && (
          <div className="section">
            <h2 className="section-heading">Your Certificates</h2>
            {completedSkills && completedSkills.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Skill Name</th>
                      <th>Completed On</th>
                      <th>Score</th>
                      <th>Certificate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedSkills.map((skill, index) => (
                      <tr key={index}>
                        <td className="skill-name-cell">{skill.skillName || "Skill"}</td>
                        <td>{new Date(skill.completedAt).toLocaleDateString()}</td>
                        <td>
                          <span className="score-badge">{skill.score || "100"}%</span>
                        </td>
                        <td>
                          <button
                            onClick={async () => {
                              try {
                                const res = await axios.post("/dashboard/generate-certificate",
                                  { skillId: skill.skillId },
                                  { responseType: "blob", withCredentials: true }
                                );
                                const url = window.URL.createObjectURL(new Blob([res.data]));
                                const link = document.createElement("a");
                                link.href = url;
                                link.setAttribute("download", "Certificate.pdf");
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                              } catch (err) {
                                alert("Certificate download failed");
                              }
                            }}
                            className="view-link"
                          >
                            Download Certificate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "3rem" }}>
                No certificates earned yet. Complete a skill to earn your first certificate!
              </p>
            )}
          </div>
        )}

        {/* AVAILABLE SKILLS TAB */}
        {activeTab === "skills" && (
          <div className="available-skills-card">
            <h2 className="section-title">Start a New Skill</h2>
            <div className="skills-grid">
              {availableSkills.map((skillItem) => (
                <button
                  key={skillItem._id}
                  onClick={() => startSkill(skillItem._id)}
                  className="skill-start-btn"
                >
                  <span className="skill-icon">{skillItem.icon || "📚"}</span>
                  <span className="skill-name">{skillItem.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === "leaderboard" && (
          <div className="section">
            <h2 className="section-heading">Global Leaderboard</h2>
            <div className="table-container">
              <table className="data-table leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Username</th>
                    <th>Level</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.slice(0, 10).map((u, i) => (
                    <tr
                      key={u.userId}
                      className={user._id === u.userId ? "current-user-row" : ""}
                    >
                      <td className="rank-cell">
                        {i === 0 && <span className="medal gold">🥇</span>}
                        {i === 1 && <span className="medal silver">🥈</span>}
                        {i === 2 && <span className="medal bronze">🥉</span>}
                        {i > 2 && <span className="rank-number">#{i + 1}</span>}
                      </td>

                      <td className="username-cell">
                        {u.username}
                        {user._id === u.userId && <span className="you-badge">You</span>}
                      </td>

                      <td>{u.level || 1}</td>

                      <td className="points-cell">
                        {(u.points || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BADGES TAB */}
        {activeTab === "badges" && badges && badges.length > 0 && (
          <div className="section">
            <h2 className="section-heading">Your Badges</h2>
            <div className="badges-grid">
              {badges.map((badge, index) => (
                <div key={index} className="badge-card">
                  <div className="badge-icon">{badge.icon || "🎖️"}</div>
                  <div className="badge-name">{badge.name}</div>
                  <div className="badge-date">
                    Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}