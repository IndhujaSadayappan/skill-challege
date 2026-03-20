const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Helper: determine cookie options
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // true only in prod (HTTPS)
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // lax in dev
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// ----------------- REGISTER -----------------
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, firstName = "", lastName = "", role = "student" } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "Username, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email or username already exists" });
    }

    // Validate role
    const validRoles = ["admin", "student", "instructor"];
    const assignedRole = validRoles.includes(role) ? role : "student";

    // Create user
    const user = new User({ username, email, password, firstName, lastName, role: assignedRole });
    await user.save();

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" });

    // Set cookie
    res.cookie("authToken", token, getCookieOptions());

    // Return user info
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        stats: user.stats,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
});

// ----------------- LOGIN -----------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    user.updateActivity();
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" });

    // Set cookie
    res.cookie("authToken", token, getCookieOptions());

    // Return user info
    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        stats: user.stats,
        preferences: user.preferences,
        badges: user.badges,
        achievements: user.achievements,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

// ----------------- VERIFY TOKEN -----------------
router.get("/verify", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        stats: user.stats,
        preferences: user.preferences,
        badges: user.badges,
        achievements: user.achievements,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ success: false, message: "Server error during token verification" });
  }
});

// ----------------- LOGOUT -----------------
router.post("/logout", auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { "stats.lastActivity": new Date() });

    // Clear cookie
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Server error during logout" });
  }
});

module.exports = router;
