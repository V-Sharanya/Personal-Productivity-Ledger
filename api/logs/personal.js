import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { user_id, date, summary } = req.body;

  await pool.query(
    "INSERT INTO daily_logs (user_id, date, summary) VALUES (?, ?, ?)",
    [user_id, date, summary]
  );

  res.json({ success: true });
}
