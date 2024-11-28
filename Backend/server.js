import mysql from "mysql2";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";
import { dbConfig } from "./dbConfig.js";
import { loginHandler } from "./loginHandler.js";
import { signupHandler } from "./signupHandler.js";
import { addTaskHandler } from "./addTaskHandler.js";
import { getTasksHandler } from "./getTasksHandler.js";
import { deleteTaskHandler } from "./deleteTaskHandler.js";
import { editTaskHandler } from "./editTaskHandler.js";
import { updateTaskStatusHandler } from "./updateTaskStatusHandler.js";

const app = express();
const port = 3000;

const pool = mysql.createConnection(dbConfig);

pool.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");
});

app.use(cors());
app.use(bodyParser.json());

const authMiddleware = (req, res, next) => {
  let auth = req.headers?.authorization;
  if (auth === "") {
    res.status(401).json({ error: "Unauthorized Acess, Please Login Again" });
    return;
  }
  next();
};

app.post("/login", (req, res) => {
  loginHandler(req, res);
});

app.post("/signup", (req, res) => {
  signupHandler(req, res);
});

app.post("/todo/addTask", authMiddleware, async (req, res) => {
  addTaskHandler(req, res);
});

app.get("/todo/getTodoTasks/:username", authMiddleware, async (req, res) => {
  getTasksHandler(req, res);
});

app.delete("/todo/deleteTask/:id", authMiddleware, async (req, res) => {
  deleteTaskHandler(req, res);
});

app.put("/todo/editTask", authMiddleware, async (req, res) => {
  editTaskHandler(req, res);
});

app.put("/todo/updateTaskStatus", authMiddleware, async (req, res) => {
  updateTaskStatusHandler(req, res);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export { pool };
