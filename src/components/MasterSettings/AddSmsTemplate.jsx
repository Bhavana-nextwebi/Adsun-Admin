import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  addSmsTemplate,
  updateSmsTemplate,
  fetchSmsTemplateById
} from '../../services/smsTemplateService';
import {
  validateSmsTemplateData,
  countSmsPlaceholders
} from '../../utils/validation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { handleErrors } from '../../utils/errorHandler';
import ComponentHeader from '../Common/OtherElements/ComponentHeader';

// -----------------------------------------------------------------------
// SMS templates are plain text only — there is no header attachment,
// media, or file upload concept (unlike WhatsApp templates). Only four
// fields make the round trip to the API: templateId, templateName,
// templateMessage and templateType. `id` is included only in edit mode.
// -----------------------------------------------------------------------

const INITIAL_FORM_STATE = {
  templateId: '',
  templateName: '',
  templateType: '',
  templateMessage: ''
};

const INITIAL_ERRORS_STATE = {
  templateId: '',
  templateName: '',
  templateType: '',
  templateMessage: ''
};

const SMS = {
  primary: '#4A6CF7',
  primaryDark: '#33459B',
  bubble: '#F1F3FB',
  wallpaper: '#EDEFF7',
  border: '#E6E4E1',
  surfaceMuted: '#F7F7F6',
  radius: 12,
  radiusSm: 8
};

const SectionLabel = ({ children }) => (
  <h6
    className="text-uppercase fw-bold mb-3"
    style={{ fontSize: '0.72rem', letterSpacing: '.06em', color: SMS.primaryDark }}
  >
    {children}
  </h6>
);

export const AddSmsTemplate = ({
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

  useEffect(() => {
    const fetchData = async () => {
      if (editMode && initialData?.id) {
        try {
          const data = await fetchSmsTemplateById(initialData.id);
          setFormData({
            templateId: data.templateId || '',
            templateName: data.templateName || '',
            templateType: data.templateType || '',
            templateMessage: data.templateMessage || ''
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

  const handleInputChange = ({ target: { name, value } }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const { valid, errors: validationErrors } = validateSmsTemplateData(formData);
      setErrors(validationErrors);

      if (valid) {
        setApiError('');
        try {
          setIsButtonDisabled(true);
          const payload = {
            templateId: formData.templateId,
            templateName: formData.templateName,
            templateType: formData.templateType,
            templateMessage: formData.templateMessage,
            id: editMode ? initialData.id : undefined
          };
          const action = editMode ? updateSmsTemplate : addSmsTemplate;
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

  const remainingChars = 1024 - (formData.templateMessage?.length || 0);
  const placeholderCount = useMemo(
    () => countSmsPlaceholders(formData.templateMessage),
    [formData.templateMessage]
  );

  return (
    <>
      <ComponentHeader title="SMS Templates" />

      <style>{`
        .sms-form .form-control,
        .sms-form .form-select {
          border-color: ${SMS.border};
          border-radius: 8px;
          padding: 0.55rem 0.85rem;
          font-size: 0.92rem;
        }
        .sms-form .form-control:focus,
        .sms-form .form-select:focus {
          border-color: ${SMS.primary};
          box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.15);
        }
        .sms-form .form-control::placeholder { color: #A9A6A1; }
        .sms-form .form-control:disabled { background-color: ${SMS.surfaceMuted}; }
        .sms-form .form-label { font-size: 0.86rem; font-weight: 600; color: #333; margin-bottom: 0.4rem; }
        .sms-form textarea.form-control { resize: vertical; }
      `}</style>

      <div className="row g-3 sms-form">
        <div className="col-xxl-8 col-lg-7">
          <div className="card mt-xxl-n5 border-0 shadow-sm" style={{ borderRadius: SMS.radius }}>
            <div
              className="card-header bg-white py-3"
              style={{ borderTopLeftRadius: SMS.radius, borderTopRightRadius: SMS.radius, borderColor: SMS.border }}
            >
              <h5 className="mb-0 fw-semibold" style={{ color: SMS.primaryDark }}>
                {editMode ? 'Update Template' : 'Create Template'}
              </h5>
              <small className="text-muted">
                {editMode ? `Editing template #${initialData?.templateId}` : 'Build a reusable SMS template'}
              </small>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit} method="POST" noValidate>
                <SectionLabel>Identity</SectionLabel>
                <div className="row g-3 mb-4">
                  <div className="col-md-5">
                    <label htmlFor="templateId" className="form-label">
                      Template ID <span className="required-field">*</span>
                    </label>
                    <input
                      type="text"
                      name="templateId"
                      id="templateId"
                      placeholder="SMS-OFFER-01"
                      value={formData.templateId}
                      onChange={handleInputChange}
                      className={`form-control ${errors.templateId ? 'is-invalid' : ''}`}
                    />
                    {errors.templateId && <div className="invalid-feedback">{errors.templateId}</div>}
                  </div>

                <div className="col-md-5">
  <label htmlFor="templateName" className="form-label">
    Template Name <span className="required-field">*</span>
  </label>
  <input
    type="text"
    name="templateName"
    id="templateName"
    placeholder="e.g. lead_offer_notification - Sends OTP for login"
    value={formData.templateName}
    onChange={handleInputChange}
    className={`form-control ${errors.templateName ? 'is-invalid' : ''}`}
  />
  <small className="text-muted">You can include a short description here too</small>
  {errors.templateName && <div className="invalid-feedback">{errors.templateName}</div>}
</div>

                  <div className="col-md-5">
                    <label htmlFor="templateType" className="form-label">
                      Template Type <span className="required-field">*</span>
                    </label>
                    <input
                      type="text"
                      name="templateType"
                      id="templateType"
                      placeholder="e.g. Transactional"
                      value={formData.templateType}
                      onChange={handleInputChange}
                      className={`form-control ${errors.templateType ? 'is-invalid' : ''}`}
                    />
                    {errors.templateType && <div className="invalid-feedback">{errors.templateType}</div>}
                  </div>
                </div>

                <SectionLabel>Message</SectionLabel>
                <div className="row g-3 mb-4">
                  <div className="col-12">
                    <label htmlFor="templateMessage" className="form-label">
                      Message Body <span className="required-field">*</span>
                    </label>
                    <textarea
                      name="templateMessage"
                      id="templateMessage"
                      rows={8}
                      maxLength={1024}
                      placeholder="Dear {#var#}, your OTP for login is {#var#}..."
                      value={formData.templateMessage}
                      onChange={handleInputChange}
                      className={`form-control ${errors.templateMessage ? 'is-invalid' : ''}`}
                    />
                    <div className="d-flex justify-content-between align-items-center flex-wrap mt-2">
                      <small className="text-muted">
                        Use <code>{'{#var#}'}</code> for each dynamic value, in order
                      </small>
                      <div className="d-flex align-items-center gap-2">
                        <small
                          className="badge fw-normal"
                          style={{ background: '#EAEDFB', color: SMS.primaryDark, border: '1px solid #D3D9F5' }}
                        >
                          {placeholderCount} placeholder{placeholderCount !== 1 ? 's' : ''}
                        </small>
                        <small className={`text-muted ${remainingChars < 50 ? 'text-danger fw-semibold' : ''}`}>
                          {remainingChars} chars left
                        </small>
                      </div>
                    </div>
                    {errors.templateMessage && <div className="text-danger small mt-1">{errors.templateMessage}</div>}
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top" style={{ borderColor: SMS.border }}>
                  {editMode && (
                    <button type="button" onClick={handleAddNewClick} className="btn btn-outline-secondary px-4">
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn text-white px-4 fw-medium"
                    style={{ background: SMS.primary, borderColor: SMS.primary }}
                    disabled={isButtonDisabled}
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
            style={{ borderRadius: SMS.radius, position: 'sticky', top: 16 }}
          >
            <div
              className="card-header bg-white py-3"
              style={{ borderTopLeftRadius: SMS.radius, borderTopRightRadius: SMS.radius, borderColor: SMS.border }}
            >
              <h6 className="mb-0 fw-semibold" style={{ color: SMS.primaryDark }}>Preview</h6>
              <small className="text-muted">How this template renders as an SMS</small>
            </div>
            <div className="card-body d-flex align-items-center justify-content-center pt-4" style={{ minHeight: 220 }}>
              <div className="p-3 rounded-3 w-100 d-flex align-items-center" style={{ background: SMS.wallpaper, minHeight: 180 }}>
                <div
                  className="shadow-sm w-100"
                  style={{
                    background: SMS.bubble,
                    maxWidth: 280,
                    margin: '0 auto',
                    borderRadius: SMS.radiusSm,
                    fontSize: '0.85rem',
                    overflow: 'hidden'
                  }}
                >
                  <div className="p-3">
                    {formData.templateType && (
                      <div
                        className="badge fw-normal mb-2"
                        style={{ background: '#fff', color: SMS.primaryDark, border: `1px solid ${SMS.border}` }}
                      >
                        {formData.templateType}
                      </div>
                    )}
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {formData.templateMessage || (
                        <span className="text-muted fst-italic">Your message will appear here...</span>
                      )}
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