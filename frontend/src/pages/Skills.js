"use client";

import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./Skills.css";

export default function Skills() {
  const { domain } = useParams();
  const { user } = useAuth();

  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("/skills")
      .then(res => {
        if (res.data.success) setSkills(res.data.skills);
      })
      .catch(() => setError("Failed to load skills"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (domain) {
      setLoading(true);
      axios.get(`/skills/${domain}`)
        .then(res => {
          if (res.data.success) {
            setCurrentSkill(res.data.skill);
          } else {
            setError("Skill not found");
          }
        })
        .catch(() => setError("Failed to load skill"))
        .finally(() => setLoading(false));
    }
  }, [domain]);

  const startSkill = async (skillId) => {
    try {
      await axios.post("/dashboard/start-skill", { skillId });
      window.location.reload(); // Refresh to update user progress
    } catch (err) {
      alert(err.response?.data?.message || "Cannot start skill");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading skills...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <span className="error-icon">⚠</span>
        <p>{error}</p>
      </div>
    );
  }

  // =============================================
  // LIST OF ALL SKILLS (Home page)
  // =============================================
  if (!domain) {
    return (
      <div className="skills-page">
        <div className="skills-container">
          <div className="page-header">
            <h1 className="page-title">Choose Your Learning Path</h1>
            <p className="page-subtitle">
              Select a skill domain to begin your learning journey and master new technologies.
            </p>
          </div>

          <div className="skills-grid">
            {skills.map((skill) => {
              const totalLessons = skill.modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
              return (
                <div key={skill._id} className="skill-card">
                  <div className="skill-card-content">
                    <div className="skill-icon-wrapper">
                      <div className="skill-icon">{skill.icon || "📚"}</div>
                    </div>
                    <h3 className="skill-name">{skill.name}</h3>
                    <div className="skill-stats">
                      <span className="stat-item">
                        <strong>{skill.modules.length}  modules</strong> 
                      </span>
                      <span className="stat-divider">•</span>
                      <span className="stat-item">
                        <strong>{totalLessons}  lessons</strong> 
                      </span>
                    </div>
                    <Link to={`/skills/${skill._id}`} className="explore-btn">
                      Explore
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // =============================================
  // INDIVIDUAL SKILL DETAIL PAGE
  // =============================================
  if (currentSkill) {
    const skillProgress = user?.skillsProgress?.find(p => p.skillId === currentSkill._id);
    const isStarted = !!skillProgress;
    const isCompleted = skillProgress?.status === "completed";

    // Helper: Is this module unlocked?
    const isModuleUnlocked = (moduleIndex) => {
      if (moduleIndex === 0) return true; // First module always unlocked

      const previousModuleId = currentSkill.modules[moduleIndex - 1]._id;

      const prevModuleProgress = skillProgress?.modulesProgress?.find(
        m => m.moduleId.toString() === previousModuleId.toString()
      );

      return prevModuleProgress?.status === "completed";
    };

    return (
      <div className="skill-detail-page">
        <div className="skill-detail-wrapper">
          <Link to="/skills" className="back-link">
            ← Back to Skills
          </Link>

          <div className="skill-detail-layout">
            {/* Left Sidebar - Modules Navigation */}
            <aside className="modules-sidebar">
              <h3 className="sidebar-title">Course Modules</h3>
              <nav className="modules-nav">
                {currentSkill.modules.map((module, index) => {
                  const unlocked = isModuleUnlocked(index);
                  const currentModuleProgress = skillProgress?.modulesProgress?.find(
                    m => m.moduleId.toString() === module._id.toString()
                  );
                  const moduleCompleted = currentModuleProgress?.status === "completed";

                  return (
                    <div key={module._id} className={`nav-module-item ${!unlocked ? 'locked' : ''}`}>
                      <div className="nav-module-header">
                        <span className="nav-module-number">Module {index + 1}</span>
                        {!unlocked && <span className="lock-icon">🔒</span>}
                        {moduleCompleted && <span className="check-icon">✅</span>}
                      </div>
                      <div className="nav-module-title">{module.title}</div>
                    </div>
                  );
                })}
              </nav>
            </aside>

            {/* Right Content Area */}
            <main className="skill-main-content">
              <div className="skill-detail-header">
                <h1 className="skill-detail-title">{currentSkill.name}</h1>
                <p className="skill-detail-description">{currentSkill.description}</p>
                <div className="skill-detail-meta">
                  <span className="meta-item">⏱ {currentSkill.estimatedHours}h</span>
                  <span className="meta-divider">•</span>
                  <span className="meta-item">📊 {currentSkill.level}</span>
                </div>
              </div>

              {/* Start Skill Button */}
              {!isStarted && user && (
                <div className="start-skill-section">
                  <button
                    onClick={() => startSkill(currentSkill._id)}
                    className="start-skill-btn"
                  >
                    Start This Skill Now
                  </button>
                </div>
              )}

              {/* Completed Badge */}
              {isCompleted && (
                <div className="completed-badge">
                  <span className="badge-icon">🏆</span>
                  Completed! Certificate Earned
                </div>
              )}

              {/* Modules Cards */}
              <div className="modules-cards-section">
                {currentSkill.modules.map((module, index) => {
                  const lessonCount = module.lessons?.length || 0;
                  const unlocked = isModuleUnlocked(index);

                  const currentModuleProgress = skillProgress?.modulesProgress?.find(
                    m => m.moduleId.toString() === module._id.toString()
                  );
                  const moduleCompleted = currentModuleProgress?.status === "completed";

                  return (
                    <div key={module._id} className="module-card">
                      <div className="module-header">
                        <span className="module-number">Module {index + 1}</span>
                        <span className="module-type">{module.type}</span>
                        {!unlocked && <span className="module-lock">🔒</span>}
                        {moduleCompleted && <span className="module-check">✅</span>}
                      </div>

                      <h3 className="module-title">{module.title}</h3>
                      <p className="module-description">{module.description}</p>

                      <div className="module-stats">
                        <div className="stat-box">
                          <span className="stat-icon">⏱</span>
                          <span className="stat-value">{(module.estimatedTime / 60).toFixed(1)}h</span>
                          <span className="stat-label">Duration</span>
                        </div>
                        <div className="stat-box">
                          <span className="stat-icon">📝</span>
                          <span className="stat-value">{lessonCount}</span>
                          <span className="stat-label">Lessons</span>
                        </div>
                        <div className="stat-box">
                          <span className="stat-icon">📊</span>
                          <span className="stat-value">{module.type}</span>
                          <span className="stat-label">Type</span>
                        </div>
                      </div>

                      {/* Button / Link */}
                      {unlocked ? (
                        <Link
                          to={`/skills/${currentSkill._id}/module/${module._id}`}
                          className="module-btn"
                        >
                          {moduleCompleted ? "Review Module" : isStarted ? "Continue Module" : "Start Module"} ({lessonCount} lessons)
                        </Link>
                      ) : (
                        <button className="module-btn locked" disabled>
                          🔒 Complete Previous Module First
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return null;
}