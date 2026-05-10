import React from 'react'
export const OfflinePageContent = () => {


    return (
        <>
    <div className="auth-page-wrapper auth-bg-cover py-5 d-flex justify-content-center align-items-center min-vh-100">
        <div className="bg-overlay"></div>
        <div className="auth-page-content overflow-hidden pt-lg-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-xl-5">
                        <div className="card overflow-hidden">
                            <div className="card-body p-4">
                                <div className="text-center">
                                    <img src="https://dl.dropboxusercontent.com/s/jyim3l2v0d53o4t/auth-offline.gif" alt="" height="210"/>
                                    <h3 className="mt-4 fw-semibold">We're currently offline</h3>
                                    <p className="text-muted mb-4 fs-14">We can't show you this images because you aren't connected to the internet. When you’re back online refresh the page or hit the button below</p>
                                    <button className="btn btn-success btn-border" ><i className="ri-refresh-line align-bottom"></i> Refresh</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
        </>
    )
}