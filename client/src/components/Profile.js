import React from 'react';
import { profile_data_endpoint, logout_endpoint } from "./Universals";
import { useNavigate } from "react-router-dom";
import useFetchGET from "./useFetchGET";

const Profile = () => {
    const history = useNavigate();

    function displayInfo(profile_data){
        if(profile_data.status !== 200){
            history('login',{ status: 404, message: 'Please login first' });
        }else{
            console.log(profile_data)
            return(
                <div className="profile-details">
                    <p>UserId: {profile_data.message.userId}</p>
                    <p>Username: {profile_data.message.username}</p>
                    <p>Role: {profile_data.message.role}</p>
                </div>
            )
        }
    }

    
    function handleLogout(){
        console.log("handling logout")
        fetch(logout_endpoint, { method:"GET", credentials: 'include' })
        .then(res => {
            if(!res.ok){
                throw Error('Could not fetch the data for that resource')
            }
            return res.json();
        })
        .then(data => {
            console.log(data);
            history('/');
            window.location.reload();
        })
        .catch(err => {
            if(err.name === 'AbortError'){
                console.log("Fetch aborted");
            }
             
        })
    }
    


    const { data: profile_data, isPending, error } = useFetchGET(profile_data_endpoint, []);
    return(
        <div className="profile">
            {profile_data && displayInfo(profile_data)}
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default Profile;