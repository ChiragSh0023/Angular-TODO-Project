import { pool } from "./server.js";

export async function updateTaskStatusHandler(req, res) {
  try {
    const { id, status } = req.body;

    const [results, fields] = await pool
      .promise()
      .query("UPDATE todoTasks SET status = ? WHERE id = ?", [status, id]);
    console.log("Task status updated successfully");
    res.json({ message: "Task status updated successfully" });
  } catch (err) {
    console.error("Error updating task status:", err);
    res.status(500).json({ error: "Failed to update task status" });
  }
}
