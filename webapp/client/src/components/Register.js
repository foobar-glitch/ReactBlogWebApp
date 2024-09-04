import React from 'react';
import { useState } from "react";
import { register_endpoint } from "./Universals";
import CsrfInput from './CsrfComponent';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVerify, setPasswordVerify] = useState('');

    const [serverResponse, setServerResponse] = useState('');
    const csrf_input = CsrfInput();

    const handleRegister = (e) =>{
        const loginForm = { username, email, password, passwordVerify};
        const formData = new FormData(e.target);
        const csrfToken = formData.get('_csrf');
        console.log(loginForm)
        e.preventDefault();
        fetch(register_endpoint, {
            method: 'POST',
            headers: {"Content-Type": "application/json", "X-CSRF-Token": csrfToken},
            body: JSON.stringify(loginForm),
            credentials: 'include'
        }).then(
            (res) => {
                console.log(res)
                if(!res.ok){
                    throw Error('Could not fetch the data for that resource')
                }
                return res.json();
            }
        ).then(
            (data) => {
                setServerResponse(data)
            }
        )
        
    }

    

    const give_form = () =>{
        return (
            <form onSubmit={handleRegister}>
                <label>Usename: </label>
                <input type="text" 
                    onChange={(e) => setUsername(e.target.value)}
                    value={username} 
                    required>
                </input>
                <label>E-Mail: </label>
                <input type="email" 
                    onChange={(e) => setEmail(e.target.value)}
                    value={email} 
                    required>
                </input>

                <label>Password: </label>
                <input 
                    type="password"  
                    onChange={(e) => setPassword(e.target.value)} 
                    value={password}
                    required>
                </input>
                <label>Verify Password: </label>
                <input 
                    type="password"  
                    onChange={(e) => setPasswordVerify(e.target.value)} 
                    value={passwordVerify}
                    required>
                </input>
                {csrf_input}
                {serverResponse && serverResponse.status !== 200 && <div className="error-message">{serverResponse.message}</div>}
                <button type="submit">Sign Up</button>
            </form>
        )
    }


    return (
        [
        <div className="register">
            {(!serverResponse || serverResponse.status !== 200) && give_form()}
            {serverResponse && serverResponse.status === 200 && <div className="success-message">Please verify the email you have received.</div>}
        </div>
        ]
    )
}


export default Register;