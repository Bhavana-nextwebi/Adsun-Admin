import React from 'react';
import { ManageSmsTemplate } from '../components/MasterSettings/ManageSmsTemplate';
import { ToastContainer } from 'react-toastify';

export const SmsTemplate = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                    <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
                    <ManageSmsTemplate/>
                </div>
            </div>
        </div>
    );
};