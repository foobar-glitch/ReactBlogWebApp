import { authenticate_endpoint, logout_endpoint } from "./Universals";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import useFetchGET from "./useFetchGET";

const Profile = () => {
    const history = useHistory();

    function displayInfo(profile_data){
        if(profile_data.status !== 200){
            history.push('/login',{ status: 404, message: 'Please login first' });
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
            history.push('/');
            window.location.reload();
        })
        .catch(err => {
            if(err.name === 'AbortError'){
                console.log("Fetch aborted");
            }
             
        })
    }
    


    const { data: profile_data, isPending, error } = useFetchGET(authenticate_endpoint, []);
    return(
        <div className="profile">
            {profile_data && displayInfo(profile_data)}
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default Profile;