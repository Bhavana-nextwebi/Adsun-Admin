import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile } from '../../services/newUserService';
import { handleErrors } from '../../utils/errorHandler';

export const DashboardIntro = () => {
    const [userName, setUserName] = useState();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await fetchUserProfile();

                if (userData.data.result.userRole === 1) {
                    setUserName(userData.data.result.userName);
                } else if(userData.data.result.id === 96){
                    setUserName(userData.data.result.userName);
                } else {
                    setUserName(userData.data.result.userName);
                    navigate('/user-dashboard'); 
                }
            } catch (error) {
                handleErrors(error);
            }
        };

        fetchUserData();
    }, [navigate]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) {
            return 'Good Morning';
        } else if (hour < 18) {
            return 'Good Afternoon';
        } else {
            return 'Good Evening';
        }
    };

    return (
        <>
            <div className="row mb-3 pb-1">
                <div className="col-12">
                    <div className="d-flex align-items-lg-center flex-lg-row flex-column">
                        <div className="flex-grow-1">
                            {userName && (
                                <>
                                    <h4 className="fs-16 mb-1">{getGreeting()}, {userName}!</h4>
                                    <p className="text-muted mb-0">Here's what's happening with your store today.</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
