import React, { useState } from 'react';
import { blogs_endpoint } from "./Universals";
import { useNavigate } from 'react-router-dom';

const Create = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    //const [author, setAuthor] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const history = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        //const blog = { title, body, author };
        const blog = { title, body };
        setIsPending(true);

        fetch(blogs_endpoint, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(blog),
            credentials: 'include'
        }).then((res) => {
            if(!res.ok){
                throw Error('Could not fetch the data for that resource')
            }
            return res.json();
        }).then((data) => {
            setIsPending(false);
            if(data.status === 200){
                history("/")
            }else{
                setErrorMessage(data.message) 
            }
            
        })
    }


    return(
        <div className="create"> 
        {errorMessage &&<div className="error-message">{errorMessage}</div>}
            <h2>Add a New Blog</h2>
            <form onSubmit={handleSubmit}>
                <label>Blog Title:</label>
                <input
                 type="text"
                 required
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
                 />
                 <label>Blog Body:</label>
                <textarea
                    required
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                 />
                 {!isPending && <button>Add Blog</button>}
                 {isPending && <button disabled>Adding blog ...</button>}
            </form>
            
        </div>
    );
}

export default Create;