const { connectToDatabase, performQuery } = require('./DatabaseConnector');

// Function to login. Set a session in the database
async function login(username, password, session) {
    let conn;
    try {
      conn = await connectToDatabase();
      const currentTime = new Date();
  
      // Perform the database query
      const rows = await performQuery(
        conn,
        "SELECT * FROM `users` WHERE `username` = ? AND `password` = SHA2(?,256)",
        [username, password]
      );
  
      console.log(rows);
      if (rows.length !== 1) {
        return 0;
      }
      // Update Session table
      await performQuery(
        conn,
        "DELETE FROM `cookie_data` WHERE userId = ?",
        [rows[0].userId]
      );

      await performQuery(
        conn,
        "INSERT `cookie_data` (sessionId, userId, createdAt, expiresAt) VALUES (?, ?, ?, ?)",
        [session.id, rows[0].userId, currentTime, session.cookie._expires]
      );
      
      return 1;
    } finally {
      if (conn) {
        conn.end();
      }
    }
  }


module.exports = {
  login
}