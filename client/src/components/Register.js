

const Register = () => {




    return (
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
                <div className="error-message">{errorMessage}</div>}
                <button type="submit">Login</button>
            </form>
            <div className="noAccount">Not a member yet? Register <a href="/register">here</a></div>
        </div>
    )
}


export default Register;