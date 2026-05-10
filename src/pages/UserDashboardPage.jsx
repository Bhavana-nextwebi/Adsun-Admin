import React from "react";
import { DashboardIntro } from "../components/Dashboard/DashboardIntro";
import ComponentHeader from "../components/Common/OtherElements/ComponentHeader";
import UserDashboardBasicDetails from "../components/Dashboard/UserDashboardBasicDetails";

export const UserDashboardPage = () => {
  return (
    <>
      <div className="main-content">
        <div className="page-content">
          <div className="container-fluid">
            <ComponentHeader title="User Dashboard" />
            <div className="row">
              <div className="col">
                <div className="h-100">
                  <DashboardIntro />
                  <UserDashboardBasicDetails />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
