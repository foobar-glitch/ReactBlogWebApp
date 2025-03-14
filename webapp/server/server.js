
var session = require('express-session')
const express = require('express');
const cors = require('cors');
const { getBlogEntry, createBlogEntry, addCommentToBlogEntry, removeBlogEntry, findCommentByCommentIdInBlog, deleteCommentOfBlogByCommentId, getCommentsOfBlogId, deleteAllCommentsFromBlog } = require('./BlogDatahandler');
const { SqlHandler } = require('./Authenticator');
const { isEmailValid } = require('./EmailValidator');
const crypto = require('crypto');
const csrf = require('csurf');
const sanitizeHtml = require('sanitize-html');
const { COOKIE_EXPIRAION_TIME_MS } = require('./server_constants');


const local_domain = "http://localhost:80"
const remote_domain = "http://[2a02:908:e845:3560::8070]:80"
const server_domain = local_domain

function generateRandomString(length) {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
}


function isAdmin(profile_data){
    if(!profile_data || profile_data.role !== 'admin'){
        return false
    }
    return true
}


const app = express();
app.set('trust proxy', 1)

const authentication_failed_message = {
    status: 404,
    message: "Authentication failed"
}

const crypto_secret = generateRandomString(32)

console.log(crypto_secret)

app.use(session({
	secret: crypto_secret,
	resave: true,
	saveUninitialized: true,
    cookie: { maxAge: COOKIE_EXPIRAION_TIME_MS, sameSite: 'Strict', secure: false }
}));

app.use(cors({
    origin: server_domain,
    credentials: true
}));

const csrfProtection = csrf({ cookie: false });
app.use(csrfProtection);

app.use(express.json());


app.get('/csrf', (req, res) => {
    const csrfToken = req.csrfToken();
    res.json({ status: 200, message: csrfToken });
});


app.get('/authenticate', async (req, res) => {
    const user_id = await SqlHandler.get_username_from_session(req.session);
    if(!user_id){
        res.json({
            status: 401,
            message: "Authentication failed"
        })
    }else{
        const user_data = await SqlHandler.get_profile_info_from_userid(user_id)
        res.json({
            status: 200,
            message: {
                username: user_data.username,
                role: user_data.role
            }
        })
    }

})

app.get('/blogs', async (req, res) => {
    const blog_entries = await getBlogEntry()
    // dropping the _id field
    let reduced_blog_entries = [];
    blog_entries.map((blog_entry) => {
        reduced_blog_entries.push(
            {
                blogId: blog_entry.blogId, 
                createdAt: blog_entry.createdAt, 
                title: blog_entry.title,
                author: blog_entry.author
            }
        )
    })
    return res.json(reduced_blog_entries)
});


app.get('/blogs/:id', async (req, res) => {
    const collection_entries = await getBlogEntry(req.params.id)
    if(collection_entries){
        // reduce collection entries to unsensitive data
        const reduced_collection = {
            createdAt: collection_entries.createdAt,
            title: collection_entries.title,
            body: collection_entries.body,
            author: collection_entries.author,
        }

        res.json({status: 200, message: reduced_collection});
    }else{
        res.json({status: 404, message: null});
    }
});


app.get('/blogs/:id/comments', async (req, res) => {
    const blog_id = req.params.id
    all_comments = await getCommentsOfBlogId(blog_id)
    return res.json({status: 200, message: {comments: all_comments}})
})


app.post('/blogs/:id/comments', async (req, res) => {
    if(!req.session){
        return res.json(authentication_failed_message);
    }
    const profile_data = await SqlHandler.get_profile_info_from_session(req.session);
    if(!profile_data){
        return res.json(authentication_failed_message);
    }
    const result = await addCommentToBlogEntry(profile_data.userId, profile_data.username, req.body.comment, req.params.id);
    // TODO: result check
    if(result === 0){
        res.json(
            {status: 200, message: `User '${profile_data.username}' added a comment to blog`}
        )
    }else{
        res.json(
            {status: 400, message: `Use '${profile_data.username}' could not add a comment`}
        )
    }
    
})

app.post('/blogs', async (req, res) => {
    if(!req.session){
        return res.json(authentication_failed_message);
    }
    if(!req.body.title || !req.body.body){
        return res.json({status: 401, message: "Invalid Data."})
    }

    if(req.body.title.length < 3 || req.body.body.length < 3){
        return res.json({status:404, message: "Message too short."})
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
    const dirtyHtml_body = req.body.body
    const cleanHtml = sanitizeHtml(dirtyHtml_body, {
        allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'li', 'ol', 'h1', 'h2', 's', 'br' ],
        allowedAttributes: { 'a': [ 'href' ] },
        disallowedTagsMode: 'escape' // This will escape disallowed tags rather than remove them
      });

    const result = await createBlogEntry(req.body.title, cleanHtml, profile_data.username)
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
        const deleteComments = await deleteAllCommentsFromBlog(req.params.id);
        return res.json({
            status: 200,
            message: "Succesfully deleted the blog."
        })

    }else{
        return res.json({status: 404, message: "You need to be the author of the blog to delete it"});
    }
});


app.post('/login', async (req, res) => {
    //console.log(req.body)
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
}) 


app.get('/get-profile-info', async (req, res) => {
    if(!req.session){
        return res.json(authentication_failed_message);
    }
    const profile_data = await SqlHandler.get_profile_info_from_session(req.session);
    if(profile_data){
        console.log(profile_data)
        const secure_profile_data={
            username: profile_data.username,
            role: profile_data.role
        }
        res.json({status:200, message: secure_profile_data});
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

app.get('/register/validate', async (req, res) => {
    const token = req.query.token;
    const register_token_successfull = await SqlHandler.checkRegisterToken(token)

    if(register_token_successfull === 0){
        console.log("Registered the user")
        return res.json({
            status: 200,
            message: "Register successfull"
        })
    }
    //console.log(register_token_successfull)
    return res.json({
        status: 400,
        message: "Error occured"
    })
    
})


app.post('/forgot/reset', async (req, res) => {
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


app.delete('/blogs/:blogId/comments/:commentId', async (req, res) => {    
    if(!req.session){
        return res.json(authentication_failed_message);
    }
    const profile_data = await SqlHandler.get_profile_info_from_session(req.session);
    if(!profile_data){
        return res.json(authentication_failed_message)
    }

    const blogId = req.params.blogId;
    const commentId = req.params.commentId;

    

    const comments = await findCommentByCommentIdInBlog(blogId, commentId)
    console.log(comments)
    const profile_user = profile_data.username
    const profile_userId = profile_data.userId
    const profile_role = profile_data.role

    const comment_user = comments.username
    const comment_userId = comments.userId
    if(profile_role === "admin"){
        //delete comment
        return res.json(await deleteCommentOfBlogByCommentId(blogId, commentId))
    }else{
        if(comment_userId !== profile_userId){
            return res.json({status: 400, message: 'Need to be the creator to delete comments'})
        }
        if(comment_user !== profile_user){
            // If userId match but the username between mariadb and mongodb dont match there is a data inconsistency
            console.log("Data Inconsistency")
            return res.json({stats: 500, message: 'Internal Server Error'})
        }
        return res.json(await deleteCommentOfBlogByCommentId(blogId, commentId))
    }
    
})


app.get('/admin', async (req, res) => {
    if(!req.session){
        return res.json(authentication_failed_message);
    }
    const profile_data = await SqlHandler.get_profile_info_from_session(req.session);
    if(!profile_data){
        return res.json(authentication_failed_message)
    }
    if(profile_data.role !== 'admin'){
        return res.json({
            status: 403,
            message: "Missing Authority"
        })
    }
    const all_users = await SqlHandler.get_all_users()
    let all_user_vales = [];
    all_users.map((user) => {
        all_user_vales.push(
            {
                user_id: user.userId, 
                user_name: user.username, 
                user_mail: user.email,
                user_role: user.role
            }
        )
    })
    return res.json({
        status: 200,
        message: {allUsers: all_user_vales}
    })

})


app.post('/admin/set-role', async (req, res) => {
    if(!req.session){
        return res.json(authentication_failed_message);
    }
    const profile_data = await SqlHandler.get_profile_info_from_session(req.session);
    if(!isAdmin(profile_data)){
        return res.json({
            status: 403,
            message: 'Missing Authority'
        })
    }
    const user_id = req.body.user_id
    const user_role = req.body.role

    const update_successfull = await SqlHandler.update_user_role(user_id, user_role)
    if(update_successfull === 0){
        return res.json({
            status: 200,
            message: 'Changed user role'
        })
    }else if(update_successfull === 1){
        return res.json({
            status: 401,
            message: 'Nothing changed'
        })
    }else{
        return res.json({
            status: 500,
            message: 'Some Server Error happened'
        })
    }
})


app.listen(8080, () => {
    console.log(`Server is running on port 8080.`);
});
