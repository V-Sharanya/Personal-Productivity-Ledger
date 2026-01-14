const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const Database = require("better-sqlite3")
const path = require("path")

const app = express()
const PORT = 5000

app.use(cors())
app.use(bodyParser.json())

const db = new Database(path.join(__dirname, "..", "productivity.db"))

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS daily_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    summary TEXT,
    tasks_completed INTEGER DEFAULT 0,
    mood TEXT,
    energy_level INTEGER,
    focus_rating INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, date)
  );

  CREATE TABLE IF NOT EXISTS weekly_reflections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    highlights TEXT,
    challenges TEXT,
    lessons_learned TEXT,
    next_week_goals TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    category TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`)

const sessions = {}

app.post("/api/auth/register", (req, res) => {
  const { username, email, password } = req.body
  try {
    const stmt = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)")
    const result = stmt.run(username, email, password)
    const userId = result.lastInsertRowid
    sessions[userId] = { username, email }
    res.json({ success: true, user_id: userId, username })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body
  const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password)
  if (user) {
    sessions[user.id] = { username: user.username, email: user.email }
    res.json({ success: true, user_id: user.id, username: user.username })
  } else {
    res.status(401).json({ error: "Invalid credentials" })
  }
})

app.post("/api/logs", (req, res) => {
  const { user_id, date, summary, tasks_completed, mood, energy_level, focus_rating, notes } = req.body
  try {
    const stmt = db.prepare(`
      INSERT INTO daily_logs (user_id, date, summary, tasks_completed, mood, energy_level, focus_rating, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const result = stmt.run(user_id, date, summary, tasks_completed, mood, energy_level, focus_rating, notes)
    res.json({ success: true, id: result.lastInsertRowid })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.get("/api/logs/:userId", (req, res) => {
  const { userId } = req.params
  const logs = db.prepare("SELECT * FROM daily_logs WHERE user_id = ? ORDER BY date DESC").all(userId)
  res.json(logs)
})

app.get("/api/logs/:userId/:date", (req, res) => {
  const { userId, date } = req.params
  const log = db.prepare("SELECT * FROM daily_logs WHERE user_id = ? AND date = ?").get(userId, date)
  res.json(log || {})
})

app.put("/api/logs/:id", (req, res) => {
  const { id } = req.params
  const { summary, tasks_completed, mood, energy_level, focus_rating, notes } = req.body
  try {
    const stmt = db.prepare(`
      UPDATE daily_logs SET summary = ?, tasks_completed = ?, mood = ?, energy_level = ?, focus_rating = ?, notes = ?
      WHERE id = ?
    `)
    stmt.run(summary, tasks_completed, mood, energy_level, focus_rating, notes, id)
    res.json({ success: true })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.post("/api/reflections", (req, res) => {
  const { user_id, week_start_date, week_end_date, highlights, challenges, lessons_learned, next_week_goals } = req.body
  try {
    const stmt = db.prepare(`
      INSERT INTO weekly_reflections (user_id, week_start_date, week_end_date, highlights, challenges, lessons_learned, next_week_goals)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    const result = stmt.run(
      user_id,
      week_start_date,
      week_end_date,
      highlights,
      challenges,
      lessons_learned,
      next_week_goals,
    )
    res.json({ success: true, id: result.lastInsertRowid })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.get("/api/reflections/:userId", (req, res) => {
  const { userId } = req.params
  const reflections = db
    .prepare("SELECT * FROM weekly_reflections WHERE user_id = ? ORDER BY week_start_date DESC")
    .all(userId)
  res.json(reflections)
})

app.post("/api/goals", (req, res) => {
  const { user_id, title, category } = req.body
  try {
    const stmt = db.prepare("INSERT INTO goals (user_id, title, category) VALUES (?, ?, ?)")
    const result = stmt.run(user_id, title, category)
    res.json({ success: true, id: result.lastInsertRowid })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.get("/api/goals/:userId", (req, res) => {
  const { userId } = req.params
  const goals = db
    .prepare("SELECT * FROM goals WHERE user_id = ? AND status = ? ORDER BY created_at DESC")
    .all(userId, "active")
  res.json(goals)
})

app.put("/api/goals/:id", (req, res) => {
  const { id } = req.params
  const { status } = req.body
  try {
    const stmt = db.prepare("UPDATE goals SET status = ? WHERE id = ?")
    stmt.run(status, id)
    res.json({ success: true })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
