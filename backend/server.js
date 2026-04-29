const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const publicRoutes = require("./routes/public");
const client = require("prom-client");

dotenv.config();

const app = express();

// Prometheus Metrics Setup
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom metric for HTTP request duration
const httpRequestDurationMicroseconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "code"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});
register.registerMetric(httpRequestDurationMicroseconds);

const PORT = process.env.PORT || 5000;

// Middleware to track request duration
app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on("finish", () => {
    end({ method: req.method, route: req.url, code: res.statusCode });
  });
  next();
});

app.use(
  cors({
    origin: [process.env.CLIENT_URL || "http://localhost:3000", "http://localhost:3000", "http://13.232.214.235:3000", "http://13.232.214.235"],
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


const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/skill-learning-platform";
console.log(`📡 Connecting to MongoDB at: ${dbUri.split('@').pop()}`); // Log URI without credentials
mongoose
  .connect(dbUri)
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

// Prometheus metrics endpoint
app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
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