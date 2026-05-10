import React from 'react';
import { ToastContainer } from 'react-toastify';
import { ProfilePagePasswordReset } from '../components/AdminSettings/ProfilePagePasswordReset';
export const ChangePassword = () => {

    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                <ProfilePagePasswordReset/>
                </div>
            </div>
        </div>
    );
};
