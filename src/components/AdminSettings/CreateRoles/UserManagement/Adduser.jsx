import React, { useState, useEffect } from 'react';
import "react-toastify/dist/ReactToastify.css";
import "react-phone-number-input/style.css";
import { toast } from 'react-toastify';
import allImages from '../../../../assets/images-import';
import { validateNewUserForm } from '../../../../utils/validation';
import { addUser } from '../../../../services/newUserService';
import { fetchRoles } from '../../../../services/roleService';
import { handleErrors } from '../../../../utils/errorHandler';
import PhoneInput from 'react-phone-number-input';
import ComponentHeader from '../../../Common/OtherElements/ComponentHeader';
import { usePageLevelAccess } from '../../../../hooks/usePageLevelAccess';
import { useNavigate } from 'react-router-dom';

const InputField = ({ label, id, type = "text", value, onChange, error, placeholder, showError = true }) => (
  <div className="mb-3">
    <label htmlFor={id} className="form-label">{label} <span className='required-field'>*</span></label>
    <input
      type={type}
      className={`form-control ${error ? 'is-invalid' : ''}`}
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
    {error && <div className="invalid-feedback">{error}</div>}
  </div>
);

const ProfileImageUpload = ({ imageUrl, onFileChange }) => (
  <div className="text-center">
    <div className="profile-user position-relative d-inline-block mx-auto mb-4">
      <img
        src={imageUrl}
        className="rounded-circle avatar-xl img-thumbnail user-profile-image shadow"
        alt="user-profile"
      />
      <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
        <input id="profileImage" type="file" className="profile-img-file-input" onChange={onFileChange} />
        <label htmlFor="profileImage" className="profile-photo-edit avatar-xs">
          <span className="avatar-title rounded-circle bg-light text-body shadow">
            <i className="ri-camera-fill"></i>
          </span>
        </label>
      </div>
    </div>
  </div>
);

const AddUser = () => {
  const [formValues, setFormValues] = useState({
    UserName: '',
    UserId: '',
    UserRole: '',
    EmailId: '',
    ContactNo: '',
    owner_password: '',
    owner_confirm_password: '',
    profileImage: null,
  });

  const [formErrors, setFormErrors] = useState({});
  const [imageUrl, setImageUrl] = useState(allImages.defaultprofile);
  const [roles, setRoles] = useState([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const PageLevelAccessurl = 'user/add';
    const navigate = useNavigate();
    const { pageAccessData } = usePageLevelAccess(PageLevelAccessurl);

    useEffect(() => {
      if (pageAccessData) {
          if (!pageAccessData.addAccess || !pageAccessData.viewAccess) {
              navigate('/404-error-page');
          } else {
              return;
          }

      } else {
          console.log('No page access details found');
      }
  })

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  };

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const rolesData = await fetchRoles();
        setRoles(rolesData);
      } catch (error) {
        handleErrors(error);
      }
    };
    loadRoles();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormValues((prevState) => ({ ...prevState, [id]: value }));
  };

  const handlePhoneChange = (phone) => {
    setFormValues((prevState) => ({ ...prevState, ContactNo: phone }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newImageUrl = URL.createObjectURL(file);
      setImageUrl(newImageUrl);
      setFormValues((prevState) => ({ ...prevState, profileImage: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateNewUserForm(formValues);
    if (formValues.owner_password !== formValues.owner_confirm_password) {
      errors.owner_confirm_password = "Passwords do not match";
    }
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        setIsButtonDisabled(true);
        await addUser(formValues);
        toast.success("User added successfully!");
        setIsButtonDisabled(false);

        setFormValues({
          UserName: '',
          UserId: '',
          UserRole: '',
          EmailId: '',
          ContactNo: '',
          owner_password: '',
          owner_confirm_password: '',
          profileImage: null,
        });
        setImageUrl(allImages.defaultprofile);
      } catch (error) {
        handleErrors(error);
        setIsButtonDisabled(false);
      }
    }
  };

  return (
    <>
      <ComponentHeader title="Add User" />

      <div className="row">
        <div className="col-xxl-12">
          <div className="card mt-xxl-n5">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-sm-1 mt-sm-1">Add User</h5>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit} method="POST">
                <ProfileImageUpload imageUrl={imageUrl} onFileChange={handleFileChange} />

                <div className="row">
                  <div className="col-lg-4 col-md-6 col-sm-12">
                    <InputField
                      label="User Id"
                      id="UserId"
                      value={formValues.UserId}
                      onChange={handleInputChange}
                      error={formErrors.UserId}
                      placeholder="Enter your User Id"
                    />
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-12">
                    <InputField
                      label="User Name"
                      id="UserName"
                      value={formValues.UserName}
                      onChange={handleInputChange}
                      error={formErrors.UserName}
                      placeholder="Enter your User Name"
                    />
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-12">
                    <div className="mb-3">
                      <label htmlFor="UserRole" className="form-label">User Role <span className='required-field'>*</span></label>
                      <select
                        className={`form-select ${formErrors.UserRole ? 'is-invalid' : ''}`}
                        id="UserRole"
                        value={formValues.UserRole}
                        onChange={handleInputChange}
                      >
                        <option value="">Select User Role</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>{role.roleName}</option>
                        ))}
                      </select>
                      {formErrors.UserRole && <div className="invalid-feedback">{formErrors.UserRole}</div>}
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-12">
                    <InputField
                      label="Email Address"
                      id="EmailId"
                      value={formValues.EmailId}
                      onChange={handleInputChange}
                      error={formErrors.EmailId}
                      
                      placeholder="Enter Email Address"
                    />
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-12">
                    <div className="mb-3">
                      <label htmlFor="ContactNo" className="form-label">Phone Number <span className='required-field'>*</span></label>
                      <PhoneInput
                      international
                        id="ContactNo"
                        value={formValues.ContactNo}
                        onChange={handlePhoneChange}
                        defaultCountry='IN'
                        maxLength="15"
                        placeholder='Enter Phone Number'
                      />
                      {formErrors.ContactNo && <div style={{ color: '#dc3545' }}>{formErrors.ContactNo}</div>}
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-12">
                    <div style={{ position: 'relative' }}>
                      <InputField
                        label="Password"
                        id="owner_password"
                        type={isPasswordVisible ? 'text' : 'password'}
                        value={formValues.owner_password}
                        onChange={handleInputChange}
                        error={formErrors.owner_password}
                        placeholder="Enter Password"
                        // showError={false} 
                      />
                      
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className={formErrors ? 'view-hide-password-invalid' : 'viewhidePassword'}
                      >
                        <i className={`ri-${isPasswordVisible ? 'eye-line' : 'eye-off-line'}`}></i>
                      </button>
                     
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-12">
                    <div style={{ position: 'relative' }}>
                      <InputField
                        label="Confirm Password"
                        id="owner_confirm_password"
                        type={isConfirmPasswordVisible ? 'text' : 'password'}
                        value={formValues.owner_confirm_password}
                        onChange={handleInputChange}
                        error={formErrors.owner_confirm_password}
                        placeholder="Confirm Password"
                        // showError={false} 
                      />
                      
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className={formErrors ? 'view-hide-password-invalid' : 'viewhidePassword'}
                      >
                        <i className={`ri-${isConfirmPasswordVisible ? 'eye-line' : 'eye-off-line'}`}></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-start">
                  <button type="submit" className="btn btn-secondary" disabled={isButtonDisabled}>{isButtonDisabled ? 'Saving...' : 'Save'}</button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddUser;
