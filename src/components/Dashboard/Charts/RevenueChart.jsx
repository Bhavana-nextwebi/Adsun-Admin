import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";

const RevenueChart = ({ monthlyRevenue }) => {
  const [chartOptions, setChartOptions] = useState({
    series: [{ name: "Earnings", type: "bar", data: [] }],
    chart: {
      height: 370,
      type: "bar",
      toolbar: { show: false },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: [],
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return value / 100000;
        },
      },
    },
    grid: {
      show: true,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
      padding: { top: 0, right: -2, bottom: 15, left: 10 },
    },
    legend: {
      show: true,
      horizontalAlign: "center",
      offsetX: 0,
      offsetY: -5,
      markers: { width: 9, height: 9, radius: 6 },
      itemMargin: { horizontal: 10, vertical: 0 },
    },
    plotOptions: {
      bar: {
        columnWidth: "30%",
        barHeight: "70%",
      },
    },
    colors: ["#007bff"],
    tooltip: {
      y: {
        formatter: (val) => (val !== undefined ? `₹${val.toFixed(2)}` : val),
      },
    },
  });

  useEffect(() => {
    if (monthlyRevenue && monthlyRevenue.rList) {
      const categories = monthlyRevenue.rList.map(
        (item) =>
          `${new Date(item.year_, item.month_ - 1).toLocaleString("default", {
            month: "short",
          })} ${item.year_}`
      );
      const data = monthlyRevenue.rList.map((item) => item.totalAmount);

      setChartOptions((prevOptions) => ({
        ...prevOptions,
        xaxis: { ...prevOptions.xaxis, categories },
        series: [{ ...prevOptions.series[0], data }],
      }));
    }
  }, [monthlyRevenue]);

  return (
    <ReactApexChart
      options={chartOptions}
      series={chartOptions.series}
      type="bar"
      height={300}
    />
  );
};

export default RevenueChart;
