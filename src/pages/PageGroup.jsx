import React from 'react';
import { ManageGroupContent } from '../components/AdminSettings/PageGroup/ManageGroupContent';
import { ToastContainer } from 'react-toastify';
export const PageGroup = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                    <ManageGroupContent />
                </div>
            </div>
            
        </div>
        
    )
}
