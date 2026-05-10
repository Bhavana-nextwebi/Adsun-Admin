import React from 'react';
import { ViewGoogleSearchResult} from '../components/Locations/ViewGoogleSearchResults';
import { ToastContainer } from 'react-toastify';

export const GoogleSearchPage = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                    <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
                    <ViewGoogleSearchResult />
                </div>
            </div>
        </div>
    );
};