import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import Database from "better-sqlite3"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 5000

// Middleware
app.use(cors())
app.use(bodyParser.json())

const db = new Database(path.join(__dirname, "ledger.db"))

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS daily_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE UNIQUE NOT NULL,
    entries TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS weekly_reflections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    highlights TEXT,
    challenges TEXT,
    lessons TEXT,
    next_week TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(week_start, week_end)
  );
`)

app.get("/api/logs/personal", (req, res) => {
  try {
    const logs = db.prepare("SELECT * FROM daily_logs ORDER BY date DESC").all()
    const parsed = logs.map((log) => ({
      ...log,
      entries: JSON.parse(log.entries),
    }))
    res.json(parsed)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.post("/api/logs/personal", (req, res) => {
  try {
    const { date, entries } = req.body
    const entriesJson = JSON.stringify(entries)

    const stmt = db.prepare(`
      INSERT INTO daily_logs (date, entries) VALUES (?, ?)
      ON CONFLICT(date) DO UPDATE SET entries = ?
    `)
    const result = stmt.run(date, entriesJson, entriesJson)

    res.json({
      id: result.lastInsertRowid,
      date,
      entries,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.put("/api/logs/personal", (req, res) => {
  try {
    const { date, entries } = req.body
    const entriesJson = JSON.stringify(entries)

    const stmt = db.prepare("UPDATE daily_logs SET entries = ? WHERE date = ?")
    stmt.run(entriesJson, date)

    res.json({
      date,
      entries,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.get("/api/reflections/personal", (req, res) => {
  try {
    const reflections = db.prepare("SELECT * FROM weekly_reflections ORDER BY week_start DESC").all()
    res.json(reflections)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.post("/api/reflections/personal", (req, res) => {
  try {
    const { weekStart, weekEnd, highlights, challenges, lessons, nextWeek } = req.body

    const stmt = db.prepare(`
      INSERT INTO weekly_reflections (week_start, week_end, highlights, challenges, lessons, next_week)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    const result = stmt.run(weekStart, weekEnd, highlights, challenges, lessons, nextWeek)

    res.json({
      id: result.lastInsertRowid,
      weekStart,
      weekEnd,
      highlights,
      challenges,
      lessons,
      nextWeek,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})

app.listen(PORT, () => {
  console.log(`[v0] Server running on http://localhost:${PORT}`)
})
