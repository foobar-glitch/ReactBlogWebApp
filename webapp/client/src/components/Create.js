import React, { useState } from 'react';
import { blogs_endpoint } from "./Universals";
import { useNavigate } from 'react-router-dom';
import CsrfInput from './CsrfComponent';
import RichTextEditor from './RichtextEditor';

const Create = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    //const [author, setAuthor] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const history = useNavigate();
    const csrf_input = CsrfInput();

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(e)
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent the Enter key from triggering any action
            return
        }
        //const blog = { title, body, author };
        const blog = { title, body };
        setIsPending(true);
        const formData = new FormData(e.target);
        const csrfToken = formData.get('_csrf');

        fetch(blogs_endpoint, {
            method: 'POST',
            headers: {"Content-Type": "application/json",  "X-CSRF-Token": csrfToken},
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
        
        <>
        <div className="create"> 
        {errorMessage &&<div className="error-message">{errorMessage}</div>}
            <h2>Add a New Blog</h2>
            <form onSubmit={handleSubmit}>
                <input
                    className='title'
                    placeholder='Blog Title'
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <div className='blog'>
                    <RichTextEditor value={body} setBody={setBody} />
                </div>
                {csrf_input}
                {!isPending && <button className='adding-button' type="submit">Add Blog</button>}
                {isPending && <button className='adding-button' disabled>Adding blog ...</button>}
            </form>
        </div>
        
        
        </>
    );

}

export default Create;