/**
 * ProtectedComponent will protect the main routes of the website by checking authentication.
 * The API to obtain the NFTs takes time to execute, so after the initial authentication,
 * the NFTs will be stored with Redux Persist, which seems to use local storage.
 * Local storage is inherently not secure. Anybody can just go into their web browser's local
 * storage and edit it. Therefore, I am thinking we use a strong crypto encoder to encode/decode
 * all of the items we put into local storage. If we do that, all you have to do is protect
 * the key.
 */
import React from "react";
import { RouteProps, Route, Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const auth_token = window.localStorage.getItem("auth_token");
    const valid = true;
    if(valid) {
        return (
            <Outlet />
        )
    }
    else {
        return (
            <Navigate to={'/'} replace/>
        )
    }
};

export default ProtectedRoute;