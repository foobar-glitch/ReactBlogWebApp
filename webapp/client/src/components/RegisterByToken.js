import React from 'react';
import { useState } from "react";
import { useLocation } from 'react-router-dom';
import { register_by_token_endpoint } from './Universals'
import useFetchGET from "./useFetchGET";


const RegisterByToken = () => {
    const location = useLocation();

    const getQueryParams = () => {
        const params = new URLSearchParams(location.search);
        const paramObject = {};
        for (const [key, value] of params.entries()) {
          paramObject[key] = value;
        }
        return paramObject;
    };



    const token = getQueryParams()['token'];
    const { data, isPending, error } = useFetchGET(`${register_by_token_endpoint}?token=${token}`);
    return(
        <div className='register-by-token'>
            Checking registration token:<br />
            {data && <div>{data.message}</div>}
        </div>
    );
}

export default RegisterByToken;