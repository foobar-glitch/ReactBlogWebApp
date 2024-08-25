
var session = require('express-session')
const express = require('express');
const cors = require('cors');
const { getBlogEntry, createBlogEntry, addCommentToBlogEntry, removeBlogEntry } = require('./BlogDatahandler');
const { SqlHandler } = require('./Authenticator');
const cryptoRandomString = require('crypto-random-string');
const { isEmailValid } = require('./EmailValidator');

const app = express();
app.set('trust proxy', 1)

const authentication_failed_message = {
    status: 404,
    message: "Authentication failed"
}

const crypto_secret = cryptoRandomString(32)
console.log(crypto_secret)
app.use(session({
	secret: crypto_secret,
	resave: true,
	saveUninitialized: true,
    cookie: { maxAge: 900000, sameSite: 'None' }
}));

app.use(cors({
    origin: 'http://localhost:3000', // Replace with the actual origin of your frontend
    credentials: true
}));

app.use(express.json());


app.get('/authenticate', async (req, res) => {
    const user_id = await SqlHandler.get_username_from_session(req.session);
    if(!user_id){
        res.json({
            status: 401,
            message: "Authentication failed"
        })
    }else{
        res.json({
            status: 200,
            message: "Authentication successful"
        })
    }

})

app.get('/blogs', (req, res) => {
    //console.log(req.session.id)
    getBlogEntry().then(
        collection_entries => {
            res.json(collection_entries);
        }
    )
});

app.get('/blogs/:id', (req, res) => {
    getBlogEntry(req.params.id).then(
        collection_entries => {
            if(collection_entries){
                res.json({status: 200, message: collection_entries});
            }else{
                res.json({status: 404, message: null});
            }
            
        }
    )
});

app.post('/blogs/:id/comments', async (req, res) => {
    if(!req.session){
        return res.json(authentication_failed_message);
    }
    const profile_data = await SqlHandler.get_profile_info_from_session(req.session);
    if(!profile_data){
        return res.json(authentication_failed_message);
    }
    const result = await addCommentToBlogEntry(profile_data.username, req.body.comment, req.params.id);
    // TODO: result check
    res.json(
        {status: 200, message: `User '${profile_data.username}' added a comment to blog`}
    )
})

app.post('/blogs', async (req, res) => {
    if(!req.session){
        return res.json(authentication_failed_message);
    }

    const profile_data = await SqlHandler.get_profile_info_from_session(req.session);
    if(!profile_data){
        return res.json(authentication_failed_message);
    }
    if(profile_data.role !== "admin" && profile_data.role !== "author"){
        return res.json({
            status: 404,
            message: "No authority to add entry."
        })
    }
    const result = await createBlogEntry(req.body.title, req.body.body, profile_data.username)
    res.json({
        status: 200, message: `User '${profile_data.username}' added a blog entry`
    })
});

app.delete('/blogs/:id', async (req, res) => {
    if(!req.session){
        return res.json(authentication_failed_message);
    }
    const profile_data = await SqlHandler.get_profile_info_from_session(req.session);
    if(!profile_data){
        return res.json(authentication_failed_message);
    }
    const entries = await getBlogEntry(req.params.id);
    if(!entries){
        return res.json({
            status: 404,
            message: "ID not found"
        })
    }
    if(entries.author == profile_data.username || profile_data.role == "admin"){
        const deleteResult = await removeBlogEntry(req.params.id);
        return res.json({
            status: 200,
            message: "Succesfully deleted the blog."
        })

    }else{
        return res.json({status: 404, message: "You need to be the author of the blog to delete it"});
    }
});


app.post('/login', async (req, res) => {
    const result = await SqlHandler.login(req.body.username, req.body.password, req.session)
    if(result === 1){
        res.json({
            status: 200,
            message: 'Login successful'
        })
    }else{
        res.json({
            status: 404,
            message: 'Password or Username incorrect'
        })
    }
})


app.post('/register', async (req, res) => {
    if(!req.session){
        return res.json(authentication_failed_message);
    }
    if(req.body.password != req.body.passwordVerify){
        console.log("Non matching passwords")
        return res.json({status: 400, message: 'Passwords dont match'});
    }
    
    if(!isEmailValid(req.body.email)){
        console.log("Invalid Email");
        return res.json({
            status: 400,
            message: 'E-Mail is invalid'
        })
    }

    const result = await SqlHandler.register(req.body.username, req.body.password, req.body.email);
    if(result === 100){
        return res.json({
            status: 400,
            message: "Username is already taken"
        })
    }
    if(result === 200){
        return res.json({
            status: 400,
            message: "E-Mail is already taken"

        })
    }
    if(result === 0){
        return res.json({
            status: 200,
            message: "Created user successfully"
    })
    }

    console.log(result);
}) 


app.get('/get-profile-info', async (req, res) => {
    if(!req.session){
        return res.json(authentication_failed_message);
    }
    const profile_data = await SqlHandler.get_profile_info_from_session(req.session);
    if(profile_data){
        res.json({status:200, message: profile_data});
    }else{
        res.json(authentication_failed_message);
    }    
})


app.get('/logout', async (req, res) => {
    logout_failed_message = {
        status: 404,
        message: "Logout failed"
    }

    if(!req.session){
        return res.json(logout_failed_message);   
    }
    const result = SqlHandler.logout(req.session)

    if(result){
        return res.json({status: 200, message: 'Logout successful'})
    }
    return res.json(logout_failed_message)
})


app.post('/forgot', async (req, res) => {
    const email = req.body.email
    if(!isEmailValid(email)){
        return res.json({
            status: 400,
            message: "This E-Mail invalid"
        })
    }

    const ret = await SqlHandler.forgot_password(email);
    if(ret === 1){
        return res.json({
            status: 500,
            message: "Server error could not create token"
        })
    }
    if(ret === 0 || ret === 100){
        return res.json({
            status: 200,
            message: "If this E-Mail exists you will receive an E-mail"
        })
    }
})

app.get('/forgot/reset', async (req, res) => {
    const token = req.query.token;
    const useId_of_token = await SqlHandler.forgot_password_validate_token(token)
    const user_data = await SqlHandler.get_profile_info_from_userid(useId_of_token)
    
    if(useId_of_token === null){
        return res.json({
            status: 400,
            message: "This token is invalid"
        })
    }
    if(useId_of_token === -1){
        return res.json({
            status: 404,
            message: "Expired token."
        })
    }
    return res.json({
        status: 202,
        username: user_data.username,
        message: "Token is correct. Reset password now."
    })
    
})

app.post('/forgot/reset', async (req, res) => {
    console.log(req.body)
    const token = req.body.token;
    const password = req.body.password
    const verifyPassword = req.body.verifyPassword

    if(password !== verifyPassword){
        return res.json({
            status: 400,
            message: "Sent passwords do not match"
        })
    }

    const useId_of_token = await SqlHandler.forgot_password_validate_token(token)
    if(useId_of_token === null){
        return res.json({
            status: 404,
            message: "Sent Token is invalid"
        })
    }
    if(useId_of_token === -1){
        return res.json({
            status: 404,
            message: "Token expired."
        })
    }

    ret_code = await SqlHandler.reset_password_with_userId(useId_of_token, password);
    if(ret_code === 0){
        return res.json({
            status: 200,
            message: "Successfully reset password"
        })
    }else{
        return res.json({
            status: 500,
            message: "Could not reset user",
        })
    }
})


app.listen(8080, () => {
    console.log(`Server is running on port 8080.`);
});
