import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  addWhatsappTemplate,
  updateWhatsappTemplate,
  fetchWhatsappTemplateById
} from '../../services/whatsappTemplateService';
import {
  validateWhatsappTemplateData,
  countPlaceholders,
  HEADER_TYPE_OPTIONS
} from '../../utils/validation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { handleErrors } from '../../utils/errorHandler';
import ComponentHeader from '../Common/OtherElements/ComponentHeader';

// -----------------------------------------------------------------------
// NOTE ON HOW WHATSAPP TEMPLATES ACTUALLY WORK:
// A WhatsApp template can have AT MOST ONE media attachment, and it can
// ONLY sit in the "header" slot — rendered above the body text, never
// embedded mid-paragraph. There is no way to place an image "wherever
// you want" inside the message body on real WhatsApp. This component
// reflects that: header attachment is optional and separate from the
// message, and the preview renders it exactly where WhatsApp would
// show it (top of the bubble, above the text).
//
// NOTE ON headerValue vs headerFile:
// For Image / Video / Document header types, the user has two ways to
// supply the attachment:
//   1. Type/paste a URL directly into the text field -> stored in
//      `headerValue` (string) -> sent to the API as `HeaderValue`.
//   2. Upload a file OR paste (Ctrl+V) a copied image/file -> the raw
//      `File` object is stored in `headerFile` -> sent to the API as
//      the binary `image` field (multipart/form-data). No separate
//      pre-upload step happens on the client; the server receives the
//      file directly as part of the Create/Update request.
// Only one of these is ever the "real" source at a time. Whichever one
// the user last touched wins, and the other is cleared, so there's a
// single unambiguous value used for submission. For preview purposes
// only, `effectiveHeaderValue` resolves to whichever is present (using
// an object URL when a File is attached).
// -----------------------------------------------------------------------

const INITIAL_FORM_STATE = {
  templateId: '',
  templateName: '',
  headerType: 'None',   // None | Text | Image | Video | Document
  headerValue: '',      // Text header text, OR a manually typed/pasted URL for media headers
  headerFile: null,     // Raw File object from upload or clipboard-paste (Image/Video/Document only)
  message: ''
};

const INITIAL_ERRORS_STATE = {
  templateId: '',
  templateName: '',
  headerValue: '',
  message: ''
};

const HEADER_VALUE_META = {
  Text: { label: 'Header Text', placeholder: 'Enter header text' },
  Image: { label: 'Header Image', placeholder: 'https://example.com/image.jpg' },
  Video: { label: 'Header Video', placeholder: 'https://example.com/video.mp4' },
  Document: { label: 'Header Document', placeholder: 'https://example.com/file.pdf' }
};

const WA = {
  green: '#25D366',
  teal: '#075E54',
  bubble: '#DCF8C6',
  wallpaper: '#E5DDD5',
  border: '#E6E4E1',
  surfaceMuted: '#F7F7F6',
  radius: 12,
  radiusSm: 8
};

const SectionLabel = ({ children }) => (
  <h6
    className="text-uppercase fw-bold mb-3"
    style={{ fontSize: '0.72rem', letterSpacing: '.06em', color: WA.teal }}
  >
    {children}
  </h6>
);

export const AddWhatsappTemplate = ({
  editMode = false,
  initialData = {},
  onSuccess,
  setSelectedTemplate,
  setEditMode
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState(INITIAL_ERRORS_STATE);
  const [apiError, setApiError] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isUploadingHeader, setIsUploadingHeader] = useState(false);
  const [headerFilePreviewUrl, setHeaderFilePreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (editMode && initialData?.id) {
        try {
          const data = await fetchWhatsappTemplateById(initialData.id);
          setFormData({
            templateId: data.templateId || '',
            templateName: data.templateName || '',
            headerType: data.headerType || 'None',
            // Existing saved templates only ever have a single stored URL
            // (headerValue) — a File object can't be reconstructed from
            // that, so headerFile stays null on load. If the user then
            // uploads/pastes a new file it will move into headerFile and
            // take over as usual.
            headerValue: data.headerValue || '',
            headerFile: null,
            message: data.message || ''
          });
        } catch (error) {
          handleErrors(error);
        }
      } else {
        setFormData(INITIAL_FORM_STATE);
      }
    };
    fetchData();
  }, [editMode, initialData]);

  // Build/revoke an object URL for previewing an attached File. Only
  // relevant for the in-browser preview panel — never sent to the API.
  useEffect(() => {
    if (formData.headerFile instanceof File) {
      const objectUrl = URL.createObjectURL(formData.headerFile);
      setHeaderFilePreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setHeaderFilePreviewUrl('');
  }, [formData.headerFile]);

  const isFileHeader = ['Image', 'Video', 'Document'].includes(formData.headerType);

  const handleInputChange = ({ target: { name, value } }) => {
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'headerType' && value === 'None') {
        next.headerValue = '';
        next.headerFile = null;
      }
      // If the user manually types/pastes a URL into the header value
      // field for a file-type header, that becomes the source of truth —
      // clear out any previously attached file so there's no ambiguity.
      if (name === 'headerValue' && ['Image', 'Video', 'Document'].includes(prev.headerType)) {
        next.headerFile = null;
      }
      return next;
    });
  };

  // ---- Header attachment selection ---------------------------------------
  // For Image / Video / Document header types, the user picks a file (or
  // pastes one). We no longer pre-upload it to a media endpoint — the raw
  // File object is kept in state and sent directly as part of the
  // Create/Update multipart/form-data request (see whatsappTemplateService).
  const handleHeaderFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processHeaderFile(file);
  };

  // Shared logic used by both the file picker and paste handler.
  // Uploaded/pasted files always land in `headerFile`, and any manually
  // typed URL in `headerValue` is cleared so the attached file wins.
  const processHeaderFile = async (file) => {
    try {
      setIsUploadingHeader(true);
      setFormData((prev) => ({ ...prev, headerFile: file, headerValue: '' }));
    } catch (error) {
      handleErrors(error);
      toast.error('Could not attach header file.');
    } finally {
      setIsUploadingHeader(false);
    }
  };

  // Lets the user just click into the header attachment zone and hit
  // Ctrl+V after copying an image (e.g. a screenshot) — no need to save
  // the file to disk first and browse for it.
  const handleHeaderPaste = async (e) => {
    if (!isFileHeader) return;
    const items = e.clipboardData?.items || [];
    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          await processHeaderFile(file);
          return;
        }
      }
    }
    // No file in the clipboard — nothing to do, let default paste happen.
  };

  // Single source of truth for the PREVIEW only: an attached file
  // (rendered via an object URL) takes precedence over a manually typed
  // URL (headerValue) for media headers. For Text headers, headerValue is
  // always the answer. This value is never sent to the API directly —
  // submission sends headerValue and headerFile as separate fields.
  const effectiveHeaderValue =
    isFileHeader ? (headerFilePreviewUrl || formData.headerValue) : formData.headerValue;

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Validate against whichever the user actually provided — a File
      // satisfies the "header value required" rule just as a URL does.
      const dataToValidate = {
        ...formData,
        headerValue: formData.headerFile ? 'file-attached' : formData.headerValue
      };
      const { valid, errors: validationErrors } = validateWhatsappTemplateData(dataToValidate);
      setErrors(validationErrors);

      if (valid) {
        setApiError('');
        try {
          setIsButtonDisabled(true);
          const payload = {
            templateId: formData.templateId,
            templateName: formData.templateName,
            headerType: formData.headerType,
            // Only ONE of these ever reaches the server: if a file was
            // attached, headerValue is blanked out and imageFile carries
            // the binary; otherwise headerValue carries the typed URL.
            headerValue: formData.headerFile ? '' : formData.headerValue,
            imageFile: formData.headerFile instanceof File ? formData.headerFile : null,
            message: formData.message,
            placeholderCount: countPlaceholders(formData.message),
            id: editMode ? initialData.id : undefined
          };
          const action = editMode ? updateWhatsappTemplate : addWhatsappTemplate;
          await action(payload);

          toast.success(`Template ${editMode ? 'updated' : 'added'} successfully!`);
          setIsButtonDisabled(false);

          setFormData(INITIAL_FORM_STATE);
          if (onSuccess) onSuccess();
          setEditMode(false);
        } catch (error) {
          handleErrors(error);
          setIsButtonDisabled(false);
        }
      }
    },
    [formData, editMode, initialData, onSuccess, setEditMode]
  );

  const handleAddNewClick = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors(INITIAL_ERRORS_STATE);
    setApiError('');
    setSelectedTemplate(null);
    setEditMode(false);
  };

  const remainingChars = 1024 - (formData.message?.length || 0);
  const placeholderCount = useMemo(() => countPlaceholders(formData.message), [formData.message]);
  const headerMeta = HEADER_VALUE_META[formData.headerType];
  const showHeaderValue = formData.headerType && formData.headerType !== 'None';

  return (
    <>
      <ComponentHeader title="WhatsApp Templates" />

      <style>{`
        .wa-form .form-control,
        .wa-form .form-select {
          border-color: ${WA.border};
          border-radius: 8px;
          padding: 0.55rem 0.85rem;
          font-size: 0.92rem;
        }
        .wa-form .form-control:focus,
        .wa-form .form-select:focus {
          border-color: ${WA.green};
          box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.15);
        }
        .wa-form .form-control::placeholder { color: #A9A6A1; }
        .wa-form .form-control:disabled { background-color: ${WA.surfaceMuted}; }
        .wa-form .form-label { font-size: 0.86rem; font-weight: 600; color: #333; margin-bottom: 0.4rem; }
        .wa-form textarea.form-control { resize: vertical; }
        .wa-header-preview-img,
        .wa-header-preview-video {
          width: 100%;
          max-height: 160px;
          object-fit: cover;
          border-radius: ${WA.radiusSm}px ${WA.radiusSm}px 0 0;
          display: block;
        }
        .wa-paste-zone {
          border: 1.5px dashed ${WA.border};
          border-radius: ${WA.radiusSm}px;
          padding: 0.75rem;
          font-size: 0.82rem;
          background: ${WA.surfaceMuted};
          cursor: text;
          outline: none;
        }
        .wa-paste-zone:focus {
          border-color: ${WA.green};
          box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.15);
        }
        .wa-header-doc-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #fff;
          border: 1px solid ${WA.border};
          border-radius: ${WA.radiusSm}px;
          padding: 0.5rem 0.65rem;
          font-size: 0.8rem;
          margin: 0 0.75rem;
        }
        .wa-or-divider {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0.5rem 0;
          font-size: 0.72rem;
          color: #A9A6A1;
          text-transform: uppercase;
          letter-spacing: .04em;
        }
        .wa-or-divider::before,
        .wa-or-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: ${WA.border};
        }
      `}</style>

      <div className="row g-3 wa-form">
        <div className="col-xxl-8 col-lg-7">
          <div className="card mt-xxl-n5 border-0 shadow-sm" style={{ borderRadius: WA.radius }}>
            <div
              className="card-header bg-white py-3"
              style={{ borderTopLeftRadius: WA.radius, borderTopRightRadius: WA.radius, borderColor: WA.border }}
            >
              <h5 className="mb-0 fw-semibold" style={{ color: WA.teal }}>
                {editMode ? 'Update Template' : 'Create Template'}
              </h5>
              <small className="text-muted">
                {editMode ? `Editing template #${initialData?.templateId}` : 'Build a reusable WhatsApp message template'}
              </small>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit} method="POST" noValidate>
                <SectionLabel>Identity</SectionLabel>
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <label htmlFor="templateId" className="form-label">
                      Template ID <span className="required-field">*</span>
                    </label>
                    <input
                      type="text"
                      name="templateId"
                      id="templateId"
                      placeholder="WA-OFFER-01"
                      value={formData.templateId}
                      onChange={handleInputChange}
                      className={`form-control ${errors.templateId ? 'is-invalid' : ''}`}
                    />
                    {errors.templateId && <div className="invalid-feedback">{errors.templateId}</div>}
                  </div>

                  <div className="col-md-8">
                    <label htmlFor="templateName" className="form-label">
                      Template Name <span className="required-field">*</span>
                    </label>
                    <input
                      type="text"
                      name="templateName"
                      id="templateName"
                      placeholder="e.g. lead_offer_notification"
                      value={formData.templateName}
                      onChange={handleInputChange}
                      className={`form-control ${errors.templateName ? 'is-invalid' : ''}`}
                    />
                    {errors.templateName && <div className="invalid-feedback">{errors.templateName}</div>}
                  </div>
                </div>

                <SectionLabel>Header attachment (optional)</SectionLabel>
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <label htmlFor="headerType" className="form-label">Header Type</label>
                    <select
                      name="headerType"
                      id="headerType"
                      value={formData.headerType}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {HEADER_TYPE_OPTIONS.filter((opt) => opt !== 'Location').map((opt) => (
                        <option value={opt} key={opt}>{opt}</option>
                      ))}
                    </select>
                  
                  </div>

                  {showHeaderValue && formData.headerType === 'Text' && (
                    <div className="col-md-8">
                      <label htmlFor="headerValue" className="form-label">
                        {headerMeta.label} <span className="required-field">*</span>
                      </label>
                      <input
                        type="text"
                        name="headerValue"
                        id="headerValue"
                        placeholder={headerMeta.placeholder}
                        value={formData.headerValue}
                        onChange={handleInputChange}
                        className={`form-control ${errors.headerValue ? 'is-invalid' : ''}`}
                      />
                      {errors.headerValue && <div className="invalid-feedback">{errors.headerValue}</div>}
                    </div>
                  )}

                  {showHeaderValue && isFileHeader && (
                    <div className="col-md-8">
                      <label htmlFor="headerValue" className="form-label">
                        {headerMeta.label} <span className="required-field">*</span>
                      </label>

                      {/* Option 1: type or paste a URL directly. Typing here
                          clears any previously attached file. Sent to the
                          API as HeaderValue. */}
                      <input
                        type="text"
                        name="headerValue"
                        id="headerValue"
                        placeholder={headerMeta.placeholder}
                        value={formData.headerValue}
                        onChange={handleInputChange}
                        disabled={!!formData.headerFile || isUploadingHeader}
                        className={`form-control ${errors.headerValue ? 'is-invalid' : ''}`}
                      />

                      <div className="wa-or-divider">or</div>

                      {/* Option 2: click this zone and press Ctrl+V to paste
                          a copied image/screenshot directly — no need to
                          save the file to disk first and browse for it.
                          Falls back to a normal file picker below for
                          actual files. Either path stores the raw File in
                          headerFile, sent to the API as the binary `image`
                          field — never headerValue. */}
                      <div
                        tabIndex={0}
                        onPaste={handleHeaderPaste}
                        className="wa-paste-zone"
                        role="button"
                        aria-label={`Click here and paste (Ctrl+V) an image, or browse a file for ${headerMeta.label}`}
                      >
                        {isUploadingHeader ? (
                          <span className="text-muted">Attaching...</span>
                        ) : formData.headerFile ? (
                          <span className="text-success">
                            Attached ✓ ({formData.headerFile instanceof File ? formData.headerFile.name : formData.headerFile})
                          </span>
                        ) : (
                          <span className="text-muted">
                            Click here, then press <strong>Ctrl+V</strong> to paste a copied image
                            — or choose a file below
                          </span>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={
                          formData.headerType === 'Image'
                            ? 'image/*'
                            : formData.headerType === 'Video'
                            ? 'video/*'
                            : '.pdf,.doc,.docx,.xls,.xlsx'
                        }
                        onChange={handleHeaderFileChange}
                        disabled={isUploadingHeader}
                        className={`form-control mt-2 ${errors.headerValue ? 'is-invalid' : ''}`}
                      />
                      {errors.headerValue && <div className="invalid-feedback d-block">{errors.headerValue}</div>}
                    </div>
                  )}
                </div>

                <SectionLabel>Message</SectionLabel>
                <div className="row g-3 mb-4">
                  <div className="col-12">
                    <label htmlFor="message" className="form-label">
                      Message Body <span className="required-field">*</span>
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      rows={8}
                      maxLength={1024}
                      placeholder="Hi {{1}}, we have an update for you..."
                      value={formData.message}
                      onChange={handleInputChange}
                      className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                    />
                    <div className="d-flex justify-content-between align-items-center flex-wrap mt-2">
                      <small className="text-muted">
                        Use <code>{'{{1}}'}</code>, <code>{'{{2}}'}</code> etc. for variables
                      </small>
                      <div className="d-flex align-items-center gap-2">
                        <small
                          className="badge fw-normal"
                          style={{ background: '#E8F5F3', color: WA.teal, border: '1px solid #CFE8E4' }}
                        >
                          {placeholderCount} placeholder{placeholderCount !== 1 ? 's' : ''}
                        </small>
                        <small className={`text-muted ${remainingChars < 50 ? 'text-danger fw-semibold' : ''}`}>
                          {remainingChars} chars left
                        </small>
                      </div>
                    </div>
                    {errors.message && <div className="text-danger small mt-1">{errors.message}</div>}
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top" style={{ borderColor: WA.border }}>
                  {editMode && (
                    <button type="button" onClick={handleAddNewClick} className="btn btn-outline-secondary px-4">
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn text-white px-4 fw-medium"
                    style={{ background: WA.green, borderColor: WA.green }}
                    disabled={isButtonDisabled || isUploadingHeader}
                  >
                    {isButtonDisabled
                      ? editMode ? 'Updating...' : 'Saving...'
                      : editMode ? 'Update Template' : 'Save Template'}
                  </button>
                </div>
                {apiError && <div className="alert alert-danger mt-3">{apiError}</div>}
              </form>
            </div>
          </div>
        </div>

        <div className="col-xxl-4 col-lg-5">
          <div
            className="card mt-xxl-n5 border-0 shadow-sm"
            style={{ borderRadius: WA.radius, position: 'sticky', top: 16 }}
          >
            <div
              className="card-header bg-white py-3"
              style={{ borderTopLeftRadius: WA.radius, borderTopRightRadius: WA.radius, borderColor: WA.border }}
            >
              <h6 className="mb-0 fw-semibold" style={{ color: WA.teal }}>Preview</h6>
              <small className="text-muted">How this template renders in a chat</small>
            </div>
            <div className="card-body d-flex align-items-center justify-content-center pt-4" style={{ minHeight: 220 }}>
              <div className="p-3 rounded-3 w-100 d-flex align-items-center" style={{ background: WA.wallpaper, minHeight: 180 }}>
                <div
                  className="shadow-sm w-100"
                  style={{
                    background: WA.bubble,
                    maxWidth: 280,
                    margin: '0 auto',
                    borderRadius: WA.radiusSm,
                    fontSize: '0.85rem',
                    overflow: 'hidden'
                  }}
                >
                  {/* Header attachment renders here, above the body — this is
                      the ONLY position WhatsApp ever places media. Uses
                      effectiveHeaderValue (an object URL when a File is
                      attached, or the typed URL otherwise) purely for
                      local preview — this is never what gets submitted. */}
                  {formData.headerType === 'Image' && effectiveHeaderValue && (
                    <img src={effectiveHeaderValue} alt="Header" className="wa-header-preview-img" />
                  )}
                  {formData.headerType === 'Video' && effectiveHeaderValue && (
                    <video src={effectiveHeaderValue} className="wa-header-preview-video" controls />
                  )}
                  {formData.headerType === 'Document' && effectiveHeaderValue && (
                    <div className="pt-2">
                      <div className="wa-header-doc-chip">
                        <i className="ri-file-text-line" />
                        <span className="text-truncate">
                          {formData.headerFile instanceof File
                            ? formData.headerFile.name
                            : effectiveHeaderValue.split('/').pop()}
                        </span>
                      </div>
                    </div>
                  )}
                  {isFileHeader && !effectiveHeaderValue && (
                    <div
                      className="d-flex align-items-center justify-content-center text-muted fst-italic"
                      style={{ height: 100, background: '#EFEFEF', margin: '0 0.75rem', borderRadius: WA.radiusSm, marginTop: '0.75rem' }}
                    >
                      {formData.headerType} preview
                    </div>
                  )}

                  <div className="p-3">
                    {formData.headerType === 'Text' && (
                      <div className="fw-bold mb-2">
                        {formData.headerValue || <span className="text-muted fst-italic fw-normal">Header text...</span>}
                      </div>
                    )}
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {formData.message || <span className="text-muted fst-italic">Your message will appear here...</span>}
                    </div>
                    <div className="text-end text-muted mt-1" style={{ fontSize: '0.65rem' }}>
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};