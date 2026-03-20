const mongoose = require('mongoose');
require('dotenv').config();

const uri = "mongodb+srv://indhujavs23cse_db_user:lstCyJocWLlwWowS@cluster0.4gxfxzl.mongodb.net/skill-learning-platform?appName=Cluster0";

console.log("Connecting to Atlas...");
mongoose.connect(uri)
    .then(() => {
        console.log("✅ ATLAS Connection SUCCESSFUL!");
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ ATLAS Connection FAILED:", err.message);
        process.exit(1);
    });
