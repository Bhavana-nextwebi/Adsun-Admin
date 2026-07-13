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


import { getAllCampaigns } from "../../services/campaignService";
import { handleErrors } from "../../utils/errorHandler";

// Scoped with the .cl- prefix so nothing here leaks into the rest of the app.
const styles = `
.cl-header-title { font-weight: 600; letter-spacing: -0.01em; }
.cl-header-sub { font-size: 0.8125rem; }

.cl-kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 1.25rem; }
@media (max-width: 768px) { .cl-kpi-row { grid-template-columns: repeat(2, 1fr); } }

.cl-kpi-tile {
  display: flex; flex-direction: column; gap: 0.375rem;
  padding: 0.875rem 1rem; border-radius: 0.65rem;
  border: 1px solid var(--bs-border-color, #e5e7eb);
  background: #fff; text-align: left; cursor: pointer;
  border-top: 3px solid transparent;
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
}
.cl-kpi-tile:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08); }
.cl-kpi-tile:focus-visible { outline: 2px solid #6366f1; outline-offset: 2px; }
.cl-kpi-tile .cl-kpi-count { font-size: 1.5rem; font-weight: 700; line-height: 1; }
.cl-kpi-tile .cl-kpi-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #6b7280; }

.cl-kpi-tile[data-tone="all"] { border-top-color: #6366f1; }
.cl-kpi-tile[data-tone="scheduled"] { border-top-color: #f59e0b; }
.cl-kpi-tile[data-tone="sent"] { border-top-color: #10b981; }
.cl-kpi-tile[data-tone="failed"] { border-top-color: #ef4444; }

.cl-kpi-tile.cl-kpi-active { background: #f8f8fd; box-shadow: 0 0 0 1.5px currentColor inset; }
.cl-kpi-tile[data-tone="all"].cl-kpi-active { color: #6366f1; }
.cl-kpi-tile[data-tone="scheduled"].cl-kpi-active { color: #f59e0b; }
.cl-kpi-tile[data-tone="sent"].cl-kpi-active { color: #10b981; }
.cl-kpi-tile[data-tone="failed"].cl-kpi-active { color: #ef4444; }
.cl-kpi-tile.cl-kpi-active .cl-kpi-count,
.cl-kpi-tile.cl-kpi-active .cl-kpi-label { color: inherit; }

.cl-search-wrap { position: relative; }
.cl-search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; }
.cl-search-wrap input { padding-left: 2.35rem; }
.cl-search-clear { position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); }

.cl-table thead th {
  position: sticky; top: 0; z-index: 1; background: #f9fafb;
  font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em;
  color: #6b7280; border-bottom: 1px solid #e5e7eb;
}
.cl-table tbody tr { transition: background-color 0.1s ease; }
.cl-table tbody td { vertical-align: middle; }

.cl-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; color: #fff; flex-shrink: 0;
}
.cl-campaign-cell { display: flex; align-items: center; gap: 0.625rem; }
.cl-campaign-name { font-weight: 600; color: #111827; }
.cl-campaign-sub { font-size: 0.75rem; color: #9ca3af; }

.cl-badge { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.3rem 0.65rem; border-radius: 999px; font-size: 0.72rem; font-weight: 600; }
.cl-badge-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

.cl-delivery { display: flex; align-items: center; gap: 0.5rem; min-width: 92px; }
.cl-delivery-track { flex: 1; height: 5px; border-radius: 999px; background: #eef0f3; overflow: hidden; }
.cl-delivery-fill { height: 100%; border-radius: 999px; background: #10b981; }
.cl-delivery-pct { font-size: 0.72rem; color: #6b7280; min-width: 30px; text-align: right; }

.cl-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 1rem; text-align: center; color: #6b7280; }
.cl-empty-icon { width: 44px; height: 44px; border-radius: 50%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; margin-bottom: 0.75rem; color: #9ca3af; }
.cl-empty-title { font-weight: 600; color: #374151; margin-bottom: 0.15rem; }

.cl-row-new {
  animation: cl-highlight-fade 2.4s ease-out 1;
}
@keyframes cl-highlight-fade {
  0%   { background-color: #FEF3C7; }
  70%  { background-color: #FEF3C7; }
  100% { background-color: transparent; }
}
`;

// Single source of truth for status styling — used by the KPI tiles
// and the table badges so colors never drift apart.
const STATUS_META = {
  Scheduled: { tone: "scheduled", badge: "bg-warning-subtle text-warning-emphasis", dot: "#f59e0b" },
  Sent: { tone: "sent", badge: "bg-success-subtle text-success-emphasis", dot: "#10b981" },
  Failed: { tone: "failed", badge: "bg-danger-subtle text-danger-emphasis", dot: "#ef4444" },
};

const STATUS_OPTIONS = ["Scheduled", "Sent", "Failed"];

const AVATAR_PALETTE = ["#6366f1", "#0ea5e9", "#14b8a6", "#f59e0b", "#ec4899", "#8b5cf6"];

// Deterministic color per campaign type so the same type always gets
// the same avatar color across the table (and across sessions).
const colorForType = (type = "") => {
  let hash = 0;
  for (let i = 0; i < type.length; i++) hash = type.charCodeAt(i) + ((hash << 5) - hash);
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
  <svg className="cl-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const ScheduledCampaignList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Empty by default = "All statuses" — filtering happens client-side
  // against the full dataset, so counts never go stale.
  const [sendStatus, setSendStatus] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Id passed back from CreateCampaign after a successful create/send,
  // used to flag the corresponding row once the list re-loads.
  const [highlightId, setHighlightId] = useState(location.state?.highlightCampaignId ?? null);
  const rowRefs = useRef({});

  const fetchCampaigns = async () => {
    try {
      setLoading(true);

      // Always fetch the full list, unfiltered. Status and search are
      // applied locally so the KPI tile counts stay accurate no matter
      // which filter is active.
      const response = await getAllCampaigns();
  
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

  // Scroll to and briefly highlight the freshly created campaign, then
  // clear the flag so it doesn't re-trigger on refresh/back-nav, and
  // clear the router state so a page refresh doesn't replay it either.
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
        item.campaignType?.toLowerCase().includes(q) ||
        item.templateMessage?.toLowerCase().includes(q)
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
      { Scheduled: 0, Sent: 0, Failed: 0 }
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
              <h4 className="cl-header-title mb-0">Campaigns</h4>
              <div className="cl-header-sub text-muted">
                Track delivery and status across every campaign you've sent.
              </div>
            </div>
          </div>

          <div className="card-body">
            {/* KPI tiles double as the status filter — clicking one filters the table */}
            <div className="cl-kpi-row">
              <button
                type="button"
                data-tone="all"
                className={`cl-kpi-tile ${sendStatus === "" ? "cl-kpi-active" : ""}`}
                onClick={() => selectStatus("")}
              >
                <span className="cl-kpi-label">All</span>
                <span className="cl-kpi-count">{campaigns.length}</span>
              </button>

              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  data-tone={STATUS_META[status].tone}
                  className={`cl-kpi-tile ${sendStatus === status ? "cl-kpi-active" : ""}`}
                  onClick={() => selectStatus(status)}
                >
                  <span className="cl-kpi-label">{status}</span>
                  <span className="cl-kpi-count">{statusCounts[status] || 0}</span>
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
                <div className="cl-search-wrap">
                  <SearchIcon />
                  <input
                    className="form-control"
                    placeholder="Search by campaign, type, or template..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="cl-search-clear btn btn-sm btn-link text-muted text-decoration-none"
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
                <table className="cl-table table table-bordered table-hover">
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
                      "Schedule Date",
                      "Action",
                    ]}
                  />

                  <tbody>
                    {currentData.length === 0 ? (
                      <tr>
                        <td colSpan={10}>
                          <div className="cl-empty">
                            <div className="cl-empty-icon">
                              <SearchIcon />
                            </div>
                            <div className="cl-empty-title">
                              {hasActiveFilters ? "No campaigns match your filters" : "No campaigns yet"}
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
                                "Campaigns you schedule or send will show up here."
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

                        const deliveryPct =
                          item.totalSent > 0
                            ? Math.round((item.totalDelivered / item.totalSent) * 100)
                            : 0;

                        const isHighlighted = highlightId != null && String(item.id) === String(highlightId);

                        return (
                          <tr
                            key={item.id}
                            ref={(el) => { rowRefs.current[item.id] = el; }}
                            className={isHighlighted ? "cl-row-new" : ""}
                          >
                            <td className="text-muted">
                              {(currentPage - 1) * entriesPerPage + index + 1}
                            </td>

                            <td>
                              <div
                                className="cl-campaign-cell"
                                title={item.templateMessage}
                              >
                                <span
                                  className="cl-avatar"
                                  style={{ background: colorForType(item.campaignType) }}
                                >
                                  {initials(item.campaignName)}
                                </span>
                                <div>
                                  <div className="cl-campaign-name">{item.campaignName}</div>
                                  <div className="cl-campaign-sub text-truncate" style={{ maxWidth: 260 }}>
                                    {item.campaignType}
                                    {item.templateMessage ? ` · ${item.templateMessage}` : ""}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td>{item.totalLeads}</td>

                            <td>{item.totalSent}</td>

                            <td>
                              <div className="cl-delivery">
                                <div className="cl-delivery-track">
                                  <div
                                    className="cl-delivery-fill"
                                    style={{ width: `${deliveryPct}%` }}
                                  />
                                </div>
                                <span className="cl-delivery-pct">{deliveryPct}%</span>
                              </div>
                            </td>

                            <td className={item.totalFailed > 0 ? "text-danger fw-medium" : "text-muted"}>
                              {item.totalFailed}
                            </td>

                            <td>{item.creditUsed}</td>

                            <td>
                              <span className={`cl-badge ${meta.badge}`}>
                                <span
                                  className="cl-badge-dot"
                                  style={{ background: meta.dot }}
                                />
                                {item.sendStatus}
                              </span>
                            </td>

                            <td className="text-nowrap text-muted">
                              {item.scheduleDate
                                ? new Date(item.scheduleDate).toLocaleString()
                                : "-"}
                            </td>

                            <td>
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() =>
                                  navigate(`/whatsapp/campaign-details/${item.id}`)
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