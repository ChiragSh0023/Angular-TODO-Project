import { pool } from "./server.js";
import { v4 as uuidv4 } from "uuid";

export async function loginHandler(req, res) {
  try {
    const { username, password } = req.body;
    const [results, fields] = await pool
      .promise()
      .query("SELECT name, username, password FROM users WHERE username = ?", [
        username,
      ]);

    // User is not registered
    if (results.length === 0) {
      res.status(401).json({ error: "Username not found, Please Signup!" });
      return;
    }

    const decodedPassword = Buffer.from(
      results[0].password,
      "base64"
    ).toString();

    // Password is incorrect corresponging
    if (password !== decodedPassword) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }

    // Generate a session ID using uuidv4
    const sessionId = uuidv4();

    const name = results[0].name;
    const user = results[0].username;
    console.log(`Login Successfull: ${user}`);
    res.json({
      message: "Login successful",
      nameOfUser: name,
      usernameOfUser: user,
      sessionId: sessionId,
    });
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
