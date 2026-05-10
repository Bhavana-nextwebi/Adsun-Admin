import React, {useState, useEffect} from 'react'
import { DashboardIntro } from '../components/Dashboard/DashboardIntro'
import { DashboardBasicDetails } from '../components/Dashboard/DashboardBasicDetails'
import { DashboardRevenue } from '../components/Dashboard/DashboardRevenue'
import { DashboardUpcomingVacations } from '../components/Dashboard/DashboardUpcomingVacations'
import { DashboardAssetsOrders } from '../components/Dashboard/DashboardAssetsOrders'
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile } from '../services/newUserService';
import ComponentHeader from '../components/Common/OtherElements/ComponentHeader'
import { handleErrors } from '../utils/errorHandler'

export const DashboardPage = () => {

    const navigate = useNavigate();
    const [sectiondisable, setSectionDisabled] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await fetchUserProfile();

                if (userData.data.result.userRole === 1) {
                    setSectionDisabled(false);
                } else if (userData.data.result.id === 96) {
                    setSectionDisabled(false);
                } else {
                    setSectionDisabled(true);
                    navigate('/user-dashboard'); 
                }
            } catch (error) {
                handleErrors(error);
            }
        };

        fetchUserData();
    }, [navigate]);

    return (
        <>
            <div className="main-content">
                <div className="page-content">
                    <div className="container-fluid">
                        <ComponentHeader title='Dashboard' />
                        <div className="row">
                            <div className="col">
                                <div className="h-100">
                                    <DashboardIntro />
                                    {/* {sectiondisable ? '' : (
                                        <>
                                            <DashboardBasicDetails />
                                          
                                        </>
                                    )} */}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
