import React from 'react';
import { ManageCategoryContent } from '../components/MasterSettings/ManageCategory';
import { ToastContainer } from 'react-toastify';

export const Category = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                    <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
                    <ManageCategoryContent />
                </div>
            </div>
        </div>
    );
};