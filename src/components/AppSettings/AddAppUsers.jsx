import React, { useState, useEffect } from 'react';
import "react-toastify/dist/ReactToastify.css";
import "react-phone-number-input/style.css";
import { toast, ToastContainer } from 'react-toastify';
import allImages from '../../assets/images-import';
import { validateAppUserForm, validateAppUserUpdate } from '../../utils/validation';
import { addAppUser, updateAppUser, fetchAppUserById } from '../../services/appUserServices';
import { handleErrors } from '../../utils/errorHandler';
import PhoneInput from 'react-phone-number-input';
import ComponentHeader from '../Common/OtherElements/ComponentHeader';
import { usePageLevelAccess } from '../../hooks/usePageLevelAccess';
import { useNavigate, useParams } from 'react-router-dom';

const InputField = ({ label, id, type = "text", value, onChange, error, placeholder }) => (
  <div className="mb-3">
    <label htmlFor={id} className="form-label">
      {label} <span className='required-field'>*</span>
    </label>
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

const AddAppUser = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formValues, setFormValues] = useState({
    FirstName: '',
    LastName: '',
    EmailId: '',
    MobileNo: '',
    Password: '',
    Confirm_Password: '',
    profileImage: null,
  });

  const [formErrors, setFormErrors] = useState({});
  const [imageUrl, setImageUrl] = useState(allImages.defaultprofile);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const PageLevelAccessurl = isEditMode ? 'app-user/update' : 'app-user/add';
  const navigate = useNavigate();
  const { pageAccessData } = usePageLevelAccess(PageLevelAccessurl);

  useEffect(() => {
    if (pageAccessData) {
      const hasAccess = isEditMode
        ? pageAccessData.editAccess && pageAccessData.viewAccess
        : pageAccessData.addAccess && pageAccessData.viewAccess;
      if (!hasAccess) navigate('/404-error-page');
    }
  }, [pageAccessData, navigate, isEditMode]);

  useEffect(() => {
    if (!isEditMode) return;
    const loadUser = async () => {
      try {
        const userData = await fetchAppUserById(id);
        console.log(userData);
        if (userData) {
          setFormValues(prev => ({
            ...prev,
            FirstName: userData.firstName || '',
            LastName: userData.lastName || '',
            EmailId: userData.emailId || '',
            MobileNo: userData.mobileNo || '',
            
          }));
          if (userData.proFileImage) 
            setImageUrl(`https://4.nxtai.dev/${userData.proFileImage.replace(/^\/+/, "")}`);
        }
      } catch (error) {
        handleErrors(error);
      }
    };
    loadUser();
  }, [id, isEditMode]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormValues(prev => ({ ...prev, [id]: value }));
  };

  const handlePhoneChange = (value) => {
  setFormValues(prev => ({
    ...prev,
    MobileNo: value ?? '' 
  }));
};

 const handleFileChange = (e) => {
  const file = e.target.files[0];

  if (file) {
    setImageUrl(URL.createObjectURL(file));

    setFormValues(prev => ({
      ...prev,
      profileImage: file,
    }));
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = isEditMode
      ? validateAppUserUpdate(formValues)
      : validateAppUserForm(formValues);

    if (!isEditMode && formValues.Password !== formValues.Confirm_Password) {
      errors.Confirm_Password = "Passwords do not match";
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setIsButtonDisabled(true);

      if (isEditMode) {
        await updateAppUser({
          Id: Number(id),
          FirstName: formValues.FirstName,
          LastName: formValues.LastName,
          EmailId: formValues.EmailId,
          MobileNo: formValues.MobileNo,
          proFileImage: formValues.profileImage,
        });
        toast.success("User updated successfully!");
      } else {
        await addAppUser(formValues);
        toast.success("User added successfully!");
        setFormValues({
          FirstName: '',
          LastName: '',
          EmailId: '',
          MobileNo: '',
          Password: '',
          Confirm_Password: '',
          proFileImage: null,
        });
        setImageUrl(allImages.defaultprofile);
      }
    } catch (error) {
      handleErrors(error);
    } finally {
      setIsButtonDisabled(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <ComponentHeader title={isEditMode ? "Update App User" : "Add App User"} />
      <div className="row">
        <div className="col-xxl-12">
          <div className="card mt-xxl-n5">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-sm-1 mt-sm-1">
                {isEditMode ? "Update App User" : "Add App User"}
              </h5>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <ProfileImageUpload imageUrl={imageUrl} onFileChange={handleFileChange} />
                <div className="row">

                  <div className="col-lg-4 col-md-6 col-sm-12">
                    <InputField
                      label="First Name"
                      id="FirstName"
                      value={formValues.FirstName}
                      onChange={handleInputChange}
                      error={formErrors.FirstName}
                      placeholder="Enter First Name"
                    />
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-12">
                    <InputField
                      label="Last Name"
                      id="LastName"
                      value={formValues.LastName}
                      onChange={handleInputChange}
                      error={formErrors.LastName}
                      placeholder="Enter Last Name"
                    />
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
                      <label htmlFor="MobileNo" className="form-label">
                        Phone Number <span className='required-field'>*</span>
                      </label>
                      <PhoneInput
                        international
                        id="MobileNo"
                        value={formValues.MobileNo}
                        onChange={handlePhoneChange}
                        defaultCountry='IN'
                        maxLength="15"
                        placeholder='Enter Phone Number'
                      />
                      {formErrors.MobileNo && (
                        <div style={{ color: '#dc3545' }}>{formErrors.MobileNo}</div>
                      )}
                    </div>
                  </div>

                  {!isEditMode && (
                    <>
                      <div className="col-lg-4 col-md-6 col-sm-12">
                        <div style={{ position: 'relative' }}>
                          <InputField
                            label="Password"
                            id="Password"
                            type={isPasswordVisible ? 'text' : 'password'}
                            value={formValues.Password}
                            onChange={handleInputChange}
                            error={formErrors.Password}
                            placeholder="Enter Password"
                          />
                          <button
                            type="button"
                            onClick={() => setIsPasswordVisible(v => !v)}
                            className={formErrors.Password ? 'view-hide-password-invalid' : 'viewhidePassword'}
                          >
                            <i className={`ri-${isPasswordVisible ? 'eye-line' : 'eye-off-line'}`}></i>
                          </button>
                        </div>
                      </div>

                      <div className="col-lg-4 col-md-6 col-sm-12">
                        <div style={{ position: 'relative' }}>
                          <InputField
                            label="Confirm Password"
                            id="Confirm_Password"
                            type={isConfirmPasswordVisible ? 'text' : 'password'}
                            value={formValues.Confirm_Password}
                            onChange={handleInputChange}
                            error={formErrors.Confirm_Password}
                            placeholder="Confirm Password"
                          />
                          <button
                            type="button"
                            onClick={() => setIsConfirmPasswordVisible(v => !v)}
                            className={formErrors.Confirm_Password ? 'view-hide-password-invalid' : 'viewhidePassword'}
                          >
                            <i className={`ri-${isConfirmPasswordVisible ? 'eye-line' : 'eye-off-line'}`}></i>
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                </div>
                <div className="text-start">
                  <button
                    type="submit"
                    className="btn btn-secondary"
                    disabled={isButtonDisabled}
                  >
                    {isButtonDisabled ? 'Saving...' : isEditMode ? 'Update' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddAppUser;