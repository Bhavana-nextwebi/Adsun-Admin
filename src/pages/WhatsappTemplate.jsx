import React from 'react';
import { ManageWhatsappTemplate} from '../components/MasterSettings/ManageWhatsappTemplate';
import { ToastContainer } from 'react-toastify';

export const WhatsappTemplate = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                    <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
                    <ManageWhatsappTemplate/>
                </div>
            </div>
        </div>
    );
};