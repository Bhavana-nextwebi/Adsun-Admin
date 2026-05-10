import React from 'react'

export const Loading = () => {
    return (
        <div>
            <div className="loading-spinner-container">
                <div className="loading-spinner">
                    <div className="spinner-circle"></div>
                </div>
                <p>Loading, please wait...</p>
            </div>
        </div>
    )
}
