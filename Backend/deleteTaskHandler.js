import { pool } from "./server.js";

export async function deleteTaskHandler(req, res) {
  try {
    const taskId = req.params.id;
    const [results, fields] = await pool
      .promise()
      .query("DELETE FROM todoTasks WHERE id = ?", [taskId]);
    console.log("Task deleted successfully");
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: "Failed to delete task" });
  }
}
