const bodyParser = require("body-parser");
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { spawn } = require("child_process");
const fs = require("fs");
// const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const { getNews } = require("./news");
// const authRoutes = require("./routes/auth");
// const jwt = require("jsonwebtoken");
// Reports persistence disabled for simplified backend
// const Report = require("./models/Report");
// const User = require('./models/User');

dotenv.config();

const app = express();
// Configure CORS (public, no credentials)
app.use(cors({
  origin: '*',
  methods: ['GET','POST','DELETE','PUT','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Accept','Authorization','X-Requested-With','Origin']
}));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));

// Friendly root and health endpoints
app.get("/", (req, res) => {
    res.type("text").send("UF XRAY API is running. See /healthz for status.");
});

app.get("/healthz", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

const PYTHON_BIN = process.env.PYTHON_BIN || "python"; // allow overriding python executable

const upload = multer({ dest: "uploads/" });

// Authentication removed; endpoints are public in simplified backend

// Auth middleware removed in simplified backend


// URL Scan Endpoint
app.post("/api/scan-url", async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ message: "URL is required" });
    }

    if (!isValidUrl(url)) {
        return res.status(400).json({ error: "Invalid URL format" });
    }

    const pythonProcess = spawn(PYTHON_BIN, [
        path.join(__dirname, "url_scanner_enhanced.py"),
        url,
    ]);

    let scriptOutput = "";
    let scriptError = "";

    pythonProcess.stdout.on("data", (data) => {
        scriptOutput += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
        scriptError += data.toString();
    });

    pythonProcess.on("close", async (code) => {
        if (code === 0) {
            try {
                const scanResult = JSON.parse(scriptOutput);
                // Skipping DB save in simplified backend
                res.json(scanResult);
            } catch (parseError) {
                console.error("Error parsing Python script output:", parseError);
                console.error("Raw stdout:", scriptOutput);
                console.error("stderr:", scriptError);
                res.status(500).json({ message: "Error processing scan results", details: scriptOutput });
            }
        } else {
            console.error(`Python script exited with code ${code}`);
            console.error("stderr:", scriptError);
            res.status(500).json({ message: "URL scan failed", details: scriptError });
        }
    });
});


// File Scan Endpoint
app.post("/api/scan-file", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const filename = req.file.originalname;

    const pythonProcess = spawn(PYTHON_BIN, [
        path.join(__dirname, "scanner.py"),
        filePath,
        filename,
    ]);

    let scriptOutput = "";
    let scriptError = "";

    pythonProcess.stdout.on("data", (data) => {
        scriptOutput += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
        scriptError += data.toString();
    });

    pythonProcess.on("close", async (code) => {
        // Clean up the uploaded file
        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error("Error deleting temporary file:", unlinkErr);
        });

        if (code === 0) {
            try {
                const scanResult = JSON.parse(scriptOutput);
                // Skipping DB save in simplified backend
                res.json(scanResult);
            } catch (parseError) {
                console.error("Error parsing Python script output:", parseError);
                console.error("Raw stdout:", scriptOutput);
                console.error("stderr:", scriptError);
                res.status(500).json({ message: "Error processing scan results", details: scriptOutput });
            }
        } else {
            console.error(`Python script exited with code ${code}`);
            console.error("stderr:", scriptError);
            res.status(500).json({ message: "File scan failed", details: scriptError });
        }
    });
});


// Log Scan Endpoint (accepts uploaded file or raw text)
app.post("/api/scan-log", upload.single("file"), async (req, res) => {
    let tempCreated = false;
    let filePath = req?.file?.path;
    let cleanupPath = null;

    try {
        if (!filePath) {
            const text = (req.body && req.body.text) ? String(req.body.text) : "";
            if (!text.trim()) {
                return res.status(400).json({ message: "Provide a log file or non-empty 'text' field" });
            }
            // Write text to a temporary file
            const tmpName = `log_${Date.now()}.txt`;
            filePath = path.join(__dirname, 'uploads', tmpName);
            await fs.promises.mkdir(path.dirname(filePath), { recursive: true }).catch(() => {});
            await fs.promises.writeFile(filePath, text, 'utf8');
            tempCreated = true;
            cleanupPath = filePath;
        }

        let scriptOutput = "";
        let scriptError = "";
        const pythonProcess = spawn(PYTHON_BIN, [
            path.join(__dirname, "log_analyzer.py"),
            filePath,
        ]);

        pythonProcess.stdout.on("data", (data) => {
            scriptOutput += data.toString();
        });

        pythonProcess.stderr.on("data", (data) => {
            scriptError += data.toString();
        });

        pythonProcess.on("close", async (code) => {
            // Clean up the uploaded or temp file if needed
            const toDelete = cleanupPath || (req?.file?.path || null);
            if (toDelete) {
                fs.unlink(toDelete, (unlinkErr) => {
                    if (unlinkErr) console.error("Error deleting temporary file:", unlinkErr);
                });
            }

            if (code === 0) {
                try {
                    const scanResult = JSON.parse(scriptOutput);
                    return res.json(scanResult);
                } catch (parseError) {
                    console.error("Error parsing Python script output:", parseError);
                    console.error("Raw stdout:", scriptOutput);
                    console.error("stderr:", scriptError);
                    return res.status(500).json({ message: "Error processing scan results", details: scriptOutput });
                }
            } else {
                console.error(`Python script exited with code ${code}`);
                console.error("stderr:", scriptError);
                return res.status(500).json({ message: "Log scan failed", details: scriptError });
            }
        });
    } catch (err) {
        if (tempCreated && cleanupPath) {
            try { await fs.promises.unlink(cleanupPath); } catch (_) {}
        }
        console.error("Unexpected error in /api/scan-log:", err);
        return res.status(500).json({ message: "Unexpected error", details: String(err) });
    }
});


// News feed (cached server-side, refresh ~4h)
app.get("/api/news", async (req, res) => {
    try {
        const limitRaw = req.query.limit || '12';
        const limit = Math.max(1, Math.min(parseInt(limitRaw, 10) || 12, 50));
        const items = await getNews(limit);
        return res.json({ items });
    } catch (e) {
        console.error("/api/news error:", e);
        return res.status(500).json({ message: "Failed to fetch news" });
    }
});


// Reports API removed in simplified backend

// Legacy scan endpoint removed. Use /api/scan-url or /api/scan-file

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (err) {
        return false;
    }
}

