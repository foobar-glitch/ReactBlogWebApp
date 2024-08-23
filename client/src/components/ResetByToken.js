import React from 'react';
import { useState } from "react";
import { useLocation } from 'react-router-dom';
import { reset_by_token_endpoint } from './Universals'
import useFetchGET from "./useFetchGET";


const ResetByToken = () => {
    const location = useLocation();
    const [password, setPassword] = useState('');
    const [verifyPassword, setVerifyPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(null)
    //const [token, setToken] = useState('');

    const getQueryParams = () => {
        const params = new URLSearchParams(location.search);
        const paramObject = {};
        for (const [key, value] of params.entries()) {
          paramObject[key] = value;
        }
        return paramObject;
    };

    const handleReset = (e) =>{
        e.preventDefault();
        if(password !== verifyPassword){
            return <div> Passwords dont match</div>
        }

        const loginForm = {
            "token" : token,
            "password" : password, 
            "verifyPassword" : verifyPassword,
        };
        
        fetch(reset_by_token_endpoint, {
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
        })
    }


    const new_password = (token) => {
        return (
            <div className="resetpass">
                <form onSubmit={handleReset}>
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
                        onChange={(e) => setVerifyPassword(e.target.value)} 
                        value={verifyPassword}
                        required>
                    </input>
                    <input type="token" value={token} required hidden></input>
                    <button type="submit">Reset</button>
                </form>
            </div>
        )
    }
    const give_welcome = (username) =>{
        return (
            <div className='welcome-reset'>Reset your password, <b>{username}</b>:</div>
        )
    }


    const token = getQueryParams()['token'];
    const { data: tokenResponse, isPending, error } = useFetchGET(`${reset_by_token_endpoint}?token=${token}`);
    return(
        <div>
            {!isPending && tokenResponse && tokenResponse.status===202 && give_welcome(tokenResponse.username)}
            {!isPending && tokenResponse && tokenResponse.status===202 && new_password(token)}
        </div>
    );
}

export default ResetByToken;