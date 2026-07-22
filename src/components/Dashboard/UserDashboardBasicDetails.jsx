// import React, { useState, useEffect } from "react";
// import { fetchUserDashboardCardStats } from "../../services/userDashboardServices";
// import useCounterAnimation from "../../hooks/useCounterAnimation";
// import { Link, useNavigate } from "react-router-dom";
// import { fetchUserProfile } from "../../services/newUserService";
// import { handleErrors } from "../../utils/errorHandler";
// export const UserDashboardBasicDetails = () => {
//   const [dashboardStats, setDashboardStats] = useState({
//     totalAssigned: 0,
//     totalCreated: 0,
//     totalInProgress: 0,
//     totalResolved: 0,
//     totalClosed: 0,
//     totalWaiting: 0,
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetchUserDashboardCardStats();
//         const data = response.result;

//         setDashboardStats({
//           totalAssigned: data.totalAssigned,
//           totalCreated: data.totalCreated,
//           totalInProgress: data.totalInProgress,
//           totalResolved: data.totalResolved,
//           totalClosed: data.totalClosed,
//           totalWaiting: data.totalWaiting,
//         });
//       } catch (error) {
//         console.error("Error fetching dashboard stats:", error);
//       }
//     };

//     fetchData();
//   }, []);

//   const [userName, setUserName] = useState();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const userData = await fetchUserProfile();

//         if (userData.data.result.userRole === 1) {
//           setUserName(userData.data.result.userName);
//         } else if (userData.data.result.id === 96) {
//           setUserName(userData.data.result.userName);
//         } else {
//           setUserName(userData.data.result.userName);
//           navigate("/user-dashboard");
//         }
//       } catch (error) {
//         handleErrors(error);
//       }
//     };

//     fetchUserData();
//   }, [navigate]);

//   const tenantCount = useCounterAnimation(dashboardStats.totalAssigned, 2000);
//   const totalCreated = useCounterAnimation(dashboardStats.totalCreated, 2000);
//   const totalInProgress = useCounterAnimation(
//     dashboardStats.totalInProgress,
//     2000
//   );
//   const totalResolved = useCounterAnimation(dashboardStats.totalResolved, 2000);
//   const totalClosed = useCounterAnimation(dashboardStats.totalClosed, 2000);
//   const totalWaiting = useCounterAnimation(dashboardStats.totalWaiting, 2000);

//   //   const currentMonth = new Date().toLocaleString("default", { month: "long" });
//   const totalAssignedStatus = "Opened";
//   const totalCreatedStatus = "Created";
//   const totalInProgresStatus = "InProgress";
//   const totalClosedStatus = "Closed";
//   const totalWaitingStatus = "Waiting";
//   const totalResolvedStatus = "Resolved";

//   return (
//     <div className="row mb-3 pb-1">
//       <div className="col-12">
//         <div className="d-flex align-items-lg-center flex-lg-row flex-column">
//           <div className="flex-grow-1">
//             {userName && (
//               <>
//                 <div className="row">
//                   <div className="col-xl-3 col-md-6">
//                     {/* <div className="card card-animate">
//                       <div className="card-body">
//                         <div className="d-flex align-items-center">
//                           <div className="flex-grow-1 overflow-hidden">
//                             <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
//                               Total Assigned
//                             </p>
//                           </div>
//                         </div>
//                         <div className="d-flex align-items-end justify-content-between mt-4">
//                           <div>
//                             <h4 className="fs-22 fw-semibold ff-secondary mb-4">
//                               {tenantCount}
//                             </h4>
//                             <Link
//                               to={{
//                                 pathname: `/support/status/${totalAssignedStatus}`,
//                               }}
//                               className="text-decoration-underline"
//                             >
//                               View number of Total Assigned
//                             </Link>
//                           </div>
//                           <div className="avatar-sm flex-shrink-0">
//                             <span className="avatar-title bg-success rounded fs-3">
//                               <i className="bx bx-group"></i>
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div> */}
//                   </div>

//                   <div className="col-xl-3 col-md-6">
//                     {/* <div className="card card-animate">
//                       <div className="card-body">
//                         <div className="d-flex align-items-center">
//                           <div className="flex-grow-1 overflow-hidden">
//                             <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
//                               Total Created
//                             </p>
//                           </div>
//                         </div>
//                         <div className="d-flex align-items-end justify-content-between mt-4">
//                           <div>
//                             <h4 className="fs-22 fw-semibold ff-secondary mb-4">
//                               {totalCreated}
//                             </h4>
//                             <Link
//                               to={{
//                                 pathname: `/support/status/${totalCreatedStatus}`,
//                               }}
//                               className="text-decoration-underline"
//                             >
//                               View number of Total Created
//                             </Link>
//                           </div>
//                           <div className="avatar-sm flex-shrink-0">
//                             <span className="avatar-title bg-info rounded fs-3">
//                               <i className="bx bx-group"></i>
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div> */}
//                   </div>

//                   <div className="col-xl-3 col-md-6">
//                     {/* <div className="card card-animate">
//                       <div className="card-body">
//                         <div className="d-flex align-items-center">
//                           <div className="flex-grow-1 overflow-hidden">
//                             <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
//                               Total InProgress
//                             </p>
//                           </div>
//                         </div>
//                         <div className="d-flex align-items-end justify-content-between mt-4">
//                           <div>
//                             <h4 className="fs-22 fw-semibold ff-secondary mb-4">
//                               {totalInProgress}
//                             </h4>
//                             <Link
//                               to={{
//                                 pathname: `/support/status/${totalInProgresStatus}`,
//                               }}
//                               className="text-decoration-underline"
//                             >
//                               View number of Total InProgress
//                             </Link>
//                           </div>
//                           <div className="avatar-sm flex-shrink-0">
//                             <span className="avatar-title bg-warning rounded fs-3">
//                               <i className="bx bx-money"></i>
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div> */}
//                   </div>
//                   <div className="col-xl-3 col-md-6">
//                     {/* <div className="card card-animate">
//                       <div className="card-body">
//                         <div className="d-flex align-items-center">
//                           <div className="flex-grow-1 overflow-hidden">
//                             <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
//                               Total Resolved
//                             </p>
//                           </div>
//                         </div>
//                         <div className="d-flex align-items-end justify-content-between mt-4">
//                           <div>
//                             <h4 className="fs-22 fw-semibold ff-secondary mb-4">
//                               {totalResolved}
//                             </h4>
//                             <Link
//                               to={{
//                                 pathname: `/support/status/${totalResolvedStatus}`,
//                               }}
//                               className="text-decoration-underline"
//                             >
//                               View number of Total Resolved
//                             </Link>
//                           </div>
//                           <div className="avatar-sm flex-shrink-0">
//                             <span className="avatar-title bg-danger rounded fs-3">
//                               <i className="bx bx-money"></i>
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div> */}
//                   </div>
//                   <div className="col-xl-3 col-md-6">
//                     {/* <div className="card card-animate">
//                       <div className="card-body">
//                         <div className="d-flex align-items-center">
//                           <div className="flex-grow-1 overflow-hidden">
//                             <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
//                               Total Waiting
//                             </p>
//                           </div>
//                         </div>
//                         <div className="d-flex align-items-end justify-content-between mt-4">
//                           <div>
//                             <h4 className="fs-22 fw-semibold ff-secondary mb-4">
//                               {totalWaiting}
//                             </h4>
//                             <Link
//                               to={{
//                                 pathname: `/support/status/${totalWaitingStatus}`,
//                               }}
//                               className="text-decoration-underline"
//                             >
//                               View number of Total Waiting
//                             </Link>
//                           </div>
//                           <div className="avatar-sm flex-shrink-0">
//                             <span className="avatar-title bg-primary rounded fs-3">
//                               <i className="bx bx-building"></i>
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div> */}
//                   </div>
//                   <div className="col-xl-3 col-md-6">
//                     {/* <div className="card card-animate">
//                       <div className="card-body">
//                         <div className="d-flex align-items-center">
//                           <div className="flex-grow-1 overflow-hidden">
//                             <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
//                               Total Closed
//                             </p>
//                           </div>
//                         </div>
//                         <div className="d-flex align-items-end justify-content-between mt-4">
//                           <div>
//                             <h4 className="fs-22 fw-semibold ff-secondary mb-4">
//                               {totalClosed}
//                             </h4>
//                             <Link
//                               to={{
//                                 pathname: `/support/status/${totalClosedStatus}`,
//                               }}
//                               className="text-decoration-underline"
//                             >
//                               View number of Total Closed
//                             </Link>
//                           </div>
//                           <div className="avatar-sm flex-shrink-0">
//                             <span className="avatar-title bg-success rounded fs-3">
//                               <i className="bx bx-building"></i>
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div> */}
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserDashboardBasicDetails;
