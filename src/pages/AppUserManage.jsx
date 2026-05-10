import React from 'react';
import { ToastContainer } from 'react-toastify';
import { ManageAppUser } from '../components/AppSettings/ManageAppUsers';
export const AppUserManage = () => {

    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                <ManageAppUser/>
                </div>
            </div>
        </div>
    );
};
