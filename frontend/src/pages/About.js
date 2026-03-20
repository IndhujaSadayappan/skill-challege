const About = () => {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Platform Director",
      image: "/professional-woman-smiling.png",
      description: "Leading educational technology with 10+ years experience",
    },
    {
      name: "Michael Chen",
      role: "Lead Developer",
      image: "/professional-man-developer.png",
      description: "Full-stack expert passionate about interactive learning",
    },
    {
      name: "Emily Rodriguez",
      role: "Content Strategist",
      image: "/professional-woman-teacher.png",
      description: "Curriculum designer focused on practical skill development",
    },
  ]

  const values = [
    {
      title: "Quality Education",
      description:
        "We believe in providing high-quality, practical education that prepares learners for real-world challenges.",
      icon: "🎓",
    },
    {
      title: "Accessibility",
      description: "Learning should be accessible to everyone, regardless of background or experience level.",
      icon: "🌍",
    },
    {
      title: "Innovation",
      description: "We continuously innovate our platform to provide the best learning experience possible.",
      icon: "💡",
    },
    {
      title: "Community",
      description: "Building a supportive community where learners can grow together and help each other succeed.",
      icon: "🤝",
    },
  ]

  return (
    <div className="about-page" style={{ paddingTop: "2rem" }}>
      {/* Hero Section */}
      <section style={{ padding: "3rem 0", textAlign: "center" }}>
        <div className="container">
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              marginBottom: "1rem",
              color: "var(--primary)",
            }}
          >
            About SkillMaster
          </h1>
          <p
            style={{
              fontSize: "1.25rem",
              color: "var(--muted-foreground)",
              maxWidth: "800px",
              margin: "0 auto",
              lineHeight: "1.6",
            }}
          >
            We're on a mission to democratize skill development through interactive, practical learning experiences that
            prepare you for success in the modern workplace.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section style={{ padding: "3rem 0", background: "var(--muted)" }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "3rem",
              alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "2.5rem",
                  marginBottom: "1.5rem",
                  color: "var(--primary)",
                }}
              >
                Our Mission
              </h2>
              <p
                style={{
                  fontSize: "1.1rem",
                  lineHeight: "1.7",
                  color: "var(--foreground)",
                  marginBottom: "1.5rem",
                }}
              >
                At SkillMaster, we believe that everyone deserves access to quality education that's both engaging and
                practical. Our platform combines cutting-edge technology with proven educational methodologies to create
                an immersive learning experience.
              </p>
              <p
                style={{
                  fontSize: "1.1rem",
                  lineHeight: "1.7",
                  color: "var(--foreground)",
                }}
              >
                Whether you're a student preparing for your career, a professional looking to upskill, or someone
                exploring new interests, we provide the tools and support you need to achieve your goals.
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <img
                src="/team-collaboration-learning-technology.jpg"
                alt="Our Mission"
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  borderRadius: "var(--radius)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section style={{ padding: "4rem 0" }}>
        <div className="container">
          <h2
            style={{
              textAlign: "center",
              fontSize: "2.5rem",
              marginBottom: "3rem",
              color: "var(--primary)",
            }}
          >
            Our Values
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "2rem",
            }}
          >
            {values.map((value, index) => (
              <div key={index} className="card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{value.icon}</div>
                <h3
                  style={{
                    fontSize: "1.5rem",
                    marginBottom: "1rem",
                    color: "var(--primary)",
                  }}
                >
                  {value.title}
                </h3>
                <p
                  style={{
                    color: "var(--muted-foreground)",
                    lineHeight: "1.6",
                  }}
                >
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section style={{ padding: "4rem 0", background: "var(--muted)" }}>
        <div className="container">
          <h2
            style={{
              textAlign: "center",
              fontSize: "2.5rem",
              marginBottom: "1rem",
              color: "var(--primary)",
            }}
          >
            Meet Our Team
          </h2>
          <p
            style={{
              textAlign: "center",
              fontSize: "1.1rem",
              marginBottom: "3rem",
              color: "var(--muted-foreground)",
              maxWidth: "600px",
              margin: "0 auto 3rem auto",
            }}
          >
            Our diverse team of educators, developers, and designers work together to create the best learning
            experience for you.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "2rem",
            }}
          >
            {teamMembers.map((member, index) => (
              <div key={index} className="card" style={{ textAlign: "center" }}>
                <img
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    margin: "0 auto 1rem auto",
                    border: "4px solid var(--primary)",
                  }}
                />
                <h3
                  style={{
                    fontSize: "1.5rem",
                    marginBottom: "0.5rem",
                    color: "var(--primary)",
                  }}
                >
                  {member.name}
                </h3>
                <p
                  style={{
                    color: "var(--secondary)",
                    fontWeight: "600",
                    marginBottom: "1rem",
                  }}
                >
                  {member.role}
                </p>
                <p
                  style={{
                    color: "var(--muted-foreground)",
                    lineHeight: "1.6",
                  }}
                >
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section style={{ padding: "4rem 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
            <h2
              style={{
                fontSize: "2.5rem",
                marginBottom: "1rem",
                color: "var(--primary)",
              }}
            >
              Get in Touch
            </h2>
            <p
              style={{
                fontSize: "1.1rem",
                marginBottom: "2rem",
                color: "var(--muted-foreground)",
                lineHeight: "1.6",
              }}
            >
              Have questions about our platform or want to learn more about how we can help you achieve your learning
              goals? We'd love to hear from you!
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "2rem",
                marginBottom: "2rem",
              }}
            >
              <div>
                <h4
                  style={{
                    color: "var(--primary)",
                    marginBottom: "0.5rem",
                    fontSize: "1.1rem",
                  }}
                >
                  Email Us
                </h4>
                <p style={{ color: "var(--muted-foreground)" }}>support@skillmaster.com</p>
              </div>
              <div>
                <h4
                  style={{
                    color: "var(--primary)",
                    marginBottom: "0.5rem",
                    fontSize: "1.1rem",
                  }}
                >
                  Call Us
                </h4>
                <p style={{ color: "var(--muted-foreground)" }}>+1 (555) 123-4567</p>
              </div>
            </div>

            <div
              className="card"
              style={{
                background: "linear-gradient(135deg, var(--primary) 0%, #6C48C5 100%)",
                color: "white",
                textAlign: "center",
              }}
            >
              <h3 style={{ marginBottom: "1rem" }}>Ready to Start Learning?</h3>
              <p style={{ marginBottom: "1.5rem", opacity: 0.9 }}>
                Join our community of learners and start your skill development journey today!
              </p>
              <a
                href="/register"
                className="btn btn-secondary"
                style={{
                  background: "white",
                  color: "var(--primary)",
                  textDecoration: "none",
                }}
              >
                Get Started Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
