import React from 'react';
import NotFound from './NotFound';

const checkAuthentication = (component, condition) => {
    if(condition === true){
        return React.createElement(component)
    }
    else{
        return React.createElement(NotFound)
    }
}

const ProtectedRoute = ({ component, condition }) => {
    return <>
        {checkAuthentication(component, condition)}
    </>
};

export default ProtectedRoute;