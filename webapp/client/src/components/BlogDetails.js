import React, { useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import useFetchGET from "./useFetchGET";
import { blogs_endpoint } from "./Universals";
import BlogEntryCommentsList from "./BlogEntryCommentsList";


const BlogDetails = () =>{
    const { blogId } = useParams();
    const { data, error, isPending } = useFetchGET(`${blogs_endpoint}/${blogId}`);
    const history = useNavigate();
    const [comment, setComment] = useState('');
    const [deleteBlogRes, setDeleteBlogRes] = useState(null);
    const [commentFailure, setCommentFail] = useState(false);

    const handleBlogDeletion = () => {
        fetch(`${blogs_endpoint}/${blogId}`,{
            method: 'DELETE',
            credentials: 'include' 
        }).then((res) => {
            if(!res.ok){
                throw Error('Could not fetch the data for that resource')
            }
            return res.json();
        }).then((data) =>{
            console.log(data)
            if(data.status === 200){
                history("/")
            }
            else{
                setDeleteBlogRes(data.message)
            }
            
        })
    }

    const handleCommentInsertion = (e) => {
        e.preventDefault();
        const comment_json = JSON.stringify({'comment': comment})
        console.log(comment_json)
        fetch(`${blogs_endpoint}/${blogId}/comments`, {
            method: 'POST',
            credentials: 'include',
            headers: {"Content-Type": "application/json"},
            body: comment_json
        }).then((res) => {
            console.log(res)
            if(!res.ok){
                throw Error('Could not fetch the data for that resource')
            }
            return res.json();
        })
        .then((data) => {
            if(data.status === 200){
                window.location.reload();
            }
            else{
                setCommentFail(true)
            }
            console.log(data); // Log the response data
        })
        .catch((error) => {
            console.error('Error:', error); // Log any errors that occurred during the fetch
        });
        
    }

    return (
        <div className="blog-details">
            { deleteBlogRes && <div className='delete-response'>{deleteBlogRes}</div> }
            { isPending && <div>Loading...</div>}
            { error && <div>{ error }</div> }
            { data && data.status === 200 && 
            [
                (
                <article class='blog-article'>
                    <h2>{ data.message.title }</h2>
                    <p class="meta-info">Created at { data.message.createdAt } <br />
                    Written by <b><i>{ data.message.author }</i></b>
                    </p>
                    <div className="blog-body">{ data.message.body }</div>
                    <button onClick={handleBlogDeletion}>Delete</button>
                </article>), 
                (
                <form className="comment-section" onSubmit={handleCommentInsertion}>
                    {commentFailure && <div className='comment-failure'>Could not add a comment</div>}
                    <h3>Comments</h3>
                    <div className="comment-input-container">
                        <input 
                            type="text"
                            required 
                            className="comment-input" 
                            placeholder="Add a comment..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <button className="comment-submit">Submit</button>
                    </div>
                    
                    {data && data.status == 200 && <BlogEntryCommentsList comments={data.message.comments} title="All Comments"/>}
                </form>
                )
            ]}
            { data && data.status === 404 && (<div className='not-found'>Entry not found</div>)}
            
        </div>
    );
}


export default BlogDetails;