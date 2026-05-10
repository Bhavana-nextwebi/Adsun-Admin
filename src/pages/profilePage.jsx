import React from 'react';
import { ToastContainer } from 'react-toastify';
import { ProfilePageContent } from '../components/AdminSettings/ProfilePageContent';
export const ProfilePage = () => {

    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                <ProfilePageContent/>
                </div>
            </div>
        </div>
    );
};
