import { pool } from "./server.js";

export async function signupHandler(req, res) {
  try {
    const { name, email, username, password } = req.body;

    // Checking if username already exists
    const [results, fields] = await pool
      .promise()
      .query("SELECT * FROM users WHERE username = ?", [username]);

    // If results.length > 0, then it means the username already exists in the DB
    if (results.length > 0) {
      console.log("Username already exists!");
      // 400 status code -> Invalid request
      res.status(400).json({ error: "Username already exists!" });
      return;
    }

    // If username does not exist
    // Encoding the password in 'base-64' encoding
    const encodedPassword = Buffer.from(password).toString("base64");

    // Inserting the data in the users table
    await pool
      .promise()
      .query(
        "INSERT INTO users (username, name, email, password) VALUES (?, ?, ?, ?)",
        [username, name, email, encodedPassword]
      );

    console.log("User signed up successfully");
    res.json({ message: "User signed up successfully" });
  } catch (err) {
    console.error("Error inserting user:", err);
    // 500 status code -> Internal server error
    res.status(500).json({ error: "Failed to sign up user" });
  }
}
