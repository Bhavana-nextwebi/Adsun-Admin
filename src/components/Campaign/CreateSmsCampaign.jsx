import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { getAreasByCategory } from "../../services/searchLocationsService";
import { fetchAllCategories } from "../../services/categoryService";
import {
  fetchBusinessesByCategoryArea, // GET /api/v1/sms-whatsapp-campaign/GetBusinesses-phone-number?category=&area=
} from "../../services/campaignService";
import { sendSmsCampaign } from "../../services/smsCampaignService";
import { fetchAllSmsTemplates } from "../../services/smsTemplateService";
import { countSmsPlaceholders } from "../../utils/validation";

const BUSINESS_PAGE_SIZE = 100;
const AUTO_SEARCH_DEBOUNCE_MS = 400;

export const normalizeIndianMobile = (raw) => {
  if (!raw) return null;
  const digitsOnly = raw.replace(/\D/g, "");
  if (!digitsOnly) return null;

  if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
    const local = digitsOnly.slice(2);
    return /^[6-9]\d{9}$/.test(local) ? `91${local}` : null;
  }

  const withoutTrunk = digitsOnly.length === 11 && digitsOnly.startsWith("0")
    ? digitsOnly.slice(1)
    : digitsOnly;

  if (withoutTrunk.length !== 10 || !/^[6-9]\d{9}$/.test(withoutTrunk)) {
    return null;
  }
  return `91${withoutTrunk}`;
};

// Formats a Date (or datetime-local string) as "YYYY-MM-DDTHH:mm:ss.sssZ"
// e.g. "2026-07-20T03:14:43.110Z"
const toIsoScheduleString = (dateLike) => {
  if (!dateLike) return null;
  const d = new Date(dateLike);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
};

const StepHeader = ({ step, title, subtitle, done }) => (
  <div className="d-flex align-items-center gap-3 mb-3">
    <span className={`step-badge ${done ? "step-badge-done" : ""}`}>
      {done ? <i className="ri-check-line" /> : step}
    </span>
    <div>
      <div className="step-title">{title}</div>
      {subtitle && <div className="sms-muted small">{subtitle}</div>}
    </div>
  </div>
);

export const CreateSmsCampaign = () => {
  const [campaignName, setCampaignName] = useState("");

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");

  const [locations, setLocations] = useState([]);
  const [areaOptions, setAreaOptions] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [areasLoading, setAreasLoading] = useState(false);

  const [businesses, setBusinesses] = useState([]);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [businessSearched, setBusinessSearched] = useState(false);
  const [selectedPhones, setSelectedPhones] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(BUSINESS_PAGE_SIZE);

  // Business detail table (names, numbers, ratings) is completely hidden
  // by default. Only "View numbers" and "Export to Excel" are visible;
  // the table itself doesn't render at all until the user opts in.
  const [showBusinessDetails, setShowBusinessDetails] = useState(false);

  const [sortField, setSortField] = useState("rating");
  const [sortDir, setSortDir] = useState("desc");

  // --- Manual audience entry (always available, entirely optional) ---
  const [manualNumbersText, setManualNumbersText] = useState("");
  const [manualPhones, setManualPhones] = useState(new Set());

  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [placeholders, setPlaceholders] = useState([]);
  const [message, setMessage] = useState("");

  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const selectedTemplate = templates.find((t) => t.templateId === templateId);

  useEffect(() => {
    const load = async () => {
      setLoadingMeta(true);
      try {
        const catRes = await fetchAllCategories();
        setCategories(catRes?.data?.result || []);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }

      try {
        const tplRes = await fetchAllSmsTemplates();
        setTemplates(tplRes?.data?.result || []);
      } catch (err) {
        console.error("Failed to fetch SMS templates", err);
      } finally {
        setLoadingMeta(false);
      }
    };
    load();
  }, []);

  const handleCategoryChange = (id) => {
    setCategoryId(id);
    const cat = categories.find((c) => String(c.id) === String(id));
    setCategoryName(cat?.categoryName || "");
  };

  useEffect(() => {
    setSelectedArea("");
    setLocations([]);
    setAreaOptions([]);

    if (!categoryName) return;

    let cancelled = false;

    const loadAreas = async () => {
      setAreasLoading(true);
      try {
        const res = await getAreasByCategory(categoryName);
        if (cancelled) return;

        const rows = res?.result || [];
        setLocations(rows);

        const seen = new Set();
        const uniqueAreas = [];
        rows.forEach((row) => {
          const area = row.area?.trim();
          if (area && !seen.has(area)) {
            seen.add(area);
            uniqueAreas.push({
              area,
              state: row.state?.trim() || "",
              city: row.city?.trim() || "",
            });
          }
        });
        setAreaOptions(uniqueAreas);
      } catch (err) {
        console.error("Failed to fetch areas for category", err);
        if (!cancelled) {
          setLocations([]);
          setAreaOptions([]);
        }
      } finally {
        if (!cancelled) setAreasLoading(false);
      }
    };

    loadAreas();

    return () => {
      cancelled = true;
    };
  }, [categoryName]);

  const runBusinessSearch = async (category, area) => {
    setBusinessLoading(true);
    setBusinessSearched(true);
    try {
      const res = await fetchBusinessesByCategoryArea({ category, area });
      const rows = res?.result || [];

      const withPhones = rows
        .map((b) => ({ ...b, normalizedPhone: normalizeIndianMobile(b.phone) }))
        .filter((b) => b.normalizedPhone);

      withPhones.sort((a, b) => (b.rating || 0) - (a.rating || 0));

      setBusinesses(withPhones);
      setSelectedPhones(new Set(withPhones.map((b) => b.normalizedPhone)));
    } catch (err) {
      console.error("Failed to fetch businesses", err);
      Swal.fire("Error", "Failed to fetch businesses for this category/location", "error");
    } finally {
      setBusinessLoading(false);
    }
  };

  useEffect(() => {
    setBusinesses([]);
    setSelectedPhones(new Set());
    setBusinessSearched(false);
    setVisibleCount(BUSINESS_PAGE_SIZE);
    setShowBusinessDetails(false);

    if (!categoryName || !selectedArea) return;

    const timer = setTimeout(() => {
      runBusinessSearch(categoryName, selectedArea);
    }, AUTO_SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, selectedArea]);

  const toggleBusinessPhone = (phone) => {
    setSelectedPhones((prev) => {
      const next = new Set(prev);
      if (next.has(phone)) next.delete(phone);
      else next.add(phone);
      return next;
    });
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "rating" ? "desc" : "asc");
    }
  };

  const filteredBusinesses = useMemo(() => {
    const rows = [...businesses];
    rows.sort((a, b) => {
      let av = a[sortField];
      let bv = b[sortField];
      if (sortField === "rating") {
        av = av || 0;
        bv = bv || 0;
      } else {
        av = (av || "").toString().toLowerCase();
        bv = (bv || "").toString().toLowerCase();
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return rows;
  }, [businesses, sortField, sortDir]);

  const visibleBusinesses = filteredBusinesses.slice(0, visibleCount);
  const hasMoreBusinesses = filteredBusinesses.length > visibleBusinesses.length;

  const toggleSelectAllFiltered = () => {
    const filteredPhones = filteredBusinesses.map((b) => b.normalizedPhone);
    const allFilteredSelected = filteredPhones.every((p) => selectedPhones.has(p));
    setSelectedPhones((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredPhones.forEach((p) => next.delete(p));
      } else {
        filteredPhones.forEach((p) => next.add(p));
      }
      return next;
    });
  };

  const exportBusinessesToExcel = () => {
    if (filteredBusinesses.length === 0) return;

    const rows = filteredBusinesses.map((b) => ({
      Name: b.title || "",
      Phone: b.normalizedPhone || "",
      Rating: b.rating || "",
      Selected: selectedPhones.has(b.normalizedPhone) ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [{ wch: 30 }, { wch: 16 }, { wch: 10 }, { wch: 10 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Businesses");

    const safeCategory = (categoryName || "businesses").replace(/[^\w-]+/g, "_");
    const safeArea = (selectedArea || "all_areas").replace(/[^\w-]+/g, "_");
    XLSX.writeFile(workbook, `${safeCategory}_${safeArea}.xlsx`);
  };

  // --- Manual number parsing/apply ---
  const parseManualNumbers = (text) => {
    const parts = text.split(/[\n,;\s]+/).map((p) => p.trim()).filter(Boolean);
    const valid = new Set();
    const invalid = [];
    parts.forEach((p) => {
      const normalized = normalizeIndianMobile(p);
      if (normalized) valid.add(normalized);
      else invalid.push(p);
    });
    return { valid, invalid };
  };

  const applyManualNumbers = () => {
    if (!manualNumbersText.trim()) {
      setManualPhones(new Set());
      return;
    }
    const { valid, invalid } = parseManualNumbers(manualNumbersText);
    setManualPhones(valid);
    if (invalid.length > 0) {
      Swal.fire(
        "Some numbers skipped",
        `${invalid.length} number(s) were invalid and ignored: ${invalid.slice(0, 10).join(", ")}${invalid.length > 10 ? "..." : ""}`,
        "warning"
      );
    }
  };

  const removeManualPhone = (phone) => {
    setManualPhones((prev) => {
      const next = new Set(prev);
      next.delete(phone);
      return next;
    });
  };

  const getRecipientNumbers = () => [...new Set([...selectedPhones, ...manualPhones])];

  const recipientNumbers = useMemo(
    () => getRecipientNumbers(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedPhones, manualPhones]
  );

  const handleTemplateChange = (id) => {
    setTemplateId(id);
    const tpl = templates.find((t) => t.templateId === id);
    const count = countSmsPlaceholders(tpl?.templateMessage);
    setPlaceholders(Array(count).fill(""));
    setMessage(tpl?.templateMessage || "");
  };

  const updatePlaceholder = (index, value) => {
    setPlaceholders((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  useEffect(() => {
    if (!selectedTemplate) return;
    let idx = 0;
    const rendered = (selectedTemplate.templateMessage || "").replace(/\{#var#\}/g, () => {
      const val = placeholders[idx];
      idx += 1;
      return val && val.trim() ? val : "{#var#}";
    });
    setMessage(rendered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholders, templateId]);

  const getLocationIdForArea = (area) => {
    if (!area) return 0;
    const match = locations.find((row) => row.area === area);
    return match?.id || match?.jioCoOrdinate || 0;
  };

  const resetForm = () => {
    setCampaignName("");
    setCategoryId("");
    setCategoryName("");
    setSelectedArea("");
    setBusinesses([]);
    setSelectedPhones(new Set());
    setBusinessSearched(false);
    setVisibleCount(BUSINESS_PAGE_SIZE);
    setShowBusinessDetails(false);
    setTemplateId("");
    setPlaceholders([]);
    setMessage("");
    setIsScheduled(false);
    setScheduleDate("");
    setManualNumbersText("");
    setManualPhones(new Set());
  };

  const handleSubmit = async () => {
    if (isScheduled && !scheduleDate) {
      Swal.fire("Missing schedule time", "Pick a date and time to schedule this campaign, or turn scheduling off to send now.", "warning");
      return;
    }

    const mobileNumbers = getRecipientNumbers();
    // if (mobileNumbers.length === 0) {
    //   Swal.fire("Error", "Please select or enter at least one recipient", "error");
    //   return;
    // }

    const payload = {
      campaignName: campaignName || "",
      mobileNumbers,
      message: message || "",
      templateId: templateId || "",
      peid: selectedTemplate?.peid || selectedTemplate?.peId || "",
      headerId: selectedTemplate?.headerId || selectedTemplate?.headerid || "",
      // e.g. "2026-07-20T03:14:43.110Z"
      scheduleDate: isScheduled && scheduleDate ? toIsoScheduleString(scheduleDate) : null,
      isScheduled,
      categoryId: categoryId ? Number(categoryId) : null,
      locationId: getLocationIdForArea(selectedArea),
      area: selectedArea,
    };

    try {
      setSubmitting(true);
      await sendSmsCampaign(payload);
      Swal.fire("Success", isScheduled ? "SMS campaign scheduled successfully" : "SMS campaign sent successfully", "success");
      resetForm();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to send SMS campaign", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const recipientCount = recipientNumbers.length;
  const audienceDone = recipientCount > 0;
  const messageDone = Boolean((message || "").trim());

  return (
    <div className="sms-campaign">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

        .sms-campaign {
          --sms-primary: #4A6CF7;
          --sms-primary-dark: #33459B;
          --sms-teal: #0F9D8C;
          --sms-bg: #F5F6FA;
          --sms-border: #E1E4EF;
          --sms-text: #1A1F36;
          --sms-muted: #6B7290;
          --sms-faint: #A4A9C4;
          --sms-accent-soft: #ECEFFE;
          --sms-font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          --sms-font-heading: 'Manrope', 'Inter', -apple-system, sans-serif;
          font-family: var(--sms-font-body);
          color: var(--sms-text);
        }
        .sms-campaign .sms-muted { color: var(--sms-muted) !important; }
        .sms-campaign, .sms-campaign input, .sms-campaign select, .sms-campaign textarea, .sms-campaign button {
          font-family: var(--sms-font-body);
        }
        .sms-campaign .page-title {
          font-family: var(--sms-font-heading);
          font-weight: 800;
          font-size: 1.3rem;
          letter-spacing: -0.01em;
          color: var(--sms-text);
        }
        .sms-campaign .page-subtitle { font-size: 0.85rem; color: var(--sms-muted); }
        .sms-campaign .step-title {
          font-family: var(--sms-font-heading);
          font-weight: 700;
          font-size: 1rem;
          letter-spacing: -0.005em;
          color: var(--sms-text);
        }
        .sms-campaign .form-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--sms-text);
          letter-spacing: 0.01em;
        }
        .sms-campaign small, .sms-campaign .small { font-size: 0.78rem; }
        .sms-campaign .page-shell { background: var(--sms-bg); border-radius: 20px; padding: 1.5rem; }
        .sms-campaign .panel {
          background: #fff;
          border: 1px solid var(--sms-border);
          border-radius: 16px;
          padding: 1.6rem;
        }
        .sms-campaign .step-badge {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid var(--sms-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--sms-font-heading);
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--sms-muted);
        }
        .sms-campaign .step-badge-done {
          background: var(--sms-primary);
          border-color: var(--sms-primary);
          color: #fff;
        }
        .sms-campaign .btn-send {
          background: var(--sms-primary);
          color: #fff;
          border: none;
          font-weight: 700;
          letter-spacing: 0.01em;
          transition: background .15s ease;
        }
        .sms-campaign .btn-send:hover:not(:disabled) { background: var(--sms-primary-dark); color: #fff; }
        .sms-campaign .btn-outline-secondary {
          font-weight: 600;
          color: var(--sms-muted);
          border-color: var(--sms-border);
        }
        .sms-campaign .btn-outline-secondary:hover {
          background: var(--sms-bg);
          color: var(--sms-text);
          border-color: var(--sms-border);
        }
        .sms-campaign .chip {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: var(--sms-bg);
          border: 1px solid var(--sms-border);
          color: var(--sms-muted);
          font-weight: 600;
          font-size: 0.72rem;
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
        }
        .sms-campaign .form-control:disabled, .sms-campaign .form-select:disabled {
          background: var(--sms-bg);
          color: var(--sms-muted);
          border-color: var(--sms-border);
        }
        .sms-campaign .biz-table-wrap {
          max-height: 420px;
          overflow: auto;
          border: 1px solid var(--sms-border);
          border-radius: 12px;
        }
        .sms-campaign .biz-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
        .sms-campaign .biz-table thead th {
          position: sticky;
          top: 0;
          background: var(--sms-bg);
          text-align: left;
          padding: 0.55rem 0.7rem;
          font-weight: 700;
          font-family: var(--sms-font-heading);
          color: var(--sms-primary-dark);
          border-bottom: 1px solid var(--sms-border);
          cursor: pointer;
          white-space: nowrap;
          user-select: none;
        }
        .sms-campaign .biz-table thead th:hover { background: var(--sms-accent-soft); }
        .sms-campaign .biz-table thead th.checkbox-col { cursor: default; width: 40px; }
        .sms-campaign .biz-table thead th.checkbox-col:hover { background: #fff; }
        .sms-campaign .biz-table tbody td {
          padding: 0.5rem 0.7rem;
          border-bottom: 1px solid var(--sms-border);
          vertical-align: top;
        }
        .sms-campaign .biz-table tbody tr:last-child td { border-bottom: none; }
        .sms-campaign .biz-table tbody tr { cursor: pointer; }
        .sms-campaign .biz-table tbody tr:hover { background: var(--sms-accent-soft); }
        .sms-campaign .biz-table tbody tr.row-selected { background: #F1F3FE; }
        .sms-campaign .biz-table tbody tr.row-selected:hover { background: var(--sms-accent-soft); }
        .sms-campaign .biz-table input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--sms-primary); }
        .sms-campaign .sort-arrow { font-size: 0.7rem; margin-left: 0.2rem; opacity: 0.6; }
        .sms-campaign .biz-title { font-weight: 700; font-size: 0.85rem; }
        .sms-campaign .show-more-row { text-align: center; padding: 0.6rem; background: var(--sms-bg); }
        .sms-campaign .placeholder-slot {
          border: 1px solid var(--sms-border);
          border-radius: 10px;
          padding: 0.5rem 0.75rem;
        }
        .sms-campaign .placeholder-slot label {
          font-size: 0.68rem;
          font-weight: 700;
          font-family: var(--sms-font-heading);
          color: var(--sms-primary-dark);
          margin-bottom: 0.15rem;
        }
        .sms-campaign .char-meter {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.35rem;
        }
        .sms-campaign .char-meter .segments {
          display: flex;
          gap: 3px;
        }
        .sms-campaign .char-meter .segment {
          width: 18px;
          height: 4px;
          border-radius: 2px;
          background: var(--sms-border);
        }
        .sms-campaign .char-meter .segment.filled { background: var(--sms-primary); }
        .sms-campaign .hidden-audience-card {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 0.5rem;
          text-align: center;
          padding: 2rem 1rem;
          background: var(--sms-bg);
          border: 1px dashed var(--sms-border);
          border-radius: 12px;
        }
        .sms-campaign .hidden-audience-card i {
          font-size: 1.5rem;
          color: var(--sms-faint);
        }
        .sms-campaign .segmented {
          display: inline-flex;
          border: 1px solid var(--sms-border);
          border-radius: 10px;
          overflow: hidden;
        }
        .sms-campaign .segmented button {
          border: none;
          background: #fff;
          padding: 0.5rem 1rem;
          font-size: 0.83rem;
          font-weight: 600;
          color: var(--sms-muted);
          cursor: pointer;
        }
        .sms-campaign .segmented button.active {
          background: var(--sms-primary);
          color: #fff;
        }
        .sms-campaign .recipients-list {
          max-height: 220px;
          overflow-y: auto;
          border: 1px solid var(--sms-border);
          border-radius: 12px;
          background: var(--sms-bg);
        }
        .sms-campaign .recipient-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          padding: 0.5rem 0.85rem;
          border-bottom: 1px solid var(--sms-border);
          background: #fff;
        }
        .sms-campaign .recipient-row:last-child { border-bottom: none; }
        .sms-campaign .recipient-remove {
          border: none;
          background: transparent;
          color: var(--sms-muted);
          width: 24px;
          height: 24px;
          flex-shrink: 0;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .sms-campaign .recipient-remove:hover {
          background: #FDECEC;
          color: #D64545;
        }
        .sms-campaign .phone-frame {
          background: #111;
          border-radius: 32px;
          padding: 10px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.18);
        }
        .sms-campaign .phone-screen {
          background: linear-gradient(180deg, #EEF1FB 0%, var(--sms-accent-soft) 100%);
          border-radius: 24px;
          overflow: hidden;
          min-height: 380px;
          display: flex;
          flex-direction: column;
        }
        .sms-campaign .phone-statusbar {
          display: flex;
          justify-content: space-between;
          padding: 0.4rem 1rem 0.1rem;
          font-size: 0.65rem;
          font-weight: 600;
          color: rgba(0,0,0,0.55);
        }
        .sms-campaign .phone-header {
          background: var(--sms-primary);
          color: #fff;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.6rem 0.9rem;
        }
        .sms-campaign .phone-header .name { font-family: var(--sms-font-heading); font-weight: 700; font-size: 0.85rem; }
        .sms-campaign .phone-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 0.8rem;
        }
        .sms-campaign .chat-area { flex: 1; padding: 1rem 0.75rem; }
        .sms-campaign .bubble {
          background: #fff;
          border-radius: 10px;
          padding: 0.65rem 0.75rem;
          max-width: 92%;
          font-size: 0.85rem;
          line-height: 1.5;
          box-shadow: 0 1px 1px rgba(0,0,0,0.08);
        }
        .sms-campaign .summary-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .sms-campaign .summary-count {
          font-family: var(--sms-font-heading);
          font-weight: 800;
          font-size: 1.05rem;
          color: var(--sms-primary-dark);
        }
        .sms-campaign .schedule-toggle-group {
          display: inline-flex;
          border: 1px solid var(--sms-border);
          border-radius: 10px;
          overflow: hidden;
        }
        .sms-campaign .schedule-toggle-btn {
          border: none;
          background: #fff;
          color: var(--sms-muted);
          font-weight: 600;
          font-size: 0.8rem;
          padding: 0.45rem 0.9rem;
          cursor: pointer;
        }
        .sms-campaign .schedule-toggle-btn.active {
          background: var(--sms-primary);
          color: #fff;
        }
      `}</style>

      <div className="page-shell">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 px-1">
          <div>
            <h5 className="page-title mb-0">Create SMS Campaign</h5>
            <div className="page-subtitle">Send a templated SMS blast to a filtered audience</div>
          </div>
          <span
            className="badge d-inline-flex align-items-center gap-1 px-3 py-2"
            style={{ background: "var(--sms-accent-soft)", color: "var(--sms-primary-dark)", fontWeight: 700 }}
          >
            <i className="ri-message-2-line" /> SMS
          </span>
        </div>

        <div className="row g-3">
          <div className="col-xxl-8 col-lg-7 d-flex flex-column gap-3">
            <div className="panel">
              <StepHeader
                step={1}
                title="Campaign details & audience"
                subtitle="Businesses matching your category and location load automatically. You can also add specific numbers manually — entirely optional."
                done={audienceDone}
              />
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Campaign name</label>
                  <input
                    className="form-control"
                    placeholder="e.g. July Diwali Offer"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Campaign type</label>
                  <input className="form-control" value="SMS" readOnly disabled />
                </div>
              </div>

              <div className="mt-3">
                <label className="form-label">Manual phone numbers (optional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Enter numbers separated by comma, space, or new line e.g. 9876543210, 9123456789"
                  value={manualNumbersText}
                  onChange={(e) => setManualNumbersText(e.target.value)}
                />
                <div className="d-flex align-items-center gap-2 mt-2 flex-wrap">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={applyManualNumbers}
                  >
                    <i className="ri-check-line me-1" />
                    Validate & apply
                  </button>
                  {manualPhones.size > 0 && (
                    <span className="sms-muted small">
                      {manualPhones.size} valid number{manualPhones.size !== 1 ? "s" : ""} added
                    </span>
                  )}
                </div>

                {manualPhones.size > 0 && (
                  <div className="recipients-list mt-2">
                    {[...manualPhones].map((phone) => (
                      <div className="recipient-row" key={phone}>
                        <span>{phone}</span>
                        <button
                          type="button"
                          className="recipient-remove"
                          onClick={() => removeManualPhone(phone)}
                          title="Remove"
                        >
                          <i className="ri-close-line" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="row g-3 mt-1">
                <div className="col-md-6">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={categoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.categoryName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Location</label>
                  <select
                    className="form-select"
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    disabled={!categoryId || areasLoading}
                  >
                    <option value="">
                      {!categoryId
                        ? "Select a category first"
                        : areasLoading
                        ? "Loading areas..."
                        : "All locations"}
                    </option>
                    {areaOptions.map((opt) => (
                      <option key={opt.area} value={opt.area}>
                        {[opt.state, opt.city, opt.area].filter(Boolean).join(", ")}
                      </option>
                    ))}
                  </select>
                  {categoryId && !areasLoading && areaOptions.length === 0 && (
                    <small className="sms-muted fst-italic d-block mt-1">
                      No areas found for this category.
                    </small>
                  )}
                </div>
              </div>

              {(!categoryId || !selectedArea) && (
                <div className="sms-muted small fst-italic mt-3">
                  Select a category and a location to load matching businesses.
                </div>
              )}

              {businessLoading && (
                <div className="sms-muted small fst-italic mt-3">
                  <i className="ri-loader-4-line me-1" />
                  Searching businesses...
                </div>
              )}

              {businessSearched && !businessLoading && businesses.length === 0 && (
                <div className="sms-muted small fst-italic mt-3">
                  No businesses with a valid phone number found for this category/location.
                </div>
              )}

              {businesses.length > 0 && !businessLoading && (
                <div className="mt-3">
                  <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                    <label className="form-label mb-0">Matching businesses</label>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="sms-muted small">
                        {selectedPhones.size} of {businesses.length} selected
                      </span>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setShowBusinessDetails((v) => !v)}
                      >
                        <i className={`ri-${showBusinessDetails ? "eye-off-line" : "eye-line"} me-1`} />
                        {showBusinessDetails ? "Hide numbers" : "View numbers"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={exportBusinessesToExcel}
                      >
                        <i className="ri-file-excel-2-line me-1" />
                        Export to Excel
                      </button>
                    </div>
                  </div>

                  {showBusinessDetails ? (
                    <div className="biz-table-wrap">
                      <table className="biz-table">
                        <thead>
                          <tr>
                            <th className="checkbox-col">
                              <input
                                type="checkbox"
                                checked={
                                  filteredBusinesses.length > 0 &&
                                  filteredBusinesses.every((b) => selectedPhones.has(b.normalizedPhone))
                                }
                                onChange={toggleSelectAllFiltered}
                              />
                            </th>
                            <th onClick={() => toggleSort("title")}>
                              Name
                              {sortField === "title" && (
                                <span className="sort-arrow">{sortDir === "asc" ? "▲" : "▼"}</span>
                              )}
                            </th>
                            <th onClick={() => toggleSort("normalizedPhone")}>
                              Phone
                              {sortField === "normalizedPhone" && (
                                <span className="sort-arrow">{sortDir === "asc" ? "▲" : "▼"}</span>
                              )}
                            </th>
                            <th onClick={() => toggleSort("rating")}>
                              Rating
                              {sortField === "rating" && (
                                <span className="sort-arrow">{sortDir === "asc" ? "▲" : "▼"}</span>
                              )}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleBusinesses.map((b) => (
                            <tr
                              key={b.normalizedPhone}
                              onClick={() => toggleBusinessPhone(b.normalizedPhone)}
                              className={selectedPhones.has(b.normalizedPhone) ? "row-selected" : ""}
                            >
                              <td onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={selectedPhones.has(b.normalizedPhone)}
                                  onChange={() => toggleBusinessPhone(b.normalizedPhone)}
                                />
                              </td>
                              <td className="fw-semibold">{b.title}</td>
                              <td className="sms-muted">{b.normalizedPhone}</td>
                              <td className="sms-muted">
                                {b.rating ? (
                                  <>
                                    <i className="ri-star-fill me-1" style={{ color: "#F5A623" }} />
                                    {b.rating}
                                  </>
                                ) : (
                                  "—"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {hasMoreBusinesses && (
                        <div className="show-more-row">
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => setVisibleCount((c) => c + BUSINESS_PAGE_SIZE)}
                          >
                            Show more ({filteredBusinesses.length - visibleBusinesses.length} remaining)
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="hidden-audience-card">
                      <i className="ri-shield-keyhole-line" />
                      <span className="sms-muted small">
                        Business names and numbers are hidden. Click <strong>"View numbers"</strong> to review and select recipients.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="panel">
              <StepHeader
                step={2}
                title="Message"
                subtitle="Pick a template to prefill the message, or write your own below"
                done={messageDone}
              />

              <div className="mb-3">
                <label className="form-label">Template</label>
                <select
                  className="form-select"
                  value={templateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  disabled={loadingMeta}
                >
                  <option value="">No template — write a custom message</option>
                  {templates.map((tpl) => (
                    <option key={tpl.templateId} value={tpl.templateId}>
                      {tpl.templateName}
                    </option>
                  ))}
                </select>
                {templates.length === 0 && !loadingMeta && (
                  <small className="sms-muted fst-italic d-block mt-1">
                    No SMS templates available yet.
                  </small>
                )}
              </div>

              {selectedTemplate?.templateType && (
                <div className="mb-3">
                  <span className="chip">{selectedTemplate.templateType}</span>
                </div>
              )}

              {placeholders.length > 0 && (
                <div className="mb-3">
                  <label className="form-label">Template variables (in order)</label>
                  <div className="d-flex flex-wrap gap-2">
                    {placeholders.map((val, idx) => (
                      <div className="placeholder-slot" key={idx} style={{ minWidth: 180 }}>
                        <label className="d-block">{`Var ${idx + 1}`}</label>
                        <input
                          className="form-control form-control-sm border-0 p-0"
                          placeholder="Value"
                          value={val}
                          onChange={(e) => updatePlaceholder(idx, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="form-label">Message</label>
                <textarea
                  className="form-control"
                  rows={5}
                  maxLength={1024}
                  placeholder="Hi there, we have an update for you..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="char-meter">
                  <div className="segments">
                    {Array.from({ length: 10 }).map((_, i) => {
                      const filled = (message?.length || 0) / 102.4 > i;
                      return <span key={i} className={`segment ${filled ? "filled" : ""}`} />;
                    })}
                  </div>
                  <small className="sms-muted">
                    {1024 - (message?.length || 0)} chars left
                  </small>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div>
                  <label className="form-label mb-1">Delivery</label>
                  <div className="schedule-toggle-group">
                    <button
                      type="button"
                      className={`schedule-toggle-btn ${!isScheduled ? "active" : ""}`}
                      onClick={() => setIsScheduled(false)}
                    >
                      <i className="ri-send-plane-line me-1" />
                      Send now
                    </button>
                    <button
                      type="button"
                      className={`schedule-toggle-btn ${isScheduled ? "active" : ""}`}
                      onClick={() => setIsScheduled(true)}
                    >
                      <i className="ri-calendar-schedule-line me-1" />
                      Schedule
                    </button>
                  </div>
                </div>
                {isScheduled && (
                  <div>
                    <label className="form-label">Send at</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={scheduleDate}
                      min={new Date().toISOString().slice(0, 16)}
                      onChange={(e) => setScheduleDate(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="summary-strip">
                <div>
                  <span className="summary-count">{recipientCount}</span>{" "}
                  <span className="sms-muted small">
                    recipient{recipientCount !== 1 ? "s" : ""} selected
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-send px-4"
                  disabled={submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? (
                    isScheduled ? "Scheduling..." : "Sending..."
                  ) : isScheduled ? (
                    <>
                      <i className="ri-calendar-schedule-line me-1" /> Schedule ({recipientCount})
                    </>
                  ) : (
                    <>
                      <i className="ri-send-plane-fill me-1" /> Send now ({recipientCount})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="col-xxl-4 col-lg-5">
            <div className="panel" style={{ position: "sticky", top: 16 }}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <small
                  className="text-uppercase fw-bold sms-muted"
                  style={{ fontSize: "0.72rem", letterSpacing: ".06em" }}
                >
                  Live preview
                </small>
                {selectedTemplate?.templateType && (
                  <span className="chip">{selectedTemplate.templateType}</span>
                )}
              </div>

              <div className="phone-frame">
                <div className="phone-screen">
                  <div className="phone-statusbar">
                    <span>9:41</span>
                    <span>
                      <i className="ri-signal-wifi-line me-1" />
                      <i className="ri-battery-2-line" />
                    </span>
                  </div>
                  <div className="phone-header">
                    <div className="phone-avatar">
                      <i className="ri-message-2-line" />
                    </div>
                    <div>
                      <div className="name">SMS</div>
                      <div style={{ fontSize: "0.65rem", opacity: 0.8 }}>Text message</div>
                    </div>
                  </div>

                  <div className="chat-area">
                    <div className="bubble">
                      <div style={{ whiteSpace: "pre-wrap" }}>
                        {message || (
                          <span className="sms-muted fst-italic">
                            Your message will appear here
                          </span>
                        )}
                      </div>
                      <div className="text-end sms-muted mt-1" style={{ fontSize: "0.65rem" }}>
                        {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <small className="sms-muted d-block mt-3">
                Audience comes from the selected category/location, manual entry, or both. The business list stays
                hidden until you choose to view it. {isScheduled ? "This campaign will send at the scheduled time." : "This campaign sends immediately."}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};