import React from 'react';
import { ToastContainer } from 'react-toastify';
import AddUser from '../components/AdminSettings/CreateRoles/UserManagement/Adduser';
export const NewUser = () => {

    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                <AddUser/>
                </div>
            </div>
        </div>
    );
};
