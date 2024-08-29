import React from 'react';
import { useState } from "react";
import { register_endpoint } from "./Universals";

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVerify, setPasswordVerify] = useState('');

    const [serverResponse, setServerResponse] = useState('');

    const handleRegister = (e) =>{
        const loginForm = { username, email, password, passwordVerify};
        console.log(loginForm)
        e.preventDefault();
        fetch(register_endpoint, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
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

    return (
        <div className="register">
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
                {serverResponse && serverResponse.status !== 200 && <div className="error-message">{serverResponse.message}</div>}
                {serverResponse && serverResponse.status === 200 && <div className="success-message">{serverResponse.message}</div>}
                <button type="submit">Sign Up</button>
            </form>
        </div>
    )
}


export default Register;