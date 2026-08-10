import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Flatpickr from 'react-flatpickr';

import 'flatpickr/dist/themes/material_blue.css';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import {
  getAllSearchResults
} from '../../services/gooogleSearchService';

import {
  paginateData,
  calculateTotalPages
} from '../../assets/js/script';

import EntriesDropdown from '../Common/TableComponent/EntriesDropdown';
import { Pagination } from '../Common/TableComponent/Pagination';
import { Loading } from '../Common/OtherElements/Loading';
import { TableDataStatusError } from '../Common/OtherElements/TableDataStatusError';

import { handleErrors } from '../../utils/errorHandler';
import { usePageLevelAccess } from '../../hooks/usePageLevelAccess';

/* ---------------------------------------------------------------------
   Shared design tokens — keep identical in SearchResults.jsx
--------------------------------------------------------------------- */
const thStyle = {
  fontSize: '12px',
  fontWeight: '700',
  color: '#6B7280',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
  verticalAlign: 'middle',
  padding: '12px 14px',
};

const tdStyle = {
  fontSize: '13px',
  fontWeight: '400',
  color: '#1F2937',
  lineHeight: '1.5',
  verticalAlign: 'middle',
  padding: '12px 14px',
};

const iconStyle = {
  fontSize: '14px',
  width: '16px',
  textAlign: 'center',
  flex: '0 0 auto',
};

const pillBase = {
  fontWeight: '600',
  fontSize: '11px',
  padding: '4px 10px',
};

export const ViewGoogleSearchResult = () => {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [pageAccessDetails, setPageAccessDetails] = useState([]);

  const navigate = useNavigate();

  const PageLevelAccessurl = 'google-search';

  const { pageAccessData } =
    usePageLevelAccess(PageLevelAccessurl);

  // PAGE ACCESS
  useEffect(() => {

    if (pageAccessData) {

      if (!pageAccessData.viewAccess) {

        navigate('/404-error-page');

      } else {

        setPageAccessDetails(pageAccessData);

      }
    }

  }, [pageAccessData, navigate]);

  // INITIAL LOAD
  useEffect(() => {

    fetchData();

    // eslint-disable-next-line
  }, []);

  // FETCH DATA
  const fetchData = async () => {

    try {

      setLoading(true);

      const formatDate = (date) => {

        if (!date) return null;

        const d = new Date(date);

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
      };

      const formattedFromDate = formatDate(fromDate);
      const formattedToDate = formatDate(toDate);

      const response = await getAllSearchResults(
        formattedFromDate,
        formattedToDate
      );

      if (response?.isSuccess) {

        setData(response.result || []);

      } else {

        setData([]);

      }

    } catch (error) {

      setData([]);

      handleErrors(error);

    } finally {

      setLoading(false);

    }
  };

  // EXPORT EXCEL
  const exportToExcel = () => {

    if (filteredData.length === 0) return;

    const excelData = filteredData.map((item, index) => ({

      'SL No': index + 1,

      'Search Name': item.title || 'Business name unavailable',

      'Category': item.type || 'Not Specified',

      'Address': item.address || 'Address unavailable',

      'Mobile No': item.phone || 'No mobile number',

      'Email Address': item.email || 'Email unavailable',

      'Price': item.priceDesc || 'Not Mentioned',

      'Rating': item.rating || 'No Ratings',

      'Reviews': item.review || 'No Reviews',

      'Working Hours': item.hours || 'Hours unavailable',

      'Latitude': item.latitude || 'N/A',

      'Longitude': item.longitude || 'N/A',

      'Added Date': item.addedOn
        ? new Date(item.addedOn).toLocaleDateString()
        : 'Date unavailable',

      'Added Time': item.addedOn
        ? new Date(item.addedOn).toLocaleTimeString()
        : 'Time unavailable'
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Google Search Results'
    );

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const fileData = new Blob(
      [excelBuffer],
      {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
      }
    );

    saveAs(
      fileData,
      `Google_Search_Results_${new Date().getTime()}.xlsx`
    );
  };

  // SEARCH FILTER
  const filteredData = data.filter((item) =>

    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.phone?.toLowerCase().includes(searchQuery.toLowerCase())

  );

  const currentData = paginateData(
    filteredData,
    currentPage,
    entriesPerPage
  );

  const totalPages = calculateTotalPages(
    filteredData.length,
    entriesPerPage
  );

  const handleEntriesChange = (value) => {

    setEntriesPerPage(value);
    setCurrentPage(1);

  };

  return (
    <>
      {pageAccessDetails.viewAccess ? (

        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-3">

              {/* HEADER */}
              <div className="card-header bg-white border-bottom py-3 px-4 rounded-top-3">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div>
                    <h5 className="mb-1 fw-bold text-dark">
                      Google Search Results
                    </h5>
                    <small className="text-muted">
                      Total Records : <strong>{filteredData.length}</strong>
                    </small>
                  </div>

                  <button
                    className="btn btn-success d-flex align-items-center gap-2"
                    onClick={exportToExcel}
                    disabled={filteredData.length === 0}
                  >
                    <i className="ri-file-excel-2-line" style={iconStyle}></i>
                    Export Excel
                  </button>
                </div>
              </div>

              {/* FILTER ROW */}
              <div className="px-4 pt-3 pb-2">
                <div className="row g-3 align-items-end">

                  {/* ENTRIES */}
                  <div className="col-lg-2 col-md-3">
                    <EntriesDropdown
                      entriesPerPage={entriesPerPage}
                      onEntriesChange={handleEntriesChange}
                      options={[10, 25, 50, 100]}
                    />
                  </div>

                  {/* SEARCH */}
                  <div className="col-lg-4 col-md-9">
                    <div className="input-group" style={{ height: '42px' }}>
                      <span className="input-group-text bg-white border-end-0">
                        <i className="ri-search-line" style={iconStyle}></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search business, address, phone..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                  </div>

                  {/* FROM DATE */}
                  <div className="col-lg-2 col-md-6">
                    <Flatpickr
                      value={fromDate}
                      onChange={(dates) => {
                        setFromDate(dates[0] || null);
                      }}
                      options={{
                        dateFormat: 'd/m/Y',
                        maxDate: toDate || null
                      }}
                      className="form-control"
                      placeholder="From date"
                      style={{ height: '42px' }}
                    />
                  </div>

                  {/* TO DATE */}
                  <div className="col-lg-2 col-md-6">
                    <Flatpickr
                      value={toDate}
                      onChange={(dates) => {
                        setToDate(dates[0] || null);
                      }}
                      options={{
                        dateFormat: 'd/m/Y',
                        minDate: fromDate || null
                      }}
                      className="form-control"
                      placeholder="To date"
                      style={{ height: '42px' }}
                    />
                  </div>

                  {/* BUTTONS */}
                  <div className="col-lg-2 col-md-12">
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-1"
                        style={{ height: '42px' }}
                        onClick={() => {
                          setCurrentPage(1);
                          fetchData();
                        }}
                      >
                        <i className="ri-search-line" style={iconStyle}></i>
                        Search
                      </button>

                      <button
                        className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                        style={{ height: '42px', width: '42px', flex: '0 0 auto' }}
                        onClick={() => {

                          setFromDate(null);
                          setToDate(null);
                          setSearchQuery('');
                          setCurrentPage(1);

                          setTimeout(() => {
                            fetchData();
                          }, 0);

                        }}
                        title="Reset filters"
                      >
                        <i className="ri-refresh-line" style={iconStyle}></i>
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* TABLE */}
              <div className="card-body p-0">
                {loading ? (
                  <div className="p-4">
                    <Loading />
                  </div>
                ) : (
                  <div className="table-responsive mt-2">
                    <table
                      className="table table-hover table-bordered align-middle mb-0"
                      style={{ tableLayout: 'fixed', width: '100%', minWidth: '1850px' }}
                    >
                      <thead style={{ background: '#F9FAFB', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
                        <tr>
                          <th className="text-center" width="50" style={thStyle}>#</th>
                          <th width="140" style={thStyle}>App User</th>
                          <th width="200" style={thStyle}>Search Name</th>
                          <th width="130" style={thStyle}>Category</th>
                          <th width="300" style={thStyle}>Address</th>
                          <th width="220" style={thStyle}>Contact</th>
                          <th width="110" style={thStyle}>Price</th>
                          <th width="140" style={thStyle}>Rating</th>
                          <th width="170" style={thStyle}>Working Hours</th>
                          <th width="150" style={thStyle}>Added On</th>
                        </tr>
                      </thead>

                      <tbody>

                        {currentData.length === 0 ? (

                          <TableDataStatusError colspan="10" />

                        ) : (

                          currentData.map((item, index) => (

                            <tr key={item.id}>

                              {/* SL NO */}
                              <td className="text-center text-muted" style={tdStyle}>
                                {(currentPage - 1) * entriesPerPage + index + 1}
                              </td>

                              {/* APP USER */}
                              <td style={tdStyle}>
                                <div style={{ fontWeight: '600', color: '#111827', fontSize: '13px' }}>
                                  {item.userName || 'UserName name unavailable'}
                                </div>
                              </td>

                              {/* BUSINESS NAME */}
                              <td style={tdStyle}>
                                <div style={{ fontWeight: '600', color: '#111827', fontSize: '13px' }}>
                                  {item.title || 'Business name unavailable'}
                                </div>
                              </td>

                              {/* CATEGORY */}
                              <td style={tdStyle}>
                                {item.type ? (
                                  <span
                                    className="badge rounded-pill"
                                    style={{ ...pillBase, background: '#F3F4F6', color: '#374151' }}
                                  >
                                    {item.type}
                                  </span>
                                ) : (
                                  <span className="text-muted small">Not Specified</span>
                                )}
                              </td>

                              {/* ADDRESS */}
                              <td style={{ ...tdStyle, whiteSpace: 'normal' }}>
                                <div className="d-flex align-items-start gap-2 mb-1">
                                  <i className="ri-map-pin-2-fill mt-1" style={{ ...iconStyle, color: '#DC2626' }}></i>
                                  <span
                                    style={{
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                    }}
                                    title={item.address}
                                  >
                                    {item.address || 'Address unavailable'}
                                  </span>
                                </div>

                                {item.latitude && item.longitude ? (
                                  <div className="d-flex align-items-center gap-2" style={{ paddingLeft: '22px' }}>
                                    <i className="ri-crosshair-2-line" style={{ ...iconStyle, color: '#0284C7' }}></i>
                                    <span style={{ fontSize: '11px', color: '#0284C7', fontWeight: '500' }}>
                                      {item.latitude}, {item.longitude}
                                    </span>
                                  </div>
                                ) : null}
                              </td>

                              {/* CONTACT */}
                              <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                                <div className="d-flex align-items-center gap-2 mb-1">
                                  <i className="ri-phone-fill" style={{ ...iconStyle, color: item.phone ? '#16A34A' : '#9CA3AF' }}></i>
                                  {item.phone ? (
                                    <span style={{ fontWeight: '500' }}>{item.phone}</span>
                                  ) : (
                                    <span className="text-muted">No mobile number</span>
                                  )}
                                </div>

                                <div className="d-flex align-items-center gap-2">
                                  <i className="ri-mail-fill" style={{ ...iconStyle, color: item.email ? '#2563EB' : '#9CA3AF' }}></i>
                                  {item.email ? (
                                    <span
                                      className="text-truncate d-inline-block"
                                      style={{ maxWidth: '160px' }}
                                      title={item.email}
                                    >
                                      {item.email}
                                    </span>
                                  ) : (
                                    <span className="text-muted">Email unavailable</span>
                                  )}
                                </div>
                              </td>

                              {/* PRICE */}
                              <td style={tdStyle}>
                                {item.priceDesc ? (
                                  <span
                                    className="badge rounded-pill"
                                    style={{ ...pillBase, background: '#FEF3C7', color: '#92400E' }}
                                  >
                                    {item.priceDesc}
                                  </span>
                                ) : (
                                  <span className="text-muted small">Not Mentioned</span>
                                )}
                              </td>

                              {/* RATING */}
                              <td style={tdStyle}>
                                <div className="d-flex flex-column" style={{ gap: '4px' }}>
                                  {item.rating ? (
                                    <span
                                      className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill"
                                      style={{ background: '#ECFDF5', color: '#065F46', width: 'fit-content', ...pillBase }}
                                    >
                                      <i className="ri-star-fill" style={{ fontSize: '11px' }}></i>
                                      {item.rating}
                                    </span>
                                  ) : (
                                    <span className="badge bg-light text-muted border" style={{ width: 'fit-content', ...pillBase }}>
                                      No Ratings
                                    </span>
                                  )}

                                  {item.review ? (
                                    <span
                                      className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill"
                                      style={{ background: '#EFF6FF', color: '#1D4ED8', width: 'fit-content', ...pillBase }}
                                    >
                                      <i className="ri-chat-3-fill" style={{ fontSize: '11px' }}></i>
                                      {item.review} Reviews
                                    </span>
                                  ) : (
                                    <span className="badge bg-light text-muted border" style={{ width: 'fit-content', ...pillBase }}>
                                      No Reviews
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* WORKING HOURS */}
                              <td style={{ ...tdStyle, whiteSpace: 'normal' }}>
                                {item.hours ? (
                                  <div className="d-flex align-items-center gap-2">
                                    <i className="ri-time-fill" style={{ ...iconStyle, color: '#7C3AED' }}></i>
                                    <span>{item.hours}</span>
                                  </div>
                                ) : (
                                  <span className="text-muted">Hours unavailable</span>
                                )}
                              </td>

                              {/* ADDED ON */}
                              <td style={tdStyle}>
                                {item.addedOn ? (
                                  <div className="d-flex align-items-center gap-2">
                                    <i className="ri-calendar-2-fill" style={{ ...iconStyle, color: '#EA580C' }}></i>
                                    <div>
                                      <div style={{ fontWeight: '500' }}>
                                        {new Date(item.addedOn).toLocaleDateString()}
                                      </div>
                                      <small className="text-muted">
                                        {new Date(item.addedOn).toLocaleTimeString()}
                                      </small>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-muted">Date unavailable</span>
                                )}
                              </td>

                            </tr>

                          ))

                        )}

                      </tbody>

                    </table>

                  </div>

                )}
              </div>

              <div className="px-4 py-3 border-top">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalEntries={filteredData.length}
                  entriesPerPage={entriesPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>

            </div>
          </div>
        </div>

      ) : null}
    </>
  );
};