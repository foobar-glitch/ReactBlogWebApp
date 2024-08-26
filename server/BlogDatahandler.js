const { MongoClient, ObjectId } = require('mongodb');
const { MongoSecrets, MongoCollections } = require('./DBConfigs');
const uri = `mongodb://${MongoSecrets.USER}:${MongoSecrets.USER_PASSWORD}@${MongoSecrets.HOST}:${MongoSecrets.PORT}`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function getBlogEntry(id_num=null) {
    try {
        await client.connect();
        const database = client.db(MongoSecrets.DB_NAME);
        const collection = database.collection(MongoCollections.BLOG_ENTRIES);
    
        // Retrieve all documents from the collection
        let collection_entries;
        if(id_num){
            collection_entries = await collection.find({ id: +id_num }).toArray();
            collection_entries = collection_entries[0];
        }else{
            collection_entries = await collection.find({}).toArray();
        }

        // Display the retrieved documents
        return collection_entries;
        } finally {
            await client.close();
        }
}

async function createBlogEntry(title_val, body_val, author_val){
    try{
        await client.connect();
        const database = client.db(MongoSecrets.DB_NAME);
        const collection = database.collection(MongoCollections.BLOG_ENTRIES);
        const lastEntry = await collection.findOne({}, { sort: { _id: -1 } });
        const currentTime = new Date();

        const lastEntryId = lastEntry ? lastEntry.id : 0

        const newBlog = {
            _id: new ObjectId(),
            createdAt : currentTime.toUTCString(),
            title: title_val,
            body: body_val,
            author: author_val,
            id: ( lastEntryId + 1 ),
            comments: []
        };

        result = await collection.insertOne(newBlog);
        return result;

    }finally{
        await client.close();
    }

}

async function addCommentToBlogEntry(userId, user, comment, blog_id){
    try {
        const entry = await getBlogEntry(blog_id);
        if(!entry){
            return 0;
        }
        // Do something with the entry
        const currentTime = new Date();
        await client.connect();
        const database = client.db(MongoSecrets.DB_NAME);
        const collection = database.collection(MongoCollections.BLOG_ENTRIES);

        // Step 1: Find the blog post by id and fetch the highest commentId
        const blogPost = await collection.findOne({ id: +blog_id }, { projection: { comments: 1 } });
        let newCommentId = 0;
        if (blogPost && blogPost.comments && blogPost.comments.length > 0) {
            // Extract the highest commentId from the existing comments
            const maxComment = blogPost.comments.reduce((max, comment) => {
                return comment.commentId > max ? comment.commentId : max;
            }, 0);
            newCommentId = maxComment + 1;
        }

        result = await collection.updateOne(
            {id: +blog_id}, { $push: {
                comments: {
                    $each: [{
                        commentId: newCommentId,
                        userId: userId,
                        username: user,
                        comment: comment,
                        createdAt: currentTime.toUTCString()
                    }],
                    $position: 0 // Insert at the front of the array
                }
            }}
        )

        if (result.modifiedCount == 1){
            console.log('Comment added successfully to blog post.');
            return 0
        }
            
        if (result.modifiedCount > 1){
            console.log("More than one edited")
            throw Error("This should not happen")
        }
        if (restult.modifiedCount < 1){
            console.log('No matching blog post found or comment was not added.');
            return 1
        }
        throw Error("An error occured")
      } catch (error) {
        // Handle the error
      }
}

async function removeBlogEntry(id_val){
    try{
        await client.connect();
        const database = client.db(MongoSecrets.DB_NAME);
        const collection = database.collection(MongoCollections.BLOG_ENTRIES);
        const deleteResult = await collection.deleteOne({ id: +id_val });
        return deleteResult;

    }finally{
        await client.close()
    }

}


module.exports = {
    getBlogEntry,
    createBlogEntry,
    addCommentToBlogEntry,
    removeBlogEntry
}