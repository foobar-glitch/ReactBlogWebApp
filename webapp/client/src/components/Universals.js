const api_endpoint = 'http://127.0.0.1:8080';
//const api_endpoint = "/api";
const login_endpoint = api_endpoint + '/login';
const logout_endpoint = api_endpoint + '/logout';
const blogs_endpoint = api_endpoint + '/blogs';
const authenticate_endpoint = api_endpoint + '/authenticate';
const profile_data_endpoint = api_endpoint + '/get-profile-info';
const register_endpoint = api_endpoint + '/register'
const forgot_password_enpoint = api_endpoint + '/forgot'
const reset_by_token_endpoint = api_endpoint + '/forgot/reset'
const register_by_token_endpoint = api_endpoint + '/register/validate'
const csrf_endpoint = api_endpoint + '/csrf'
const admin_endpoint = api_endpoint + '/admin'
const set_role_endpoint = admin_endpoint + '/set-role'


export {blogs_endpoint, login_endpoint, logout_endpoint, register_endpoint, authenticate_endpoint, profile_data_endpoint, forgot_password_enpoint, reset_by_token_endpoint, register_by_token_endpoint, csrf_endpoint, admin_endpoint, set_role_endpoint};
