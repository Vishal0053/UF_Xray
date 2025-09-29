const bodyParser = require("body-parser");
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { spawn } = require("child_process");
const fs = require("fs");
// const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const rateLimit = require('express-rate-limit');
const { getNews } = require("./news");
// const authRoutes = require("./routes/auth");
// const jwt = require("jsonwebtoken");
// Reports persistence disabled for simplified backend
// const Report = require("./models/Report");
// const User = require('./models/User');

dotenv.config();

const app = express();
const FALLBACK_SVG = (
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'>`+
  `<rect width='800' height='450' fill='rgb(15,23,42)'/>`+
  `<rect x='340' y='170' rx='12' ry='12' width='120' height='100' fill='rgba(96,165,250,0.15)' stroke='rgb(96,165,250)' stroke-width='8'/>`+
  `<path d='M360 170 v-20 a40 40 0 0 1 80 0 v20' fill='none' stroke='rgb(147,197,253)' stroke-width='8'/>`+
  `<text x='400' y='320' font-size='28' fill='rgb(203,213,225)' text-anchor='middle' font-family='Segoe UI,Roboto,Arial,sans-serif'>Cyber Security</text>`+
  `</svg>`
);
function sendFallback(res) {
  if (!res.headersSent) {
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send(FALLBACK_SVG);
  }
}
// Basic rate limiter to protect upstream AI API and server
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: parseInt(process.env.CHAT_RATE_LIMIT || '30', 10), // 30 req/min by default
  standardHeaders: true,
  legacyHeaders: false,
});
// Ensure global fetch is available (Node < 18 fallback)
async function ensureFetch() {
  if (typeof fetch === 'undefined') {
    const mod = await import('node-fetch');
    global.fetch = mod.default;
  }
}
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

// Simple image proxy to avoid mixed-content (http) issues on HTTPS sites
app.get('/api/news-image', (req, res) => {
    try {
        const src = req.query.src;
        if (!src || typeof src !== 'string') {
            return res.status(400).send('src query param required');
        }
        let start;
        try { start = new URL(src); } catch { return sendFallback(res); }
        if (start.protocol !== 'http:' && start.protocol !== 'https:') {
            return sendFallback(res);
        }

        const visited = new Set();
        const MAX_REDIRECTS = 5;

        const fetchAndPipe = (target, redirectsLeft) => {
            const client = target.protocol === 'http:' ? require('http') : require('https');
            const request = client.get(target.toString(), {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
                    'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
                    'Referer': target.origin
                },
                timeout: 10000,
            }, (r) => {
                // Follow redirects server-side
                if (r.statusCode && r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
                    if (redirectsLeft <= 0) return sendFallback(res);
                    let nextUrl;
                    try { nextUrl = new URL(r.headers.location, target); } catch { return sendFallback(res); }
                    const key = nextUrl.toString();
                    if (visited.has(key)) return res.status(508).send('redirect loop');
                    visited.add(key);
                    r.resume(); // discard data
                    return fetchAndPipe(nextUrl, redirectsLeft - 1);
                }
                if (r.statusCode && r.statusCode >= 400) {
                    return sendFallback(res);
                }
                res.setHeader('Cache-Control', 'public, max-age=86400');
                const ct = r.headers['content-type'] || '';
                if (!ct.toLowerCase().startsWith('image/')) {
                    r.resume(); // discard non-image
                    return sendFallback(res);
                }
                res.setHeader('Content-Type', ct);
                r.on('error', () => res.status(502).end());
                r.pipe(res);
            });

            request.on('timeout', () => {
                request.destroy();
                sendFallback(res);
            });
            request.on('error', () => {
                sendFallback(res);
            });
        };

        fetchAndPipe(start, MAX_REDIRECTS);
    } catch (e) {
        res.status(500).send('proxy error');
    }
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
        const nocache = String(req.query.nocache || '').toLowerCase();
        const items = await getNews(limit, { nocache: nocache === '1' || nocache === 'true' });
        return res.json({ items });
    } catch (e) {
        console.error("/api/news error:", e);
        return res.status(500).json({ message: "Failed to fetch news" });
    }
});


// Reports API removed in simplified backend

// Legacy scan endpoint removed. Use /api/scan-url or /api/scan-file

// Chatbot endpoint for cybersecurity Q&A
app.post('/api/chat', chatLimiter, async (req, res) => {
    try {
        await ensureFetch();
        const { message, history } = req.body || {};
        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({ message: "'message' is required" });
        }

        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        if (!OPENAI_API_KEY) {
            return res.status(500).json({ message: "Server not configured with OPENAI_API_KEY" });
        }

        const systemPrompt = [
            "You are 'UF XRay Assistant', a helpful cybersecurity expert.",
            "Answer clearly and concisely, focusing on practical security guidance.",
            "You can explain concepts like malware, phishing, network security, SIEM, log analysis, incident response, and secure coding.",
            "Be safe and ethical. Do NOT provide instructions that facilitate wrongdoing (e.g., exploiting systems).",
            "If the user asks for something unsafe, refuse and provide safer alternatives like defensive best practices.",
        ].join(' ');

        const chatHistory = Array.isArray(history) ? history.slice(-10) : [];
        const messages = [
            { role: 'system', content: systemPrompt },
            ...chatHistory,
            { role: 'user', content: String(message) }
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                messages,
                temperature: 0.2,
                max_tokens: 800
            })
        });

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            console.error('/api/chat upstream error:', response.status, text);
            return res.status(502).json({ message: 'AI provider error', details: text });
        }
        const data = await response.json();
        const answer = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content)
            ? data.choices[0].message.content.trim()
            : "Sorry, I couldn't generate a response.";

        return res.json({ answer });
    } catch (err) {
        console.error('/api/chat error:', err);
        return res.status(500).json({ message: 'Unexpected error', details: String(err) });
    }
});

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

