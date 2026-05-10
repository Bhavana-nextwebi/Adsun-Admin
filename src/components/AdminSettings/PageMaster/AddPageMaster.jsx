import React, { useState, useEffect, useCallback } from 'react';
import { createPageMaster, updatePageMaster, fetchPageMasterById } from '../../../services/pageMasterService';
import { getPageGroups } from '../../../services/pageGroupService';
import { validatePageMaster } from '../../../utils/validation';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { handleErrors } from '../../../utils/errorHandler';
import ComponentHeader from '../../Common/OtherElements/ComponentHeader';

export const AddPageMaster = ({ editMode = false, initialData = {}, onSuccess, setSelectedPageGroup, setEditMode }) => {
  const [formData, setFormData] = useState({
    pageGroup: '', 
    showInMenu: '', 
    pageName: '', 
    pageOrder: '',
    pageLink: '', 
    pageDesc: ''
  });

  const [errors, setErrors] = useState({});
  const [pageGroups, setPageGroups] = useState([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groups = await getPageGroups();
        setPageGroups(groups.data.result);
      } catch (error) {
        handleErrors(error);
      }
    };
    fetchGroups();
  }, []);

  const resetFormData = useCallback(() => {
    setFormData({ pageGroup: '', showInMenu: '', pageName: '',pageOrder: '', pageLink: '', pageDesc: '' });
    setErrors({});
    setSelectedPageGroup(null);
    setEditMode(false);
  }, [setSelectedPageGroup, setEditMode]);
  

  useEffect(() => {
    const fetchData = async () => {
      if (editMode && initialData.id) {
        try {
          const data = await fetchPageMasterById(initialData.id);
          setFormData({
            pageGroup: data.pageGroup || '',
            showInMenu: data.showInMenu || '',
            pageName: data.pageName || '',
            pageOrder: data.pageOrder || '',
            pageLink: data.pageLink || '',
            pageDesc: data.pageDesc || '',
          });
        } catch (error) {
          handleErrors(error);
        }
      } else {
        resetFormData();
      }
    };
    fetchData();
  }, [editMode, initialData, resetFormData]);
  

  const handleInputChange = ({ target: { name, value } }) => {
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };



  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const { valid, errors: validationErrors } = validatePageMaster(formData);
    setErrors(validationErrors);
  
    if (valid) {
      try {
        const formattedData = {
          ...formData,
          showInMenu: formData.showInMenu === 'true'
        };
  
        if (editMode) {
          setIsButtonDisabled(true);
          await updatePageMaster({ ...formattedData, id: initialData.id });
          toast.success('Page Master updated successfully!');
          setIsButtonDisabled(false);
        } else {
          setIsButtonDisabled(true);
          await createPageMaster(formattedData);
          toast.success('Page Master added successfully!');
          setIsButtonDisabled(false);
        }
  
        resetFormData();
        if (onSuccess) onSuccess();
      } catch (error) {
       handleErrors(error);
       setIsButtonDisabled(false);
      }
    }
  }, [formData, editMode, initialData, onSuccess, resetFormData]);
  

  return (
    <>
      <ComponentHeader title="Page Master"/>
      <div className="row">
        <div className="col-xxl-12">
          <div className="card mt-xxl-n5">
            <div className="card-header">
              <h5 className="mb-sm-1 mt-sm-1">{editMode ? 'Update Page Master' : 'Add Page Master'}</h5>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit} method="POST">
                <div className="row">
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="mb-3">
                      <label htmlFor="page_group" className="form-label">Page Group <span className='required-field'>*</span></label>
                      <select
                        id="page_group"
                        name="pageGroup"
                        value={formData.pageGroup}
                        onChange={handleInputChange}
                        className={`form-select ${errors.pageGroup ? 'is-invalid' : ''}`}
                      >
                        <option value="">Select Group</option>
                        {pageGroups.map((group) => (
                          <option key={group.id} value={group.id}>{group.groupName}</option>
                        ))}
                      </select>
                      {errors.pageGroup && <div className="invalid-feedback">{errors.pageGroup}</div>}
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="mb-3">
                      <label htmlFor="showInMenu" className="form-label">Show In Menu</label>
                      <select
                        id="showInMenu"
                        name="showInMenu"
                        value={formData.showInMenu}
                        onChange={handleInputChange}
                        className={`form-select ${errors.showInMenu ? 'is-invalid' : ''}`}
                      >
                        <option value="">Select Option</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                      {errors.showInMenu && <div className="invalid-feedback">{errors.showInMenu}</div>}
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="mb-3">
                      <label htmlFor="pageName" className="form-label">Page Name <span className='required-field'>*</span></label>
                      <input
                        type="text"
                        id="pageName"
                        name="pageName"
                        value={formData.pageName}
                        placeholder='Enter Page Name'
                        onChange={handleInputChange}
                        className={`form-control ${errors.pageName ? 'is-invalid' : ''}`}
                      />
                      {errors.pageName && <div className="invalid-feedback">{errors.pageName}</div>}
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="mb-3">
                      <label htmlFor="pageOrder" className="form-label">Page Order</label>
                      <input
                        type="text"
                        id="pageOrder"
                        name="pageOrder"
                        value={formData.pageOrder}
                        placeholder='Enter Page Order'
                        onChange={handleInputChange}
                        className={`form-control ${errors.pageOrder ? 'is-invalid' : ''}`}
                      />
                      {errors.pageOrder && <div className="invalid-feedback">{errors.pageOrder}</div>}
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="mb-3">
                      <label htmlFor="pageLink" className="form-label">Page Link <span className='required-field'>*</span></label>
                      <input
                        type="text"
                        id="pageLink"
                        name="pageLink"
                        value={formData.pageLink}
                        placeholder='Enter Page Link'
                        onChange={handleInputChange}
                        className={`form-control ${errors.pageLink ? 'is-invalid' : ''}`}
                      />
                      {errors.pageLink && <div className="invalid-feedback">{errors.pageLink}</div>}
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="mb-3">
                      <label htmlFor="pageDesc" className="form-label">Page Description</label>
                      <textarea
                        id="pageDesc"
                        name="pageDesc"
                        value={formData.pageDesc}
                        placeholder='Enter Page Description'
                        onChange={handleInputChange}
                        className={`form-control ${errors.pageDesc ? 'is-invalid' : ''}`}
                      />
                      {errors.pageDesc && <div className="invalid-feedback">{errors.pageDesc}</div>}
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12">
                    <button type="submit" className="btn btn-secondary" disabled={isButtonDisabled}>{isButtonDisabled ? (editMode ? 'Updating' : 'Saving') : (editMode ? 'Update' : 'Save')}</button>
                    {editMode && (
                      <button type="button" onClick={resetFormData} className="btn btn-danger ms-1 pt-1 pb-1 p-3">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
