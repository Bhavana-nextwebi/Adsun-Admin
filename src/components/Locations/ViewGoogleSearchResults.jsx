import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Flatpickr from 'react-flatpickr';

import 'flatpickr/dist/themes/material_blue.css';

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

      }

    } catch (error) {

      handleErrors(error);

    } finally {

      setLoading(false);

    }
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
  lineHeight:'1.5',
  verticalAlign:'middle'
  
  
};
  return (
    <>
      {pageAccessDetails.viewAccess ? (

        <div className="row">

          <div className="col-12">

            {/* FILTER CARD */}
        {/* FILTER SECTION */}
<div className="card mb-4">

  <div className="card-body">

    <div className="row g-3 align-items-end">

      {/* ENTRIES */}
      <div className="col-lg-2 col-md-3">

        <label className="form-label fw-semibold text-dark mb-2">
        
        </label>

        <EntriesDropdown
          entriesPerPage={entriesPerPage}
          onEntriesChange={handleEntriesChange}
          options={[10, 25, 50, 100]}
        />

      </div>

      {/* SEARCH */}
      <div className="col-lg-4 col-md-9">

        <label className="form-label fw-semibold text-dark mb-2">
       
        </label>

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

        <label className="form-label fw-semibold text-dark mb-2">
        
        </label>

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
          placeholder="Select date"
          style={{
            height: '45px'
          }}
        />

      </div>

      {/* TO DATE */}
      <div className="col-lg-2 col-md-6">

        <label className="form-label fw-semibold text-dark mb-2">
        
        </label>

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
          placeholder="Select date"
          style={{
            height: '45px'
          }}
        />

      </div>

      {/* BUTTONS */}
      <div className="col-lg-2 col-md-12">

        <div className="d-flex gap-2">

          {/* SEARCH BUTTON */}
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

          {/* RESET BUTTON */}
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
            {/* TABLE CARD */}
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
  {/* TABLE HEAD */}
  <thead
    className="table-light"
    style={{
      whiteSpace: 'nowrap'
    }}
  >
    <tr>
      <th className="text-center" width="60" style={thStyle}>#</th>

      <th style={thStyle}>Business Name</th>

      <th width="150" style={thStyle}>Category</th>

      <th width="350" style={thStyle}>Address</th>

      <th width="180" style={thStyle}>Mobile No</th>

      <th width="240" style={thStyle}>Email Address</th>

      <th width="120" style={thStyle}>Price</th>

      <th width="140" style={thStyle}>Rating</th>

      <th width="120" style={thStyle}>Reviews</th>

      <th width="180" style={thStyle}>Working Hours</th>

      <th width="180" style={thStyle}>Coordinates</th>

      <th width="180" style={thStyle}>Added On</th>
    </tr>
  </thead>

  {/* TABLE BODY */}
  <tbody>
    {currentData.length === 0 ? (
      <TableDataStatusError colspan="12" />
    ) : (
      currentData.map((item, index) => (
        <tr key={item.id}>
          {/* SERIAL */}
          <td className="text-center" style={tdStyle}>
            {(currentPage - 1) * entriesPerPage + index + 1}
          </td>

          {/* BUSINESS NAME */}
          <td style={tdStyle}>
            {item.title || 'Business name unavailable'}
          </td>

          {/* CATEGORY */}
          <td style={tdStyle}>
            {item.type ? (
              <span
                className="badge bg-light text-dark border"
                style={{
                  fontSize: '10px',
                  padding: '4px 8px',
                  borderRadius: '5px',
                  fontWeight: '500'
                }}
              >
                {item.type}
              </span>
            ) : (
              'Not Specified'
            )}
          </td>

          {/* ADDRESS */}
          <td
            style={{
              ...tdStyle,
              lineHeight: '1.5'
            }}
          >
            {item.address || 'Address unavailable'}
          </td>

          {/* MOBILE */}
          <td
            style={{
              ...tdStyle,
              whiteSpace: 'nowrap'
            }}
          >
            {item.phone ? (
              <div className="d-flex align-items-center gap-2">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle bg-success-subtle"
                  style={{
                    width: '24px',
                    height: '24px',
                    flexShrink: 0
                  }}
                >
                  <i
                    className="ri-phone-fill text-success"
                    style={{
                      fontSize: '11px'
                    }}
                  ></i>
                </div>

                <span>{item.phone}</span>
              </div>
            ) : (
              'No mobile number'
            )}
          </td>

          {/* EMAIL */}
          <td
            style={{
              ...tdStyle,
              wordBreak: 'break-word'
            }}
          >
            {item.email || 'Email unavailable'}
          </td>

          {/* PRICE */}
          <td style={tdStyle}>
            {item.priceDesc ? (
              <span
                className="badge bg-success-subtle text-success border"
                style={{
                  fontSize: '10px',
                  padding: '4px 8px',
                  borderRadius: '5px',
                  fontWeight: '500'
                }}
              >
                {item.priceDesc}
              </span>
            ) : (
              'Not Mentioned'
            )}
          </td>

          {/* RATING */}
          <td style={tdStyle}>
            {item.rating ? (
              <span
                className={`badge ${
                  item.rating >= 4.5
                    ? 'bg-success'
                    : item.rating >= 3.5
                    ? 'bg-warning text-dark'
                    : 'bg-danger'
                }`}
                style={{
                  fontSize: '10px',
                  padding: '4px 8px',
                  borderRadius: '5px',
                  fontWeight: '500'
                }}
              >
                ⭐ {item.rating}
              </span>
            ) : (
              'No Ratings'
            )}
          </td>

          {/* REVIEWS */}
          <td style={tdStyle}>
            {item.review || 'No Reviews'}
          </td>

          {/* HOURS */}
          <td
            style={{
              ...tdStyle,
              lineHeight: '1.4'
            }}
          >
            {item.hours || 'Hours unavailable'}
          </td>

          {/* COORDINATES */}
          <td style={tdStyle}>
            {item.latitude && item.longitude ? (
              <div>
                <div>Lat: {item.latitude}</div>
                <div>Lng: {item.longitude}</div>
              </div>
            ) : (
              'Coordinates unavailable'
            )}
          </td>

          {/* DATE */}
          <td style={tdStyle}>
            {item.addedOn ? (
              <div>
                <div>
                  {new Date(item.addedOn).toLocaleDateString()}
                </div>

                <div>
                  {new Date(item.addedOn).toLocaleTimeString()}
                </div>
              </div>
            ) : (
              'Date unavailable'
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