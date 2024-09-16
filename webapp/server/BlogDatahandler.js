const { MongoClient, ObjectId } = require('mongodb');
const { MongoSecrets, MongoCollections } = require('./DBConfigs');
const uri = `mongodb://${MongoSecrets.USER}:${MongoSecrets.USER_PASSWORD}@${MongoSecrets.HOST}:${MongoSecrets.PORT}`;


async function getBlogEntry(id_num=null) {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
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
            collection_entries = await collection.find({}).sort({ createdAt: -1 }).toArray();
        }

        // Display the retrieved documents
        return collection_entries;
        } finally {
            await client.close();
        }
}

async function createBlogEntry(title_val, body_val, author_val){
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
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
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
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
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
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

async function findCommentByCommentIdInBlog(blogId, commentId){
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try{
        await client.connect()
        const database = client.db(MongoSecrets.DB_NAME);
        const collection = database.collection(MongoCollections.BLOG_ENTRIES);
        const comments = await collection.aggregate([
            {
                $match: { id: +blogId } // Match the blog document with the given blogId
            },
            {
                $project: { // Project only the necessary fields
                    _id: 0, // Exclude the _id field
                    comments: {
                        $filter: { // Filter the comments array
                            input: '$comments',
                            as: 'comment',
                            cond: { $eq: ['$$comment.commentId', +commentId] }
                        }
                    }
                }
            }
        ]).toArray();
        if(comments.length !== 1){
            throw Error("There should only be one comment with that id in that blog")
        }
        //if(comments[0].length !== 1){
        //    throw Error("There should only be one comment with that id in that blog 2")
        //}
        console.log(comments[0].comments[0])
        return comments[0].comments[0]
    }finally{
        await client.close()
    }
}

async function deleteCommentOfBlogByCommentId(blogId, commentId){
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try{
        await client.connect()
        const database = client.db(MongoSecrets.DB_NAME);
        const collection = database.collection(MongoCollections.BLOG_ENTRIES);
        const result = await collection.updateOne(
            { id: +blogId }, // Filter to match the document with the given blogId
            { $pull: { comments: { commentId: +commentId } } } // Pull (remove) the comment with the specified commentId
        );

        // Check the result and return a status
        if (result.modifiedCount > 0) {
            console.log(`Comment with commentId ${commentId} deleted from blog with id ${blogId}`);
            return { status: 200, message: 'Comment deleted successfully' };
        } else {
            console.log(`No matching comment found to delete.`);
            return { status: 404, message: 'Comment not found' };
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        throw error; // Re-throw error if needed
    }finally{
        await client.close()
    }
}


module.exports = {
    getBlogEntry,
    createBlogEntry,
    addCommentToBlogEntry,
    removeBlogEntry,
    findCommentByCommentIdInBlog,
    deleteCommentOfBlogByCommentId
}