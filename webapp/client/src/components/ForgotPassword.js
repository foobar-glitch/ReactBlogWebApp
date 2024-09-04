import React, { useState } from 'react';
import { forgot_password_enpoint } from './Universals'
import { Link } from "react-router-dom";
import CsrfInput from './CsrfComponent';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState(null)
    const [success, setSucess] = useState(null)
    const csrf_input = CsrfInput();

    const handleForgotPassword = (e) => {
        const loginForm = { email };
        console.log(loginForm)
        e.preventDefault();

        const formData = new FormData(e.target);
        const csrfToken = formData.get('_csrf');

        fetch(forgot_password_enpoint, {
            method: 'POST',
            headers: {"Content-Type": "application/json", "X-CSRF-Token": csrfToken},
            body: JSON.stringify(loginForm),
            credentials: 'include'
        }).then(
            (res) => {
                if(!res.ok){
                    throw Error('Could not fetch the data for that resource')
                }
                return res.json();
            }
        ).then((data) => {
            console.log(data)
            if(data.status !== 200){
                setErrorMessage(data.message);
            }
            else{
                setSucess(1)
            }
        })
    }

    

    return (
        (
        <div className="register">
            {!success &&
            <form onSubmit={handleForgotPassword}>
                <label>E-Mail: </label>
                <input type="email" 
                    onChange={(e) => setEmail(e.target.value)}
                    value={email} 
                    required>
                </input>
                {csrf_input}
                {errorMessage &&  <div className="error-message">{errorMessage}</div>}
                <button type="submit">Reset Password</button>
            </form>
            }
            {success && 
            <div className='sucess'>
                If that E-Mail exists you will get a reset  link. <br />
            <Link to="/">Back To Mainpage</Link>
            </div>
            
            }
        </div>
        )
    )
}

export default ForgotPassword;