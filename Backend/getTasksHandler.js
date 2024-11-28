import { pool } from "./server.js";

export async function getTasksHandler(req, res) {
  try {
    const username = req.params.username;

    if (!username) {
      res.status(400).json({ error: "Username not provided" });
      return;
    }

    const [results, fields] = await pool
      .promise()
      .query(
        "SELECT id, username, title, task, status FROM todoTasks WHERE username = ?",
        [username]
      );
    res.json(results);
  } catch (err) {
    console.error("Error fetching todo tasks:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
