import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, RotateCcw, Filter, MapPin } from "lucide-react";
import Swal from "sweetalert2";
import { getAllUserLocations } from "../../services/searchLocationsService";
import { calculateTotalPages } from "../../assets/js/script";
import TableHeader from "../Common/TableComponent/TableHeader";
import EntriesDropdown from "../Common/TableComponent/EntriesDropdown";
import { Pagination } from "../Common/TableComponent/Pagination";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import { handleErrors } from "../../utils/errorHandler";
import { usePageLevelAccess } from "../../hooks/usePageLevelAccess";

// ⚠️ Adjust the `value`s below to whatever string your API expects in the
// `status` filter of all-user-locations (e.g. "Blocked" instead of "Inactive").
const STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

const EMPTY_FILTERS = {
  fromDate: "",
  toDate: "",
  status: "",
  state: "",
  city: "",
  area: "",
};

// <input type="date"> gives "YYYY-MM-DD". Send a full-day range to the API.
const toStartOfDayISO = (d) => (d ? new Date(`${d}T00:00:00`).toISOString() : null);
const toEndOfDayISO = (d) => (d ? new Date(`${d}T23:59:59.999`).toISOString() : null);

const isActive = (item) => item.status === "Active";

// The paged endpoint may return the rows directly or wrapped in an object
// (e.g. { items: [...], totalCount, pageNumber, ... }). Always return an array.
const extractList = (result) => {
  if (Array.isArray(result)) return result;
  if (result && typeof result === "object") {
    const candidate =
      result.items ??
      result.data ??
      result.records ??
      result.list ??
      result.locations ??
      result.userLocations;
    if (Array.isArray(candidate)) return candidate;

    // Fallback: first array-valued property on the object
    const firstArray = Object.values(result).find(Array.isArray);
    if (firstArray) return firstArray;
  }
  return [];
};

// Reads the total record count from `result` or from the top level of the response.
const extractTotal = (response, fallback) => {
  const keys = ["totalCount", "totalRecords", "totalItems", "total", "count"];
  for (const source of [response?.result, response]) {
    if (source && typeof source === "object" && !Array.isArray(source)) {
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

export const GetAllLocations = () => {
  const [data, setData] = useState([]); // rows of the current page only
  const [totalCount, setTotalCount] = useState(0); // total rows for the current filters
  const [loading, setLoading] = useState(true);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageAccessDetails, setPageAccessDetails] = useState([]);

  // `searchQuery` is the text box, `debouncedSearch` is what is sent to the API.
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // `filters` is what the user is editing, `appliedFilters` is what was last
  // applied (it drives the API call and the badge).
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);

  const requestIdRef = useRef(0);

  const PageLevelAccessurl = "google-search";
  const navigate = useNavigate();
  const { pageAccessData } = usePageLevelAccess(PageLevelAccessurl);

  useEffect(() => {
    if (pageAccessData) {
      if (!pageAccessData.viewAccess) {
        navigate("/404-error-page");
      } else {
        setPageAccessDetails(pageAccessData);
      }
    }
  }, [pageAccessData, navigate]);

  // -------------------------------------------------------------------------
  // Data fetching (server-side paging)
  // -------------------------------------------------------------------------
  const fetchData = useCallback(async ({ page, size, activeFilters, search }) => {
    // Ignore responses that arrive after a newer request was started
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const response = await getAllUserLocations({
        pageNumber: page,
        pageSize: size,
        fromDate: toStartOfDayISO(activeFilters.fromDate),
        toDate: toEndOfDayISO(activeFilters.toDate),
        status: activeFilters.status,
        state: activeFilters.state,
        city: activeFilters.city,
        area: activeFilters.area,
        sParam: search,
      });

      if (requestId !== requestIdRef.current) return;

      // Temporary: check the real response shape, then remove this log
      console.log("all-user-locations response:", response);

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

  // Any change to the page, page size, applied filters or search refetches.
  useEffect(() => {
    fetchData({
      page: currentPage,
      size: entriesPerPage,
      activeFilters: appliedFilters,
      search: debouncedSearch,
    });
  }, [fetchData, currentPage, entriesPerPage, appliedFilters, debouncedSearch]);

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

  // -------------------------------------------------------------------------
  // Filter handlers
  // -------------------------------------------------------------------------
  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const handleApplyFilters = () => {
    if (filters.fromDate && filters.toDate && filters.fromDate > filters.toDate) {
      Swal.fire("Invalid range", "From Date cannot be after To Date", "warning");
      return;
    }
    // new object, so Apply always refetches
    setAppliedFilters({
      ...filters,
      state: filters.state.trim(),
      city: filters.city.trim(),
      area: filters.area.trim(),
    });
    setCurrentPage(1);
  };

  const handleFilterKeyDown = (e) => {
    if (e.key === "Enter" && !loading) handleApplyFilters();
  };

  const handleResetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters({ ...EMPTY_FILTERS });
    setSearchQuery("");
    setDebouncedSearch("");
    setCurrentPage(1);
  };

  const handleEntriesChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

  // -------------------------------------------------------------------------
  // Derived data
  // -------------------------------------------------------------------------
  const totalPages = calculateTotalPages(totalCount, entriesPerPage);

  const parseCoords = (coord) => {
    if (!coord) return { lat: "-", lng: "-" };
    const [lat, lng] = coord.split(",");
    return { lat: lat?.trim() || "-", lng: lng?.trim() || "-" };
  };

  // Builds "area, city, state, country" skipping any missing pieces
  const getLocationLine = (item) => {
    const parts = [item.area, item.city, item.state, item.country].filter(Boolean);
    return parts.length ? parts.join(", ") : "-";
  };

  const handleSearchClick = (item) => {
    const coords = item.jioCoOrdinate || "";
    const [latitude, longitude] = coords.split(",").map((x) => x.trim());

    navigate(`/google-search/search`, {
      state: {
        userDetails: {
          userGuid: item.userGuid,
          shareId: item.id,
          userName: item.userName,
          city: item.city,
          state: item.state,
          country: item.country,
          area: item.area,
          status: item.status,
          addedOn: item.addedOn,
        },
        latitude,
        longitude,
      },
    });
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <>
      <style>{`
        .ul-filter-panel {
          background: #fff;
          border: 1px solid #e9ebec;
          border-radius: 12px;
          padding: 16px 18px 18px;
          box-shadow: 0 1px 2px rgba(16, 24, 40, .04);
        }
        .ul-filter-panel .form-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .5px;
          color: #8a8fa3;
          margin-bottom: 6px;
        }
        /* One height and font size for every control in the bar */
        .ul-filter-panel .form-control,
        .ul-filter-panel .form-select {
          height: 40px;
          font-size: 14px;
          border-radius: 8px;
        }
        .ul-filter-panel .btn {
          height: 40px;
          font-size: 14px;
          border-radius: 8px;
          padding: 0 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          white-space: nowrap;
          box-shadow: none;
        }
        .ul-stat {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px 8px 10px;
          border-radius: 10px;
          background: #fff;
          border: 1px solid #e9ebec;
        }
        .ul-stat .ul-stat-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          background: #eef2ff;
          color: #4338ca;
        }
        .ul-stat .ul-stat-value { font-size: 17px; font-weight: 700; line-height: 1.1; color: #212529; }
        .ul-stat .ul-stat-label {
          font-size: 11px;
          font-weight: 500;
          color: #8a8fa3;
          text-transform: uppercase;
          letter-spacing: .4px;
        }
        .ul-btn-gold {
          background: linear-gradient(135deg, #f59e0b, #facc15);
          border: none;
          color: #000;
          font-weight: 600;
          border-radius: 8px;
        }
        .ul-btn-gold:hover:not(:disabled) { filter: brightness(.95); color: #000; }
        .ul-search-wrap { position: relative; }
        .ul-search-wrap .form-control { padding-left: 38px; }
        .ul-search-wrap .ul-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #878a99;
          pointer-events: none;
        }
        .ul-badge-active { background: #d1fae5; color: #047857; }
        .ul-badge-inactive { background: #fee2e2; color: #b91c1c; }
      `}</style>

      {pageAccessDetails.viewAccess ? (
        <div className="row">
          <div className="col-xxl-12">
            <div className="card mt-xxl-n5">
              {/* Header with title + total */}
              <div className="card-header">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div>
                    <h5 className="mb-1">User Locations</h5>
                    <p className="text-muted mb-0 fs-13">
                      Browse shared user locations and run a search from any of them
                    </p>
                  </div>
                  <div className="ul-stat">
                    <span className="ul-stat-icon"><MapPin size={16} /></span>
                    <div>
                      <div className="ul-stat-value">{totalCount}</div>
                      <div className="ul-stat-label">Total</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-body p-4">
                {/* Filter panel */}
                <div className="ul-filter-panel mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <Filter size={16} className="text-muted" />
                    <span className="fw-semibold">Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="badge bg-warning-subtle text-warning rounded-pill">
                        {activeFilterCount} applied
                      </span>
                    )}
                  </div>

                  {/* Row 1: dates, status, general search */}
                  <div className="row g-3 align-items-end mb-3">
                    <div className="col-xl-2 col-md-4 col-sm-6">
                      <label className="form-label" htmlFor="ul-from-date">
                        From Date
                      </label>
                      <input
                        id="ul-from-date"
                        type="date"
                        className="form-control"
                        value={filters.fromDate}
                        max={filters.toDate || undefined}
                        onChange={(e) => handleFilterChange("fromDate", e.target.value)}
                      />
                    </div>

                    <div className="col-xl-2 col-md-4 col-sm-6">
                      <label className="form-label" htmlFor="ul-to-date">
                        To Date
                      </label>
                      <input
                        id="ul-to-date"
                        type="date"
                        className="form-control"
                        value={filters.toDate}
                        min={filters.fromDate || undefined}
                        onChange={(e) => handleFilterChange("toDate", e.target.value)}
                      />
                    </div>

                    <div className="col-xl-2 col-md-4 col-sm-6">
                      <label className="form-label" htmlFor="ul-status">
                        Status
                      </label>
                      <select
                        id="ul-status"
                        className="form-select"
                        value={filters.status}
                        onChange={(e) => handleFilterChange("status", e.target.value)}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value || "all"} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-xl-6 col-md-12 col-sm-6">
                      <label className="form-label" htmlFor="ul-search">
                        Search
                      </label>
                      <div className="ul-search-wrap">
                        <Search size={16} className="ul-search-icon" />
                        <input
                          id="ul-search"
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
                  </div>

                  {/* Row 2: state, city, area + actions */}
                  <div className="row g-3 align-items-end">
                    <div className="col-xl-3 col-md-4 col-sm-6">
                      <label className="form-label" htmlFor="ul-state">
                        State
                      </label>
                      <div className="ul-search-wrap">
                        <Search size={16} className="ul-search-icon" />
                        <input
                          id="ul-state"
                          type="text"
                          className="form-control"
                          placeholder="Search state..."
                          value={filters.state}
                          autoComplete="off"
                          spellCheck={false}
                          onChange={(e) => handleFilterChange("state", e.target.value)}
                          onKeyDown={handleFilterKeyDown}
                        />
                      </div>
                    </div>

                    <div className="col-xl-3 col-md-4 col-sm-6">
                      <label className="form-label" htmlFor="ul-city">
                        City
                      </label>
                      <div className="ul-search-wrap">
                        <Search size={16} className="ul-search-icon" />
                        <input
                          id="ul-city"
                          type="text"
                          className="form-control"
                          placeholder="Search city..."
                          value={filters.city}
                          autoComplete="off"
                          spellCheck={false}
                          onChange={(e) => handleFilterChange("city", e.target.value)}
                          onKeyDown={handleFilterKeyDown}
                        />
                      </div>
                    </div>

                    <div className="col-xl-3 col-md-4 col-sm-6">
                      <label className="form-label" htmlFor="ul-area">
                        Area
                      </label>
                      <div className="ul-search-wrap">
                        <Search size={16} className="ul-search-icon" />
                        <input
                          id="ul-area"
                          type="text"
                          className="form-control"
                          placeholder="Search area..."
                          value={filters.area}
                          autoComplete="off"
                          spellCheck={false}
                          onChange={(e) => handleFilterChange("area", e.target.value)}
                          onKeyDown={handleFilterKeyDown}
                        />
                      </div>
                    </div>

                    <div className="col-xl-3 col-md-12 col-sm-6">
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn ul-btn-gold flex-grow-1"
                          onClick={handleApplyFilters}
                          disabled={loading}
                        >
                          <Filter size={16} />
                          Apply
                        </button>
                        <button
                          type="button"
                          className="btn btn-light border"
                          onClick={handleResetFilters}
                          disabled={loading}
                        >
                          <RotateCcw size={16} />
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table toolbar */}
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                  <EntriesDropdown
                    entriesPerPage={entriesPerPage}
                    onEntriesChange={handleEntriesChange}
                    options={[10, 25, 50, 100]}
                  />
                  <span className="text-muted fs-13">
                    {totalCount} location{totalCount === 1 ? "" : "s"} found
                  </span>
                </div>

                {loading ? (
                  <Loading />
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered align-middle">
                      <TableHeader
                        columns={["#", "MobileAppUser", "Location", "Added On", "Action", "Status"]}
                      />
                      <tbody>
                        {data.length === 0 ? (
                          <TableDataStatusError colspan="6" />
                        ) : (
                          data.map((item, index) => {
                            const { lat, lng } = parseCoords(item.jioCoOrdinate);

                            return (
                              <tr key={item.id}>
                                <td>{(currentPage - 1) * entriesPerPage + index + 1}</td>

                                <td>{item.userName}</td>

                                <td style={{ minWidth: "250px" }}>
                                  <div className="d-flex align-items-center mb-1">
                                    <span
                                      className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger-subtle text-danger me-2"
                                      style={{ width: "22px", height: "22px", flex: "0 0 auto" }}
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                      </svg>
                                    </span>
                                    <span className="fw-medium">{getLocationLine(item)}</span>
                                  </div>
                                  <div className="d-flex align-items-center">
                                    <span
                                      className="d-inline-flex align-items-center justify-content-center rounded-circle bg-info-subtle text-info me-2"
                                      style={{ width: "22px", height: "22px", flex: "0 0 auto" }}
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="8"></circle>
                                        <path d="M12 2v4M12 18v4M2 12h4M18 12h4"></path>
                                      </svg>
                                    </span>
                                    <span className="small text-muted">
                                      Lat: {lat}, Lng: {lng}
                                    </span>
                                  </div>
                                </td>

                                <td>
                                  {item.addedOn ? new Date(item.addedOn).toLocaleString() : "-"}
                                </td>

                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-sm ul-btn-gold d-flex align-items-center gap-1"
                                    style={{ padding: "6px 12px" }}
                                    onClick={() => handleSearchClick(item)}
                                  >
                                    <Search size={14} />
                                    Search
                                  </button>
                                </td>

                                <td>
                                  <span
                                    className={`badge rounded-pill ${
                                      isActive(item) ? "ul-badge-active" : "ul-badge-inactive"
                                    }`}
                                  >
                                    {item.status || "-"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
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