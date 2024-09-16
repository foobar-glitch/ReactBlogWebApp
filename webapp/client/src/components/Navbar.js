import React from 'react';
import { Link } from "react-router-dom";
import { authenticate_endpoint } from "./Universals";
import useFetchGET from "./useFetchGET";


const Navbar = () => {
    function displayInfo(profile_data){
        let html_code = [];
        if(profile_data.status === 200){
            console.log(profile_data.role)
            if (profile_data.message.role === "author" || profile_data.message.role === "admin"){
                html_code.push(
                    <Link to="/create" style={{
                        color: "white",
                        backgroundColor: '#f1356d',
                        borderRadius: '8px'
                    }}>New Blog</Link>
                )
                if( profile_data.message.role === "admin"){
                    html_code.push(
                        <Link to="/admin">Admin</Link>
                    )
                }
            }
            html_code.push(
                <Link to="/profile">Profile</Link>
            );
             
        }else{
            html_code.push(
                <Link to="/login">Login</Link>
            )
        }
        return html_code
    }
    
    const { data: profile_data, isPending, error } = useFetchGET(authenticate_endpoint);
    console.log(error);
    return (
        <nav className="navbar">
            <h1>The Blog</h1>
            <div className="links">
                <Link to="/">Home</Link>
                {!isPending && profile_data && displayInfo(profile_data)}
            </div>
        </nav>

    );
}

export default Navbar;