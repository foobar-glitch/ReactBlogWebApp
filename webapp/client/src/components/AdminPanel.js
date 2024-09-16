import { admin_endpoint, authenticate_endpoint } from "./Universals"
import useFetchGET from "./useFetchGET"


const AdminPanel = () => {
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
                                <select class="role-select">
                                    <option value="user">User</option>
                                    <option value="author">Author</option>
                                </select>
                            </td>
                            <td>
                                <div class="action-btns">
                                    <button class="btn">Set Role</button>
                                    <button class="btn btn-delete">Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))
                    }
                </tbody>
            </table>
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
            {!error_admin_req && !isPending_admin_req && user_data && user_data.status === 200 && giveUserInfo(user_data.message.allUsers)
            }
            {!error_admin_req && !isPending_admin_req && user_data && user_data.status !== 200 && connectionNotPossible()}
        </div>
    );
}

export default AdminPanel;