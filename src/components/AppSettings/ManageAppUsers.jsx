import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { calculateTotalPages } from "../../assets/js/script";
import TableHeader from "../Common/TableComponent/TableHeader";
import EntriesDropdown from "../Common/TableComponent/EntriesDropdown";
import TablesRow from "../Common/TableComponent/TablesRow";
import { Pagination } from "../Common/TableComponent/Pagination";
import {
  getAppUsers,
  deleteAppUser,
  ChangePassword,
  blockUnblockAppUser,
} from "../../services/appUserServices";
import { Loading } from "../Common/OtherElements/Loading";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import allImages from "../../assets/images-import";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import { handleErrors } from "../../utils/errorHandler";
import { usePageLevelAccess } from "../../hooks/usePageLevelAccess";
import {
  Eye,
  EyeOff,
  Search,
  RotateCcw,
  Filter,
  Users,
  KeyRound,
  MapPin,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------
// The API returns `status` as a STRING, so `!!u.status` would be wrong
// (`!!"false"` is true). Anything that is not "active" is treated as inactive.
const parseStatus = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") return value.trim().toLowerCase() === "active";
  return false;
};

const normalizeUser = (u) => ({
  ...u,
  status: parseStatus(u.status),
  userGuid: u.userGuid ?? u.userGUID ?? u.guid ?? u.userId ?? u.id,
});

// ⚠️ Adjust the `value`s below to whatever string your API expects in the
// `status` filter of GetallAppUsers (e.g. "Blocked" instead of "Inactive").
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
  district: "",
  city: "",
};

// <input type="date"> gives "YYYY-MM-DD". Send a full-day range to the API.
const toStartOfDayISO = (d) => (d ? new Date(`${d}T00:00:00`).toISOString() : null);
const toEndOfDayISO = (d) => (d ? new Date(`${d}T23:59:59.999`).toISOString() : null);

// The paged endpoint returns the rows wrapped in an object
// ({ <rows array>, totalCount, pageNumber, pageSize, totalPages }) or,
// in some cases, as a plain array. Always return an array.
const extractList = (result) => {
  if (Array.isArray(result)) return result;
  if (result && typeof result === "object") {
    const candidate =
      result.items ??
      result.data ??
      result.records ??
      result.list ??
      result.users ??
      result.appUsers;
    if (Array.isArray(candidate)) return candidate;

    // Fallback: first array-valued property on the object
    const firstArray = Object.values(result).find(Array.isArray);
    if (firstArray) return firstArray;
  }
  return [];
};

// Reads the total record count from `body.result` or from the top level of `body`.
const extractTotal = (body, fallback) => {
  const keys = ["totalCount", "totalRecords", "totalItems", "total", "count"];
  for (const source of [body?.result, body]) {
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

export const ManageAppUser = () => {
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [manageAppUsers, setManageAppUsers] = useState([]); // rows of the current page only
  const [totalCount, setTotalCount] = useState(0); // total rows for the current filters
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // bump to refetch the current page
  const [pageAccessDetails, setPageAccessDetails] = useState([]);

  // `searchQuery` is the text box, `debouncedSearch` is what is sent to the API.
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // `filters` is what the user is editing, `appliedFilters` is what was last
  // applied (it drives the API call and the badge).
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);

  // Change password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserGuid, setSelectedUserGuid] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [statusLoadingId, setStatusLoadingId] = useState(null);

  const requestIdRef = useRef(0);

  const PageLevelAccessurl = "app-user";
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
  const fetchUsers = useCallback(async ({ page, size, activeFilters, search }) => {
    // Ignore responses that arrive after a newer request was started
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const response = await getAppUsers({
        pageNumber: page,
        pageSize: size,
        fromDate: toStartOfDayISO(activeFilters.fromDate),
        toDate: toEndOfDayISO(activeFilters.toDate),
        status: activeFilters.status,
        state: activeFilters.state,
        district: activeFilters.district,
        city: activeFilters.city,
        sParam: search,
      });

      if (requestId !== requestIdRef.current) return;

      const body = response?.data;

      // Temporary: check the real response shape, then remove this log
      console.log("GetallAppUsers response:", body);

      const rows = extractList(body?.result);
      setManageAppUsers(rows.map(normalizeUser));
      setTotalCount(extractTotal(body, rows.length));
    } catch (error) {
      if (requestId === requestIdRef.current) {
        setManageAppUsers([]);
        setTotalCount(0);
      }
      handleErrors(error);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  // Any change to the page, page size, applied filters, search or a manual
  // refresh refetches.
  useEffect(() => {
    fetchUsers({
      page: currentPage,
      size: entriesPerPage,
      activeFilters: appliedFilters,
      search: debouncedSearch,
    });
  }, [fetchUsers, currentPage, entriesPerPage, appliedFilters, debouncedSearch, refreshKey]);

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
    // New object, so Apply always refetches. Text filters are trimmed.
    setAppliedFilters({
      ...filters,
      state: filters.state.trim(),
      district: filters.district.trim(),
      city: filters.city.trim(),
    });
    setCurrentPage(1);
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

  const handlePageChange = (newPage) => setCurrentPage(newPage);

  // Pressing Enter in any filter text box applies the filters
  const handleFilterKeyDown = (e) => {
    if (e.key === "Enter") handleApplyFilters();
  };

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

  const totalPages = calculateTotalPages(totalCount, entriesPerPage);

  // -------------------------------------------------------------------------
  // Row actions
  // -------------------------------------------------------------------------
  const handleDelete = async (userId) => {
    const confirmed = await confirmDelete("appUser");
    if (confirmed) {
      try {
        await deleteAppUser(userId);
        Swal.fire("Deleted!", "User deleted successfully!", "success");

        // Reload so page numbers and totals stay correct. If the last row of
        // a later page was deleted, step back one page.
        if (manageAppUsers.length === 1 && currentPage > 1) {
          setCurrentPage((p) => p - 1);
        } else {
          setRefreshKey((k) => k + 1);
        }
      } catch (error) {
        handleErrors(error);
      }
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setNewPassword("");
    setConfirmPassword("");
    setSelectedUserGuid("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Swal.fire("Error", "Please fill all fields", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire("Error", "Passwords do not match", "error");
      return;
    }

    try {
      setPasswordLoading(true);
      await ChangePassword({
        userGuid: selectedUserGuid,
        newPassword: newPassword,
      });
      Swal.fire("Success", "Password updated successfully", "success");
      closePasswordModal();
    } catch (error) {
      handleErrors(error);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleToggleStatus = async (item) => {
    if (!item.userGuid) {
      console.error("handleToggleStatus: missing userGuid on item", item);
      Swal.fire("Error", "Unable to update status: missing user identifier", "error");
      return;
    }

    const newStatus = !item.status;
    const statusPayload = newStatus ? "Unblock" : "Blocked"; // action verb, not state
    setStatusLoadingId(item.id);

    try {
      await blockUnblockAppUser({
        userGuid: item.userGuid,
        status: statusPayload,
      });

      setManageAppUsers((prev) =>
        prev.map((user) =>
          user.id === item.id ? { ...user, status: newStatus } : user
        )
      );

      Swal.fire(
        "Success",
        `User ${newStatus ? "unblocked" : "blocked"} successfully`,
        "success"
      );
    } catch (error) {
      console.error("handleToggleStatus failed:", error);
      handleErrors(error);
    } finally {
      setStatusLoadingId(null);
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <>
      <style>{`
        .au-filter-panel {
          background: #fff;
          border: 1px solid #e9ebec;
          border-radius: 12px;
          padding: 16px 18px 18px;
          box-shadow: 0 1px 2px rgba(16, 24, 40, .04);
        }
        .au-filter-panel .form-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .5px;
          color: #8a8fa3;
          margin-bottom: 6px;
        }
        /* One height and font size for every control in the bar */
        .au-filter-panel .form-control,
        .au-filter-panel .form-select {
          height: 40px;
          font-size: 14px;
          border-radius: 8px;
        }
        .au-filter-panel .btn {
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
        .au-stat {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px 8px 10px;
          border-radius: 10px;
          background: #fff;
          border: 1px solid #e9ebec;
        }
        .au-stat .au-stat-icon {
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
        .au-stat .au-stat-value { font-size: 17px; font-weight: 700; line-height: 1.1; color: #212529; }
        .au-stat .au-stat-label {
          font-size: 11px;
          font-weight: 500;
          color: #8a8fa3;
          text-transform: uppercase;
          letter-spacing: .4px;
        }
        .au-btn-gold {
          background: linear-gradient(135deg, #f59e0b, #facc15);
          border: none;
          color: #000;
          font-weight: 600;
          border-radius: 8px;
        }
        .au-btn-gold:hover:not(:disabled) { filter: brightness(.95); color: #000; }
        .au-search-wrap { position: relative; }
        .au-search-wrap .form-control { padding-left: 38px; }
        .au-search-wrap .au-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #878a99;
          pointer-events: none;
        }
        .au-badge-active { background: #d1fae5; color: #047857; }
        .au-badge-inactive { background: #fee2e2; color: #b91c1c; }
        .au-status-cell { display: flex; align-items: center; gap: 10px; }
        .au-status-cell .form-switch { margin: 0; min-height: auto; }
      `}</style>

      <ToastContainer />
      {pageAccessDetails.viewAccess ? (
        <div className="row">
          <div className="col-xxl-12">
            <div className="card mt-xxl-n5">
              {/* Header with title + total */}
              <div className="card-header">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div>
                    <h5 className="mb-1">Manage App Users</h5>
                    <p className="text-muted mb-0 fs-13">
                      View, filter and manage registered app users
                    </p>
                  </div>
                  <div className="au-stat">
                    <span className="au-stat-icon"><Users size={16} /></span>
                    <div>
                      <div className="au-stat-value">{totalCount}</div>
                      <div className="au-stat-label">Total</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-body manage-amenity-master-card-body">
                {/* Filter panel */}
                <div className="au-filter-panel mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <Filter size={16} className="text-muted" />
                    <span className="fw-semibold">Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="badge bg-warning-subtle text-warning rounded-pill">
                        {activeFilterCount} applied
                      </span>
                    )}
                  </div>

                  <div className="row g-3 align-items-end">
                    <div className="col-xl-3 col-md-6 col-sm-6">
                      <label className="form-label" htmlFor="au-from-date">
                        From Date
                      </label>
                      <input
                        id="au-from-date"
                        type="date"
                        className="form-control"
                        value={filters.fromDate}
                        max={filters.toDate || undefined}
                        onChange={(e) => handleFilterChange("fromDate", e.target.value)}
                      />
                    </div>

                    <div className="col-xl-3 col-md-6 col-sm-6">
                      <label className="form-label" htmlFor="au-to-date">
                        To Date
                      </label>
                      <input
                        id="au-to-date"
                        type="date"
                        className="form-control"
                        value={filters.toDate}
                        min={filters.fromDate || undefined}
                        onChange={(e) => handleFilterChange("toDate", e.target.value)}
                      />
                    </div>

                    <div className="col-xl-3 col-md-6 col-sm-6">
                      <label className="form-label" htmlFor="au-status">
                        Status
                      </label>
                      <select
                        id="au-status"
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

                    <div className="col-xl-3 col-md-6 col-sm-6">
                      <label className="form-label" htmlFor="search_random_app_user">
                        Search
                      </label>
                      <div className="au-search-wrap">
                        <Search size={16} className="au-search-icon" />
                        <input
                          type="text"
                          placeholder="Name, email or mobile..."
                          className="form-control"
                          value={searchQuery}
                          autoComplete="new-password"
                          name="search_random_app_user"
                          id="search_random_app_user"
                          spellCheck={false}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="col-xl-3 col-md-6 col-sm-6">
                      <label className="form-label" htmlFor="au-state">
                        State
                      </label>
                      <div className="au-search-wrap">
                        <MapPin size={16} className="au-search-icon" />
                        <input
                          id="au-state"
                          type="text"
                          className="form-control"
                          placeholder="Enter state"
                          value={filters.state}
                          autoComplete="off"
                          spellCheck={false}
                          onChange={(e) => handleFilterChange("state", e.target.value)}
                          onKeyDown={handleFilterKeyDown}
                        />
                      </div>
                    </div>

                    <div className="col-xl-3 col-md-6 col-sm-6">
                      <label className="form-label" htmlFor="au-district">
                        District
                      </label>
                      <div className="au-search-wrap">
                        <MapPin size={16} className="au-search-icon" />
                        <input
                          id="au-district"
                          type="text"
                          className="form-control"
                          placeholder="Enter district"
                          value={filters.district}
                          autoComplete="off"
                          spellCheck={false}
                          onChange={(e) => handleFilterChange("district", e.target.value)}
                          onKeyDown={handleFilterKeyDown}
                        />
                      </div>
                    </div>

                    <div className="col-xl-3 col-md-6 col-sm-6">
                      <label className="form-label" htmlFor="au-city">
                        City
                      </label>
                      <div className="au-search-wrap">
                        <MapPin size={16} className="au-search-icon" />
                        <input
                          id="au-city"
                          type="text"
                          className="form-control"
                          placeholder="Enter city"
                          value={filters.city}
                          autoComplete="off"
                          spellCheck={false}
                          onChange={(e) => handleFilterChange("city", e.target.value)}
                          onKeyDown={handleFilterKeyDown}
                        />
                      </div>
                    </div>

                    <div className="col-xl-3 col-md-6">
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn au-btn-gold flex-grow-1"
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
                <div className="pagination-details-responsive justify-content-between align-items-center mb-3">
                  <EntriesDropdown
                    entriesPerPage={entriesPerPage}
                    onEntriesChange={handleEntriesChange}
                    options={[10, 25, 50, 100]}
                  />
                  <span className="text-muted fs-13">
                    {totalCount} user{totalCount === 1 ? "" : "s"} found
                  </span>
                </div>

                {loading ? (
                  <Loading />
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle table-bordered">
                      <TableHeader
                        columns={[
                          "#",
                          "Profile Image",
                          "First Name",
                          "Last Name",
                          "Email Address",
                          "Phone Number",
                          "City",
                          "District",
                          "State",
                          "Change Password",
                          "Status",
                          "Added On",
                          "Action",
                        ]}
                      />
                      <tbody className="manage-property-owner-table-values">
                        {manageAppUsers.length === 0 ? (
                          <TableDataStatusError colspan="13" />
                        ) : (
                          manageAppUsers.map((item, index) => (
                            <TablesRow
                              key={item.id}
                              rowData={{
                                userId: (currentPage - 1) * entriesPerPage + index + 1,
                                profileImage: (
                                  <img
                                    src={
                                      item.proFileImage
                                        ? `https://4.nxtai.dev/${item.proFileImage}`
                                        : allImages.defaultprofile
                                    }
                                    alt="Profile"
                                    className="profile-img"
                                  />
                                ),
                                FirstName: item.firstName,
                                LastName: item.lastName,
                                emailId: item.emailId,
                                MobileNo: item.mobileNo,
                                City: item.city || "-",
                                District: item.district || "-",
                                State: item.state || "-",
                                changePassword: (
                                  <button
                                    type="button"
                                    className="btn btn-sm au-btn-gold d-flex align-items-center gap-1"
                                    style={{ padding: "6px 12px", whiteSpace: "nowrap" }}
                                    onClick={() => {
                                      setSelectedUserGuid(item.userGuid);
                                      setShowPasswordModal(true);
                                    }}
                                  >
                                    <KeyRound size={14} />
                                    Change Password
                                  </button>
                                ),
                                status: (
                                  <div className="au-status-cell">
                                    <div className="form-check form-switch">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        style={{
                                          width: "2.5em",
                                          height: "1.3em",
                                          cursor: "pointer",
                                        }}
                                        checked={!!item.status}
                                        disabled={statusLoadingId === item.id}
                                        onChange={() => handleToggleStatus(item)}
                                      />
                                    </div>
                                    <span
                                      className={`badge rounded-pill ${
                                        item.status ? "au-badge-active" : "au-badge-inactive"
                                      }`}
                                    >
                                      {item.status ? "Active" : "Inactive"}
                                    </span>
                                  </div>
                                ),
                                addedOn: item.createdOn
                                  ? new Date(item.createdOn).toLocaleDateString()
                                  : "-",
                              }}
                              columns={[
                                "userId",
                                "profileImage",
                                "FirstName",
                                "LastName",
                                "emailId",
                                "MobileNo",
                                "City",
                                "District",
                                "State",
                                "changePassword",
                                "status",
                                "addedOn",
                              ]}
                              hideIcons={false}
                              onEdit={() => navigate(`add/${item.id}`)}
                              onDelete={() => handleDelete(item.id)}
                              pageLevelAccessData={pageAccessDetails}
                            />
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
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}

      {/* Change password modal */}
      {showPasswordModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content border-0"
              style={{ borderRadius: "20px", overflow: "hidden" }}
            >
              <div
                className="modal-header border-0"
                style={{ background: "linear-gradient(135deg, #f59e0b, #facc15)" }}
              >
                <h5 className="modal-title fw-bold text-dark">Change Password</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closePasswordModal}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold">New Password</label>
                  <div className="position-relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="form-control pe-5"
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Confirm Password</label>
                  <div className="position-relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control pe-5"
                      placeholder="Confirm password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={closePasswordModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn au-btn-gold"
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};