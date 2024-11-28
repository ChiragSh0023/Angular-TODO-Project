import { pool } from "./server.js";

export async function editTaskHandler(req, res) {
  try {
    const { title, task, id } = req.body;

    const [results, fields] = await pool
      .promise()
      .query("UPDATE todoTasks SET title = ?, task = ? WHERE id = ?", [
        title,
        task,
        id,
      ]);
    console.log("Task Edited successfully");
    res.json({ message: "Task Edited successfully" });
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ error: "Failed to update task" });
  }
}
