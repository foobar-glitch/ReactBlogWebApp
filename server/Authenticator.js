const { connectToDatabase, performQuery } = require('./DatabaseConnector');
const { cookie_table_name, users_table_name, reset_table_name } = require('/var/www/private/nodejs/mysqlCredentials')
const crypto = require('crypto');

class SqlHandler{

    constructor(){
        this.db_connection = null;
        
    }

    async initialize_db() {
        this.db_connection = await connectToDatabase();
    }

    check_db_initialized(){
        if(!this.db_connection){
            throw new Error("Database connection is not initialized.");
        }
    }

    async login(username, password, session){
        const currentTime = new Date();
        const db_connection = this.db_connection;
        this.check_db_initialized();

        const salt_rows = await performQuery(
            db_connection, 
            `SELECT salt FROM ${users_table_name} WHERE username = ?`,
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
            `SELECT * FROM ${users_table_name} WHERE username = ? AND password = SHA2(?, 256)`,
            [username, password.concat(sql_salt)]
        );
        if (rows.length !== 1) {
            return 0;
        }
        // Update Session table
        await performQuery(
            db_connection,
            `DELETE FROM ${cookie_table_name} WHERE userId = ?`,
            [rows[0].userId]
        );

        // After login insert the session cookie into the cookie table
        await performQuery(
            db_connection,
            `INSERT ${cookie_table_name} (userId, cookieData, created_at, expired_at) VALUES (?, ?, ?, ?)`,
            [rows[0].userId, session.id, currentTime, session.cookie._expires]
        );
        return 1;

    }

    async register(username, password, email){
        const db_connection = this.db_connection;
        const user_role = 'user'
        this.check_db_initialized();

        // check if username already taken
        const taken_usernames = await performQuery(
            db_connection,
            `SELECT * FROM ${users_table_name} WHERE username = ?`,
            [username]
        );

        const taken_emails = await performQuery(
            db_connection,
            `SELECT * FROM ${users_table_name} WHERE email = ?`,
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

        const salt = crypto.randomBytes(8).toString('hex').slice(0, 16);
        const create_table = await performQuery(
            db_connection,
            `INSERT INTO ${users_table_name} (username, password, email, salt, role, created_at, updated_at)` 
            +`values (?, SHA2(?, 256),? , ?, ?, NOW(), NOW());`,
            [username, password.concat(salt), email, salt, user_role]
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
            throw Error("Server error more than one entry changed!!");
        }

        return 2;
    }

    // If successfull return username else return nothing
    async get_username_from_session(session) {
        const db_connection = this.db_connection;
        this.check_db_initialized();


        const cookie_table_data = await performQuery(
            db_connection,
            `SELECT * FROM ${cookie_table_name} WHERE cookieData = ?`,
            [session.id]
            );

        if (cookie_table_data.length !== 1) {
            return null;
        }

        const user_of_cookie = cookie_table_data[0].userId;
        // Only use cookie if not expired, otherwise delete entry
        const currentTime = new Date();
        if (cookie_table_data[0].expiresAt < currentTime) {
            session.destroy();
            await performQuery(
                db_connection,
                `DELETE FROM ${cookie_table_name} WHERE userId = ?`,
                [user_of_cookie]
            );
            return null;
        }

        return user_of_cookie
    }

    async get_profile_info(session){
        const db_connection = this.db_connection;

        this.check_db_initialized();

        const user_id = await this.get_username_from_session(session);
        if(!user_id){
            return null;
        }
        const profile_data = await performQuery(
            db_connection,
            `SELECT userId, username, role FROM ${users_table_name} WHERE userId = ?`,
            [user_id]
        );

        if(profile_data.length != 1){
            throw Error(`Username ${user_id} more than once in user table`)
        }

        return {userId: profile_data[0].userId, username: profile_data[0].username, role: profile_data[0].role};
    }

    async logout(session){
        const db_connection = this.db_connection;

        this.check_db_initialized();
        const username = await this.get_username_from_session(session);

        // invalid cookie
        if(!username){
            return 0
        }

        await performQuery(
            db_connection,
            `DELETE FROM ${cookie_table_name} WHERE cookieData = ?`,
            [session.id]
        );

        return 1;
    }


    async forgot_password(email){
        const db_connection = this.db_connection;

        const email_entry = await performQuery(
            db_connection,
            `SELECT * FROM ${users_table_name} WHERE email = ?`,
            [email]
        );
        if(email_entry.length !== 1){
            console.log("E-Mail is not registered yet");
            return 100;
        }

        console.log(email_entry[0])
        // if token for email already exists overwrite token
        
        const token_exist = await performQuery(
            db_connection,
            `DELETE FROM ${reset_table_name} WHERE userId = ?`,
            [email_entry[0].userId]
        )


        const currentTime = new Date();
        const nextDayTime = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
        const sql_current_time = currentTime.toISOString().slice(0, 19).replace('T', ' ');
        const sql_next_day_time = nextDayTime.toISOString().slice(0, 19).replace('T', ' ');

        // Create random reset token
        const reset_token = crypto.randomBytes(16).toString('hex');

        // Create a rest entry
        const reset_entry = await performQuery(
            db_connection,
            `INSERT INTO ${reset_table_name} (userId, resetToken, created_at, expired_at) VALUES (?, ?, ?, ?)`,
            [email_entry[0].userId, reset_token, sql_current_time, sql_next_day_time]
        )

        if(reset_entry.affectedRows == 1){
            console.log("Creating user succeded");
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

    }
}




module.exports = {
    SqlHandler
}