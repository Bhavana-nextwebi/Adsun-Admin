import React, {
  useEffect,
  useState,
  useCallback
} from 'react';

import {
  useNavigate,
  useLocation,
} from 'react-router-dom';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import {
  paginateData,
  calculateTotalPages,
} from '../../assets/js/script';

import EntriesDropdown from '../Common/TableComponent/EntriesDropdown';

import { Pagination } from '../Common/TableComponent/Pagination';

import { Loading } from '../Common/OtherElements/Loading';

import { TableDataStatusError } from '../Common/OtherElements/TableDataStatusError';

import { handleErrors } from '../../utils/errorHandler';

import { usePageLevelAccess } from '../../hooks/usePageLevelAccess';

import { getSearchResultsBySearchId } from '../../services/searchLocationsService';

/* ---------------------------------------------------------------------
   Shared design tokens — keep identical in ViewGoogleSearchResult.jsx
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

export const SearchResults = () => {
  const [data, setData] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    searchQuery,
    setSearchQuery,
  ] = useState('');

  const [
    entriesPerPage,
    setEntriesPerPage,
  ] = useState(10);

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    pageAccessDetails,
    setPageAccessDetails,
  ] = useState([]);

  const navigate =
    useNavigate();

  const routeLocation =
    useLocation();

  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("searchId");
  const searchId =
    id ||
    routeLocation.state
      ?.searchId ||
    null;

  const searchInfo =
    routeLocation.state
      ?.searchInfo || {};

  const userDetails =
    routeLocation.state
      ?.userDetails || null;

  const PageLevelAccessurl =
    'google-search';

  const { pageAccessData } =
    usePageLevelAccess(
      PageLevelAccessurl
    );

  useEffect(() => {
    if (pageAccessData) {
      if (
        !pageAccessData.viewAccess
      ) {
        navigate(
          '/404-error-page'
        );
      } else {
        setPageAccessDetails(
          pageAccessData
        );
      }
    }
  }, [
    pageAccessData,
    navigate,
  ]);

  const fetchData = useCallback(
    async () => {
      try {
        setLoading(true);

        const response =
          await getSearchResultsBySearchId(
            searchId
          );

        if (
          response?.isSuccess
        ) {
          setData(
            response.result || []
          );
        } else {
          setData([]);
        }
      } catch (error) {
        handleErrors(error);
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [searchId]
  );

  useEffect(() => {
    if (searchId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [searchId, fetchData]);

  const filteredData =
    data.filter((item) => {
      const query =
        searchQuery.toLowerCase();

      return (
        item.title
          ?.toLowerCase()
          .includes(query) ||
        item.address
          ?.toLowerCase()
          .includes(query) ||
        item.type
          ?.toLowerCase()
          .includes(query) ||
        item.phone
          ?.toLowerCase()
          .includes(query) ||
        item.priceDesc
          ?.toLowerCase()
          .includes(query)
      );
    });

  const currentData =
    paginateData(
      filteredData,
      currentPage,
      entriesPerPage
    );

  const totalPages =
    calculateTotalPages(
      filteredData.length,
      entriesPerPage
    );

  const handleEntriesChange = (
    value
  ) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  const exportToExcel =
    () => {
      const exportData =
        filteredData.map(
          (item, index) => ({
            'S.No':
              index + 1,

            Title:
              item.title || 'Business name unavailable',

            Type:
              item.type || 'Not Specified',

            Address:
              item.address || 'Address unavailable',

            Phone:
              item.phone || 'No mobile number',

            Email:
              item.email || 'Email unavailable',

            Rating:
              item.rating || 'No Ratings',

            Reviews:
              item.review || 'No Reviews',

            Price:
              item.priceDesc || 'Not Mentioned',

            Hours:
              item.hours || 'Hours unavailable',

            Latitude:
              item.latitude || 'N/A',

            Longitude:
              item.longitude || 'N/A',

            'Added On':
              item.addedOn
                ? new Date(
                    item.addedOn
                  ).toLocaleString()
                : 'Date unavailable',
          })
        );

      const worksheet =
        XLSX.utils.json_to_sheet(
          exportData
        );

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        'Search Results'
      );

      const excelBuffer =
        XLSX.write(workbook, {
          bookType: 'xlsx',
          type: 'array',
        });

      const fileData =
        new Blob(
          [excelBuffer],
          {
            type:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
          }
        );

      saveAs(
        fileData,
        `Search_Results_${Date.now()}.xlsx`
      );
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
                      Search Results
                    </h5>
                    <small className="text-muted d-flex align-items-center flex-wrap gap-1">
                      <span>Total Records : <strong>{filteredData.length}</strong></span>
                      {searchInfo.category && (
                        <span className="d-flex align-items-center">
                          <span className="mx-1">·</span>
                          Category: <strong className="ms-1">{searchInfo.category}</strong>
                        </span>
                      )}
                      {searchInfo.radiusKm && (
                        <span className="d-flex align-items-center">
                          <span className="mx-1">·</span>
                          Radius: <strong className="ms-1">{searchInfo.radiusKm} KM</strong>
                        </span>
                      )}
                      {userDetails && (
                        <span className="d-flex align-items-center">
                          <span className="mx-1">·</span>
                          User: <strong className="ms-1">{userDetails.userName}</strong>
                        </span>
                      )}
                    </small>
                  </div>

                  <div className="d-flex gap-2 align-items-center flex-wrap">
                    <button
                      className="btn btn-outline-secondary d-flex align-items-center gap-1"
                      onClick={() =>
                        navigate(
                          '/google-search/savedsearch',
                          {
                            state: {
                              userDetails,
                            },
                          }
                        )
                      }
                    >
                      <i className="ri-arrow-left-line" style={iconStyle}></i>
                      Back
                    </button>

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
              </div>

              {/* FILTER ROW */}
              <div className="px-4 pt-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <EntriesDropdown
                  entriesPerPage={entriesPerPage}
                  onEntriesChange={handleEntriesChange}
                  options={[10, 25, 50, 100]}
                />

                <div className="input-group" style={{ maxWidth: '320px', height: '42px' }}>
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

              {/* TABLE */}
              <div className="card-body p-0">
                {loading ? (
                  <div className="p-4">
                    <Loading />
                  </div>
                ) : (
                  <div className="table-responsive mt-3">
                    <table
                      className="table table-hover table-bordered align-middle mb-0"
                      style={{ tableLayout: 'fixed', width: '100%', minWidth: '1700px' }}
                    >
                      <thead style={{ background: '#F9FAFB', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
                        <tr>
                          <th className="text-center" width="50" style={thStyle}>#</th>
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
                          <TableDataStatusError colspan="9" />
                        ) : (
                          currentData.map((item, index) => (
                            <tr key={item.id}>

                              {/* SL NO */}
                             {/* SL NO */}
<td className="text-center text-muted" style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
  {(currentPage - 1) * entriesPerPage + index + 1}
</td>

                              {/* BUSINESS NAME */}
                              <td style={tdStyle}>
                                <div style={{ fontWeight: '600', color: '#111827', fontSize: '13px' }}>
                                  {item.title || 'Business name unavailable'}
                                </div>
                                {item.desc && (
                                  <small
                                    className="text-muted d-block text-truncate"
                                    style={{ maxWidth: '190px' }}
                                    title={item.desc}
                                  >
                                    {item.desc}
                                  </small>
                                )}
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
                                    <a href={`tel:${item.phone}`} className="text-decoration-none" style={{ fontWeight: '500', color: 'inherit' }}>
                                      {item.phone}
                                    </a>
                                  ) : (
                                    <span className="text-muted">No mobile number</span>
                                  )}
                                </div>

                                <div className="d-flex align-items-center gap-2">
                                  <i className="ri-mail-fill" style={{ ...iconStyle, color: item.email ? '#2563EB' : '#9CA3AF' }}></i>
                                  {item.email ? (
                                    <a
                                      href={`mailto:${item.email}`}
                                      className="text-decoration-none text-truncate"
                                      style={{ maxWidth: '160px', color: 'inherit' }}
                                      title={item.email}
                                    >
                                      {item.email}
                                    </a>
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
                                    <span
                                      className={
                                        item.hours.toLowerCase().includes('open')
                                          ? 'text-success fw-semibold'
                                          : item.hours.toLowerCase().includes('closed')
                                          ? 'text-danger fw-semibold'
                                          : ''
                                      }
                                    >
                                      {item.hours}
                                    </span>
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