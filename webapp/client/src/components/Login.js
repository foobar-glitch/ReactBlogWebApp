import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { login_endpoint } from "./Universals";
import { useNavigate } from "react-router-dom";
import CsrfInput from './CsrfComponent';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const history = useNavigate();

    const [errorMessage, setErrorMessage] = useState(null);
    const csrf_input = CsrfInput();


    const handleLogin = (e) => {
        console.log(e)
        e.preventDefault();
        const formData = new FormData(e.target);
        const csrfToken = formData.get('_csrf');
        const loginForm = { username, password };
        
        fetch(login_endpoint, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json", 
                "X-CSRF-Token": csrfToken
            },
            body: JSON.stringify(loginForm),
            credentials: 'include'
        })
        .then(res => {
            if(!res.ok){
                throw Error('Could not fetch the data for that resource')
            }
            return res.json();
        })
        .then((data) => {
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

    const goToSignUp = () => {
        history('/register')
    }

    

    const giveLoginForm = () => {
        return (
            <form onSubmit={handleLogin}>
                <label>Usename: </label>
                <input type="text" 
                    onChange={(e) => setUsername(e.target.value)}
                    value={username} 
                    required>
                </input>
                <label>Password: </label>
                <input 
                    type="password"  
                    onChange={(e) => setPassword(e.target.value)} 
                    value={password}
                    required>
                </input>
                {csrf_input}
                {errorMessage && 
                <div className="error-message">{errorMessage}</div>}
                <div className="options">
                    <input className="remember" type="checkbox" value="remember"></input> <a>Remember Me</a>
                    <div className="resetpassword"><a><Link to="/forgot">Forgot Password?</Link></a></div>
                </div>
                
                <button type="submit">Login</button>
            </form>
        )
    }

    
    return(
        (
        <div className="login">
            <div className="signIn">
                {giveLoginForm()}
            </div>
            <div className="signUp">Not a member yet? <br/>
                <button onClick={goToSignUp}>
                    Sign Up
                </button>
            </div>
        </div>
        )
    );
}

export default Login;