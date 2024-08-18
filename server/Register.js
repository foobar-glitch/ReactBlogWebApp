const { connectToDatabase, performQuery } = require('./DatabaseConnector');


async function register(username, password) {
    try{
        // check if username already taken
        const rows = await performQuery(
            conn,
            "SELECT * FROM `users` WHERE `username` = ?",
            [username]
        );

        if(rows.length !== 0){
            console.log("username al")
            return 0;
        }

    }finally {
    if (conn) {
      conn.end();
    }
  }

}
