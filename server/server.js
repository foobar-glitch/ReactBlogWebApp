
var session = require('express-session')
const express = require('express');
const cors = require('cors');
const { getBlogEntry, createBlogEntry, addCommentToBlogEntry, removeBlogEntry } = require('./BlogDatahandler');
const { login } = require('./Login');
const { register } = require('./Register')
const { get_profile_info } = require('./GetProfileInfo');
const { deleteSessionFromTable } = require('./Logout');
const cryptoRandomString = require('crypto-random-string');

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

app.post('/blogs/:id/comments', (req, res) => {
    if(!req.session){
        return res.json(authentication_failed_message);
    }

    get_profile_info(req.session).then(
        (profile_data) => {
            if(!profile_data){
                return res.json(authentication_failed_message)
            }

            addCommentToBlogEntry(profile_data.username, req.body.comment, req.params.id).then(
                result => {
                    console.log(result);
                    //res.json(result)
                    return res.json(
                        {status: 200, message: `User '${profile_data.username}' added a comment to blog`}
                    )
                }
            )
        }
    )
})

app.post('/blogs', (req, res) => {
    if(!req.session){
        return res.json(authentication_failed_message);
    }

    get_profile_info(req.session).then(
        (profile_data) => {
            if(!profile_data){
                console.log("Failed authentication")
                return res.json(authentication_failed_message);
            }
            if(profile_data.role !== "admin" && profile_data.role !== "author"){
                console.log("Failed privilege check")
                return res.json({status: 404, message: "No authority to add blog entry"});
            }
            console.log("creating entry")
            createBlogEntry(req.body.title, req.body.body, profile_data.username).then(
                result => {
                    console.log(result);
                    //res.json(result)
                    res.json(
                        {status: 200, message: `User '${profile_data.username}' added a blog entry`}
                    )
                }
            )
        }
    )
});

app.delete('/blogs/:id', (req, res) => {
    if(!req.session){
        return res.json(authentication_failed_message);
    }

    get_profile_info(req.session).then(
        (profile_data) => {
            if(!profile_data){
                console.log("Failed authentication");
                return res.json(authentication_failed_message);
            }
            getBlogEntry(req.params.id).then(
                (entries) => {
                    if(!entries){
                        return res.json({status: 404, message: "ID not found"})
                    }
                    // delete only the user is the author or when it is an admin
                    if(entries.author === profile_data.username || profile_data.role == "admin"){
                        console.log("Valid user");
                        removeBlogEntry(req.params.id).then(
                            deleteResult => {
                                console.log(deleteResult);
                                return res.json(deleteResult);
                            }
                        )
                    }else{
                        console.log("Invalid User")
                        return res.json({status: 404, message: "Invalid User"});
                    }       
                }
            )
        }
    )

    

});


app.post('/login', (req, res) => {
    login(req.body.username, req.body.password, req.session)
    .then((result) => {
        if (result === 1) {
          console.log("Login successful");
          res.json({
            status: 200,
            message: 'Login successful',
          });
        } else {
          console.log("Login unsuccessful");
          res.json({
            status: 404,
            message: 'Username or Password invalid',
          });
        }
    })
    .catch((error) => {
        console.error("Error:", error);
        res.json({
            status: 505,
            message: 'Server Error',
        });
    });
})

app.post('/register', (req, res) => {
    if(!req.session){
        return res.json(authentication_failed_message);
    }
    if(req.body.password != req.body.passwordVerify){
        console.log("Non matching passwords")
        return res.json({status: 400, message: 'Passwords dont match'});
    }
    
    register(req.body.username, req.body.password).then(
        (result) => {
            console.log(result);
        }
    )}
)


app.get('/get-profile-info', (req, res) => {
    if(!req.session){
        return res.json(authentication_failed_message);
    }
    
    get_profile_info(req.session)
    .then((result) => {
        if(result){
            res.json({status:200, message: result});
        }else{
            res.json(authentication_failed_message);
        }
    })
})


app.get('/logout', (req, res) => {
    logout_failed_message = {
        status: 404,
        message: "Logout failed"
    }
    if(!req.session){
        return res.json(logout_failed_message);   
    }
    deleteSessionFromTable(req.session)
    .then((result) => {
        req.session.destroy();
        if(result){
            return res.json({status: 200, message: 'Logout successful'})
        }
        return res.json(logout_failed_message)
    })
})


app.listen(8080, () => {
    console.log(`Server is running on port 8080.`);
});
