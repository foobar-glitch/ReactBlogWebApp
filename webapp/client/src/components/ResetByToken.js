import React from 'react';
import { useState } from "react";
import { useLocation } from 'react-router-dom';
import { reset_by_token_endpoint } from './Universals'
import useFetchGET from "./useFetchGET";
import CsrfInput from './CsrfComponent';


const ResetByToken = () => {
    const location = useLocation();
    const [password, setPassword] = useState('');
    const [verifyPassword, setVerifyPassword] = useState('');
    const [resetSuccessfull, setResetsuccessfull] = useState(false)

    const csrf_input = CsrfInput();

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
        const formData = new FormData(e.target);
        const csrfToken = formData.get('_csrf');
        const token_from_form = formData.get('_token');

        const loginForm = {
            "token" : token_from_form,
            "password" : password, 
            "verifyPassword" : verifyPassword,
        };
        
        fetch(reset_by_token_endpoint, {
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
            if(data.status === 200){
                setResetsuccessfull(true)
            }else{
                setResetsuccessfull(false)
            }
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
                    <input type="hidden" name='_token' value={token} required></input>
                    {csrf_input}
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
        (
        <div className='reset-by-token'>
            {!isPending && !resetSuccessfull && tokenResponse && tokenResponse.status===400 && 
            <div className='invalid-token'>This token is not valid</div>
            }
            {!isPending && !resetSuccessfull && tokenResponse && tokenResponse.status===202 && 
            [give_welcome(tokenResponse.username), new_password(token)]
            }
            {!isPending && resetSuccessfull && <div className='password-reset'>Password reset was successfull</div>}
        </div>
        )
    );
}

export default ResetByToken;