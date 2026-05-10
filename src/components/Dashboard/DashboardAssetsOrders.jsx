// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import {
//   fetchDashboardAssets,
//   fetchDashboardTopOrders,
// } from "../../services/dashboardService";
// import { Loading } from "../Common/OtherElements/Loading";
// import { Pagination } from "../Common/TableComponent/Pagination";
// import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
// import { handleErrors } from "../../utils/errorHandler";
// import { Link } from "react-router-dom";

// export const DashboardAssetsOrders = () => {
//   const [dashboardStats, setDashboardStats] = useState({
//     totalAssets: 0,
//     assetQuantity: 0,
//     availabeQuantity: 0,
//     usedQuantity: 0,
//   });
//   const [vacationData, setVacationData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [entriesPerPage, setEntriesPerPage] = useState(3);

//   const fetchDashboardData = useCallback(async () => {
//     try {
//       const response = await fetchDashboardAssets();
//       const data = response.result;
//       setDashboardStats({
//         totalAssets: data.totalAssets,
//         assetQuantity: data.assetQuantity,
//         availabeQuantity: data.availabeQuantity,
//         usedQuantity: data.usedQuantity,
//       });
//     } catch (error) {
//       handleErrors(error);
//     }
//   }, []);

//   const fetchTopOrdersData = useCallback(async () => {
//     try {
//       const response = await fetchDashboardTopOrders();

//       if (Array.isArray(response.result) && response.result.length > 0) {
//         setVacationData(response.result);
//         setEntriesPerPage(3);
//       } else if (response.result === null) {
//         setVacationData([]);
//       } else {
//         console.error("No data found or data is not in expected format");
//       }
//     } catch (err) {
//       setError("Failed to fetch data");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchDashboardData();
//     fetchTopOrdersData();
//   }, [fetchDashboardData, fetchTopOrdersData]);

//   const totalPages = useMemo(
//     () => Math.ceil(vacationData.length / entriesPerPage),
//     [vacationData.length, entriesPerPage]
//   );

//   const handlePageChange = useCallback((newPage) => {
//     setCurrentPage(newPage);
//   }, []);

//   if (loading) {
//     return <Loading />;
//   }

//   if (error) {
//     return <div>{error}</div>;
//   }

//   const paginatedVacationData = vacationData.slice(
//     (currentPage - 1) * entriesPerPage,
//     currentPage * entriesPerPage
//   );

//   return (
//     <div className="row">
//       <div className="col-xl-8">
//         <div className="card">
//           <div className="card-header align-items-center d-flex">
//             <h4 className="card-title mb-0 flex-grow-1">
//               Top 10 Recent Bookings
//             </h4>
//             <div className="flex-shrink-0">
//               <div className="dropdown card-header-dropdown">
//                 <Link to="/orders">View All Bookings</Link>
//               </div>
//             </div>
//           </div>
//           <div className="card-body">
//             <div className="table-responsive table-card">
//               <table className="table table-hover table-centered align-middle mb-0">
//                 <tbody>
//                   {vacationData.length === 0 ? (
//                     <TableDataStatusError colspan="5" />
//                   ) : (
//                     paginatedVacationData.map((vacation, index) => (
//                       <tr key={index}>
//                         <td>
//                           <div className="d-flex align-items-center">
//                             <div>
//                               <h5 className="fs-14 my-1">
//                                 <Link
//                                   to={`/onboarding-customers/detail/${vacation.userGuid}`}
//                                 >
//                                   {vacation.userName}
//                                 </Link>
//                               </h5>
//                               <span className="text-muted">
//                                 <i className="ri-mail-fill"></i>{" "}
//                                 {vacation.emailAddress}
//                               </span>
//                               <br />
//                               <span className="text-muted">
//                                 <i className="ri-phone-fill"></i>{" "}
//                                 {vacation.contactNo}
//                               </span>
//                             </div>
//                           </div>
//                         </td>
//                         <td>
//                           <h5 className="fs-14 my-1 fw-normal">
//                             Booking Status
//                           </h5>
//                           <span className="text-muted">
//                             {vacation.orderStatus === "Initiated" && (
//                               <span className="badge rounded-pill badge-soft-primary">
//                                 Initiated
//                               </span>
//                             )}
//                             {vacation.orderStatus === "Success" && (
//                               <span className="badge rounded-pill badge-soft-success">
//                                 Success
//                               </span>
//                             )}
//                             {vacation.orderStatus === "Cancelled" && (
//                               <span className="badge rounded-pill badge-soft-danger">
//                                 Cancelled
//                               </span>
//                             )}
//                           </span>
//                         </td>
//                         <td>
//                           <h5 className="fs-14 my-1 fw-normal">
//                             <Link
//                               to={`/property/detail/${vacation.propertyGuid}`}
//                               style={{ color: "#108b34" }}
//                             >
//                               {vacation.propertyName}
//                             </Link>
//                           </h5>
//                           <span className="text-muted">
//                             Flat Number: {vacation.flatNo}
//                           </span>
//                         </td>
//                         <td>
//                           <h5 className="fs-14 my-1 fw-normal">Period</h5>
//                           <span className="text-muted">
//                             {new Date(vacation.moveInDate).toLocaleDateString(
//                               "en-GB",
//                               {
//                                 day: "2-digit",
//                                 month: "short",
//                                 year: "numeric",
//                               }
//                             )}{" "}
//                             -
//                             {new Date(vacation.moveOutDate).toLocaleDateString(
//                               "en-GB",
//                               {
//                                 day: "2-digit",
//                                 month: "short",
//                                 year: "numeric",
//                               }
//                             )}
//                           </span>
//                         </td>
//                         <td>
//                           <h5 className="fs-14 my-1 fw-normal">Rent Amount</h5>
//                           <span className="text-muted">
//                             ₹ {vacation.rentAmount}
//                           </span>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//             <Pagination
//               currentPage={currentPage}
//               totalPages={totalPages}
//               totalEntries={vacationData.length}
//               entriesPerPage={entriesPerPage}
//               onPageChange={handlePageChange}
//             />
//           </div>
//         </div>
//       </div>

//       <div className="col-xl-4">
//         <div className="card card-height-100">
//           <div className="card-header align-items-center d-flex">
//             <h4 className="card-title mb-0 flex-grow-1">Assets Info Section</h4>
//             <div className="flex-shrink-0">
//               <div className="dropdown card-header-dropdown">
//                 <Link to="/assets">View All Assets</Link>
//               </div>
//             </div>
//           </div>

//           <div className="card-body p-0">
//             <ul className="list-group list-group-flush border-dashed mb-0">
//               <li className="list-group-item d-flex align-items-center">
//                 <div className="flex-grow-1">
//                   <h6 className="fs-14 mb-1">No of Assets :</h6>
//                 </div>
//                 <div className="flex-shrink-0 text-end">
//                   <h6 className="fs-14 mb-1">{dashboardStats.totalAssets}</h6>
//                 </div>
//               </li>
//               <li className="list-group-item d-flex align-items-center">
//                 <div className="flex-grow-1">
//                   <h6 className="fs-14 mb-1">Total Assets in Inventory :</h6>
//                 </div>
//                 <div className="flex-shrink-0 text-end">
//                   <h6 className="fs-14 mb-1">{dashboardStats.assetQuantity}</h6>
//                 </div>
//               </li>
//               <li className="list-group-item d-flex align-items-center">
//                 <div className="flex-grow-1">
//                   <h6 className="fs-14 mb-1">Assets Used :</h6>
//                 </div>
//                 <div className="flex-shrink-0 text-end">
//                   <h6 className="fs-14 mb-1">
//                     {dashboardStats.usedQuantity}
//                   </h6>
//                 </div>
//               </li>
//               <li className="list-group-item d-flex align-items-center">
//                 <div className="flex-grow-1">
//                   <h6 className="fs-14 mb-1">Balance Assets :</h6>
//                 </div>
//                 <div className="flex-shrink-0 text-end">
//                   <h6 className="fs-14 mb-1">{dashboardStats.availabeQuantity}</h6>
//                 </div>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
