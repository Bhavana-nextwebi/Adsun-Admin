import React from 'react';
import { ToastContainer } from 'react-toastify';
import { UpdateUser } from '../components/AdminSettings/CreateRoles/UserManagement/UpdateUser';
export const NewUserUpdate = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                <UpdateUser/>
                </div>
            </div>
            
        </div>
        
    )
}
