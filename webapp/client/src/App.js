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

function App() {
  return React.createElement(BrowserRouter, null,
    React.createElement('div', { className: 'App' },
      React.createElement(Navbar),
      React.createElement('div', { className: 'content' },
        React.createElement(Routes, null,
          React.createElement(Route, { path: "/", element: React.createElement(Home) }),
          React.createElement(Route, { path: "/create", element: React.createElement(Create) }),
          React.createElement(Route, { path: `/blogs/:blogId`, element: React.createElement(BlogDetails) }),
          React.createElement(Route, { path: "/login", element: React.createElement(Login) }),
          React.createElement(Route, { path: "/register", element: React.createElement(Register) }),
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
