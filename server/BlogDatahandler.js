const { MongoClient, ObjectId } = require('mongodb');
const {username, db_host, db_password, db_name, collection_name} = require('/var/www/private/nodejs/mongodbCredentials')

const uri = `mongodb://${username}:${db_password}@${db_host}:27017`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function getBlogEntry(id_num=null) {
    try {
        await client.connect();
        const database = client.db(db_name);
        const collection = database.collection(collection_name);
    
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
        const database = client.db(db_name);
        const collection = database.collection(collection_name);
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

async function addCommentToBlogEntry(user, comment, blog_id){
    try {
        const entry = await getBlogEntry(blog_id);
        if(!entry){
            return 0;
        }
        // Do something with the entry
        console.log(`MY COMMENT ${comment}`)
        await client.connect();
        const database = client.db(db_name);
        const collection = database.collection(collection_name);
        result = await collection.updateOne(
            {id: +blog_id}, { $push: {
                comments: {'username': user, 'comment': comment}
            }}
        )

        console.log("My result")
        console.log(result)
        if (result.modifiedCount == 1) 
            console.log('Comment added successfully to blog post.');
        if (result.modifiedCount > 1){
            console.log("More than one edited")
        }
        if (restult.modifiedCount < 1){
            console.log('No matching blog post found or comment was not added.');
        }
        return result
      } catch (error) {
        // Handle the error
      }
}

async function removeBlogEntry(id_val){
    try{
        await client.connect();
        const database = client.db(db_name);
        const collection = database.collection(collection_name);
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