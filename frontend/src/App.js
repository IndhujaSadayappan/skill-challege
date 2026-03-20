"use client"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import "./styles/globals.css"


import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import About from "./pages/About"
import Skills from "./pages/Skills"
import UserDashboard from "./pages/UserDashboard"
import AdminDashboard from "./pages/AdminDashboard"
import SkillModule from "./pages/SkillModule"
import SkillDetails from "./pages/SkillDetails";





import { AuthProvider, useAuth } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import { CoursesProvider } from "./context/CoursesContext"


const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" />
  }

  return children
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CoursesProvider>
          <Router>
            <div className="App">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/skills" element={<Skills />} />
                  <Route path="/skills/:domain" element={<Skills />} />
                  
                  <Route path="/skills/:skillId/modules" element={<SkillDetails />} />
                  <Route path="/skills/:skillId/module/:moduleId" element={<SkillModule />} />



                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <UserDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>
            </div>
          </Router>
        </CoursesProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
