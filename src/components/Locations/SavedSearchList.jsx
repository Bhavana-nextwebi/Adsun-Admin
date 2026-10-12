import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Flatpickr from 'react-flatpickr';

import 'flatpickr/dist/themes/material_blue.css';

import { getAllSavedSearches } from '../../services/searchLocationsService';
import { calculateTotalPages } from '../../assets/js/script';

import TableHeader from '../Common/TableComponent/TableHeader';
import EntriesDropdown from '../Common/TableComponent/EntriesDropdown';
import { Pagination } from '../Common/TableComponent/Pagination';
import { Loading } from '../Common/OtherElements/Loading';
import { TableDataStatusError } from '../Common/OtherElements/TableDataStatusError';

import { handleErrors } from '../../utils/errorHandler';
import { usePageLevelAccess } from '../../hooks/usePageLevelAccess';

const EMPTY_FILTERS = {
  fromDate: null,
  toDate: null,
  category: '',
  state: '',
  city: '',
  area: '',
};

// Flatpickr gives Date objects. Send a full-day range to the API.
const toStartOfDayISO = (d) =>
  d ? new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).toISOString() : null;
const toEndOfDayISO = (d) =>
  d ? new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).toISOString() : null;

// The paged endpoint may return rows directly or wrapped in an object.
const extractList = (result) => {
  if (Array.isArray(result)) return result;
  if (result && typeof result === 'object') {
    const candidate =
      result.items ??
      result.data ??
      result.records ??
      result.list ??
      result.results ??
      result.searches;
    if (Array.isArray(candidate)) return candidate;

    const firstArray = Object.values(result).find(Array.isArray);
    if (firstArray) return firstArray;
  }
  return [];
};

const extractTotal = (response, fallback) => {
  const keys = ['totalCount', 'totalRecords', 'totalItems', 'total', 'count'];
  for (const source of [response?.result, response]) {
    if (source && typeof source === 'object' && !Array.isArray(source)) {
      for (const key of keys) {
        const raw = source[key];
        if (raw !== undefined && raw !== null && !Number.isNaN(Number(raw))) {
          return Number(raw);
        }
      }
    }
  }
  return fallback;
};

const buildPayload = ({ page, size, activeFilters, search, userGuid }) => ({
  pageNumber: page,
  pageSize: size,
  fromDate: toStartOfDayISO(activeFilters.fromDate),
  toDate: toEndOfDayISO(activeFilters.toDate),
  sParam: search,
  category: activeFilters.category,
  userGuid: userGuid || '',
  state: activeFilters.state,
  city: activeFilters.city,
  area: activeFilters.area,
});

const getRadiusFromCoordinates = (coord) => {
  if (!coord) return null;
  const cleaned = coord.replace('@', '').split(',');
  const radiusPart = cleaned[2]; // "5000m"
  if (!radiusPart) return null;
  const meters = parseFloat(radiusPart.replace('m', ''));
  if (isNaN(meters)) return null;
  return (meters / 1000).toFixed(2);
};

export const SavedSearchList = () => {
  const [data, setData] = useState([]); // rows of the current page only
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageAccessDetails, setPageAccessDetails] = useState([]);

  // `searchQuery` is the text box, `debouncedSearch` is what is sent to the API.
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // `filters` is what the user is editing, `appliedFilters` drives the API call.
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);

  const requestIdRef = useRef(0);

  const navigate = useNavigate();
  const routeLocation = useLocation();
  const queryParams = new URLSearchParams(routeLocation.search);
  const userGuidFromQuery = queryParams.get('userGuid');

  const userDetails = routeLocation.state?.userDetails || null;
  const highlightCriteria = routeLocation.state?.highlightCriteria;

  const userGuid =
    userGuidFromQuery ||
    routeLocation.state?.userGuid ||
    routeLocation.state?.userDetails?.userGuid ||
    '';

  const PageLevelAccessurl = 'google-search';
  const { pageAccessData } = usePageLevelAccess(PageLevelAccessurl);

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

  // FETCH DATA (server-side paging)
  const fetchData = useCallback(async (params) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const response = await getAllSavedSearches(buildPayload(params));

      if (requestId !== requestIdRef.current) return;

      if (response?.isSuccess) {
        const rows = extractList(response.result);
        setData(rows);
        setTotalCount(extractTotal(response, rows.length));
      } else {
        setData([]);
        setTotalCount(0);
      }
    } catch (error) {
      if (requestId === requestIdRef.current) {
        setData([]);
        setTotalCount(0);
      }
      handleErrors(error);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData({
      page: currentPage,
      size: entriesPerPage,
      activeFilters: appliedFilters,
      search: debouncedSearch,
      userGuid,
    });
  }, [fetchData, currentPage, entriesPerPage, appliedFilters, debouncedSearch, userGuid]);

  // Wait until the user stops typing before searching, then go back to page 1.
  useEffect(() => {
    const value = searchQuery.trim();
    if (value === debouncedSearch) return;
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch]);

  // FILTER HANDLERS
  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const handleApplyFilters = () => {
    setAppliedFilters({
      ...filters,
      category: filters.category.trim(),
      state: filters.state.trim(),
      city: filters.city.trim(),
      area: filters.area.trim(),
    });
    setCurrentPage(1);
  };

  const handleFilterKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) handleApplyFilters();
  };

  const handleResetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters({ ...EMPTY_FILTERS });
    setSearchQuery('');
    setDebouncedSearch('');
    setCurrentPage(1);
  };

  const handleEntriesChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  const activeFilterCount =
    Object.values(appliedFilters).filter(Boolean).length + (debouncedSearch ? 1 : 0);
  const totalPages = calculateTotalPages(totalCount, entriesPerPage);

  const isHighlighted = (item) => {
    if (!highlightCriteria) return false;
    if (!item?.coOrdinates) return false;

    const cleanCoords = item.coOrdinates.replace('@', '').replace('m', '').split(',');

    const itemLat = Number(cleanCoords[0]?.trim());
    const itemLng = Number(cleanCoords[1]?.trim());
    const searchLat = Number(highlightCriteria.latitude);
    const searchLng = Number(highlightCriteria.longitude);

    const sameCategory =
      item.category?.toLowerCase()?.trim() ===
      highlightCriteria.category?.toLowerCase()?.trim();

    const sameLat = Math.abs(itemLat - searchLat) < 0.000001;
    const sameLng = Math.abs(itemLng - searchLng) < 0.000001;

    return sameCategory && sameLat && sameLng;
  };

  const handleViewResults = (item) => {
    let url = `/google-search/place-results?searchId=${item.id}`;

    if (userGuidFromQuery) {
      url += `&userGuid=${userGuidFromQuery}`;
    } else {
      url += `&userGuid=${item.userGuid}`;
    }

    navigate(url, {
      state: {
        searchInfo: {
          category: item.category,
          coOrdinates: item.coOrdinates,
          addedOn: item.addedOn,
        },
        userDetails,
      },
    });
  };

  // Builds "area, city, state" skipping any missing pieces
  const getLocationLine = (item) => {
    const parts = [item.area, item.city, item.state].filter(Boolean);
    return parts.length ? parts.join(', ') : '-';
  };

  return (
    <>
      <style>{`
        .sl-filter-panel {
          background: #f8f9fb;
          border: 1px solid #e9ebec;
          border-radius: 12px;
          padding: 16px 18px 18px;
        }
        .sl-filter-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #212529;
        }
        .sl-filter-panel .sl-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .5px;
          color: #8a8fa3;
          margin-bottom: 6px;
        }
        .sl-field { position: relative; }
        .sl-field .sl-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 15px;
          color: #878a99;
          pointer-events: none;
          z-index: 2;
        }
        .sl-filter-panel .form-control {
          height: 40px;
          font-size: 14px;
          border-radius: 8px;
          border: 1px solid #dfe3e8;
          background-color: #fff;
          padding-left: 36px;
          box-shadow: none;
        }
        .sl-filter-panel .form-control:focus {
          border-color: #405189;
          box-shadow: 0 0 0 3px rgba(64, 81, 137, .12);
        }
        .sl-filter-panel .form-control::placeholder { color: #a5aab8; }
        .sl-filter-panel .btn {
          height: 40px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 8px;
          padding: 0 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          white-space: nowrap;
          box-shadow: none;
        }
        .sl-btn-reset {
          background: #fff;
          border: 1px solid #dfe3e8;
          color: #495057;
        }
        .sl-btn-reset:hover:not(:disabled) { background: #f1f3f5; color: #212529; }
        .sl-count {
          font-size: 12px;
          font-weight: 600;
          color: #405189;
          background: #e8ecf8;
          border-radius: 999px;
          padding: 2px 10px;
        }
      `}</style>

      {pageAccessDetails.viewAccess ? (
        <div className="row">
          <div className="col-xxl-12">
            <div className="card mt-xxl-n5">
              <div className="card-header d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h5 className="mb-1">Saved Searches</h5>
                  <small className="text-muted">
                    Total Records : <strong>{totalCount}</strong>
                  </small>
                </div>
                {userDetails && (
                  <span className="text-muted small">
                    User: <strong>{userDetails.userName}</strong>
                    {userDetails.city && ` — ${userDetails.city}`}
                    {userDetails.state && `, ${userDetails.state}`}
                  </span>
                )}
              </div>

              <div className="card-body p-4">
                {/* FILTER PANEL */}
                <div className="sl-filter-panel mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="sl-filter-title">
                      <i className="ri-filter-3-line text-muted"></i>
                      <span>Filters</span>
                      {activeFilterCount > 0 && (
                        <span className="sl-count">{activeFilterCount} applied</span>
                      )}
                    </div>
                  </div>

                  {/* Row 1: search + dates */}
                  <div className="row g-3 mb-3">
                    <div className="col-xl-6 col-md-12">
                      <label className="sl-label" htmlFor="sl-search">Search</label>
                      <div className="sl-field">
                        <i className="ri-search-line sl-icon"></i>
                        <input
                          id="sl-search"
                          type="text"
                          className="form-control"
                          placeholder="User name, email or mobile..."
                          value={searchQuery}
                          autoComplete="off"
                          spellCheck={false}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="col-xl-3 col-md-6">
                      <label className="sl-label">From Date</label>
                      <div className="sl-field">
                        <i className="ri-calendar-line sl-icon"></i>
                        <Flatpickr
                          value={filters.fromDate}
                          onChange={(dates) => handleFilterChange('fromDate', dates[0] || null)}
                          options={{ dateFormat: 'd/m/Y', maxDate: filters.toDate || null }}
                          className="form-control"
                          placeholder="DD/MM/YYYY"
                        />
                      </div>
                    </div>

                    <div className="col-xl-3 col-md-6">
                      <label className="sl-label">To Date</label>
                      <div className="sl-field">
                        <i className="ri-calendar-line sl-icon"></i>
                        <Flatpickr
                          value={filters.toDate}
                          onChange={(dates) => handleFilterChange('toDate', dates[0] || null)}
                          options={{ dateFormat: 'd/m/Y', minDate: filters.fromDate || null }}
                          className="form-control"
                          placeholder="DD/MM/YYYY"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: category, state, city, area + actions */}
                  <div className="row g-3 align-items-end">
                    <div className="col-xl-2 col-md-6">
                      <label className="sl-label" htmlFor="sl-category">Category</label>
                      <div className="sl-field">
                        <i className="ri-price-tag-3-line sl-icon"></i>
                        <input
                          id="sl-category"
                          type="text"
                          className="form-control"
                          placeholder="Category"
                          value={filters.category}
                          autoComplete="off"
                          spellCheck={false}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                          onKeyDown={handleFilterKeyDown}
                        />
                      </div>
                    </div>

                    <div className="col-xl-2 col-md-6">
                      <label className="sl-label" htmlFor="sl-state">State</label>
                      <div className="sl-field">
                        <i className="ri-map-2-line sl-icon"></i>
                        <input
                          id="sl-state"
                          type="text"
                          className="form-control"
                          placeholder="State"
                          value={filters.state}
                          autoComplete="off"
                          spellCheck={false}
                          onChange={(e) => handleFilterChange('state', e.target.value)}
                          onKeyDown={handleFilterKeyDown}
                        />
                      </div>
                    </div>

                    <div className="col-xl-2 col-md-6">
                      <label className="sl-label" htmlFor="sl-city">City</label>
                      <div className="sl-field">
                        <i className="ri-building-line sl-icon"></i>
                        <input
                          id="sl-city"
                          type="text"
                          className="form-control"
                          placeholder="City"
                          value={filters.city}
                          autoComplete="off"
                          spellCheck={false}
                          onChange={(e) => handleFilterChange('city', e.target.value)}
                          onKeyDown={handleFilterKeyDown}
                        />
                      </div>
                    </div>

                    <div className="col-xl-2 col-md-6">
                      <label className="sl-label" htmlFor="sl-area">Area</label>
                      <div className="sl-field">
                        <i className="ri-map-pin-line sl-icon"></i>
                        <input
                          id="sl-area"
                          type="text"
                          className="form-control"
                          placeholder="Area"
                          value={filters.area}
                          autoComplete="off"
                          spellCheck={false}
                          onChange={(e) => handleFilterChange('area', e.target.value)}
                          onKeyDown={handleFilterKeyDown}
                        />
                      </div>
                    </div>

                    <div className="col-xl-4 col-md-12">
                      <div className="d-flex gap-2 justify-content-xl-end">
                        <button
                          type="button"
                          className="btn btn-primary flex-grow-1 flex-xl-grow-0"
                          style={{ minWidth: '120px' }}
                          onClick={handleApplyFilters}
                          disabled={loading}
                        >
                          <i className="ri-filter-3-line"></i>
                          Apply
                        </button>
                        <button
                          type="button"
                          className="btn sl-btn-reset"
                          onClick={handleResetFilters}
                          disabled={loading}
                        >
                          <i className="ri-refresh-line"></i>
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TABLE TOOLBAR */}
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                  <EntriesDropdown
                    entriesPerPage={entriesPerPage}
                    onEntriesChange={handleEntriesChange}
                    options={[10, 25, 50, 100]}
                  />
                  <span className="text-muted small">
                    {totalCount} record{totalCount === 1 ? '' : 's'} found
                  </span>
                </div>

                {loading ? (
                  <Loading />
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered align-middle">
                      <TableHeader
                        columns={[
                          '#',
                          'MobileAppUser',
                          'Category',
                          'Location',
                          'Action',
                          'Added On',
                          'Status',
                        ]}
                      />
                      <tbody>
                        {data.length === 0 ? (
                          <TableDataStatusError colspan="7" />
                        ) : (
                          data.map((item, index) => (
                            <tr
                              key={item.id}
                              id={item.id}
                              className={`align-middle transition-row ${
                                isHighlighted(item)
                                  ? 'bg-warning-subtle border-start border-4 border-warning shadow-sm'
                                  : ''
                              }`}
                              style={{ transition: 'all 0.2s ease-in-out' }}
                            >
                              <td>{(currentPage - 1) * entriesPerPage + index + 1}</td>
                              <td>{item.userName || '-'}</td>
                              <td>{item.category || '-'}</td>
                              <td style={{ minWidth: '250px' }}>
                                <div className="d-flex align-items-center mb-1">
                                  <span
                                    className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger-subtle text-danger me-2"
                                    style={{ width: '22px', height: '22px', flex: '0 0 auto' }}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                                      <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                  </span>
                                  <span className="fw-medium">{getLocationLine(item)}</span>
                                </div>
                                <div className="d-flex align-items-center mb-1">
                                  <span
                                    className="d-inline-flex align-items-center justify-content-center rounded-circle bg-info-subtle text-info me-2"
                                    style={{ width: '22px', height: '22px', flex: '0 0 auto' }}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <circle cx="12" cy="12" r="8"></circle>
                                      <path d="M12 2v4M12 18v4M2 12h4M18 12h4"></path>
                                    </svg>
                                  </span>
                                  <span className="small">{item.coOrdinates || '-'}</span>
                                </div>
                                {getRadiusFromCoordinates(item.coOrdinates) && (
                                  <div className="d-flex align-items-center">
                                    <span
                                      className="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning-subtle text-warning me-2"
                                      style={{ width: '22px', height: '22px', flex: '0 0 auto' }}
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="9"></circle>
                                        <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"></circle>
                                      </svg>
                                    </span>
                                    <span className="small">
                                      {getRadiusFromCoordinates(item.coOrdinates)} km radius
                                    </span>
                                  </div>
                                )}
                              </td>
                              <td>
                                <button
                                  className="btn btn-sm btn-primary"
                                  title="View Search Results"
                                  onClick={() => handleViewResults(item)}
                                >
                                  <i className="fa fa-search me-1"></i>
                                  View Results
                                </button>
                              </td>
                              <td>
                                {item.addedOn ? new Date(item.addedOn).toLocaleString() : '-'}
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    item.status === 'Active' ? 'bg-success' : 'bg-danger'
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalEntries={totalCount}
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