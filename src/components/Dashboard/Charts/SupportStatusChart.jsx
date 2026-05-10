import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { fetchDashboardSupportStats } from "../../../services/dashboardService";

const SupportStatusChart = () => {
  const [chartData, setChartData] = useState({
    series: [],
    labels: [],
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 380);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchDashboardSupportStats();
        const data = response?.result;

        if (data) {
          setChartData({
            series: [
              data.initiated,
              data.success,
              data.cancelled,
              data.vendorAssigned,
              data.vendorReAssigned,
              data.vendorReQuoted,
              data.reQuoteAccepted,
              data.completed,
            ],
            labels: [
              "Initiated",
              "Success",
              "Cancelled",
              "Vendor Assigned",
              "Vendor Re-Assigned",
              "Vendor Re-Quoted",
              "Re-Quote Accepted",
              "Completed",
            ],
          });
        }
      } catch (error) {
        console.error("Error fetching support stats:", error);
      }
    };

    fetchData();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 380);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const options = {
    chart: {
      type: "donut",
    },
    responsive: [
      {
        breakpoint: 380,
        options: {
          chart: {
            width: 250,
          },
          legend: {
            position: "bottom",
            fontSize: "12px",
          },
        },
      },
    ],
    labels: chartData.labels?.length ? chartData.labels : ["No Data"],
    colors: [
      "#00FFFF",
      "#00FF00",
      "#FF0000",
      "#45CB85",
      "#FFA500",
      "#f710a0",
      "#008080",
      "#000080",
    ],
    legend: {
      position: "bottom",
      floating: false,
      fontSize: "14px",
      offsetY: 0,
      labels: {
        colors: ["#333"],
      },
    },
  };

  return (
    <div
      id="chart"
      style={{
        maxWidth: "100%",
        margin: "0 auto",
        padding: "10px",
        boxSizing: "border-box",
      }}
    >
      <Chart
        options={options}
        series={chartData.series}
        type="donut"
        height={isMobile ? 300 : 350}
      />
    </div>
  );
};

export default SupportStatusChart;
