const { MongoClient, ObjectId } = require('mongodb');
const { MongoSecrets, MongoCollections } = require('./DBConfigs');
const uri = `mongodb://${MongoSecrets.USER}:${MongoSecrets.USER_PASSWORD}@${MongoSecrets.HOST}:${MongoSecrets.PORT}`;


async function getBlogEntry(searched_id=null) {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        const database = client.db(MongoSecrets.DB_NAME);
        const collection = database.collection(MongoCollections.BLOG_ENTRIES);
    
        // Retrieve all documents from the collection
        let collection_entries;
        if(searched_id){
            collection_entries = await collection.find({ blogId: new ObjectId(searched_id) }).toArray();
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
        const currentTime = new Date();

        const newBlog = {
            blogId: new ObjectId(),
            createdAt : currentTime.toUTCString(),
            title: title_val,
            body: body_val,
            author: author_val,
        };

        result = await collection.insertOne(newBlog);
        return result;

    }finally{
        await client.close();
    }

}


async function removeBlogEntry(searched_blog_id){
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try{
        await client.connect();
        const database = client.db(MongoSecrets.DB_NAME);
        const collection = database.collection(MongoCollections.BLOG_ENTRIES);
        const deleteResult = await collection.deleteOne({ blogId: new ObjectId(searched_blog_id) });
        return deleteResult;

    }finally{
        await client.close()
    }

}


async function getCommentsOfBlogId(searched_blog_id) {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try{
        await client.connect();
        const database = client.db(MongoSecrets.DB_NAME);
        const collection = database.collection(MongoCollections.COMMENT_ENTRIES);
        result = await collection.find({blogId: new ObjectId(searched_blog_id)}).sort({ createdAt: -1 }).toArray();
        return result


    }finally{
        client.close()
    }
    

}

async function addCommentToBlogEntry(userId, user, comment, searched_blog_id){
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        const entry = await getBlogEntry(searched_blog_id);
        if(!entry){
            return 0;
        }
        const currentTime = new Date();
        await client.connect();
        const database = client.db(MongoSecrets.DB_NAME);
        const collection = database.collection(MongoCollections.COMMENT_ENTRIES);
        const newComment = {
            blogId: new ObjectId(searched_blog_id),
            commentId : new ObjectId(),
            userId: userId,
            username: user,
            comment: comment,
            createdAt: currentTime.toUTCString()
        }
        result = await collection.insertOne(newComment);
        if (result.acknowledged){
            console.log('Comment added successfully to blog post.');
            return 0
        }
        else{
            return 1
        }
      } catch (error) {
        // Handle the error
      } finally {
        client.close()
      }
}


async function findCommentByCommentIdInBlog(searched_blog_id, searched_comment_id){
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try{
        await client.connect()
        const database = client.db(MongoSecrets.DB_NAME);
        const collection = database.collection(MongoCollections.COMMENT_ENTRIES);
        const comments = await collection.findOne({blogId: new ObjectId(searched_blog_id), commentId: new ObjectId(searched_comment_id)});
        //if(comments[0].length !== 1){
        //    throw Error("There should only be one comment with that id in that blog 2")
        //}
        return comments
    }finally{
        await client.close()
    }
}

async function deleteCommentOfBlogByCommentId(searched_blog_id, searched_comment_id){
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try{
        await client.connect()
        const database = client.db(MongoSecrets.DB_NAME);
        const collection = database.collection(MongoCollections.COMMENT_ENTRIES);
        const result = await collection.deleteOne({blogId: new ObjectId(searched_blog_id), commentId: new ObjectId(searched_comment_id)})
        // Check the result and return a status
        if (result.deletedCount === 1) {
            console.log(`Comment with commentId ${searched_comment_id} deleted from blog with id ${searched_blog_id}`);
            return { status: 200, message: 'Comment deleted successfully' };
        } else if (result.deletedCount === 0) {
            console.log(`No matching comment found to delete.`);
            return { status: 404, message: 'Comment not found' };
        } else{
            console.log('When deleting a comment, multiple were affected. This shouldnt happen!')
            return { status: 500, message: 'Internal Error'};
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
    getCommentsOfBlogId,
    addCommentToBlogEntry,
    removeBlogEntry,
    findCommentByCommentIdInBlog,
    deleteCommentOfBlogByCommentId
}