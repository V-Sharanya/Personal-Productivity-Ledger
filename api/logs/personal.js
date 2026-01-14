export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { date, category, hours, note } = req.body;

    // TEMP: log to console to verify
    console.log({ date, category, hours, note });

    // Later: insert into MySQL here

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to save log" });
  }
}
