import React, { useEffect, useState } from 'react';
import {
  fetchAllSmsTemplates,
  deleteSmsTemplate
} from '../../services/smsTemplateService';
import { paginateData, calculateTotalPages } from '../../assets/js/script';
import EntriesDropdown from '../Common/TableComponent/EntriesDropdown';
import { Pagination } from '../Common/TableComponent/Pagination';
import { AddSmsTemplate } from './AddSmsTemplate';
import { Loading } from '../Common/OtherElements/Loading';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { confirmDelete } from '../Common/OtherElements/confirmDeleteClone';
import { TableDataStatusError } from '../Common/OtherElements/TableDataStatusError';
import { handleErrors } from '../../utils/errorHandler';
import { usePageLevelAccess } from '../../hooks/usePageLevelAccess';

// ---------------------------------------------------------------------------
// Shared design tokens (kept identical to AddSmsTemplate.jsx so the create
// form and the list share one visual language).
// ---------------------------------------------------------------------------
const SMS = {
  primary: '#4A6CF7',
  primaryDark: '#33459B',
  bubble: '#F1F3FB',
  wallpaper: '#EDEFF7',
  border: '#E6E4E1',
  radius: 12,
  radiusSm: 8
};

// templateType is a free-text field (no fixed set of values), so the list
// just shows it as a neutral badge rather than mapping known values to
// specific colors.

export const ManageSmsTemplate = () => {
  const [pageAccessDetails, setPageAccessDetails] = useState([]);
  const PageLevelAccessurl = 'sms-template-master';
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
      const response = await fetchAllSmsTemplates();
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
      (item?.templateType || '').toLowerCase().includes(q)
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

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete('Template');
    if (confirmed) {
      try {
        await deleteSmsTemplate(id);
        setTemplates((prev) => prev.filter((item) => item.id !== id));
        Swal.fire('Deleted!', 'The template has been deleted successfully.', 'success');
      } catch (error) {
        handleErrors(error);
      }
    }
  };

  return (
    <>
      <style>{`
        .sms-template-table tbody tr:last-child { border-bottom: none !important; }
        .sms-template-table tbody tr:hover { background: #FAFAF9; }
        .sms-template-table thead tr.sms-thead-row th {
          background-color: ${SMS.primaryDark} !important;
          color: #ffffff !important;
          border: none !important;
          box-shadow: none !important;
        }
        .sms-template-table table { border-collapse: separate !important; border-spacing: 0; }
        .sms-icon-btn {
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid ${SMS.border};
          background: #fff;
          transition: background .15s ease, border-color .15s ease;
        }
        .sms-icon-btn i { font-size: 1rem; line-height: 1; }
        .sms-icon-btn:hover { background: #F7F7F6; border-color: #D8D6D2; }
        .sms-icon-btn.text-primary i { color: #0d6efd; }
        .sms-icon-btn.text-danger i { color: #dc3545; }
      `}</style>
      {pageAccessDetails.addAccess ? (
        <AddSmsTemplate
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
            <div className="card border-0 shadow-sm" style={{ borderRadius: SMS.radius }}>
              <div
                className="card-header bg-white py-3 d-flex align-items-center justify-content-between flex-wrap gap-2"
                style={{ borderTopLeftRadius: SMS.radius, borderTopRightRadius: SMS.radius, borderColor: SMS.border }}
              >
                <div>
                  <h5 className="mb-0 fw-semibold" style={{ color: SMS.primaryDark }}>Manage SMS Templates</h5>
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
                    placeholder="Search by name, ID or type..."
                    className="form-control"
                    style={{ paddingLeft: '2.1rem' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="card-body">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 pb-3 border-bottom" style={{ borderColor: SMS.border }}>
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
                    className="table-responsive sms-template-table"
                    style={{ border: `1px solid ${SMS.border}`, borderRadius: SMS.radiusSm, overflow: 'hidden' }}
                  >
                    <table className="table align-middle mb-0">
                      <thead>
                        <tr className="sms-thead-row">
                          {['#', 'Template ID', 'Name', 'Type', 'Action'].map((col, i, arr) => (
                            <th
                              key={col}
                              className="fw-semibold text-uppercase"
                              style={{
                                fontSize: '0.7rem',
                                letterSpacing: '.04em',
                                padding: '0.85rem 1rem',
                                borderTopLeftRadius: i === 0 ? SMS.radiusSm : 0,
                                borderTopRightRadius: i === arr.length - 1 ? SMS.radiusSm : 0
                              }}
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="manage-page-group-table-values">
                        {currentData.length === 0 ? (
                          <TableDataStatusError colspan="5" />
                        ) : (
                          currentData.map((item, index) => (
                            <tr key={item.id} style={{ borderBottom: `1px solid ${SMS.border}` }}>
                              <td className="text-muted" style={{ padding: '0.85rem 1rem' }}>
                                {(currentPage - 1) * entriesPerPage + index + 1}
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <span
                                  className="font-monospace small px-2 py-1"
                                  style={{ background: '#F7F7F6', border: `1px solid ${SMS.border}`, borderRadius: 6 }}
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
                                  style={{ color: SMS.primaryDark }}
                                >
                                  {item.templateName}
                                </button>
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <span className="badge bg-light text-dark border fw-normal">
                                  {item.templateType}
                                </span>
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <div className="d-flex gap-2">
                                  <button
                                    type="button"
                                    className="sms-icon-btn"
                                    onClick={() => setPreviewTemplate(item)}
                                    title="Preview"
                                  >
                                    <i className="ri-eye-line text-muted" />
                                  </button>
                                  {pageAccessDetails.editAccess !== false && (
                                    <button
                                      type="button"
                                      className="sms-icon-btn text-primary"
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
                                      className="sms-icon-btn text-danger"
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
          <div className="modal-body p-4" style={{ background: SMS.wallpaper }}>
            <div
              className="shadow-sm"
              style={{ background: SMS.bubble, maxWidth: 320, margin: '0 auto', borderRadius: SMS.radiusSm, overflow: 'hidden' }}
            >
              <div className="p-3">
                {previewTemplate.templateType && (
                  <div
                    className="badge fw-normal mb-2"
                    style={{ background: '#fff', color: SMS.primaryDark, border: `1px solid ${SMS.border}` }}
                  >
                    {previewTemplate.templateType}
                  </div>
                )}
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                  {previewTemplate.templateMessage}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};