import React from 'react';
const BlogEntryCommentsList = ({comments}) => {
    return(
        <div className="comment-list">
            {comments.map((comment) => (
                <div className="comment">
                    <div className='username'>{comment.username} </div>
                    <div className='creation'>{comment.createdAt}</div>
                    <div className='entry'>{comment.comment}</div>
                </div>
            ))}
        </div>
    );
}

export default BlogEntryCommentsList;