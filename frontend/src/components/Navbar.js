"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import "./Navbar.css"

const Navbar = () => {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [isSkillsOpen, setIsSkillsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [skills, setSkills] = useState([])
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Fetch skills dynamically from backend
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/skills`)
        if (res.data.success) {
          setSkills(res.data.skills)
        }
      } catch (err) {
        console.error("❌ Failed to fetch skills:", err.message)
      }
    }
    fetchSkills()
  }, [])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
    navigate("/")
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
    setIsSkillsOpen(false)
    setIsUserMenuOpen(false)
  }

  return (
    <nav className={`navbar ${isDark ? "navbar-dark" : "navbar-light"} ${scrolled ? "scrolled" : ""}`}>
      <div className="container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="logo" onClick={closeMobileMenu}>
            SkillChallenge
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className={`mobile-menu-btn ${mobileMenuOpen ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Navigation Links */}
          <ul className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
            <li>
              <Link to="/" className="nav-link" onClick={closeMobileMenu}>
                Home
              </Link>
            </li>

            {/* Skills Dropdown */}
            <li
              className="dropdown"
              onMouseEnter={() => !mobileMenuOpen && setIsSkillsOpen(true)}
              onMouseLeave={() => !mobileMenuOpen && setIsSkillsOpen(false)}
            >
              <span 
                className="nav-link"
                onClick={() => mobileMenuOpen && setIsSkillsOpen(!isSkillsOpen)}
              >
                Skills ▾
              </span>
              {(isSkillsOpen || mobileMenuOpen) && (
                <div className="dropdown-content">
                  {skills.length > 0 ? (
                    skills.map(skill => (
                      <div key={skill._id}>
                        <Link
                          to={`/skills/${skill._id}`}
                          className="dropdown-item"
                          onClick={closeMobileMenu}
                        >
                          {skill.icon ? `${skill.icon} ` : "📚 "}
                          {skill.name}
                        </Link>
                      </div>
                    ))
                  ) : (
                    <span className="dropdown-item">
                      No skills available
                    </span>
                  )}
                </div>
              )}
            </li>

            <li>
              <Link to="/about" className="nav-link" onClick={closeMobileMenu}>
                About
              </Link>
            </li>

            {/* User Section */}
            {user ? (
              <>
                {user.role === "admin" ? (
                  <li>
                    <Link to="/admin" className="nav-link" onClick={closeMobileMenu}>
                      Admin Dashboard
                    </Link>
                  </li>
                ) : (
                  <li>
                    <Link to="/dashboard" className="nav-link" onClick={closeMobileMenu}>
                      My Dashboard
                    </Link>
                  </li>
                )}

                <li
                  className="dropdown"
                  onMouseEnter={() => !mobileMenuOpen && setIsUserMenuOpen(true)}
                  onMouseLeave={() => !mobileMenuOpen && setIsUserMenuOpen(false)}
                >
                  <span 
                    className="nav-link"
                    onClick={() => mobileMenuOpen && setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    👤 {user.username} ▾
                  </span>
                  {(isUserMenuOpen || mobileMenuOpen) && (
                    <div className="dropdown-content">
                      <Link
                        to="/dashboard"
                        className="dropdown-item"
                        onClick={closeMobileMenu}
                      >
                        📊 My Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="dropdown-item"
                        onClick={closeMobileMenu}
                      >
                        ⚙️ Settings
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="dropdown-item"
                        style={{
                          background: "none",
                          border: "none",
                          width: "100%",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="nav-link" onClick={closeMobileMenu}>
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="btn btn-primary" onClick={closeMobileMenu}>
                    Get Started
                  </Link>
                </li>
              </>
            )}

            {/* Theme Toggle */}
            <li>
              <button
                type="button"
                onClick={toggleTheme}
                className="theme-toggle"
                title={`Switch to ${isDark ? "light" : "dark"} mode`}
              >
                {isDark ? "☀️" : "🌙"}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar