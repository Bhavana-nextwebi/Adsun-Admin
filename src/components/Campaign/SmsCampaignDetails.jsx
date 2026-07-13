import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getSmsCampaignDetailsById } from "../../services/smsCampaignService";
import { handleErrors } from "../../utils/errorHandler";
import { Loading } from "../Common/OtherElements/Loading";
import TableHeader from "../Common/TableComponent/TableHeader";

const styles = `
.cds-back-btn { border: none; background: transparent; color: #6b7280; font-weight: 600; padding: 0; }
.cds-back-btn:hover { color: #374151; }

.cds-summary-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.75rem; margin: 1.25rem 0; }
@media (max-width: 900px) { .cds-summary-row { grid-template-columns: repeat(2, 1fr); } }

.cds-summary-tile {
  padding: 0.875rem 1rem; border-radius: 0.65rem;
  border: 1px solid #e5e7eb; background: #fff;
  border-top: 3px solid transparent;
}
.cds-summary-tile .cds-summary-label { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #6b7280; }
.cds-summary-tile .cds-summary-value { font-size: 1.35rem; font-weight: 700; line-height: 1.2; margin-top: 0.25rem; }

.cds-summary-tile[data-tone="leads"] { border-top-color: #6366f1; }
.cds-summary-tile[data-tone="sent"] { border-top-color: #10b981; }
.cds-summary-tile[data-tone="failed"] { border-top-color: #ef4444; }
.cds-summary-tile[data-tone="credits"] { border-top-color: #f59e0b; }
.cds-summary-tile[data-tone="status"] { border-top-color: #0ea5e9; }

.cds-filter-row { display: inline-flex; border: 1px solid #e5e7eb; border-radius: 0.65rem; overflow: hidden; margin-bottom: 1rem; }
.cds-filter-btn { border: none; background: #fff; padding: 0.5rem 1.1rem; font-size: 0.83rem; font-weight: 600; color: #6b7280; cursor: pointer; }
.cds-filter-btn + .cds-filter-btn { border-left: 1px solid #e5e7eb; }
.cds-filter-btn.active { background: #111827; color: #fff; }

.cds-message-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.65rem; padding: 0.9rem 1.1rem; font-size: 0.88rem; color: #374151; margin-bottom: 1.25rem; white-space: pre-wrap; }

.cds-table thead th {
  background: #f9fafb; font-size: 0.72rem; text-transform: uppercase;
  letter-spacing: 0.04em; color: #6b7280; border-bottom: 1px solid #e5e7eb;
}
.cds-table tbody td { vertical-align: middle; }

.cds-badge { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.3rem 0.65rem; border-radius: 999px; font-size: 0.72rem; font-weight: 600; }
.cds-badge-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

.cds-empty { text-align: center; padding: 2.5rem 1rem; color: #6b7280; }
`;

// deliveryStatus values from the API are "Deliveried" (backend typo), "Pending", "Failed"
const LEAD_STATUS_META = {
  Sent: { badge: "bg-success-subtle text-success-emphasis", dot: "#10b981" },
  Deliveried: { badge: "bg-success-subtle text-success-emphasis", dot: "#10b981" },
  Failed: { badge: "bg-danger-subtle text-danger-emphasis", dot: "#ef4444" },
  Pending: { badge: "bg-warning-subtle text-warning-emphasis", dot: "#f59e0b" },
};

const LEAD_FILTER_OPTIONS = [
  { label: "All", value: "" },
  { label: "Sent", value: "Sent" },
  { label: "Failed", value: "Failed" },
];

export const SmsCampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leadStatusFilter, setLeadStatusFilter] = useState("");

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await getSmsCampaignDetailsById(id);
      if (response.isSuccess) {
        setCampaign(response.result || null);
      } else {
        setCampaign(null);
      }
    } catch (error) {
      handleErrors(error);
      setCampaign(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const leadDetails = campaign?.leadDetails || [];

  const leadCounts = useMemo(
    () =>
      leadDetails.reduce(
        (acc, lead) => {
          acc[lead.sendStatus] = (acc[lead.sendStatus] || 0) + 1;
          return acc;
        },
        { Sent: 0, Failed: 0 }
      ),
    [leadDetails]
  );

  const filteredLeads = useMemo(() => {
    if (!leadStatusFilter) return leadDetails;
    return leadDetails.filter((lead) => lead.sendStatus === leadStatusFilter);
  }, [leadDetails, leadStatusFilter]);

  if (loading) {
    return (
      <div className="row">
        <style>{styles}</style>
        <div className="col-12">
          <Loading />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="row">
        <style>{styles}</style>
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <button className="cds-back-btn mb-3" onClick={() => navigate(-1)}>
                &larr; Back to campaigns
              </button>
              <div className="cds-empty">SMS campaign not found, or failed to load.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = campaign.campaignName?.trim() || "SMS Campaign";

  const deliveryPct =
    campaign.totalSent > 0
      ? Math.round((campaign.totalDelivered / campaign.totalSent) * 100)
      : 0;

  return (
    <div className="row">
      <style>{styles}</style>
      <div className="col-12">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white">
            <button className="cds-back-btn mb-2" onClick={() => navigate(-1)}>
              &larr; Back to campaigns
            </button>
            <h4 className="mb-0">{displayName}</h4>
            <div className="text-muted" style={{ fontSize: "0.85rem" }}>
              {campaign.sentDate ? `Sent ${new Date(campaign.sentDate).toLocaleString()}` : ""}
            </div>
          </div>

          <div className="card-body">
            <div className="cds-summary-row">
              <div className="cds-summary-tile" data-tone="leads">
                <div className="cds-summary-label">Total Leads</div>
                <div className="cds-summary-value">{campaign.totalLeads}</div>
              </div>
              <div className="cds-summary-tile" data-tone="sent">
                <div className="cds-summary-label">Sent / Delivered</div>
                <div className="cds-summary-value">
                  {campaign.totalSent} <span className="text-muted" style={{ fontSize: "0.9rem" }}>({deliveryPct}%)</span>
                </div>
              </div>
              <div className="cds-summary-tile" data-tone="failed">
                <div className="cds-summary-label">Failed</div>
                <div className="cds-summary-value">{campaign.totalFailed}</div>
              </div>
              <div className="cds-summary-tile" data-tone="credits">
                <div className="cds-summary-label">Credits Used</div>
                <div className="cds-summary-value">{campaign.creditUsed}</div>
              </div>
              {/* <div className="cds-summary-tile" data-tone="status">
                 <div className="cds-summary-label">Status</div>
                <div className="cds-summary-value">
                  {campaign.deliveryStatus === "Deliveried" ? "Delivered" : campaign.deliveryStatus}
                </div> 
              </div> */}
            </div>

            <div className="cds-message-box">{campaign.message}</div>

            {campaign.apiResponse && (
              <div className="text-muted mb-3" style={{ fontSize: "0.82rem" }}>
                <strong>API Response:</strong> {campaign.apiResponse}
              </div>
            )}

            {campaign.failureReason && (
              <div className="alert alert-danger py-2 px-3" style={{ fontSize: "0.85rem" }}>
                <strong>Failure reason:</strong> {campaign.failureReason}
              </div>
            )}

            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
              <h6 className="mb-0">Lead Details</h6>
              <div className="cds-filter-row">
                {LEAD_FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value || "all"}
                    type="button"
                    className={`cds-filter-btn ${leadStatusFilter === opt.value ? "active" : ""}`}
                    onClick={() => setLeadStatusFilter(opt.value)}
                  >
                    {opt.label}
                    {opt.value && ` (${leadCounts[opt.value] || 0})`}
                    {!opt.value && ` (${leadDetails.length})`}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-responsive">
              <table className="cds-table table table-bordered table-hover">
                <TableHeader
                  columns={["#", "Name", "Mobile No", "Rating", "Send Status", "Delivery Status", "Failure Reason"]}
                />
                <tbody>
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="cds-empty">
                          No {leadStatusFilter ? leadStatusFilter.toLowerCase() : ""} leads to show.
                        </div>
                      </td>
                    </tr>   
                  ) : (
                    filteredLeads.map((lead, index) => {
                      const meta = LEAD_STATUS_META[lead.sendStatus] || {
                        badge: "bg-secondary-subtle text-secondary-emphasis",
                        dot: "#9ca3af",
                      };
                      const dMeta = LEAD_STATUS_META[lead.deliveryStatus] || {
                        badge: "bg-secondary-subtle text-secondary-emphasis",
                        dot: "#9ca3af",
                      };

                      return (
                        <tr key={lead.leadId}>
                          <td className="text-muted">{index + 1}</td>
                          <td className="fw-semibold">{lead.title || "-"}</td>
                          <td>{lead.mobileNo}</td>
                          <td>{lead.rating ?? "-"}</td>
                          <td>
                            <span className={`cds-badge ${meta.badge}`}>
                              <span className="cds-badge-dot" style={{ background: meta.dot }} />
                              {lead.sendStatus}
                            </span>
                          </td>
                          {/* <td>
                            <span className={`cds-badge ${dMeta.badge}`}>
                              <span className="cds-badge-dot" style={{ background: dMeta.dot }} />
                              {lead.deliveryStatus === "Deliveried" ? "Delivered" : (lead.deliveryStatus || "-")}
                            </span>
                          </td> */}
                          <td className="text-muted">{lead.failureReason || "-"}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};