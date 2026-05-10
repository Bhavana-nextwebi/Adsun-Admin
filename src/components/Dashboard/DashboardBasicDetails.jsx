// import React, { useState, useEffect } from "react";
// import { fetchDashboardCardStats } from "../../services/dashboardService";
// import useCounterAnimation from "../../hooks/useCounterAnimation";
// // import { Link } from "react-router-dom";

// export const DashboardBasicDetails = () => {
//   const [dashboardStats, setDashboardStats] = useState({
//     completedSerices: 0,
//     noOfCustomers: 0,
//     noOfVendors: 0,
//     onGoingServices: 0,
//   });

//   // useEffect(() => {
//   //   const fetchData = async () => {
//   //     try {
//   //       const response = await fetchDashboardCardStats();
//   //       const data = response.result;

//   //       setDashboardStats({
//   //         completedSerices: data.completedSerices,
//   //         noOfCustomers: data.noOfCustomers,
//   //         noOfVendors: data.noOfVendors,
//   //         onGoingServices: data.onGoingServices,
//   //       });
//   //     } catch (error) {
//   //       console.error("Error fetching dashboard stats:", error);
//   //     }
//   //   };

//   //   fetchData();
//   // }, []);

//   // const tenantCount = useCounterAnimation(
//   //   dashboardStats.completedSerices,
//   //   2000
//   // );
//   // const noOfCustomers = useCounterAnimation(dashboardStats.noOfCustomers, 2000);
//   // const noOfVendors = useCounterAnimation(dashboardStats.noOfVendors, 2000);
//   // const onGoingServices = useCounterAnimation(
//   //   dashboardStats.onGoingServices,
//   //   2000
//   // );
//   // const availableFlats = useCounterAnimation(dashboardStats.availableFlats, 2000);

//   return (
//     <div className="row">
//       <div className="col-xl-3 col-md-6">
//         <div className="card card-animate">
//           <div className="card-body">
//             <div className="d-flex align-items-center">
//               <div className="flex-grow-1 overflow-hidden">
//                 <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
//                   No Of Customers
//                 </p>
//               </div>
//             </div>
//             <div className="d-flex align-items-end justify-content-between mt-4">
//               <div>
//                 <h4 className="fs-22 fw-semibold ff-secondary mb-4">
//                   {noOfCustomers}
//                 </h4>
//                 <a
//                   href="/onboarding-customers"
//                   className="text-decoration-underline"
//                 >
//                   View no of Customers
//                 </a>
//               </div>
//               <div className="avatar-sm flex-shrink-0">
//                 <span className="avatar-title bg-info rounded fs-3">
//                   <i className="bx bx-group"></i>
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="col-xl-3 col-md-6">
//         <div className="card card-animate">
//           <div className="card-body">
//             <div className="d-flex align-items-center">
//               <div className="flex-grow-1 overflow-hidden">
//                 <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
//                   No Of Vendors
//                 </p>
//               </div>
//             </div>
//             <div className="d-flex align-items-end justify-content-between mt-4">
//               <div>
//                 <h4 className="fs-22 fw-semibold ff-secondary mb-4">
//                   {noOfVendors}
//                 </h4>
//                 <a
//                   href="/onboarding-vendors"
//                   className="text-decoration-underline"
//                 >
//                   View no of Vendors
//                 </a>
//               </div>
//               <div className="avatar-sm flex-shrink-0">
//                 <span className="avatar-title bg-success rounded fs-3">
//                   <i className="bx bx-group"></i>
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="col-xl-3 col-md-6">
//         <div className="card card-animate">
//           <div className="card-body">
//             <div className="d-flex align-items-center">
//               <div className="flex-grow-1 overflow-hidden">
//                 <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
//                   On Going Services
//                 </p>
//               </div>
//             </div>
//             <div className="d-flex align-items-end justify-content-between mt-4">
//               <div>
//                 <h4 className="fs-22 fw-semibold ff-secondary mb-4">
//                   {onGoingServices}
//                 </h4>
//                 <a
//                   href="/bookings-ongoing"
//                   className="text-decoration-underline"
//                 >
//                   View On Going Services
//                 </a>
//               </div>
//               <div className="avatar-sm flex-shrink-0">
//                 <span className="avatar-title bg-red-50 rounded fs-3">
//                   <i className="bx bx-money"></i>
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="col-xl-3 col-md-6">
//         <div className="card card-animate">
//           <div className="card-body">
//             <div className="d-flex align-items-center">
//               <div className="flex-grow-1 overflow-hidden">
//                 <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
//                   Completed Services
//                 </p>
//               </div>
//             </div>
//             <div className="d-flex align-items-end justify-content-between mt-4">
//               <div>
//                 <h4 className="fs-22 fw-semibold ff-secondary mb-4">
//                   {tenantCount}
//                 </h4>
//                 <a
//                   href="/bookings-completed"
//                   className="text-decoration-underline"
//                 >
//                   View of Completed Services
//                 </a>
//               </div>
//               <div className="avatar-sm flex-shrink-0">
//                 <span className="avatar-title bg-warning rounded fs-3">
//                   <i className="bx bx-money"></i>
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardBasicDetails;
