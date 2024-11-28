import { pool } from "./server.js";

export async function addTaskHandler(req, res) {
  try {
    const { username, title, task } = req.body;

    if (!username || !title || !task) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const [results, fields] = await pool
      .promise()
      .query(
        "INSERT INTO todoTasks (username, title, task, status) VALUES (?, ?, ?, ?)",
        [username, title, task, false]
      );
    console.log("Task added successfully");
    res.json({ message: "Task added successfully" });
  } catch (err) {
    console.error("Error inserting task:", err);
    res.status(500).json({ error: "Failed to add task" });
  }
}
