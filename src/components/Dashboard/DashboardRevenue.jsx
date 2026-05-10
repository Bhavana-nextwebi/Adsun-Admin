import React, { useEffect, useState } from "react";
import { fetchDashboardMonthwiseRevenue } from "../../services/dashboardService";
import RevenueChart from "./Charts/RevenueChart";
import SupportStatusChart from "./Charts/SupportStatusChart";
import { Link } from "react-router-dom";
import { Loading } from "../Common/OtherElements/Loading";

export const DashboardRevenue = () => {
  const [dashboardData, setDashboardData] = useState({
    totalAmount: 0,
    initatedAmount: 0,
    totalOrder: 0,
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardRevenue = async () => {
      try {
        const response = await fetchDashboardMonthwiseRevenue();
        const result = response;
        setDashboardData({
          totalAmount: result.totalAmount,
          initatedAmount: result.initatedAmount,
          totalOrder: result.totalOrder,
        });
        setMonthlyRevenue(result);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard revenue data:", error);
        setIsLoading(false);
      }
    };

    fetchDashboardRevenue();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <div className="row">
        <div className="col-xl-8">
          <div className="card">
            <div className="card-header border-0 align-items-center d-flex">
              <h4 className="card-title mb-0 flex-grow-1">Monthwise Revenue</h4>
            </div>

            <div className="card-header p-0 border-0 bg-soft-light">
              <div className="row g-0 text-center">
                <div className="col-6 col-sm-4">
                  <div className="p-3 border border-dashed border-start-0">
                    <h5 className="mb-1">{dashboardData.totalOrder}</h5>
                    <p className="text-muted mb-0">Number of Bookings</p>
                  </div>
                </div>
                <div className="col-6 col-sm-4">
                  <div className="p-3 border border-dashed border-start-0">
                    <h5 className="mb-1">
                      ₹ {Math.floor(dashboardData.totalAmount).toLocaleString()}
                    </h5>

                    <p className="text-muted mb-0">Total Amount</p>
                  </div>
                </div>
                <div className="col-6 col-sm-4">
                  <div className="p-3 border border-dashed border-start-0">
                    <h5 className="mb-1">
                      ₹{" "}
                      {Math.floor(
                        dashboardData.initatedAmount
                      ).toLocaleString()}
                    </h5>
                    <p className="text-muted mb-0">Cancelled Amount</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-body p-0 pb-2">
              <div className="w-100">
                <RevenueChart monthlyRevenue={monthlyRevenue} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card card-height-100">
            <div className="card-header align-items-center d-flex">
              <h4 className="card-title mb-0 flex-grow-1">Status</h4>
              <div className="flex-shrink-0">
                <div className="dropdown card-header-dropdown">
                  <Link to="/">View All Status</Link>
                </div>
              </div>
            </div>

            <div className="card-body">
              <SupportStatusChart />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
