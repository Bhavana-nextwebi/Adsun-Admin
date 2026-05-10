import React from 'react';
import { ManageAccess } from '../components/AdminSettings/ManageAccess/ManageAccess';
import { ManageAccessContent } from '../components/AdminSettings/ManageAccess/ManageAccessContent';

export const ManageAccessPage = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                    <ManageAccess/>
                    <ManageAccessContent/>
                </div>
            </div>
        </div>
    )
}
