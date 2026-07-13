import React, { useEffect, useState } from 'react';
import {
  fetchAllWhatsappTemplates,
  deleteWhatsappTemplate
} from '../../services/whatsappTemplateService';
import { paginateData, calculateTotalPages } from '../../assets/js/script';
import EntriesDropdown from '../Common/TableComponent/EntriesDropdown';
import { Pagination } from '../Common/TableComponent/Pagination';
import { AddWhatsappTemplate } from './AddWhatsappTemplate';
import { Loading } from '../Common/OtherElements/Loading';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { confirmDelete } from '../Common/OtherElements/confirmDeleteClone';
import { TableDataStatusError } from '../Common/OtherElements/TableDataStatusError';
import { handleErrors } from '../../utils/errorHandler';
import { usePageLevelAccess } from '../../hooks/usePageLevelAccess';

// ---------------------------------------------------------------------------
// Shared design tokens (kept identical to AddWhatsappTemplate.jsx so the
// create form and the list share one visual language).
// ---------------------------------------------------------------------------
const WA = {
  green: '#25D366',
  teal: '#075E54',
  bubble: '#DCF8C6',
  wallpaper: '#E5DDD5',
  border: '#E6E4E1',
  radius: 12,
  radiusSm: 8
};

const CATEGORY_BADGE_CLASS = {
  Marketing: 'bg-info-subtle text-info',
  Utility: 'bg-warning-subtle text-warning',
  Authentication: 'bg-success-subtle text-success'
};

const STATUS_BADGE_CLASS = {
  Active: 'bg-success-subtle text-success',
  Inactive: 'bg-secondary-subtle text-secondary',
  Pending: 'bg-warning-subtle text-warning',
  Rejected: 'bg-danger-subtle text-danger'
};

const STATUS_DOT_COLOR = {
  Active: '#198754',
  Inactive: '#6c757d',
  Pending: '#ffc107',
  Rejected: '#dc3545'
};

export const ManageWhatsappTemplate = () => {
  const [pageAccessDetails, setPageAccessDetails] = useState([]);
  const PageLevelAccessurl = 'whatsapp-template-master';
  const navigate = useNavigate();
  const { pageAccessData } = usePageLevelAccess(PageLevelAccessurl);

  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState(null);

  useEffect(() => {
    if (pageAccessData) {
      if (!pageAccessData.addAccess && !pageAccessData.viewAccess) {
        navigate('/404-error-page');
      } else {
        setPageAccessDetails(pageAccessData);
      }
    }
  }, [pageAccessData, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetchAllWhatsappTemplates();
      setTemplates(response.data.result);
    } catch (error) {
      handleErrors(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = templates.filter((item) => {
    const q = (searchQuery || '').toLowerCase();
    return (
      (item?.templateName || '').toLowerCase().includes(q) ||
      (item?.templateId || '').toLowerCase().includes(q) ||
      (item?.category || '').toLowerCase().includes(q)
    );
  });

  const currentData = paginateData(filteredData, currentPage, entriesPerPage);
  const totalPages = calculateTotalPages(filteredData.length, entriesPerPage);

  const handleEntriesChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleDelete = async (templateId) => {
    const confirmed = await confirmDelete('Template');
    if (confirmed) {
      try {
        await deleteWhatsappTemplate(templateId);
        setTemplates((prev) => prev.filter((item) => item.id !== templateId));
        Swal.fire('Deleted!', 'The template has been deleted successfully.', 'success');
      } catch (error) {
        handleErrors(error);
      }
    }
  };

  return (
    <>
      <style>{`
        .wa-template-table tbody tr:last-child { border-bottom: none !important; }
        .wa-template-table tbody tr:hover { background: #FAFAF9; }
        .wa-template-table thead tr.wa-thead-row th {
          background-color: ${WA.teal} !important;
          color: #ffffff !important;
          border: none !important;
          box-shadow: none !important;
        }
        .wa-template-table table { border-collapse: separate !important; border-spacing: 0; }
        .wa-icon-btn {
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid ${WA.border};
          background: #fff;
          transition: background .15s ease, border-color .15s ease;
        }
        .wa-icon-btn i { font-size: 1rem; line-height: 1; }
        .wa-icon-btn:hover { background: #F7F7F6; border-color: #D8D6D2; }
        .wa-icon-btn.text-primary i { color: #0d6efd; }
        .wa-icon-btn.text-danger i { color: #dc3545; }
      `}</style>
      {pageAccessDetails.addAccess ? (
        <AddWhatsappTemplate
          editMode={editMode}
          initialData={selectedTemplate}
          onSuccess={fetchData}
          setSelectedTemplate={setSelectedTemplate}
          setEditMode={setEditMode}
        />
      ) : (
        ''
      )}

      {pageAccessDetails.viewAccess ? (
        <div className="row mt-4">
          <div className="col-xxl-12">
            <div className="card border-0 shadow-sm" style={{ borderRadius: WA.radius }}>
              <div
                className="card-header bg-white py-3 d-flex align-items-center justify-content-between flex-wrap gap-2"
                style={{ borderTopLeftRadius: WA.radius, borderTopRightRadius: WA.radius, borderColor: WA.border }}
              >
                <div>
                  <h5 className="mb-0 fw-semibold" style={{ color: WA.teal }}>Manage WhatsApp Templates</h5>
                  <small className="text-muted">
                    {templates.length} template{templates.length !== 1 ? 's' : ''} total
                  </small>
                </div>
                <div className="position-relative" style={{ maxWidth: 280, width: '100%' }}>
                  <i
                    className="ri-search-line position-absolute text-muted"
                    style={{ left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Search by name, ID or category..."
                    className="form-control"
                    style={{ paddingLeft: '2.1rem' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="card-body">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 pb-3 border-bottom" style={{ borderColor: WA.border }}>
                  <EntriesDropdown
                    entriesPerPage={entriesPerPage}
                    onEntriesChange={handleEntriesChange}
                  />
                  <small className="text-muted">
                    Showing {currentData.length} of {filteredData.length} result{filteredData.length !== 1 ? 's' : ''}
                  </small>
                </div>

                {loading ? (
                  <Loading />
                ) : (
                  <div
                    className="table-responsive wa-template-table"
                    style={{ border: `1px solid ${WA.border}`, borderRadius: WA.radiusSm, overflow: 'hidden' }}
                  >
                    <table className="table align-middle mb-0">
                      <thead>
                        <tr className="wa-thead-row">
                          {['#', 'Template ID', 'Name', 'Language', 'Category', 'Status', 'Action'].map((col, i, arr) => (
                            <th
                              key={col}
                              className="fw-semibold text-uppercase"
                              style={{
                                fontSize: '0.7rem',
                                letterSpacing: '.04em',
                                padding: '0.85rem 1rem',
                                borderTopLeftRadius: i === 0 ? WA.radiusSm : 0,
                                borderTopRightRadius: i === arr.length - 1 ? WA.radiusSm : 0
                              }}
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="manage-page-group-table-values">
                        {currentData.length === 0 ? (
                          <TableDataStatusError colspan="7" />
                        ) : (
                          currentData.map((item, index) => (
                            <tr key={item.id} style={{ borderBottom: `1px solid ${WA.border}` }}>
                              <td className="text-muted" style={{ padding: '0.85rem 1rem' }}>
                                {(currentPage - 1) * entriesPerPage + index + 1}
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <span
                                  className="font-monospace small px-2 py-1"
                                  style={{ background: '#F7F7F6', border: `1px solid ${WA.border}`, borderRadius: 6 }}
                                >
                                  #{item.templateId}
                                </span>
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <button
                                  type="button"
                                  className="btn btn-link p-0 text-decoration-none fw-medium"
                                  onClick={() => setPreviewTemplate(item)}
                                  title="Preview template"
                                  style={{ color: WA.teal }}
                                >
                                  {item.templateName}
                                </button>
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <span className="badge bg-light text-dark border fw-normal">{item.languageCode}</span>
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <span
                                  className={`badge ${
                                    CATEGORY_BADGE_CLASS[item.category] || 'bg-secondary-subtle text-secondary'
                                  }`}
                                >
                                  {item.category}
                                </span>
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <span
                                  className={`badge d-inline-flex align-items-center gap-1 ${
                                    STATUS_BADGE_CLASS[item.status] || 'bg-secondary-subtle text-secondary'
                                  }`}
                                >
                                  <span
                                    className="rounded-circle d-inline-block"
                                    style={{
                                      width: 6,
                                      height: 6,
                                      background: STATUS_DOT_COLOR[item.status] || '#6c757d'
                                    }}
                                  />
                                  {item.status || 'Unknown'}
                                </span>
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <div className="d-flex gap-2">
                                  <button
                                    type="button"
                                    className="wa-icon-btn"
                                    onClick={() => setPreviewTemplate(item)}
                                    title="Preview"
                                  >
                                    <i className="ri-eye-line text-muted" />
                                  </button>
                                  {pageAccessDetails.editAccess !== false && (
                                    <button
                                      type="button"
                                      className="wa-icon-btn text-primary"
                                      onClick={() => {
                                        setSelectedTemplate(item);
                                        setEditMode(true);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                      }}
                                      title="Edit"
                                    >
                                      <i className="ri-edit-line" />
                                    </button>
                                  )}
                                  {pageAccessDetails.deleteAccess !== false && (
                                    <button
                                      type="button"
                                      className="wa-icon-btn text-danger"
                                      onClick={() => handleDelete(item.id)}
                                      title="Delete"
                                    >
                                      <i className="ri-delete-bin-line" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mt-3">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalEntries={filteredData.length}
                    entriesPerPage={entriesPerPage}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ''
      )}

      {previewTemplate && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setPreviewTemplate(null)}
        >
        <div className="modal-body p-4" style={{ background: WA.wallpaper }}>
                <div
                  className="shadow-sm"
                  style={{ background: WA.bubble, maxWidth: 320, margin: '0 auto', borderRadius: WA.radiusSm, overflow: 'hidden' }}
                >
                  <div className="p-3">
                    {previewTemplate.headerType && previewTemplate.headerType !== 'None' && (
                      <div className="fw-bold mb-2">
                        {previewTemplate.headerType === 'Text' ? (
                          previewTemplate.headerValue
                        ) : previewTemplate.headerType === 'Location' ? (
                          <span className="text-muted fst-italic">Location</span>
                        ) : (
                          <span className="text-muted fst-italic">{previewTemplate.headerType}</span>
                        )}
                      </div>
                    )}
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                      {previewTemplate.message}
                    </div>
                    {previewTemplate.footer && (
                      <div className="text-muted mt-2" style={{ fontSize: '0.8em' }}>
                        {previewTemplate.footer}
                      </div>
                    )}
                  </div>

                  {Array.isArray(previewTemplate.buttons) && previewTemplate.buttons.length > 0 && (
                    <div className="px-2 pb-2">
                      {previewTemplate.buttons.map((btn, i) => (
                        <div
                          key={i}
                          className="text-center fw-medium"
                          style={{
                            borderTop: '1px solid rgba(0,0,0,0.08)',
                            padding: '0.5rem 0',
                            fontSize: '0.82rem',
                            color: '#00A5F4'
                          }}
                        >
                          {btn.type === 'URL' && <i className="ri-external-link-line me-1" />}
                          {btn.type === 'PHONE_NUMBER' && <i className="ri-phone-line me-1" />}
                          {btn.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
        </div>
      )}
    </>
  );
};