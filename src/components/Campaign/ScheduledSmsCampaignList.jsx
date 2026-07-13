import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  paginateData,
  calculateTotalPages,
} from "../../assets/js/script";

import TableHeader from "../Common/TableComponent/TableHeader";
import EntriesDropdown from "../Common/TableComponent/EntriesDropdown";
import { Pagination } from "../Common/TableComponent/Pagination";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";

import { getAllSmsCampaigns } from "../../services/smsCampaignService";
import { handleErrors } from "../../utils/errorHandler";

const styles = `
.cls-header-title { font-weight: 600; letter-spacing: -0.01em; }
.cls-header-sub { font-size: 0.8125rem; }

.cls-kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 1.25rem; }
@media (max-width: 768px) { .cls-kpi-row { grid-template-columns: repeat(2, 1fr); } }

.cls-kpi-tile {
  display: flex; flex-direction: column; gap: 0.375rem;
  padding: 0.875rem 1rem; border-radius: 0.65rem;
  border: 1px solid var(--bs-border-color, #e5e7eb);
  background: #fff; text-align: left; cursor: pointer;
  border-top: 3px solid transparent;
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
}
.cls-kpi-tile:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08); }
.cls-kpi-tile:focus-visible { outline: 2px solid #6366f1; outline-offset: 2px; }
.cls-kpi-tile .cls-kpi-count { font-size: 1.5rem; font-weight: 700; line-height: 1; }
.cls-kpi-tile .cls-kpi-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #6b7280; }

.cls-kpi-tile[data-tone="all"] { border-top-color: #6366f1; }
.cls-kpi-tile[data-tone="sent"] { border-top-color: #10b981; }
.cls-kpi-tile[data-tone="pending"] { border-top-color: #f59e0b; }
.cls-kpi-tile[data-tone="failed"] { border-top-color: #ef4444; }

.cls-kpi-tile.cls-kpi-active { background: #f8f8fd; box-shadow: 0 0 0 1.5px currentColor inset; }
.cls-kpi-tile[data-tone="all"].cls-kpi-active { color: #6366f1; }
.cls-kpi-tile[data-tone="sent"].cls-kpi-active { color: #10b981; }
.cls-kpi-tile[data-tone="pending"].cls-kpi-active { color: #f59e0b; }
.cls-kpi-tile[data-tone="failed"].cls-kpi-active { color: #ef4444; }
.cls-kpi-tile.cls-kpi-active .cls-kpi-count,
.cls-kpi-tile.cls-kpi-active .cls-kpi-label { color: inherit; }

.cls-search-wrap { position: relative; }
.cls-search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; }
.cls-search-wrap input { padding-left: 2.35rem; }
.cls-search-clear { position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); }

.cls-table thead th {
  position: sticky; top: 0; z-index: 1; background: #f9fafb;
  font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em;
  color: #6b7280; border-bottom: 1px solid #e5e7eb;
}
.cls-table tbody tr { transition: background-color 0.1s ease; }
.cls-table tbody td { vertical-align: middle; }

.cls-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; color: #fff; flex-shrink: 0;
}
.cls-campaign-cell { display: flex; align-items: center; gap: 0.625rem; }
.cls-campaign-name { font-weight: 600; color: #111827; }
.cls-campaign-sub { font-size: 0.75rem; color: #9ca3af; }

.cls-badge { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.3rem 0.65rem; border-radius: 999px; font-size: 0.72rem; font-weight: 600; }
.cls-badge-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

.cls-delivery { display: flex; align-items: center; gap: 0.5rem; min-width: 92px; }
.cls-delivery-track { flex: 1; height: 5px; border-radius: 999px; background: #eef0f3; overflow: hidden; }
.cls-delivery-fill { height: 100%; border-radius: 999px; background: #10b981; }
.cls-delivery-pct { font-size: 0.72rem; color: #6b7280; min-width: 30px; text-align: right; }

.cls-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 1rem; text-align: center; color: #6b7280; }
.cls-empty-icon { width: 44px; height: 44px; border-radius: 50%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; margin-bottom: 0.75rem; color: #9ca3af; }
.cls-empty-title { font-weight: 600; color: #374151; margin-bottom: 0.15rem; }

.cls-row-new {
  animation: cls-highlight-fade 2.4s ease-out 1;
}
@keyframes cls-highlight-fade {
  0%   { background-color: #FEF3C7; }
  70%  { background-color: #FEF3C7; }
  100% { background-color: transparent; }
}
`;

// Now keyed off sendStatus (normal spelling — no "Deliveried" typo here,
// that quirk only lives on deliveryStatus).
const STATUS_META = {
  Sent: { tone: "sent", badge: "bg-success-subtle text-success-emphasis", dot: "#10b981" },
  Scheduled: { tone: "scheduled", badge: "bg-info-subtle text-info-emphasis", dot: "#3b82f6" },
  Failed: { tone: "failed", badge: "bg-danger-subtle text-danger-emphasis", dot: "#ef4444" },
};

const STATUS_OPTIONS = ["Sent", "Scheduled", "Failed"];

const AVATAR_PALETTE = ["#6366f1", "#0ea5e9", "#14b8a6", "#f59e0b", "#ec4899", "#8b5cf6"];

// Deterministic color per campaign name so the same campaign always gets
// the same avatar color across the table (and across sessions).
const colorForName = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "?";

const SearchIcon = () => (
  <svg className="cls-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const ScheduledSmsCampaignList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sendStatus, setSendStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [highlightId, setHighlightId] = useState(location.state?.highlightCampaignId ?? null);
  const rowRefs = useRef({});

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await getAllSmsCampaigns();

      if (response.isSuccess) {
        setCampaigns(response.result || []);
      } else {
        setCampaigns([]);
      }
    } catch (error) {
      handleErrors(error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (!highlightId || loading) return;

    const node = rowRefs.current[highlightId];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    const timer = setTimeout(() => {
      setHighlightId(null);
      navigate(location.pathname, { replace: true, state: {} });
    }, 2600);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightId, loading]);

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return campaigns.filter((item) => {
      const matchesStatus = !sendStatus || item.sendStatus === sendStatus;
      if (!matchesStatus) return false;

      if (!q) return true;
      return (
        item.campaignName?.toLowerCase().includes(q) ||
        item.message?.toLowerCase().includes(q) ||
        item.mobileNo?.toLowerCase().includes(q)
      );
    });
  }, [campaigns, sendStatus, searchQuery]);

  const currentData = paginateData(filteredData, currentPage, entriesPerPage);
  const totalPages = calculateTotalPages(filteredData.length, entriesPerPage);

  const statusCounts = useMemo(() => {
    return campaigns.reduce(
      (acc, item) => {
        acc[item.sendStatus] = (acc[item.sendStatus] || 0) + 1;
        return acc;
      },
      { Sent: 0, Scheduled: 0, Failed: 0 }
    );
  }, [campaigns]);

  const hasActiveFilters = sendStatus !== "" || searchQuery.trim() !== "";

  const clearFilters = () => {
    setSendStatus("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const selectStatus = (status) => {
    setSendStatus(status);
    setCurrentPage(1);
  };

  return (
    <div className="row">
      <style>{styles}</style>
      <div className="col-12">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white d-flex align-items-center justify-content-between">
            <div>
              <h4 className="cls-header-title mb-0">SMS Campaigns</h4>
              <div className="cls-header-sub text-muted">
                Track delivery and status across every SMS campaign you've sent.
              </div>
            </div>
          </div>

          <div className="card-body">
            <div className="cls-kpi-row">
              <button
                type="button"
                data-tone="all"
                className={`cls-kpi-tile ${sendStatus === "" ? "cls-kpi-active" : ""}`}
                onClick={() => selectStatus("")}
              >
                <span className="cls-kpi-label">All</span>
                <span className="cls-kpi-count">{campaigns.length}</span>
              </button>

              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  data-tone={STATUS_META[status].tone}
                  className={`cls-kpi-tile ${sendStatus === status ? "cls-kpi-active" : ""}`}
                  onClick={() => selectStatus(status)}
                >
                  <span className="cls-kpi-label">{status}</span>
                  <span className="cls-kpi-count">{statusCounts[status] || 0}</span>
                </button>
              ))}
            </div>

            <div className="row mb-3 g-2 align-items-center">
              <div className="col-md-3">
                <EntriesDropdown
                  entriesPerPage={entriesPerPage}
                  onEntriesChange={(value) => {
                    setEntriesPerPage(value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="col-md-6 ms-auto">
                <div className="cls-search-wrap">
                  <SearchIcon />
                  <input
                    className="form-control"
                    placeholder="Search by campaign name or message..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="cls-search-clear btn btn-sm btn-link text-muted text-decoration-none"
                      onClick={() => {
                        setSearchQuery("");
                        setCurrentPage(1);
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mb-3">
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none ps-0"
                  onClick={clearFilters}
                >
                  Clear all filters
                </button>
              </div>
            )}

            {loading ? (
              <Loading />
            ) : (
              <div className="table-responsive">
                <table className="cls-table table table-bordered table-hover">
                  <TableHeader
                    columns={[
                      "#",
                      "Campaign",
                      "Leads",
                      "Sent",
                      "Delivery Rate",
                      "Failed",
                      "Credits",
                      "Status",
                      "Sent Date",
                      "Action",
                    ]}
                  />

                  <tbody>
                    {currentData.length === 0 ? (
                      <tr>
                        <td colSpan={10}>
                          <div className="cls-empty">
                            <div className="cls-empty-icon">
                              <SearchIcon />
                            </div>
                            <div className="cls-empty-title">
                              {hasActiveFilters ? "No SMS campaigns match your filters" : "No SMS campaigns yet"}
                            </div>
                            <div>
                              {hasActiveFilters ? (
                                <>
                                  Try a different search term or{" "}
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-link p-0 align-baseline"
                                    onClick={clearFilters}
                                  >
                                    clear your filters
                                  </button>
                                  .
                                </>
                              ) : (
                                "SMS campaigns you schedule or send will show up here."
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentData.map((item, index) => {
                        const meta = STATUS_META[item.sendStatus] || {
                          badge: "bg-secondary-subtle text-secondary-emphasis",
                          dot: "#9ca3af",
                        };

                        const displayName = item.campaignName?.trim() || "SMS Campaign";

                        const deliveryPct =
                          item.totalSent > 0
                            ? Math.round((item.totalDelivered / item.totalSent) * 100)
                            : 0;

                        const isHighlighted = highlightId != null && String(item.id) === String(highlightId);

                        return (
                          <tr
                            key={item.id}
                            ref={(el) => { rowRefs.current[item.id] = el; }}
                            className={isHighlighted ? "cls-row-new" : ""}
                          >
                            <td className="text-muted">
                              {(currentPage - 1) * entriesPerPage + index + 1}
                            </td>

                            <td>
                              <div className="cls-campaign-cell" title={item.message}>
                                <span
                                  className="cls-avatar"
                                  style={{ background: colorForName(displayName) }}
                                >
                                  {initials(displayName)}
                                </span>
                                <div>
                                  <div className="cls-campaign-name">{displayName}</div>
                                  <div className="cls-campaign-sub text-truncate" style={{ maxWidth: 260 }}>
                                    {item.message}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td>{item.totalLeads}</td>

                            <td>{item.totalSent}</td>

                            <td>
                              <div className="cls-delivery">
                                <div className="cls-delivery-track">
                                  <div
                                    className="cls-delivery-fill"
                                    style={{ width: `${deliveryPct}%` }}
                                  />
                                </div>
                                <span className="cls-delivery-pct">{deliveryPct}%</span>
                              </div>
                            </td>

                            <td className={item.totalFailed > 0 ? "text-danger fw-medium" : "text-muted"}>
                              {item.totalFailed}
                            </td>

                            <td>{item.creditUsed}</td>

                            <td>
                              <span className={`cls-badge ${meta.badge}`}>
                                <span
                                  className="cls-badge-dot"
                                  style={{ background: meta.dot }}
                                />
                                {item.sendStatus}
                              </span>
                            </td>

                            <td className="text-nowrap text-muted">
                              {item.sentDate
                                ? new Date(item.sentDate).toLocaleString()
                                : "-"}
                            </td>

                            <td>
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() =>
                                  navigate(`/sms/campaign-details/${item.id}`)
                                }
                              >
                                View
                              </button>
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
              totalEntries={filteredData.length}
              entriesPerPage={entriesPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};