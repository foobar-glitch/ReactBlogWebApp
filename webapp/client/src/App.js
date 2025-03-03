import React from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Create from './components/Create';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import BlogDetails from './components/BlogDetails';
import NotFound from './components/NotFound';
import Login from './components/Login';
import Profile from './components/Profile';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetByToken from './components/ResetByToken'
import RegisterByToken from './components/RegisterByToken';
import useFetchGET from './components/useFetchGET';
import ProtectedRoute from './components/ProtectedRoute';
import { authenticate_endpoint } from './components/Universals';
import AdminPanel from './components/AdminPanel';

function isAuthorOrAdmin(profile_data){
  return profile_data.status === 200 && (profile_data.message.role === "author" || profile_data.message.role === "admin")
}

function isAdmin(profile_data){
  return profile_data.status === 200 && profile_data.message.role === "admin"
}


function App() {

  const { data: profile_data, isPending, error } = useFetchGET(authenticate_endpoint);


  return profile_data && !isPending && !error && React.createElement(BrowserRouter, null,
    React.createElement('div', { className: 'App' },
      React.createElement(Navbar),
      React.createElement('div', { className: 'content' },
        React.createElement(Routes, null,
          React.createElement(Route, { path: "/", element: React.createElement(Home) }),
          React.createElement(Route, { 
            path: "/create", 
            element: React.createElement(ProtectedRoute, {
              component: Create,
              condition: isAuthorOrAdmin(profile_data)
            })
          }),
          React.createElement(Route, { 
            path: "/admin", 
            element: React.createElement(ProtectedRoute, {
              component: AdminPanel,
              condition: isAdmin(profile_data)
            })
          }),
          React.createElement(Route, { path: `/blogs/:blogId`, element: React.createElement(BlogDetails) }),
          React.createElement(Route, { path: "/login", element: React.createElement(Login) }),
          React.createElement(Route, { path: "/register", element: React.createElement(Register) }),
          React.createElement(Route, { path: "/register/validate", element: React.createElement(RegisterByToken) }),
          React.createElement(Route, { path: "/forgot", element: React.createElement(ForgotPassword) }),
          React.createElement(Route, { path: "/forgot/reset", element: React.createElement(ResetByToken) }),
          React.createElement(Route, { path: "/profile", element: React.createElement(Profile) }),
          React.createElement(Route, { path: "*", element: React.createElement(NotFound) })
        )
      )
    )
  );
}

export default App;
