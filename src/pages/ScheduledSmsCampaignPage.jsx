// pages/ScheduledSmsCampaignPage.jsx
import { ScheduledSmsCampaignList } from "../components/Campaign/ScheduledSmsCampaignList";

export const ScheduledSmsCampaignPage = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ScheduledSmsCampaignList />
        </div>
      </div>
    </div>
  );
};