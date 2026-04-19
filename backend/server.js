const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const publicRoutes = require("./routes/public");






dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(
  cors({
    origin: ["http://localhost:3000", "http://13.234.18.228:3000"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  "/quiz-data",
  express.static(path.join(__dirname, "../quiz-data"))
);

app.use("/api", publicRoutes);


mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/skill-learning-platform"
  )
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/skills", require("./routes/skills"));
app.use("/api/progress", require("./routes/progress"));
app.use("/api/quiz", require("./routes/quiz"));
app.use("/api/certificates", require("./routes/certificates"));
app.use("/api/leaderboard", require("./routes/leaderboard"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/dashboard", require("./routes/dashboard"));

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
});


app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;