import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { login_endpoint } from "./Universals";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const history = useNavigate();

    const [errorMessage, setErrorMessage] = useState(null);

    const handleLogin = (e) => {
        e.preventDefault();
        const loginForm = { username, password };
        
        fetch(login_endpoint, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
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
    
  
    return(
        <div className="login">
            <div className="signIn">
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
                    {errorMessage && 
                    <div className="error-message">{errorMessage}</div>}
                    <div className="options">
                        <input className="remember" type="checkbox" value="remember"></input> <a>Remember Me</a>
                        <div className="resetpassword"><a><Link to="/forgot">Forgot Password?</Link></a></div>
                    </div>
                    
                    <button type="submit">Login</button>
                </form>
                
            </div>
            <div className="signUp">Not a member yet? <br/>
                <button onClick={goToSignUp}>
                    Sign Up
                </button>
            </div>
        </div>
    );
}

export default Login;