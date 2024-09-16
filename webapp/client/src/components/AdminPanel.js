import { useState } from "react";
import CsrfInput from "./CsrfComponent";
import { admin_endpoint, set_role_endpoint } from "./Universals"
import useFetchGET from "./useFetchGET"
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
    const csrf_input = CsrfInput();
    const [changeRolePending, setChangeRolePending] = useState(true);
    const [changeRoleError, setChangeRoleError] = useState(null)
    const history = useNavigate();

    const changeRole = (user_id) => {
        const selectedRole = document.querySelector(`select[data-user-id="${user_id}"]`).value
        const csrf_value = document.querySelector('div._csrf').querySelector('input').value
        const user_data = { user_id: user_id, role: selectedRole };
        fetch(
            set_role_endpoint, {
                method: 'POST',
                headers: {"Content-Type": "application/json",  "X-CSRF-Token": csrf_value},
                body: JSON.stringify(user_data),
                credentials: 'include'
            }
        ).then((res) => {
            if(!res.ok){
                throw Error('Could not fetch the data for that resource')
            }
            return res.json()
        }).then((data) => {
            setChangeRolePending(false)
            console.log(data)
            if(data.status === 200){
                history(0)
            }else{
                console.log("hello")
                setChangeRoleError(data.message)
            }
            
        })
        //setIsPending(true);
        //const formData = new FormData(e.target);
        //const csrfToken = formData.get('_csrf');

    }


    const giveUserInfo = (userArray) => {
        //[user_id, user_name, e-mail]
        return (
        <div className="user-list">
            <h1>User Management Panel</h1>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Current Role</th>
                        <th>Set Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {
                    userArray.map((user) => (
                        
                            <tr key={user.user_id}>
                                <td>{user.user_id}</td>
                                <td>{user.user_name}</td>
                                <td>{user.user_mail}</td>
                                <td>{user.user_role}</td>
                                <td>
                                    <select class="role-select" data-user-id={user.user_id}>
                                        <option value="user">user</option>
                                        <option value="author">author</option>
                                    </select>
                                </td>
                                <td>
                                    <div class="action-btns">
                                        <button class="btn" onClick={() => {changeRole(user.user_id)}}>Set Role</button>
                                        <button class="btn btn-delete">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        
                    ))
                    }
                </tbody>
            </table>
            <div className="_csrf">
                {csrf_input}
            </div>
            
        </div>
        )
    }
    const connectionNotPossible = () => {
        return (
        <div className="invalid-request">
            Request is invalid
        </div>
        )
    }

    const { data: user_data, isPending_admin_req, error_admin_req } = useFetchGET(admin_endpoint);
    return (
        <div className="admin-panel">
            {changeRoleError && <div style={{ color: 'red' }}>While Changing the Role: {changeRoleError}</div>}     
            {!error_admin_req && !isPending_admin_req && user_data && user_data.status === 200 && giveUserInfo(user_data.message.allUsers)
            }
            {!error_admin_req && !isPending_admin_req && user_data && user_data.status !== 200 && connectionNotPossible()}
            
        </div>

    );
}

export default AdminPanel;