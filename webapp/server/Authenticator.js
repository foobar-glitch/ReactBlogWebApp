const { connectToDatabase, closeDatabaseConnection, performQuery } = require('./DatabaseConnector');
const crypto = require('crypto');
const { SQLTableNames } = require('./DBConfigs');
const { TOKEN_EXPIRATION_TIME_MS, COOKIE_EXPIRAION_TIME_MS } = require('./server_constants');
const salt_legth = 8;
const token_length = 16;



class SqlHandler{

    static async login(username, password, session){
        let db_connection
        try{
            db_connection = await connectToDatabase();
            const currentTime = new Date();
            const cookie_expire_time = new Date(currentTime.getTime() + COOKIE_EXPIRAION_TIME_MS)

            const salt_rows = await performQuery(
                db_connection, 
                `SELECT salt FROM ${SQLTableNames.USERS} WHERE username = ?`,
                [username]
                )
        
            //console.log(salt_rows.length)
            if(salt_rows.length !== 1){
                return 0
            }
            
            const sql_salt = salt_rows[0].salt
            console.log(`salt of user='${username}' is '${sql_salt}'`)
            // Perform the database query
            const rows = await performQuery(
                db_connection,
                `SELECT * FROM ${SQLTableNames.USERS} WHERE username = ? AND password = SHA2(CONCAT(?, UNHEX(?)), 256)`,
                [username, password, sql_salt]
            );
            if (rows.length !== 1) {
                return 0;
            }
            // Update Session table
            await performQuery(
                db_connection,
                `DELETE FROM ${SQLTableNames.COOKIE} WHERE userId = ?`,
                [rows[0].userId]
            );

            // After login insert the session cookie into the cookie table
            await performQuery(
                db_connection,
                `INSERT ${SQLTableNames.COOKIE} (userId, cookieData, created_at, expired_at) VALUES (?, SHA2(?, 256), ?, ?)`,
                [rows[0].userId, session.id, currentTime, cookie_expire_time]
            );
            return 1;
        }finally{
            await closeDatabaseConnection(db_connection);
        }
    }

    static async register(username, password, email){
        let db_connection
        try{

        db_connection = await connectToDatabase();
        const user_role = 'user'
        

        // check if username already taken
        const taken_usernames = await performQuery(
            db_connection,
            `SELECT * FROM ${SQLTableNames.USERS} WHERE username = ?`,
            [username]
        );

        const taken_emails = await performQuery(
            db_connection,
            `SELECT * FROM ${SQLTableNames.USERS} WHERE email = ?`,
            [email]
        )
        
        if(taken_usernames.length !== 0){
            console.log("username already taken");
            return 100;
        }

        if(taken_emails.length !== 0){
            console.log("Email is taken");
            return 200;
        }

        // delete from temp users
        const temp_user_username = await performQuery(
            db_connection,
            `SELECT * FROM temp_users WHERE username = ?` ,
            [username]
        )


        if(temp_user_username.length !== 0){
            console.log("Already registered username "+ username)
            await performQuery(db_connection, "DELETE FROM temp_users WHERE username = ?", [username])
            //return 1010;
        }

        const temp_email= await performQuery(
            db_connection,
            `SELECT * FROM temp_users WHERE email = ?` ,
            [email]
        )

        if(temp_email.length !== 0){
            console.log("Already registering email")
            await performQuery(db_connection, "DELETE FROM temp_users WHERE email = ?", [email])
            //return 1020;
        }
        

        const salt = crypto.randomBytes(salt_legth).toString('hex').slice(0, 16);
        const create_table = await performQuery(
            db_connection,
            `INSERT INTO temp_users (username, password, email, salt, role, created_at, updated_at) values (?, SHA2(CONCAT(?, UNHEX(?)), 256), ? , ?, ?, NOW(), NOW());`,
            [username, password, salt, email, salt, user_role]
        )

        const temp_user = await performQuery(
            db_connection,
            `SELECT * from temp_users WHERE username=?`,
            [username]
        )
        if(temp_user.length > 1){
            // could do check time>10min otherwise send new link
            console.log("Temp user already existed")
            //return 10;
        }
        

        const currentTime = new Date();
        const nextDayTime = new Date(currentTime.getTime() + TOKEN_EXPIRATION_TIME_MS);

        const register_token = crypto.randomBytes(token_length).toString('hex');
        const register_table = await performQuery(
            db_connection,
            `INSERT INTO ${SQLTableNames.REGISTER} (tempUserId, registerToken, created_at, expired_at) values (?, SHA2(?, 256), ?, ?);`,
            [temp_user[0].tempUserId, register_token, currentTime, nextDayTime]
        )
        console.log(`Created register token ${register_token}`)
        console.log(`Go to /register/validate?token=${register_token}`)

        if(create_table.affectedRows == 1){
            console.log("Creating temp user succeded");
            return 0;
        }
        if(create_table.affectedRows < 1){
            console.log("Nothing changed user not added.");
            return 1;
        }
        if(create_table.affectedRows > 1){
            throw Error("Server error more than one entry changed!!");
        }
            return 2;
        }finally{
            await closeDatabaseConnection(db_connection);
        }
    }

    static async checkRegisterToken(registerToken){

        let db_connection
        try{

        db_connection = await connectToDatabase();
        const register_table = await performQuery(
            db_connection,
            `SELECT * FROM ${SQLTableNames.REGISTER} WHERE registerToken = SHA2(?, 256)`,
            [registerToken]
        )
        if(register_table.length === 0){
            console.log("Register token does not exist")
            return 100
        }
        if(register_table > 1){
            // This should not happen
            console.log("Register Token has multiple entries")
            return 101
        }
        const currentTime = new Date();

        if(register_table[0].expired_at < currentTime){
            // Delete resetToken from table
            console.log("Expired time")
            await performQuery(
                db_connection,
                `DELETE FROM ${SQLTableNames.REGISTER} WHERE registerId=${register_table[0].registerId}`
            )
            return -1;
        }

        const temp_user_id = register_table[0].tempUserId
        const temp_user_table = await performQuery(
            db_connection,
            `SELECT * FROM temp_users WHERE tempUserId=?`,
            [temp_user_id]
        )

        if(temp_user_table.length !== 1){
            console.log("TempUserId not unique")
            return 100
        }

        const create_table = await performQuery(
            db_connection,
            `INSERT INTO ${SQLTableNames.USERS} (username, password, email, salt, role, created_at, updated_at) values (?, ?, ?, ?, ?, NOW(), NOW());`,
            [temp_user_table[0].username, temp_user_table[0].password, temp_user_table[0].email, temp_user_table[0].salt, temp_user_table[0].role]
        )

        if(create_table.affectedRows !== 1){
            return 100;
        }


        await performQuery(
            db_connection,
            `DELETE FROM temp_users WHERE tempUserId=?`,
            [temp_user_id]
        )
        return 0;
        }finally{
            await closeDatabaseConnection(db_connection);
        }
    }

    // If successfull return username else return nothing
    static async get_username_from_session(session) {
        let db_connection
        try{
            db_connection = await connectToDatabase();

            const cookie_table_data = await performQuery(
            db_connection,
            `SELECT * FROM ${SQLTableNames.COOKIE} WHERE cookieData = SHA2(?, 256)`,
            [session.id]
            );

            if (cookie_table_data.length !== 1) {
                return null;
            }

            const user_of_cookie = cookie_table_data[0].userId;
            // Only use cookie if not expired, otherwise delete entry
            const currentTime = new Date();
            if (cookie_table_data[0].expired_at < currentTime) {
                session.destroy();
                await performQuery(
                    db_connection,
                    `DELETE FROM ${SQLTableNames.COOKIE} WHERE userId = ?`,
                    [user_of_cookie]
                );
                return null;
            }
            return user_of_cookie
        }finally{
            await closeDatabaseConnection(db_connection)
        }
        
    }


    static async get_profile_info_from_userid(user_id){
        let db_connection
        try{
            db_connection = await connectToDatabase();
            const profile_data = await performQuery(
            db_connection,
            `SELECT userId, username, role FROM ${SQLTableNames.USERS} WHERE userId = ?`,
            [user_id]
        );

        if(profile_data.length < 1){
            return  null
        }
        if(profile_data.length > 1){
            throw Error("More than one user by user_id")
        }

        return {username: profile_data[0].username, role: profile_data[0].role};

        }finally{
            await closeDatabaseConnection(db_connection)
        }
        
    }


    static async get_profile_info_from_session(session){
        const user_id = await this.get_username_from_session(session);
        let db_connection
        try{
            db_connection = await connectToDatabase();
            if(!user_id){
                return null;
            }
            const profile_data = await performQuery(
                db_connection,
                `SELECT userId, username, role FROM ${SQLTableNames.USERS} WHERE userId = ?`,
                [user_id]
            );

            if(profile_data.length != 1){
                throw Error(`Username ${user_id} more than once in user table`)
            }

            return {userId: profile_data[0].userId, username: profile_data[0].username, role: profile_data[0].role};
        }finally{
            await closeDatabaseConnection(db_connection)
        }
    }

    static async update_user_role(user_id, new_role){
        let db_connection
        try{
            db_connection = await connectToDatabase();
            if(!user_id){
                return null;
            }
            if(new_role !== 'admin' && new_role !== 'author' && new_role !== 'user'){
                return null
            }

            const profile_data = await performQuery(
                db_connection,
                `UPDATE ${SQLTableNames.USERS} SET role = ? WHERE userId = ?`,
                [new_role, user_id]
            )

            if(profile_data.affectedRows === 1){
                return 0;
            }
            else{
                if(profile_data.affectedRows === 0){
                    return 1;
                }
                else{
                    console.log("More than one row affected!")
                    return -1;
                }
            }
        }finally{
            await closeDatabaseConnection(db_connection)
        }

    }

    static async logout(session){
        const username = await this.get_username_from_session(session);
        let db_connection
        try{
            db_connection = await connectToDatabase();
            // invalid cookie
            if(!username){
                return 0
            }

            await performQuery(
                db_connection,
                `DELETE FROM ${SQLTableNames.COOKIE} WHERE cookieData = SHA2(?, 256)`,
                [session.id]
            );

            return 1;

        }finally{
            await closeDatabaseConnection(db_connection)
        }
        
    }


    static async forgot_password(email){
        let db_connection
        try{
            db_connection = await connectToDatabase();
            const email_entry = await performQuery(
                db_connection,
                `SELECT * FROM ${SQLTableNames.USERS} WHERE email = ?`,
                [email]
            );
            if(email_entry.length < 1){
                console.log("E-Mail is not registered yet");
                return 100;
            }
            if(email_entry.length > 1){
                console.log("E-Mail more than once in database. Should not be");
                throw Error("Email is multiple times in databank")
            }


            //console.log(email_entry[0])
            // if token for email already exists overwrite token
            
            const token_exist = await performQuery(
                db_connection,
                `DELETE FROM ${SQLTableNames.RESET} WHERE userId = ?`,
                [email_entry[0].userId]
            )


            const currentTime = new Date();
            const nextDayTime = new Date(currentTime.getTime() + TOKEN_EXPIRATION_TIME_MS);

            // Create random reset token
            const reset_token = crypto.randomBytes(token_length).toString('hex');

            // Create a reset entry
            const reset_entry = await performQuery(
                db_connection,
                `INSERT INTO ${SQLTableNames.RESET} (userId, resetToken, created_at, expired_at) VALUES (?, SHA2(?, 256), ?, ?)`,
                [email_entry[0].userId, reset_token, currentTime, nextDayTime]
            )

            if(reset_entry.affectedRows == 1){
                // Currently not sending to E-Mail
                console.log(`Creating reset entry succeded with token: '${reset_token}'`);
                console.log(`visit: '/forgot/reset?token=${reset_token}' to reset the password`)
                return 0;
            }
            if(reset_entry.affectedRows < 1){
                console.log("Nothing changed user not added.");
                return 1;
            }
            if(reset_entry.affectedRows > 1){
                throw Error("Server error more than one entry changed!!");
            }
            //TODO send token via email as /forgot?token=random_token
        }finally{
            await closeDatabaseConnection(db_connection)
        }

    }

    static async forgot_password_validate_token(token){
        let db_connection
        try{
            db_connection = await connectToDatabase();
            const reset_entry = await performQuery(
                db_connection,
                `SELECT * FROM ${SQLTableNames.RESET} WHERE resetToken = SHA2(?, 256)`,
                [token]
            )
            console.log(reset_entry)
            if(reset_entry.length < 1){
                //console.log("Entry not found")
                return null;
            }
            if(reset_entry.length > 1){
                throw Error("Server error more than one entry for token")
            }

            const currentTime = new Date();

            if(reset_entry[0].expired_at < currentTime){
                // Delete resetToken from table
                console.log("Expired time")
                await performQuery(
                    db_connection,
                    `DELETE FROM ${SQLTableNames.RESET} WHERE resetId=${reset_entry[0].resetId}`
                )
                return -1
            }
            return reset_entry[0].userId
        }finally{
            await closeDatabaseConnection(db_connection)
        }
    }

    static async reset_password_with_userId(userId, newpassword){
        let db_connection
        try{
            db_connection = await connectToDatabase();
            // delete token with userID
            await performQuery(
                db_connection,
                `DELETE FROM ${SQLTableNames.RESET} WHERE userId=?`,
                [userId]
            )
            
            const salt = crypto.randomBytes(salt_legth).toString('hex').slice(0, 16);

            const create_table = await performQuery(
                db_connection,
                `UPDATE ${SQLTableNames.USERS} SET password = SHA2(CONCAT(?, UNHEX(?)), 256), salt = ? WHERE userId = ?;`,
                [newpassword, salt, salt, userId]
            )

            if(create_table.affectedRows < 1){
                return -1
            }
            if(create_table.affectedRows > 1){
                // Changed more than one field
                throw Error("Server Error deleted data")
            }
            return 0;
        }finally{
            await closeDatabaseConnection(db_connection)
        }
    }

    static async get_all_users(){
        let db_connection
        try{
            db_connection = await connectToDatabase();
            // delete token with userID
            const all_users = await performQuery(
                db_connection,
                `SELECT userId, username, email, role from ${SQLTableNames.USERS} WHERE role!='admin'`,
                []
            )
            return all_users
        }finally{
            await closeDatabaseConnection(db_connection)
        }

    }

}


module.exports = {
    SqlHandler
}