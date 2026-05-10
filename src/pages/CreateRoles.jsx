import React from 'react';
import { ManageRolesContent } from '../components/AdminSettings/CreateRoles/ManageRolesContent';
import { ToastContainer } from 'react-toastify';
export const CreateRoles = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                    <ManageRolesContent />
                </div>
            </div>
        </div>
    )
}
