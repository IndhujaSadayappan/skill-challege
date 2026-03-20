"use client"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import { useState, useEffect } from "react"
import "./Home.css"

const Home = () => {
  const { user } = useAuth()
  const [skillCategories, setSkillCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/skills`)
        if (res.data.success) {
          const formatted = res.data.skills.map((skill) => ({
            title: skill.name,
            description: skill.description,
            image: skill.image || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop",
            path: `/skills/${skill._id}`,
            modules: skill.modules?.map((m) => m.title) || [],
            color: skill.color || "#0066FF",
            category: skill.category || "Development",
            rating: skill.rating || 4.8,
            students: skill.students || 1250,
            duration: skill.duration || "8 weeks",
          }))
          setSkillCategories(formatted)
        }
      } catch (err) {
        console.error("Home skills fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchSkills()
  }, [])

  const features = [
    { 
      icon: "🎯", 
      title: "Interactive Learning", 
      description: "Engage with hands-on projects and real-world challenges that build practical skills you can use immediately in your career."
    },
    { 
      icon: "📊", 
      title: "Progress Tracking", 
      description: "Monitor your learning journey with detailed analytics, milestone achievements, and personalized recommendations."
    },
    { 
      icon: "🏆", 
      title: "Industry Certificates", 
      description: "Earn recognized certifications that showcase your expertise to employers and advance your professional growth."
    },
  ]

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              🚀 Join 50,000+ Learners Worldwide
            </div>
            <h1 className="hero-title">
              Master Skills That Matter
            </h1>
            <p className="hero-subtitle">
              Transform your career with interactive challenges, expert-led courses, and hands-on projects. Learn at your own pace, build real-world skills.
            </p>
            <div className="hero-buttons">
              {user ? (
                <Link to="/dashboard" className="btn btn-primary">
                  Continue Learning →
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary">
                    Start Free Trial
                  </Link>
                  <Link to="/login" className="btn btn-secondary">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop"
                alt="Learning Together"
                className="hero-image"
              />
            </div>
            <div className="floating-cards">
              <div className="floating-card">
                <div className="card-icon">💡</div>
                <div className="card-title">Personalized Learning</div>
                <div className="card-text">Personalized path</div>
              </div>
              <div className="floating-card">
                <div className="card-icon">⚡</div>
                <div className="card-title">Quick Results</div>
                <div className="card-text">See progress fast</div>
              </div>
              <div className="floating-card">
                <div className="card-icon">🎓</div>
                <div className="card-title">Certificates</div>
                <div className="card-text">Display your verified skills</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* <section className="skills-section">
        <div className="container">
          <div className="section-header">
            {/* <div className="section-badge">POPULAR SKILLS</div> */}
            {/* <h2 className="section-title">Choose Your Learning Path</h2>
            <p className="section-subtitle">
              Explore our comprehensive collection of courses designed by industry experts. Start building skills that accelerate your career today.
            </p>
          </div> */}

          {/* {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading amazing courses...</p>
            </div>
          ) : skillCategories.length === 0 ? (
            <p className="empty-state">No skills available at the moment. Check back soon!</p>
          ) : (
            <div className="skills-grid">
              {skillCategories.map((skill, index) => (
                <div key={index} className="skill-card">
                  <div className="skill-image-wrapper">
                    <img src={skill.image} alt={skill.title} className="skill-image" />
                  </div>

                  <div className="skill-content">
                    <h3 className="skill-title">{skill.title}</h3>
                    <div className="skill-meta">{skill.duration}</div>
                    <Link to={skill.path} className="btn-skill">
                      <span>Enroll Now</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section> */} 

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">WHY CHOOSE US</div>
            <h2 className="section-title">Learning That Works</h2>
            <p className="section-subtitle">
              Our platform combines cutting-edge technology with proven teaching methods to deliver exceptional learning experiences.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Career?</h2>
            <p className="cta-description">
              Join thousands of successful learners who have already advanced their careers. Start your journey today with our expert-led courses.
            </p>
            {!user && (
              <Link to="/register" className="btn btn-cta">
                Get Started Free →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3 className="footer-logo">SkillChallenge</h3>
              <p className="footer-description">
                Empowering learners worldwide with cutting-edge skills and industry-recognized certifications. Your success is our mission.
              </p>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Platform</h4>
              <ul className="footer-links">
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/courses">All Courses</Link></li>
                <li><Link to="/pricing">Pricing</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Resources</h4>
              <ul className="footer-links">
                <li><Link to="/help">Help Center</Link></li>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/terms">Terms of Service</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Community</h4>
              <div className="social-links">
                <a href="#" className="social-link">🐦 Twitter</a>
                <a href="#" className="social-link">💼 LinkedIn</a>
                <a href="#" className="social-link">📘 Facebook</a>
                <a href="#" className="social-link">📸 Instagram</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2024 SkillChallenge. All rights reserved. Made with ❤️ for learners worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home