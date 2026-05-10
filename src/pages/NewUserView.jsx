import React from 'react';
import { ToastContainer } from 'react-toastify';
import { ManageUser } from '../components/AdminSettings/CreateRoles/UserManagement/ManageUser';
export const NewUserView = () => {

    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                <ManageUser/>
                </div>
            </div>
        </div>
    );
};
