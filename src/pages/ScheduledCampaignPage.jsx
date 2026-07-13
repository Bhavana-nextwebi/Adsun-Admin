import {ScheduledCampaignList}  from "../components/Campaign/ScheduledCampaignList";

export const ScheduledCampaignPage = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                    <ScheduledCampaignList />
                </div>
            </div>
        </div>
    );
};