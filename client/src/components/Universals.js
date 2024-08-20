
const api_endpoint = 'http://localhost:8080';
//const api_endpoint = "http://blog.localhost/api";
const login_endpoint = api_endpoint + '/login';
const logout_endpoint = api_endpoint + '/logout';
const blogs_endpoint = api_endpoint + '/blogs';
const authenticate_endpoint = api_endpoint + '/authenticate';
const profile_data_endpoint = api_endpoint + '/get-profile-info';
const register_endpoint = api_endpoint + '/register'


export {blogs_endpoint, login_endpoint, logout_endpoint, register_endpoint, authenticate_endpoint, profile_data_endpoint};
