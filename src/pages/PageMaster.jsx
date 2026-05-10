import React from 'react';
import { ManageMasterContent } from '../components/AdminSettings/PageMaster/ManageMasterContent';
import { ToastContainer } from 'react-toastify';
export const PageMaster = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                    <ManageMasterContent />
                </div>
            </div>
        </div>
    )
}
