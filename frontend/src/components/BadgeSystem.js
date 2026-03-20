"use client"

import { useState, useEffect } from "react"

const BadgeSystem = ({ userProgress, onBadgeEarned }) => {
  const [badges, setBadges] = useState([
    {
      id: "first_steps",
      name: "First Steps",
      description: "Complete your first module",
      icon: "🎯",
      category: "milestone",
      requirement: { type: "modules_completed", value: 1 },
      points: 50,
      rarity: "common",
    },
    {
      id: "quiz_master",
      name: "Quiz Master",
      description: "Score 90% or higher on 5 quizzes",
      icon: "🧠",
      category: "achievement",
      requirement: { type: "high_quiz_scores", value: 5 },
      points: 100,
      rarity: "uncommon",
    },
    {
      id: "code_warrior",
      name: "Code Warrior",
      description: "Complete 10 coding challenges",
      icon: "⚔️",
      category: "skill",
      requirement: { type: "coding_challenges", value: 10 },
      points: 150,
      rarity: "rare",
    },
    {
      id: "streak_champion",
      name: "Streak Champion",
      description: "Maintain a 7-day learning streak",
      icon: "🔥",
      category: "consistency",
      requirement: { type: "learning_streak", value: 7 },
      points: 200,
      rarity: "rare",
    },
    {
      id: "knowledge_seeker",
      name: "Knowledge Seeker",
      description: "Complete 20 modules",
      icon: "📚",
      category: "milestone",
      requirement: { type: "modules_completed", value: 20 },
      points: 300,
      rarity: "epic",
    },
    {
      id: "perfect_score",
      name: "Perfect Score",
      description: "Get 100% on a final exam",
      icon: "💯",
      category: "achievement",
      requirement: { type: "perfect_exam", value: 1 },
      points: 500,
      rarity: "legendary",
    },
    {
      id: "mentor",
      name: "Mentor",
      description: "Help 5 other students",
      icon: "🤝",
      category: "community",
      requirement: { type: "help_others", value: 5 },
      points: 250,
      rarity: "epic",
    },
    {
      id: "speed_demon",
      name: "Speed Demon",
      description: "Complete a module in under 2 hours",
      icon: "⚡",
      category: "speed",
      requirement: { type: "fast_completion", value: 120 },
      points: 150,
      rarity: "uncommon",
    },
  ])

  const [earnedBadges, setEarnedBadges] = useState(["first_steps", "quiz_master", "code_warrior", "streak_champion"])

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "common":
        return "#6B7280"
      case "uncommon":
        return "#10B981"
      case "rare":
        return "#3B82F6"
      case "epic":
        return "#8B5CF6"
      case "legendary":
        return "#F59E0B"
      default:
        return "#6B7280"
    }
  }

  const getRarityGlow = (rarity) => {
    const color = getRarityColor(rarity)
    return `0 0 20px ${color}40`
  }

  const checkBadgeEligibility = (badge) => {
    // Mock logic - in real app, this would check actual user progress
    const { requirement } = badge
    switch (requirement.type) {
      case "modules_completed":
        return userProgress?.modulesCompleted >= requirement.value
      case "high_quiz_scores":
        return userProgress?.highQuizScores >= requirement.value
      case "coding_challenges":
        return userProgress?.codingChallenges >= requirement.value
      case "learning_streak":
        return userProgress?.currentStreak >= requirement.value
      default:
        return false
    }
  }

  useEffect(() => {
    // Check for newly earned badges
    badges.forEach((badge) => {
      if (!earnedBadges.includes(badge.id) && checkBadgeEligibility(badge)) {
        setEarnedBadges((prev) => [...prev, badge.id])
        if (onBadgeEarned) {
          onBadgeEarned(badge)
        }
      }
    })
  }, [userProgress])

  const categorizedBadges = badges.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = []
    }
    acc[badge.category].push(badge)
    return acc
  }, {})

  return (
    <div className="badge-system">
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "var(--primary)", marginBottom: "0.5rem" }}>Badge Collection</h2>
        <p style={{ color: "var(--muted-foreground)" }}>
          Earn badges by completing challenges and reaching milestones. You have {earnedBadges.length} of{" "}
          {badges.length} badges.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <span>Collection Progress</span>
          <span>
            {earnedBadges.length}/{badges.length} ({((earnedBadges.length / badges.length) * 100).toFixed(0)}%)
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(earnedBadges.length / badges.length) * 100}%` }}></div>
        </div>
      </div>

      {/* Badge Categories */}
      {Object.entries(categorizedBadges).map(([category, categoryBadges]) => (
        <div key={category} style={{ marginBottom: "3rem" }}>
          <h3
            style={{
              color: "var(--primary)",
              marginBottom: "1.5rem",
              textTransform: "capitalize",
              borderBottom: "2px solid var(--border)",
              paddingBottom: "0.5rem",
            }}
          >
            {category.replace("_", " ")} Badges
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
            {categoryBadges.map((badge) => {
              const isEarned = earnedBadges.includes(badge.id)
              return (
                <div
                  key={badge.id}
                  className="card"
                  style={{
                    textAlign: "center",
                    opacity: isEarned ? 1 : 0.6,
                    border: isEarned ? `2px solid ${getRarityColor(badge.rarity)}` : "2px solid var(--border)",
                    boxShadow: isEarned ? getRarityGlow(badge.rarity) : "none",
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {isEarned && (
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: getRarityColor(badge.rarity),
                        color: "white",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "1rem",
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                      }}
                    >
                      {badge.rarity}
                    </div>
                  )}

                  <div
                    style={{
                      fontSize: "3rem",
                      marginBottom: "1rem",
                      filter: isEarned ? "none" : "grayscale(100%)",
                    }}
                  >
                    {badge.icon}
                  </div>

                  <h4
                    style={{
                      color: isEarned ? getRarityColor(badge.rarity) : "var(--muted-foreground)",
                      marginBottom: "0.5rem",
                      fontSize: "1.2rem",
                    }}
                  >
                    {badge.name}
                  </h4>

                  <p
                    style={{
                      color: "var(--muted-foreground)",
                      fontSize: "0.9rem",
                      marginBottom: "1rem",
                      lineHeight: "1.4",
                    }}
                  >
                    {badge.description}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="badge" style={{ background: getRarityColor(badge.rarity), color: "white" }}>
                      +{badge.points} pts
                    </span>
                    {isEarned ? (
                      <span className="badge badge-success">Earned</span>
                    ) : (
                      <span className="badge">Locked</span>
                    )}
                  </div>

                  {!isEarned && (
                    <div
                      style={{
                        marginTop: "1rem",
                        padding: "0.5rem",
                        background: "var(--muted)",
                        borderRadius: "var(--radius)",
                        fontSize: "0.8rem",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      Progress: {getProgressText(badge, userProgress)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

const getProgressText = (badge, userProgress) => {
  const { requirement } = badge
  switch (requirement.type) {
    case "modules_completed":
      return `${userProgress?.modulesCompleted || 0}/${requirement.value} modules`
    case "high_quiz_scores":
      return `${userProgress?.highQuizScores || 0}/${requirement.value} high scores`
    case "coding_challenges":
      return `${userProgress?.codingChallenges || 0}/${requirement.value} challenges`
    case "learning_streak":
      return `${userProgress?.currentStreak || 0}/${requirement.value} days`
    default:
      return "Requirements not met"
  }
}

export default BadgeSystem
