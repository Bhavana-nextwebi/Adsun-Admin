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

  const thStyle = {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1F2937',
    verticalAlign: 'middle'
  };

  const tdStyle = {
    fontSize: '12px',
    fontWeight: '300',
    color: '#310800',
    lineHeight: '1.5',
    verticalAlign: 'middle'
  };

  return (
    <>
      {pageAccessDetails.viewAccess ? (

        <div className="row">

          <div className="col-12">

            {/* FILTER SECTION */}
            <div className="card mb-4">

              <div className="card-body">

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

                    <div className="input-group">

                      <span className="input-group-text bg-white">
                        <i className="ri-search-line"></i>
                      </span>

                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search business, address, phone..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        style={{
                          height: '45px'
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
                      style={{
                        height: '45px'
                      }}
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
                      style={{
                        height: '45px'
                      }}
                    />

                  </div>

                  {/* BUTTONS */}
                  <div className="col-lg-2 col-md-12">

                    <div className="d-flex gap-2">

                      <button
                        className="btn btn-primary w-100"
                        style={{
                          height: '45px'
                        }}
                        onClick={() => {
                          setCurrentPage(1);
                          fetchData();
                        }}
                      >
                        <i className="ri-search-line me-1"></i>
                        Search
                      </button>

                      <button
                        className="btn btn-light border"
                        style={{
                          height: '45px',
                          width: '45px'
                        }}
                        onClick={() => {

                          setFromDate(null);
                          setToDate(null);
                          setSearchQuery('');
                          setCurrentPage(1);

                          setTimeout(() => {
                            fetchData();
                          }, 0);

                        }}
                      >
                        <i className="ri-refresh-line"></i>
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* TABLE */}
            <div className="card border-0 shadow-sm">

              {/* HEADER */}
              <div className="card-header bg-white border-bottom py-3 px-3">

                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">

                  <div>

                    <h5 className="mb-1 fw-bold text-dark">
                      Google Search Results
                    </h5>

                    <small className="text-muted">
                      Total Records : {filteredData.length}
                    </small>

                  </div>

                  <button
                    className="btn btn-success d-flex align-items-center gap-2"
                    onClick={exportToExcel}
                    disabled={filteredData.length === 0}
                  >
                    <i className="ri-file-excel-2-line"></i>

                    Export Excel
                  </button>

                </div>

              </div>

              {/* BODY */}
              <div className="card-body p-0">

                {loading ? (

                  <Loading />

                ) : (

                  <div className="table-responsive">

                    <table
                      className="table table-hover table-bordered align-middle mb-0"
                    >

                      <thead
                        className="table-light"
                        style={{
                          whiteSpace: 'nowrap'
                        }}
                      >

                        <tr>

                          <th className="text-center" width="60" style={thStyle}>#</th>

                          <th style={thStyle}>UserName</th>
                          <th style={thStyle}>Search Name</th>

                          <th width="150" style={thStyle}>Category</th>

                          <th width="350" style={thStyle}>Address</th>

                          <th width="250" style={thStyle}>Mobile No</th>

                          <th width="240" style={thStyle}>Email Address</th>

                          <th width="120" style={thStyle}>Price</th>

                          <th width="140" style={thStyle}>Rating</th>

                          <th width="120" style={thStyle}>Reviews</th>

                          <th width="180" style={thStyle}>Working Hours</th>

                          <th width="180" style={thStyle}>Coordinates</th>

                          <th width="180" style={thStyle}>Added On</th>

                        </tr>

                      </thead>

                     <tbody>

  {currentData.length === 0 ? (

    <TableDataStatusError colspan="12" />

  ) : (

    currentData.map((item, index) => (

      <tr
        key={item.id}
        style={{
          transition: '0.2s ease'
        }}
      >

        {/* SL NO */}
        <td
          className="text-center"
          style={tdStyle}
        >
          {(currentPage - 1) * entriesPerPage + index + 1}
        </td>
  <td style={tdStyle}>

          <div
            style={{
              fontWeight: '600',
              color: '#111827',
              fontSize: '12px'
            }}
          >
            {item.userName || 'UserName name unavailable'}
          </div>

        </td>
        {/* BUSINESS NAME */}
        <td style={tdStyle}>

          <div
            style={{
              fontWeight: '600',
              color: '#111827',
              fontSize: '12px'
            }}
          >
            {item.title || 'Business name unavailable'}
          </div>

        </td>

        {/* CATEGORY */}
        <td style={tdStyle}>

          {item.type ? (

            <span
              className="badge rounded-pill"
              style={{
                background: '#F3F4F6',
                color: '#374151',
                fontWeight: '500',
                fontSize: '11px',
                padding: '6px 10px'
              }}
            >
              {item.type}
            </span>

          ) : (

            <span className="text-muted">
              Not Specified
            </span>

          )}

        </td>

        {/* ADDRESS */}
        <td
          style={{
            ...tdStyle,
            whiteSpace: 'normal',
            minWidth: '260px'
          }}
        >

          <div
            className="d-flex align-items-start gap-2"
          >

            <i
              className="ri-map-pin-2-fill mt-1"
              style={{
                color: '#DC2626',
                fontSize: '14px'
              }}
            ></i>

            <span>
              {item.address || 'Address unavailable'}
            </span>

          </div>

        </td>

        {/* MOBILE NUMBER */}
        <td
          style={{
            ...tdStyle,
            whiteSpace: 'nowrap',
            minWidth: '180px'
          }}
        >

          {item.phone ? (

            <div
              className="d-flex align-items-center gap-2"
            >

              <i
                className="ri-phone-fill"
                style={{
                  color: '#16A34A',
                  fontSize: '14px'
                }}
              ></i>

              <span
                style={{
                  fontWeight: '500'
                }}
              >
                {item.phone}
              </span>

            </div>

          ) : (

            <span className="text-muted">
              No mobile number
            </span>

          )}

        </td>

        {/* EMAIL */}
        <td
          style={{
            ...tdStyle,
            minWidth: '220px'
          }}
        >

          {item.email ? (

            <div
              className="d-flex align-items-center gap-2"
            >

              <i
                className="ri-mail-fill"
                style={{
                  color: '#2563EB',
                  fontSize: '14px'
                }}
              ></i>

              <span>
                {item.email}
              </span>

            </div>

          ) : (

            <span className="text-muted">
              Email unavailable
            </span>

          )}

        </td>

        {/* PRICE */}
        <td style={tdStyle}>

          {item.priceDesc ? (

            <span
              className="badge rounded-pill"
              style={{
                background: '#FEF3C7',
                color: '#92400E',
                fontWeight: '600',
                fontSize: '11px',
                padding: '6px 10px'
              }}
            >
              {item.priceDesc}
            </span>

          ) : (

            <span className="text-muted">
              Not Mentioned
            </span>

          )}

        </td>

        {/* RATING */}
        <td style={tdStyle}>

          {item.rating ? (

            <div
              className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill"
              style={{
                background: '#ECFDF5',
                color: '#065F46',
                fontWeight: '600',
                fontSize: '11px'
              }}
            >

              <i className="ri-star-fill"></i>

              {item.rating}

            </div>

          ) : (

            <span
              className="badge bg-light text-muted border"
              style={{
                fontSize: '11px',
                fontWeight: '500'
              }}
            >
              No Ratings
            </span>

          )}

        </td>

        {/* REVIEWS */}
        <td style={tdStyle}>

          {item.review ? (

            <div
              className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill"
              style={{
                background: '#EFF6FF',
                color: '#1D4ED8',
                fontWeight: '600',
                fontSize: '11px'
              }}
            >

              <i className="ri-chat-3-fill"></i>

              {item.review} Reviews

            </div>

          ) : (

            <span
              className="badge bg-light text-muted border"
              style={{
                fontSize: '11px',
                fontWeight: '500'
              }}
            >
              No Reviews
            </span>

          )}

        </td>

        {/* WORKING HOURS */}
        <td
          style={{
            ...tdStyle,
            minWidth: '180px',
            whiteSpace: 'normal'
          }}
        >

          {item.hours ? (

            <div
              className="d-flex align-items-start gap-2"
            >

              <i
                className="ri-time-fill mt-1"
                style={{
                  color: '#7C3AED',
                  fontSize: '14px'
                }}
              ></i>

              <span>
                {item.hours}
              </span>

            </div>

          ) : (

            <span className="text-muted">
              Hours unavailable
            </span>

          )}

        </td>

        {/* COORDINATES */}
        <td
          style={{
            ...tdStyle,
            minWidth: '200px'
          }}
        >

          {item.latitude && item.longitude ? (

            <div
              className="d-flex flex-column"
              style={{
                fontSize: '11px'
              }}
            >

              <span>
                <strong>Lat:</strong> {item.latitude}
              </span>

              <span>
                <strong>Lng:</strong> {item.longitude}
              </span>

            </div>

          ) : (

            <span className="text-muted">
              Coordinates unavailable
            </span>

          )}

        </td>

        {/* ADDED ON */}
        <td
          style={{
            ...tdStyle,
            minWidth: '180px'
          }}
        >

          {item.addedOn ? (

            <div
              className="d-flex align-items-start gap-2"
            >

              <i
                className="ri-calendar-2-fill mt-1"
                style={{
                  color: '#EA580C',
                  fontSize: '14px'
                }}
              ></i>

              <div>

                <div
                  style={{
                    fontWeight: '500'
                  }}
                >
                  {new Date(item.addedOn).toLocaleDateString()}
                </div>

                <small className="text-muted">
                  {new Date(item.addedOn).toLocaleTimeString()}
                </small>

              </div>

            </div>

          ) : (

            <span className="text-muted">
              Date unavailable
            </span>

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

            </div>

            {/* PAGINATION */}
            <div className="mt-3">
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

      ) : null}
    </>
  );
};