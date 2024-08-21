import { useState } from "react";
import { forgot_password_enpoint } from './Universals'


const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState(null)

    const handleForgotPassword = (e) => {
        const loginForm = { email };
        console.log(loginForm)
        e.preventDefault();
        fetch(forgot_password_enpoint, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(loginForm),
            credentials: 'include'
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
                <button type="submit">Sign Up</button>
            </form>
        </div>
    )
}

export default ForgotPassword;