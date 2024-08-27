import React, { useState } from 'react';
import { blogs_endpoint } from './Universals';
import { useParams } from 'react-router-dom';
const BlogEntryCommentsList = ({comments}) => {
    const { blogId } = useParams();
    const [error, setError] = useState(null)

    const handleDeleteComment = (commendId) => {
        console.log(commendId)
        fetch(`${blogs_endpoint}/${blogId}/comments/${commendId}`, {
            method: 'DELETE', credentials: 'include' 
        }).then(
            (res) =>{
            if(!res.ok){
                throw Error('Could not fetch the data for that resource')
            }
            return res.json();
            }
        ).then(
            (data) => {
                if(data.status == 200){
                    window.location.reload()
                }
                else{
                    setError(data.message)
                }
            }
        )
        
    }

    const editComment = () => {
        console.log("Now edit")
    }

    return(
        <div className="comment-list">
            {error && <div className='error-message'>{error}</div>}
            {comments.map((comment) => ( 
                <div className="comment-body">
                    <div className='comment'>
                        <div className='header'>
                            <div className='username'>{comment.username} </div>
                            <div className='creation'>{comment.createdAt}</div>
                        </div>
                        <div className='entry' onClick={editComment}>{comment.comment}</div>
                        <div className='modify'>
                            <span className='delete' onClick={() => handleDeleteComment(comment.commentId)}>DEL</span>
                            <span className='edit' onClick={() => editComment()}>EDIT</span>
                        </div>
                    </div>
                    
                </div>
            ))}
        </div>
    );
}

export default BlogEntryCommentsList;