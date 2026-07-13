import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getCampaignDetailsById } from "../../services/campaignService";
import { handleErrors } from "../../utils/errorHandler";
import { Loading } from "../Common/OtherElements/Loading";
import TableHeader from "../Common/TableComponent/TableHeader";

// Scoped styles, same pattern as the list page (.cd- prefix here).
const styles = `
.cd-back-btn { border: none; background: transparent; color: #6b7280; font-weight: 600; padding: 0; }
.cd-back-btn:hover { color: #374151; }

.cd-summary-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.75rem; margin: 1.25rem 0; }
@media (max-width: 900px) { .cd-summary-row { grid-template-columns: repeat(2, 1fr); } }

.cd-summary-tile {
  padding: 0.875rem 1rem; border-radius: 0.65rem;
  border: 1px solid #e5e7eb; background: #fff;
  border-top: 3px solid transparent;
}
.cd-summary-tile .cd-summary-label { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #6b7280; }
.cd-summary-tile .cd-summary-value { font-size: 1.35rem; font-weight: 700; line-height: 1.2; margin-top: 0.25rem; }

.cd-summary-tile[data-tone="leads"] { border-top-color: #6366f1; }
.cd-summary-tile[data-tone="sent"] { border-top-color: #10b981; }
.cd-summary-tile[data-tone="failed"] { border-top-color: #ef4444; }
.cd-summary-tile[data-tone="credits"] { border-top-color: #f59e0b; }
.cd-summary-tile[data-tone="status"] { border-top-color: #0ea5e9; }

.cd-filter-row { display: inline-flex; border: 1px solid #e5e7eb; border-radius: 0.65rem; overflow: hidden; margin-bottom: 1rem; }
.cd-filter-btn { border: none; background: #fff; padding: 0.5rem 1.1rem; font-size: 0.83rem; font-weight: 600; color: #6b7280; cursor: pointer; }
.cd-filter-btn + .cd-filter-btn { border-left: 1px solid #e5e7eb; }
.cd-filter-btn.active { background: #111827; color: #fff; }

.cd-table thead th {
  background: #f9fafb; font-size: 0.72rem; text-transform: uppercase;
  letter-spacing: 0.04em; color: #6b7280; border-bottom: 1px solid #e5e7eb;
}
.cd-table tbody td { vertical-align: middle; }

.cd-badge { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.3rem 0.65rem; border-radius: 999px; font-size: 0.72rem; font-weight: 600; }
.cd-badge-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

.cd-empty { text-align: center; padding: 2.5rem 1rem; color: #6b7280; }
`;

const LEAD_STATUS_META = {
  Sent: { badge: "bg-success-subtle text-success-emphasis", dot: "#10b981" },
  Delivered: { badge: "bg-success-subtle text-success-emphasis", dot: "#10b981" },
  Failed: { badge: "bg-danger-subtle text-danger-emphasis", dot: "#ef4444" },
  Pending: { badge: "bg-warning-subtle text-warning-emphasis", dot: "#f59e0b" },
};

const LEAD_FILTER_OPTIONS = [
  { label: "All", value: "" },
  { label: "Sent", value: "Sent" },
  { label: "Failed", value: "Failed" },
];

export const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leadStatusFilter, setLeadStatusFilter] = useState("");

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await getCampaignDetailsById(id);
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
              <button className="cd-back-btn mb-3" onClick={() => navigate(-1)}>
                &larr; Back to campaigns
              </button>
              <div className="cd-empty">Campaign not found, or failed to load.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <button className="cd-back-btn mb-2" onClick={() => navigate(-1)}>
              &larr; Back to campaigns
            </button>
            <h4 className="mb-0">{campaign.campaignName}</h4>
            <div className="text-muted" style={{ fontSize: "0.85rem" }}>
              {campaign.campaignType}
              {campaign.templateMessage ? ` · Template ${campaign.templateMessage}` : ""}
              {campaign.sendDate ? ` · Sent ${new Date(campaign.sendDate).toLocaleString()}` : ""}
            </div>
          </div>

          <div className="card-body">
            <div className="cd-summary-row">
              <div className="cd-summary-tile" data-tone="leads">
                <div className="cd-summary-label">Total Leads</div>
                <div className="cd-summary-value">{campaign.totalLeads}</div>
              </div>
              <div className="cd-summary-tile" data-tone="sent">
                <div className="cd-summary-label">Sent / Delivered</div>
                <div className="cd-summary-value">
                  {campaign.totalSent} <span className="text-muted" style={{ fontSize: "0.9rem" }}>({deliveryPct}%)</span>
                </div>
              </div>
              <div className="cd-summary-tile" data-tone="failed">
                <div className="cd-summary-label">Failed</div>
                <div className="cd-summary-value">{campaign.totalFailed}</div>
              </div>
              <div className="cd-summary-tile" data-tone="credits">
                <div className="cd-summary-label">Credits Used</div>
                <div className="cd-summary-value">{campaign.creditUsed}</div>
              </div>
              <div className="cd-summary-tile" data-tone="status">
                <div className="cd-summary-label">Status</div>
                <div className="cd-summary-value">{campaign.sendStatus}</div>
              </div>
            </div>

            {campaign.failureReason && (
              <div className="alert alert-danger py-2 px-3" style={{ fontSize: "0.85rem" }}>
                <strong>Failure reason:</strong> {campaign.failureReason}
              </div>
            )}

            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
              <h6 className="mb-0">Lead Details</h6>
              <div className="cd-filter-row">
                {LEAD_FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value || "all"}
                    type="button"
                    className={`cd-filter-btn ${leadStatusFilter === opt.value ? "active" : ""}`}
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
              <table className="cd-table table table-bordered table-hover">
                <TableHeader
                  columns={["#", "Name", "Mobile No", "Rating", "Send Status", "Delivery Status", "Failure Reason"]}
                />
                <tbody>
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="cd-empty">
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
                      const deliveryMeta = LEAD_STATUS_META[lead.deliveryStatus] || {
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
                            <span className={`cd-badge ${meta.badge}`}>
                              <span className="cd-badge-dot" style={{ background: meta.dot }} />
                              {lead.sendStatus}
                            </span>
                          </td>
                          <td>
                            <span className={`cd-badge ${deliveryMeta.badge}`}>
                              <span className="cd-badge-dot" style={{ background: deliveryMeta.dot }} />
                              {lead.deliveryStatus || "-"}
                            </span>
                          </td>
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