// import React, { useEffect, useState, useMemo, useCallback } from 'react';
// import { fetchDashboardVacationsStats } from '../../services/dashboardService';
// import { Link } from 'react-router-dom';
// import { paginateData, calculateTotalPages } from '../../assets/js/script';
// import { Pagination } from '../Common/TableComponent/Pagination';
// import { TableDataStatusError } from '../Common/OtherElements/TableDataStatusError';
// import { Loading } from '../Common/OtherElements/Loading';

// export const DashboardUpcomingVacations = () => {
//     const [vacationData, setVacationData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [entriesPerPage, setEntriesPerPage] = useState(10);

//     const fetchData = useCallback(async () => {
//         setLoading(true);
//         try {
//             const response = await fetchDashboardVacationsStats();

//             if(response.result === null){
//                 setVacationData([]);
//             }else{
//                 setVacationData(Array.isArray(response.result) ? response.result : [response.result]);
//             }
//         } catch (err) {
//             setError('Failed to fetch data');
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchData();
//     }, [fetchData]);

//     const paginatedVacations = useMemo(() =>
//         paginateData(vacationData, currentPage, entriesPerPage),
//         [vacationData, currentPage, entriesPerPage]
//     );

//     const totalPages = useMemo(() =>
//         calculateTotalPages(vacationData.length, entriesPerPage),
//         [vacationData.length, entriesPerPage]
//     );

//     const handlePageChange = useCallback((newPage) => {
//         setCurrentPage(newPage);
//     }, []);

//     const handleEntriesChange = useCallback((value) => {
//         setEntriesPerPage(value);
//         setCurrentPage(1);
//     }, []);

//     if (loading) {
//         return <Loading/>;
//     }

//     if (error) {
//         return <div>{error}</div>;
//     }

//     return (
//         <>
//             <div className="row">
//                 <div className="col-xl-12">
//                     <div className="card" id="upcoming-expiry-section">
//                         <div className="card-header align-items-center d-flex">
//                             <h4 className="card-title mb-0 flex-grow-1">Upcoming Expiry / Vacations</h4>
//                         </div>

//                         <div className="card-body">
//                             <div className="table-responsive table-card">
//                                 <table className="table table-hover table-centered align-middle mb-0">
//                                     <tbody>
//                                     {paginatedVacations.length === 0 ? (
//                                         <TableDataStatusError colspan="6"/>
//                                     ) : (
//                                          paginatedVacations.map((vacation, index) => (
//                                             <tr key={index}>
//                                                 <td>
//                                                     <div className="d-flex align-items-center">
//                                                         <div>
//                                                             <h5 className="fs-14 my-1">
//                                                                 <Link to={`/onboarding-customers/detail/${vacation.userGuid}`}>{vacation.userName}</Link>
//                                                             </h5>
//                                                             <span className="text-muted"><i className="ri-mail-fill"></i> {vacation.emailAddress}</span><br />
//                                                             <span className="text-muted"><i className="ri-phone-fill"></i> {vacation.contactNo}</span>
//                                                         </div>
//                                                     </div>
//                                                 </td>
//                                                 <td>
//                                                     <h5 className="fs-14 my-1 fw-normal"><Link to={`/property/detail/${vacation.propertyGuid}`} style={{color:'#108b34'}}>{vacation.propertyName}</Link></h5>
//                                                     <span className="text-muted">Flat Number : {vacation.flatNo} </span>
//                                                 </td>
//                                                 <td>
//                                                     <h5 className="fs-14 my-1 fw-normal">Period</h5>
//                                                     <span className="text-muted">
//                                                         {new Date(vacation.moveInDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} -
//                                                         {new Date(vacation.moveOutDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
//                                                     </span>
//                                                 </td>
//                                                 <td>
//                                                     <h5 className="fs-14 my-1 fw-normal">Rent Amount</h5>
//                                                     <span className="text-muted">₹ {vacation.rentAmount}</span>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     ) }

//                                     </tbody>
//                                 </table>
//                             </div>
//                             <div className='pt-2'>
//                             <Pagination
//                                 currentPage={currentPage}
//                                 totalPages={totalPages}
//                                 onPageChange={handlePageChange}
//                                 onEntriesChange={handleEntriesChange}
//                                 entriesPerPage={entriesPerPage}
//                                 totalEntries={vacationData.length}
//                             />
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };
