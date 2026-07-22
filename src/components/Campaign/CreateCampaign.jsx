import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { getAreasByCategory } from "../../services/searchLocationsService";
import { fetchAllCategories } from "../../services/categoryService";
import {
  createSendCampaign,
  fetchBusinessesByCategoryArea,
} from "../../services/campaignService";
import { fetchAllWhatsappTemplates } from "../../services/whatsappTemplateService";

const MEDIA_HEADER_TYPES = ["Image", "Video", "Document"];

const HEADER_ATTACHMENT_META = {
  Image: { label: "Image URL", placeholder: "https://example.com/image.jpg", icon: "ri-image-line" },
  Video: { label: "Video URL", placeholder: "https://example.com/video.mp4", icon: "ri-video-line" },
  Document: { label: "Document URL", placeholder: "https://example.com/file.pdf", icon: "ri-file-text-line" },
};

const BUSINESS_PAGE_SIZE = 100;
const AUTO_SEARCH_DEBOUNCE_MS = 400;

const countTemplatePlaceholders = (message) => {
  const matches = (message || "").match(/\{\{\d+\}\}|\{\d+\}/g);
  return matches ? new Set(matches).size : 0;
};

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
      {subtitle && <div className="wa-muted small">{subtitle}</div>}
    </div>
  </div>
);

export const CreateCampaign = () => {
  const [campaignType] = useState("WhatsApp");
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

  // Business detail table (names, numbers, ratings) is completely hidden
  // by default. Only "View numbers" and "Export to Excel" show; the
  // table itself doesn't render at all until the user opts in.
  const [numbersRevealed, setNumbersRevealed] = useState(false);

  const [visibleCount, setVisibleCount] = useState(BUSINESS_PAGE_SIZE);

  // --- Manual audience entry (always available, entirely optional) ---
  const [manualNumbersText, setManualNumbersText] = useState("");
  const [manualPhones, setManualPhones] = useState(new Set());

  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [placeholders, setPlaceholders] = useState([]);

  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const selectedTemplate = templates.find((t) => t.templateId === templateId);
  const isMediaHeader = MEDIA_HEADER_TYPES.includes(selectedTemplate?.headerType);
  const attachmentMeta = HEADER_ATTACHMENT_META[selectedTemplate?.headerType];

  const templateStoredMediaUrl = selectedTemplate?.image || selectedTemplate?.headerValue || "";

  const templateButtons = Array.isArray(selectedTemplate?.buttons) ? selectedTemplate.buttons : [];

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
        const tplRes = await fetchAllWhatsappTemplates();
        setTemplates(tplRes?.data?.result || []);
      } catch (err) {
        console.error("Failed to fetch templates", err);
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
    setNumbersRevealed(false);

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

  const [sortField, setSortField] = useState("rating");
  const [sortDir, setSortDir] = useState("desc");

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

  const exportBusinessesToExcel = () => {
    if (filteredBusinesses.length === 0) return;

    const rows = filteredBusinesses.map((b) => ({
      Name: b.title || "",
      Address: b.address || "",
      Phone: b.normalizedPhone || "",
      Rating: b.rating || "",
      Selected: selectedPhones.has(b.normalizedPhone) ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [{ wch: 30 }, { wch: 40 }, { wch: 16 }, { wch: 10 }, { wch: 10 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Businesses");

    const safeCategory = (categoryName || "businesses").replace(/[^\w-]+/g, "_");
    const safeArea = (selectedArea || "all_areas").replace(/[^\w-]+/g, "_");
    XLSX.writeFile(workbook, `${safeCategory}_${safeArea}.xlsx`);
  };


  const getLocationIdForArea = (area) => {
    if (!area) return 0;
    const match = locations.find((row) => row.area === area);
    return match?.id || match?.jioCoOrdinate || 0;
  };

  const resetForm = () => {
    setCategoryId("");
    setCategoryName("");
    setSelectedArea("");
    setBusinesses([]);
    setSelectedPhones(new Set());
    setBusinessSearched(false);
    setVisibleCount(BUSINESS_PAGE_SIZE);
    setNumbersRevealed(false);
    setCampaignName("");
    setTemplateId("");
    setAttachmentUrl("");
    setPlaceholders([]);
    setIsScheduled(false);
    setScheduleDate("");
    setManualNumbersText("");
    setManualPhones(new Set());
  };

  const handleTemplateChange = (id) => {
    setTemplateId(id);
    const tpl = templates.find((t) => t.templateId === id);
    const count = countTemplatePlaceholders(tpl?.message);
    setPlaceholders(Array(count).fill(""));
    setAttachmentUrl("");
  };

  const updatePlaceholder = (index, value) => {
    setPlaceholders((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = async (asDraft = false) => {
    if (!campaignName.trim()) {
      Swal.fire("Error", "Please enter a campaign name", "error");
      return;
    }
    // if (!categoryId) {
    //   Swal.fire("Error", "Please select a category", "error");
    //   return;
    // }
    if (!templateId) {
      Swal.fire("Error", "Please select a message", "error");
      return;
    }
    // if (isMediaHeader && !attachmentUrl.trim() && !templateStoredMediaUrl) {
    //   Swal.fire("Error", `Please provide a ${attachmentMeta?.label.toLowerCase()}`, "error");
    //   return;
    // }
    if (placeholders.some((p) => !p.trim())) {
      Swal.fire("Error", "Please fill in all body placeholder values", "error");
      return;
    }

    const mobileNo = getRecipientNumbers();
    // if (mobileNo.length === 0) {
    //   Swal.fire("Error", "Please select at least one business or enter a valid number to send to", "error");
    //   return;
    // }

    // Backend requires these keys to always be present in the payload
    // (Buttons / HeaderType / HeaderValue / LanguageCode / AttachmentUrl),
    // even when the selected template doesn't use them — so we always
    // fall back to "" / [] / 0 instead of omitting the keys.
    const resolvedHeaderValue = isMediaHeader
      ? (attachmentUrl.trim() || templateStoredMediaUrl || "")
      : (selectedTemplate?.headerValue || "");

    const resolvedAttachmentUrl = isMediaHeader
      ? (attachmentUrl.trim() || templateStoredMediaUrl || "")
      : "";

    const payload = {
      campaignName: campaignName.trim(),
      campaignType,
      mobileNo,
      templateId,
      languageCode: selectedTemplate?.languageCode || "",
      headerType: selectedTemplate?.headerType || "",
      headerValue: resolvedHeaderValue,
      bodyPlaceholders: placeholders,
      attachmentUrl: resolvedAttachmentUrl,

      // e.g. "2026-07-20T03:14:43.110Z"
      scheduleDate: isScheduled && scheduleDate ? toIsoScheduleString(scheduleDate) : null,
      isScheduled: !!isScheduled,
      buttons: templateButtons.length > 0
        ? templateButtons.map((btn) => ({
            type: btn.type || "",
            placeholder: btn.placeholder || "",
            text: btn.text || "",
          }))
        : [],
    };

    try {
      setSubmitting(true);
      await createSendCampaign(payload);
      Swal.fire(
        "Success",
        asDraft ? "Draft saved successfully" : "Campaign sent successfully",
        "success"
      );
      resetForm();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to submit campaign", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const recipientCount = useMemo(
    () => new Set([...selectedPhones, ...manualPhones]).size,
    [selectedPhones, manualPhones]
  );

  const detailsDone = Boolean(campaignName.trim() && categoryId);
  const audienceDone = recipientCount > 0;
  const messageDone = Boolean(
    templateId &&
      (!isMediaHeader || attachmentUrl.trim() || templateStoredMediaUrl) &&
      (placeholders.length === 0 || placeholders.every((p) => p.trim()))
  );
  const scheduleDone = !isScheduled || Boolean(scheduleDate);

  const renderedMessage = useMemo(() => {
    if (!selectedTemplate) return "";
    let rendered = selectedTemplate.message || "";
    placeholders.forEach((val, idx) => {
      const token1 = `{{${idx + 1}}}`;
      const token2 = `{${idx + 1}}`;
      const display = val || token2;
      rendered = rendered.split(token1).join(display);
      rendered = rendered.split(token2).join(display);
    });
    return rendered;
  }, [selectedTemplate, placeholders]);

  const previewMediaUrl = isMediaHeader
    ? (attachmentUrl.trim() || templateStoredMediaUrl)
    : "";

  return (
    <div className="wa-campaign">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

        .wa-campaign {
          --wa-green: #25D366;
          --wa-teal: #075E54;
          --wa-teal-dark: #054239;
          --wa-bg: #F5F7F7;
          --wa-border: #DCE4E2;
          --wa-text: #16211F;
          --wa-muted: #587670;
          --wa-faint: #9BB0AC;
          --wa-accent-soft: #E9FBF1;
          --wa-font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          --wa-font-heading: 'Manrope', 'Inter', -apple-system, sans-serif;
          font-family: var(--wa-font-body);
          color: var(--wa-text);
        }
        .wa-campaign .wa-muted {
          color: var(--wa-muted) !important;
        }
        .wa-campaign, .wa-campaign input, .wa-campaign select, .wa-campaign textarea, .wa-campaign button {
          font-family: var(--wa-font-body);
        }
        .wa-campaign .page-title {
          font-family: var(--wa-font-heading);
          font-weight: 800;
          font-size: 1.3rem;
          letter-spacing: -0.01em;
          color: var(--wa-text);
        }
        .wa-campaign .page-subtitle {
          font-size: 0.85rem;
          color: var(--wa-muted);
        }
        .wa-campaign .step-title {
          font-family: var(--wa-font-heading);
          font-weight: 700;
          font-size: 1rem;
          letter-spacing: -0.005em;
          color: var(--wa-text);
        }
        .wa-campaign .form-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--wa-text);
          letter-spacing: 0.01em;
        }
        .wa-campaign small, .wa-campaign .small {
          font-size: 0.78rem;
        }
        .wa-campaign .page-shell {
          background: var(--wa-bg);
          border-radius: 20px;
          padding: 1.5rem;
        }
        .wa-campaign .panel {
          background: #fff;
          border: 1px solid var(--wa-border);
          border-radius: 16px;
          padding: 1.6rem;
        }
        .wa-campaign .step-badge {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid var(--wa-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--wa-font-heading);
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--wa-muted);
        }
        .wa-campaign .step-badge-done {
          background: var(--wa-teal);
          border-color: var(--wa-teal);
          color: #fff;
        }
        .wa-campaign .segmented {
          display: inline-flex;
          border: 1px solid var(--wa-border);
          border-radius: 10px;
          overflow: hidden;
        }
        .wa-campaign .segmented button {
          border: none;
          background: #fff;
          padding: 0.5rem 1rem;
          font-size: 0.83rem;
          font-weight: 600;
          color: var(--wa-muted);
          cursor: pointer;
        }
        .wa-campaign .segmented button.active {
          background: var(--wa-teal);
          color: #fff;
        }
        .wa-campaign .placeholder-slot {
          border: 1px solid var(--wa-border);
          border-radius: 10px;
          padding: 0.5rem 0.75rem;
        }
        .wa-campaign .placeholder-slot label {
          font-size: 0.68rem;
          font-weight: 700;
          font-family: var(--wa-font-heading);
          color: var(--wa-teal);
          margin-bottom: 0.15rem;
        }
        .wa-campaign .btn-send {
          background: var(--wa-teal);
          color: #fff;
          border: none;
          font-weight: 700;
          letter-spacing: 0.01em;
          transition: background .15s ease;
        }
        .wa-campaign .btn-send:hover:not(:disabled) { background: var(--wa-teal-dark); color: #fff; }
        .wa-campaign .btn-outline-secondary {
          font-weight: 600;
          color: var(--wa-muted);
          border-color: var(--wa-border);
        }
        .wa-campaign .btn-outline-secondary:hover {
          background: var(--wa-bg);
          color: var(--wa-text);
          border-color: var(--wa-border);
        }
        .wa-campaign .chip {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: var(--wa-bg);
          border: 1px solid var(--wa-border);
          color: var(--wa-muted);
          font-weight: 600;
          font-size: 0.72rem;
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
        }
        .wa-campaign .form-control:disabled,
        .wa-campaign .form-select:disabled {
          background: var(--wa-bg);
          color: var(--wa-muted);
          border-color: var(--wa-border);
        }
        .wa-campaign .biz-table-wrap {
          max-height: 420px;
          overflow: auto;
          border: 1px solid var(--wa-border);
          border-radius: 12px;
        }
        .wa-campaign .biz-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8rem;
        }
        .wa-campaign .biz-table thead th {
          position: sticky;
          top: 0;
          background: var(--wa-bg);
          text-align: left;
          padding: 0.55rem 0.7rem;
          font-weight: 700;
          font-family: var(--wa-font-heading);
          color: var(--wa-teal);
          border-bottom: 1px solid var(--wa-border);
          cursor: pointer;
          white-space: nowrap;
          user-select: none;
        }
        .wa-campaign .biz-table thead th:hover {
          background: var(--wa-accent-soft);
        }
        .wa-campaign .biz-table thead th.checkbox-col {
          cursor: default;
          width: 40px;
        }
        .wa-campaign .biz-table thead th.checkbox-col:hover {
          background: #fff;
        }
        .wa-campaign .biz-table tbody td {
          padding: 0.5rem 0.7rem;
          border-bottom: 1px solid var(--wa-border);
          vertical-align: top;
        }
        .wa-campaign .biz-table tbody tr:last-child td {
          border-bottom: none;
        }
        .wa-campaign .biz-table tbody tr {
          cursor: pointer;
        }
        .wa-campaign .biz-table tbody tr:hover {
          background: var(--wa-accent-soft);
        }
        .wa-campaign .biz-table tbody tr.row-selected {
          background: #F3FBF6;
        }
        .wa-campaign .biz-table tbody tr.row-selected:hover {
          background: var(--wa-accent-soft);
        }
        .wa-campaign .biz-table input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: var(--wa-teal);
        }
        .wa-campaign .sort-arrow {
          font-size: 0.7rem;
          margin-left: 0.2rem;
          opacity: 0.6;
        }
        .wa-campaign .biz-title {
          font-weight: 700;
          font-size: 0.85rem;
        }
        .wa-campaign .biz-meta {
          font-size: 0.75rem;
          color: var(--wa-muted);
        }
        .wa-campaign .show-more-row {
          text-align: center;
          padding: 0.6rem;
          background: var(--wa-bg);
        }
        .wa-campaign .hidden-audience-card {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 0.5rem;
          text-align: center;
          padding: 2rem 1rem;
          background: var(--wa-bg);
          border: 1px dashed var(--wa-border);
          border-radius: 12px;
        }
        .wa-campaign .hidden-audience-card i {
          font-size: 1.5rem;
          color: var(--wa-faint);
        }
        .wa-campaign .recipients-list {
          max-height: 220px;
          overflow-y: auto;
          border: 1px solid var(--wa-border);
          border-radius: 12px;
          background: var(--wa-bg);
        }
        .wa-campaign .recipient-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          padding: 0.5rem 0.85rem;
          border-bottom: 1px solid var(--wa-border);
          background: #fff;
        }
        .wa-campaign .recipient-row:last-child { border-bottom: none; }
        .wa-campaign .recipient-remove {
          border: none;
          background: transparent;
          color: var(--wa-muted);
          width: 24px;
          height: 24px;
          flex-shrink: 0;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .wa-campaign .recipient-remove:hover {
          background: #FDECEC;
          color: #D64545;
        }
        .wa-campaign .phone-frame {
          background: #111;
          border-radius: 32px;
          padding: 10px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.18);
        }
        .wa-campaign .phone-screen {
          background: #E5DDD5;
          border-radius: 24px;
          overflow: hidden;
          min-height: 420px;
          display: flex;
          flex-direction: column;
        }
        .wa-campaign .phone-statusbar {
          display: flex;
          justify-content: space-between;
          padding: 0.4rem 1rem 0.1rem;
          font-size: 0.65rem;
          font-weight: 600;
          color: rgba(0,0,0,0.55);
        }
        .wa-campaign .phone-header {
          background: var(--wa-teal);
          color: #fff;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.6rem 0.9rem;
        }
        .wa-campaign .phone-header .name {
          font-family: var(--wa-font-heading);
          font-weight: 700;
          font-size: 0.85rem;
        }
        .wa-campaign .phone-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.8rem;
        }
        .wa-campaign .chat-area {
          flex: 1;
          padding: 1rem 0.75rem;
        }
        .wa-campaign .bubble {
          background: #fff;
          border-radius: 10px;
          padding: 0.65rem 0.75rem;
          max-width: 88%;
          font-size: 0.85rem;
          line-height: 1.5;
          box-shadow: 0 1px 1px rgba(0,0,0,0.08);
          position: relative;
        }
        .wa-campaign .bubble-media-img,
        .wa-campaign .bubble-media-video {
          width: 100%;
          max-height: 160px;
          object-fit: cover;
          border-radius: 8px;
          display: block;
          margin-bottom: 0.4rem;
        }
        .wa-campaign .bubble-media-doc {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--wa-bg);
          border: 1px solid var(--wa-border);
          border-radius: 8px;
          padding: 0.5rem 0.65rem;
          font-size: 0.8rem;
          margin-bottom: 0.4rem;
        }
        .wa-campaign .phone-inputbar {
          background: #f0f0f0;
          padding: 0.5rem 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--wa-muted);
        }
      `}</style>

      <div className="page-shell">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 px-1">
          <div>
            <h5 className="page-title mb-0">Create WhatsApp Campaign</h5>
            <div className="page-subtitle">Send a templated broadcast to a filtered audience</div>
          </div>
          <span
            className="badge d-inline-flex align-items-center gap-1 px-3 py-2"
            style={{ background: "var(--wa-accent-soft)", color: "var(--wa-teal)", fontWeight: 700 }}
          >
            <i className="ri-whatsapp-line" /> WhatsApp
          </span>
        </div>

        <div className="row g-3">
          <div className="col-xxl-8 col-lg-7 d-flex flex-column gap-3">
            <div className="panel">
              <StepHeader
                step={1}
                title="Campaign details & audience"
                subtitle="Businesses matching your category and location load automatically. You can also add specific numbers manually — entirely optional."
                done={detailsDone && audienceDone}
              />

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Campaign name <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    placeholder=""
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Campaign type</label>
                  <input className="form-control" value={campaignType} disabled />
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
                    <span className="wa-muted small">
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
                  <label className="form-label">
                    Category <span className="text-danger">*</span>
                  </label>
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
                    <small className="wa-muted fst-italic d-block mt-1">
                      No areas found for this category.
                    </small>
                  )}
                </div>
              </div>

              {(!categoryId || !selectedArea) && (
                <div className="wa-muted small fst-italic mt-3">
                  Select a category and a location to load matching businesses.
                </div>
              )}

              {businessLoading && (
                <div className="wa-muted small fst-italic mt-3">
                  <i className="ri-loader-4-line me-1" />
                  Searching businesses...
                </div>
              )}

              {businessSearched && !businessLoading && businesses.length === 0 && (
                <div className="wa-muted small fst-italic mt-3">
                  No businesses with a valid phone number found for this category/location.
                </div>
              )}

              {businesses.length > 0 && !businessLoading && (
                <div className="mt-3">
                  <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                    <label className="form-label mb-0">Matching businesses</label>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="wa-muted small">
                        {selectedPhones.size} of {businesses.length} selected
                      </span>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setNumbersRevealed((v) => !v)}
                      >
                        <i className={`ri-${numbersRevealed ? "eye-off-line" : "eye-line"} me-1`} />
                        {numbersRevealed ? "Hide numbers" : "View numbers"}
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

                  {numbersRevealed ? (
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
                              <td className="wa-muted">{b.normalizedPhone}</td>
                              <td className="wa-muted">
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
                      <span className="wa-muted small">
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
                subtitle="Pick the approved message to send"
                done={messageDone}
              />

              <div className="mb-3">
                <label className="form-label">
                  Template name <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={templateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  disabled={loadingMeta}
                >
                  <option value="">Select a template</option>
                  {templates.map((tpl) => (
                    <option key={tpl.templateId} value={tpl.templateId}>
                      {tpl.templateName}
                    </option>
                  ))}
                </select>
                {templates.length === 0 && !loadingMeta && (
                  <small className="wa-muted fst-italic d-block mt-1">
                    No templates available yet.
                  </small>
                )}
              </div>

              {selectedTemplate && (
                <div className="mb-3 d-flex gap-2 flex-wrap">
                  <span className="chip">{selectedTemplate.languageCode}</span>
                  {isMediaHeader && (
                    <span className="chip">
                      <i className={`${attachmentMeta?.icon} me-1`} />
                      {selectedTemplate.headerType}
                    </span>
                  )}
                  {templateButtons.length > 0 && (
                    <span className="chip">
                      <i className="ri-cursor-line me-1" />
                      {templateButtons.length} button{templateButtons.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}

              {selectedTemplate && isMediaHeader && (
                <div className="mb-3">
                  <label className="form-label">
                    {attachmentMeta?.label} for this send
                    {!templateStoredMediaUrl && <span className="text-danger"> *</span>}
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <i className={attachmentMeta?.icon} />
                    </span>
                    <input
                      className="form-control"
                      placeholder={templateStoredMediaUrl || attachmentMeta?.placeholder}
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                    />
                  </div>
                  <small className="wa-muted">
                    {templateStoredMediaUrl
                      ? "This template already has a saved attachment — leave blank to use it, or enter a URL to override for this send."
                      : "This template's header needs media supplied per campaign."}
                  </small>
                </div>
              )}

              {placeholders.length > 0 && (
                <div>
                  <label className="form-label">Body placeholders</label>
                  <div className="d-flex flex-wrap gap-2">
                    {placeholders.map((val, idx) => (
                      <div className="placeholder-slot" key={idx} style={{ minWidth: 180 }}>
                        <label className="d-block">{`{${idx + 1}}`}</label>
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
            </div>

            <div className="panel">
              <StepHeader
                step={3}
                title={isScheduled ? "Schedule" : "Send"}
                subtitle="Choose when this campaign goes out"
                done={scheduleDone}
              />
              <div className="d-flex align-items-center flex-wrap gap-3 mb-4">
                <div className="segmented">
                  <button
                    type="button"
                    className={!isScheduled ? "active" : ""}
                    onClick={() => setIsScheduled(false)}
                  >
                    Send now
                  </button>
                  <button
                    type="button"
                    className={isScheduled ? "active" : ""}
                    onClick={() => setIsScheduled(true)}
                  >
                    Schedule for later
                  </button>
                </div>
                {isScheduled && (
                  <input
                    type="datetime-local"
                    className="form-control"
                    style={{ maxWidth: 260 }}
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                )}
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-send px-4"
                  disabled={submitting || loadingMeta}
                  onClick={() => handleSubmit(false)}
                >
                  {submitting ? (
                    "Sending..."
                  ) : isScheduled ? (
                    <>
                      <i className="ri-calendar-event-line me-1" /> Schedule campaign
                    </>
                  ) : (
                    <>
                      <i className="ri-send-plane-fill me-1" /> Send now ({recipientCount})
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  disabled={submitting}
                  onClick={() => handleSubmit(true)}
                >
                  Save as draft
                </button>
              </div>
            </div>
          </div>

          <div className="col-xxl-4 col-lg-5">
            <div className="panel" style={{ position: "sticky", top: 16 }}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <small
                  className="text-uppercase fw-bold wa-muted"
                  style={{ fontSize: "0.72rem", letterSpacing: ".06em" }}
                >
                  Live preview
                </small>
                {selectedTemplate && (
                  <span className="chip">
                    {selectedTemplate.languageCode}
                  </span>
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
                      <i className="ri-store-2-line" />
                    </div>
                    <div>
                      <div className="name">Your Business</div>
                      <div style={{ fontSize: "0.65rem", opacity: 0.8 }}>Business account</div>
                    </div>
                  </div>

                  <div className="chat-area">
                    <div className="bubble">
                      {selectedTemplate?.headerType && selectedTemplate.headerType !== "None" && (
                        <div className="mb-2">
                          {selectedTemplate.headerType === "Text" ? (
                            <div className="fw-bold">
                              {selectedTemplate.headerValue || (
                                <span className="wa-muted fst-italic fw-normal">Header text...</span>
                              )}
                            </div>
                          ) : selectedTemplate.headerType === "Location" ? (
                            <div className="fw-bold">
                              <span className="wa-muted fst-italic fw-normal">
                                <i className="ri-map-pin-line me-1" />
                                Location
                              </span>
                            </div>
                          ) : isMediaHeader ? (
                            previewMediaUrl ? (
                              selectedTemplate.headerType === "Image" ? (
                                <img
                                  src={previewMediaUrl}
                                  alt="Header"
                                  className="bubble-media-img"
                                  onError={(e) => { e.target.style.display = "none"; }}
                                />
                              ) : selectedTemplate.headerType === "Video" ? (
                                <video
                                  src={previewMediaUrl}
                                  controls
                                  className="bubble-media-video"
                                />
                              ) : (
                                <div className="bubble-media-doc">
                                  <i className={attachmentMeta?.icon} />
                                  <span className="text-truncate">
                                    {previewMediaUrl.split("/").pop()}
                                  </span>
                                </div>
                              )
                            ) : (
                              <span className="wa-muted fst-italic fw-normal">
                                {selectedTemplate.headerType} attachment...
                              </span>
                            )
                          ) : null}
                        </div>
                      )}
                      <div style={{ whiteSpace: "pre-wrap" }}>
                        {selectedTemplate ? (
                          renderedMessage
                        ) : (
                          <span className="wa-muted fst-italic">
                            Select a message to preview it here
                          </span>
                        )}
                      </div>
                      {selectedTemplate?.footer && (
                        <div className="wa-muted mt-2" style={{ fontSize: "0.75em" }}>
                          {selectedTemplate.footer}
                        </div>
                      )}
                      <div className="text-end wa-muted mt-1" style={{ fontSize: "0.65rem" }}>
                        {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        <i className="ri-check-double-line ms-1" style={{ color: "#53BDEB" }} />
                      </div>
                    </div>

                    {templateButtons.length > 0 && (
                      <div style={{ maxWidth: "88%", marginTop: 2 }}>
                        {templateButtons.map((btn, i) => (
                          <div
                            key={i}
                            className="text-center fw-medium bg-white"
                            style={{
                              borderTop: i === 0 ? "1px solid rgba(0,0,0,0.08)" : "none",
                              borderBottom: i < templateButtons.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none",
                              padding: "0.5rem 0",
                              fontSize: "0.82rem",
                              color: "#00A5F4",
                              borderRadius:
                                i === templateButtons.length - 1 ? "0 0 10px 10px" : "0"
                            }}
                          >
                            {btn.type === "URL" && <i className="ri-external-link-line me-1" />}
                            {btn.type === "PHONE_NUMBER" && <i className="ri-phone-line me-1" />}
                            {btn.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="phone-inputbar">
                    <i className="ri-emotion-line" />
                    <span className="flex-grow-1">Message</span>
                    <i className="ri-mic-line" />
                  </div>
                </div>
              </div>

              <small className="wa-muted d-block mt-3">
                Language, header, footer and buttons come from the selected message as approved by
                WhatsApp; only placeholders and any required attachment are filled in per campaign.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};