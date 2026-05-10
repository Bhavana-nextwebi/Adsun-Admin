import React from 'react';
import { ToastContainer } from 'react-toastify';
import AddAppUser from '../components/AppSettings/AddAppUsers';
export const AppUserAdd = () => {

    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                <AddAppUser/>
                </div>
            </div>
        </div>
    );
};