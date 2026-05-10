import React, { useState, useEffect, useCallback } from 'react';
import { createRole, updateRole, fetchRoleById } from '../../../services/roleService';
import { validateRoles } from '../../../utils/validation';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { handleErrors } from '../../../utils/errorHandler';
import ComponentHeader from '../../Common/OtherElements/ComponentHeader';

export const AddRoles = ({ editMode = false, initialData = {}, onSuccess, setSelectedPageGroup, setEditMode }) => {
  const [formData, setFormData] = useState({ roleName: '' });
  const [errors, setErrors] = useState({ roleName: '' });
  const [apiError, setApiError] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (editMode && initialData.id) {
        try {
          const data = await fetchRoleById(initialData.id);
          setFormData({ roleName: data.roleName || '' });
        } catch (error) {
          handleErrors(error);
        }
      } else {
        setFormData({ roleName: '' });
      }
    };
    fetchData();
  }, [editMode, initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const { valid, errors: validationErrors } = validateRoles(formData);
    setErrors(validationErrors);

    if (valid) {
      setApiError('');
      try {
        if (editMode) {
          setIsButtonDisabled(true);
          await updateRole({ ...formData, id: initialData.id });
          toast.success('Role updated successfully!');
          setIsButtonDisabled(false);
          setEditMode(false);
        } else {
          setIsButtonDisabled(true);
          await createRole(formData.roleName);
          toast.success('Role added successfully!');
          setIsButtonDisabled(false);
        }
        setFormData({ roleName: '' });
        if (onSuccess) onSuccess();
      } catch (error) {
        handleErrors(error);
        setIsButtonDisabled(false);
      }
    } else {
      console.error('Validation errors:', validationErrors);
    }
  }, [formData, editMode, initialData, onSuccess, setEditMode]);

  const handleAddNewClick = () => {
    setFormData({ roleName: '' });
    setErrors({ roleName: '' });
    setApiError('');
    setSelectedPageGroup(null);
    setEditMode(false);
  };

  return (
    <>
      <ComponentHeader title="Roles"/>
      <div className="row">
        <div className="col-xxl-12">
          <div className="card mt-xxl-n5">
            <div className="card-header">
              <h5 className="mb-sm-1 mt-sm-1">{editMode ? 'Update Role' : 'Add Role'}</h5>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit} method="POST">
                <div className="row">
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="mb-3">
                      <label htmlFor="role_name" className="form-label">Role Name <span className='required-field'>*</span></label>
                      <input
                        type="text"
                        name="roleName"
                        value={formData.roleName}
                        onChange={handleInputChange}
                        className={`form-control ${errors.roleName ? 'is-invalid' : ''}`}
                        placeholder='Enter Role Name'
                      />
                      {errors.roleName && <div className="invalid-feedback">{errors.roleName}</div>}
                    </div>
                  </div>
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
