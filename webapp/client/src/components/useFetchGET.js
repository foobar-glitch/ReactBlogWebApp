import React from 'react';
import { useState, useEffect } from "react";

const useFetchGET = (url, dependencies=[]) => {
    const [data, setData] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const abortCont = new AbortController();
        fetch(url, { method:"GET", signal: abortCont.signal, credentials: 'include' })
        .then(res => {
            if(!res.ok){
                throw Error('Could not fetch the data for that resource')
            }
            return res.json();
        })
        .then(data =>{
            setData(data);
            setIsPending(false);
            setError(null);
        })
        .catch(err => {
            if(err.name === 'AbortError'){
                //console.log("Fetch aborted");
            }else{
                setIsPending(false);
                setError(err.message);
            }
        })
        return () => abortCont.abort();
    }, [url, ...dependencies]);

    return {data, isPending, error};
}


export default useFetchGET;