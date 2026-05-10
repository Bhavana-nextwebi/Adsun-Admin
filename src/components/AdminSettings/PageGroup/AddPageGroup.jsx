import React, { useState, useEffect, useCallback } from 'react';
import { addPageGroup, updatePageGroup, fetchPageGroupData } from '../../../services/pageGroupService';
import { validateAddPageGroup } from '../../../utils/validation';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { handleErrors } from '../../../utils/errorHandler';
import ComponentHeader from '../../Common/OtherElements/ComponentHeader';

const INITIAL_FORM_STATE = {
  groupName: '',
  groupIcon: '',
  groupOrder: '',
};

const INITIAL_ERRORS_STATE = {
  groupName: '',
  groupIcon: '',
  groupOrder: '',
};

export const AddPageGroup = ({ editMode = false, initialData = {}, onSuccess, setSelectedPageGroup, setEditMode }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState(INITIAL_ERRORS_STATE);
  const [apiError, setApiError] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (editMode && initialData.id) {
        try {
          const data = await fetchPageGroupData(initialData.id);
          setFormData({
            groupName: data.groupName || '',
            groupIcon: data.groupIcon || '',
            groupOrder: data.groupOrder || '',
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
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const { valid, errors: validationErrors } = validateAddPageGroup(formData);
    setErrors(validationErrors);
  
    if (valid) {
      setApiError('');
      try {
        setIsButtonDisabled(true);
        const action = editMode ? updatePageGroup : addPageGroup;
        await action({ ...formData, id: editMode ? initialData.id : undefined });
        toast.success(`Page group ${editMode ? 'updated' : 'added'} successfully!`);
        setIsButtonDisabled(false);
        
        setFormData(INITIAL_FORM_STATE);
        if (onSuccess) {
          onSuccess();
        }
        setEditMode(false);
      } catch (error) {
        handleErrors(error);
        setIsButtonDisabled(false);
      }
    }
  }, [formData, editMode, initialData, onSuccess, setEditMode]);

  const handleAddNewClick = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors(INITIAL_ERRORS_STATE);
    setApiError('');
    setSelectedPageGroup(null);
    setEditMode(false);
  };

  return (
    <>
      <ComponentHeader title="Page Group"/>

      <div className="row">
        <div className="col-xxl-12">
          <div className="card mt-xxl-n5">
            <div className="card-header">
              <h5 className="mb-sm-1 mt-sm-1">{editMode ? 'Update Page Group' : 'Add Page Group'}</h5>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit} method="POST">
                <div className="row">
                  {['groupName', 'groupIcon', 'groupOrder'].map((field, index) => (
                    <div className="col-lg-3 col-md-4 col-sm-12" key={field}>
                      <div className="mb-3">
                        <label htmlFor={field} className="form-label">{field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}  <span className='required-field'>*</span></label>
                        <input
                          type={field === 'groupOrder' ? 'number' : 'text'}
                          name={field}
                          placeholder={`Enter ${field}`}
                          value={formData[field]}
                          onChange={handleInputChange}
                          className={`form-control ${errors[field] ? 'is-invalid' : ''}`}
                        />
                        {errors[field] && <div className="invalid-feedback">{errors[field]}</div>}
                      </div>
                    </div>
                  ))}
                  <div className="col-lg-12">
                    <div>
                      <button type="submit" className="btn btn-secondary pt-1 pb-1 p-3" disabled={isButtonDisabled}>{isButtonDisabled ? (editMode ? 'Updating' : 'Saving') : (editMode ? 'Update' : 'Save')}</button>
                      {editMode && (
                        <button type="button" onClick={handleAddNewClick} className="btn btn-danger ms-1 pt-1 pb-1 p-3">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {apiError && <div className="alert alert-danger">{apiError}</div>}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

