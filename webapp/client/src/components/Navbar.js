import React from 'react';
import { Link } from "react-router-dom";
import { authenticate_endpoint } from "./Universals";
import useFetchGET from "./useFetchGET";


const Navbar = () => {
    function displayInfo(profile_data){
        if(profile_data.status === 200){
            return(
                <Link to="/profile">Profile</Link>
            );
        }else{
            return(
                <Link to="/login">Login</Link>
            )
        }
    }
    
    const { data: profile_data, isPending, error } = useFetchGET(authenticate_endpoint);
    console.log(error);
    return (
        <nav className="navbar">
            <h1>The Blog</h1>
            <div className="links">
                <Link to="/">Home</Link>
                <Link to="/create" style={{
                    color: "white",
                    backgroundColor: '#f1356d',
                    borderRadius: '8px'
                }}>New Blog</Link>
                {!isPending && profile_data && displayInfo(profile_data)}
            </div>
        </nav>

    );
}

export default Navbar;