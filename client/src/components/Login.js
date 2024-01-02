import { useState } from "react";
import { login_endpoint } from "./Universals";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const history = useHistory();

    const [errorMessage, setErrorMessage] = useState(null);

    const handleLogin = (e) => {
        e.preventDefault();
        const loginForm = { username, password};
        
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
                history.push('/');
                window.location.reload();
            }
        })
        
    }
    
  
    return(
        <div className="login">
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
                <div className="error-message"  style={
                    { 
                        color: 'red',
                        fontSize: '13px',
                        lineHeight: '16px',
                        textAlign: 'left',
                        marginBottom: '0.9rem'
                    }
                }>{errorMessage}</div>}
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;