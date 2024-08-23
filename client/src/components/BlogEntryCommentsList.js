import React from 'react';
const BlogEntryCommentsList = ({comments}) => {
    return(
        <div className="comment-list">
            {comments.map((comment) => (
                <div className="comment">{comment.username}: {comment.comment}</div>
            ))}
        </div>
    );
}

export default BlogEntryCommentsList;