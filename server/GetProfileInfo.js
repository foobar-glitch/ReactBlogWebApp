const { authenticate } = require('./Authenticate');
const { connectToDatabase, performQuery } = require('./DatabaseConnector');

// Gets all info of user
async function get_profile_info(session) {
    let conn;
    let auth_successful;
    try {
      conn = await connectToDatabase();
      auth_successful = await authenticate(session);
      //console.log('Authentication result:', auth_successful);
      if(!auth_successful){
        return null;
      }

      const rows = await performQuery(
        conn,
        "SELECT * FROM `cookie_data` WHERE `sessionId` = ?",
        [session.id]
      );

      // Should not happen since authentication was already successful
      if(rows.length !== 1){
        return null;
      }

      const profile_data = await performQuery(
        conn,
        "SELECT * FROM `users` WHERE `userId` = ?",
        [rows[0].userId]
      )
    
      if(profile_data.length !== 1){
        return null;
      }
      
      return {userId: profile_data[0].userId, username: profile_data[0].username, role: profile_data[0].role};

    } finally {
      if (conn) {
        conn.end();
      }
    }
  }


module.exports = {
    get_profile_info
}