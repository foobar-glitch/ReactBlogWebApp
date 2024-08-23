import React, { useState } from 'react';
import { forgot_password_enpoint } from './Universals'
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState(null)
    const history = useNavigate();

    const handleForgotPassword = (e) => {
        const loginForm = { email };
        console.log(loginForm)
        e.preventDefault();
        fetch(forgot_password_enpoint, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
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
                history('/');
                window.location.reload();
            }
        })
    }

    return (
        <div className="register">
            <form onSubmit={handleForgotPassword}>
                <label>E-Mail: </label>
                <input type="email" 
                    onChange={(e) => setEmail(e.target.value)}
                    value={email} 
                    required>
                </input>
                {errorMessage && 
                <div className="error-message">{errorMessage}</div>}
                <button type="submit">Reset Password</button>
            </form>
        </div>
    )
}

export default ForgotPassword;