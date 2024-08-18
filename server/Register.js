const { connectToDatabase, performQuery } = require('./DatabaseConnector');
const {cookie_table_name, users_table_name} = require('/var/www/private/nodejs/mysqlCredentials')
const crypto = require('crypto');

async function register(username, password) {
    const conn = await connectToDatabase();
    const user_role = 'user'
    try{
        
        // check if username already taken
        const rows = await performQuery(
            conn,
            `SELECT * FROM ${users_table_name} WHERE username = ?`,
            [username]
        );

        if(rows.length !== 0){
            console.log("username already taken");
            return 1;
        }
        const salt = crypto.randomBytes(8).toString('hex').slice(0, 16);
        const create_table = await performQuery(
          conn,
          `INSERT INTO ${users_table_name} (username, password, salt, role, created_at, updated_at)` 
          +`values (?, SHA2(CONCAT(?, ?), 256), ?, ?, NOW(), NOW());`,
          [username, password, salt, salt, user_role]
        )
        
        if(create_table.affectedRows == 1){
          console.log("Creating user succeded");
          return 0;
        }
        if(create_table.affectedRows < 1){
          console.log("Nothing changed user not added.");
          return 1;
        }
        if(create_table.affectedRows > 1){
          console.log("Server error more than one entry changed!!")
          return -1;
        }
        return 2;
    }finally {
    if (conn) {
      conn.end();
    }
  }

}


module.exports = {
  register
}