import React, { useState } from 'react';
import { blogs_endpoint } from './Universals';
import { useParams } from 'react-router-dom';
import CsrfInput from './CsrfComponent';

const BlogEntryCommentsList = ({comments}) => {
    const { blogId } = useParams();
    const [error, setError] = useState(null)
    const [enableEdit, setEnableEdit] = useState(false)
    const [editText, setEditTextt] = useState('')
    const csrf_input = CsrfInput();

    const handleDeleteComment = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const csrfToken = formData.get('_csrf');
        const commentId = formData.get('_commentId')

        fetch(`${blogs_endpoint}/${blogId}/comments/${commentId}`, {
            method: 'DELETE', headers: {"X-CSRF-Token": csrfToken}, credentials: 'include' 
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
        setEnableEdit(true)
    }
    const closeEdit = () => {
        setEnableEdit(false)
    }

    const giveEdit = () => {
        return (
            <div className='edit-field'>
                <textarea
                    required
                    value={editText}
                    onChange={(e) => setEditTextt(e.target.value)}
                />
                <button className='disable-edit' onClick={closeEdit}>close edit</button>
            </div>
        )
    }


   

    return(
        (
        <div className="comment-list">
            {error && <div className='error-message'>{error}</div>}
            <form className='comment-form' onSubmit={handleDeleteComment}>
                {comments.map((comment) => ( 
                    <div className="comment-body">
                        <div className='comment'>
                            <div className='header'>
                                <div className='username'>{comment.username} </div>
                                <div className='creation'>{comment.createdAt}</div>
                            </div>
                            {enableEdit && giveEdit()}
                            {!enableEdit && <div className='entry' onClick={editComment}>{comment.comment}</div>}
                        </div>
                        <input type='hidden' name="_commentId" value={comment.commentId} required ></input>
                        <button type='submit' formAction='action_delete'> DEL</button>
                    </div>
                ))}
            {csrf_input}
            </form>
        </div>
        )
    );
}

export default BlogEntryCommentsList;