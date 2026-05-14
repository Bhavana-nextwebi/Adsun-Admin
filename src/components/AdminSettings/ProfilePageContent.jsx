import React, { useEffect, useState } from "react";
import {
  updateProfilePage,
  fetchUserProfile,
} from "../../services/newUserService";
import allImages from "../../assets/images-import";
import ComponentHeader from "../Common/OtherElements/ComponentHeader";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { validateProfileForm } from "../../utils/validation";
import { handleErrors } from "../../utils/errorHandler";
import { toast } from "react-toastify";

export const ProfilePageContent = ({ onBack }) => {
  const [ownerUserId, setUserId] = useState("");
  const [ownerUserName, setUserName] = useState("");
  const [ownerUserRole, setOwnerUserRole] = useState("");
  const [ownerUserRoleId, setOwnerUserRoleId] = useState("");
  const [ownerEmailId, setOwnerEmailId] = useState("");
  const [ownerContactNo, setOwnerContactNo] = useState("");
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [currentProfileImage, setCurrentProfileImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        const amenityData = await fetchUserProfile();
        const profileData = amenityData.data.result;

        setUserId(profileData.userId);
        setUserName(profileData.userName);
        setOwnerUserRoleId(profileData.userRole);
        setOwnerUserRole(profileData.roleName);
        setOwnerEmailId(profileData.emailId);
        setOwnerContactNo(profileData.contactNo);
        setCurrentProfileImage(profileData.profileImage || null);
      } catch (error) {
        handleErrors(error);
      }
    };

    fetchOwnerData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateProfileForm(
      ownerUserId,
      ownerUserName,
      ownerUserRole,
      ownerEmailId,
      ownerContactNo
    );

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("UserId", ownerUserId);
      formData.append("UserName", ownerUserName);
      formData.append("UserRole", ownerUserRoleId);
      formData.append("EmailId", ownerEmailId);
      formData.append("ContactNo", ownerContactNo);

      if (ownerProfile) {
        formData.append("profileImage", ownerProfile);
      }
      setIsButtonDisabled(true);
      await updateProfilePage(formData);
      toast.success("Profile Updated Successfully");
      setIsButtonDisabled(false);
    } catch (error) {
      handleErrors(error);
      setIsButtonDisabled(false);
    }
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    setOwnerProfile(file);

    if (file) {
      const fileURL = URL.createObjectURL(file);
      setCurrentProfileImage(fileURL);
    } else {
      setCurrentProfileImage(null);
    }
  };

  const handlePhoneChange = (value) => {
    setOwnerContactNo(value);
  };

  return (
    <>
      <ComponentHeader title="Profile Page" />
      <div className="row">
        <div className="col-xxl-12">
          <div className="card mt-xxl-n5">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-lg-12">
                    <h1>My Profile</h1>
                    <div className="text-center">
                      <div className="profile-user position-relative d-inline-block mx-auto mb-4">
                        {currentProfileImage ? (
                          <img
                            src={currentProfileImage}
                            className="rounded-circle avatar-xl img-thumbnail user-profile-image shadow"
                            alt="user-profile-image"
                          />
                        ) : (
                          <img
                            src={allImages.defaultprofile}
                            className="rounded-circle avatar-xl img-thumbnail user-profile-image shadow"
                            alt="default-profile-image"
                          />
                        )}
                        <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                          <input
                            id="profileImage"
                            type="file"
                            className="profile-img-file-input"
                            onChange={handleProfileChange}
                          />
                          <label
                            htmlFor="profileImage"
                            className="profile-photo-edit avatar-xs"
                          >
                            <span className="avatar-title rounded-circle bg-light text-body shadow">
                              <i className="ri-camera-fill"></i>
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="mb-3">
                          <label htmlFor="userid" className="form-label">
                            User Id <span className="required-field">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={ownerUserId}
                            onChange={(e) => setUserId(e.target.value)}
                          />
                          {errors.userId && (
                            <small className="text-danger">
                              {errors.userId}
                            </small>
                          )}{" "}
                          {/* Show error */}
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="mb-3">
                          <label
                            htmlFor="owner_firstName"
                            className="form-label"
                          >
                            User Name <span className="required-field">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={ownerUserName}
                            onChange={(e) => setUserName(e.target.value)}
                          />
                          {errors.userName && (
                            <small className="text-danger">
                              {errors.userName}
                            </small>
                          )}{" "}
                          {/* Show error */}
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="mb-3">
                          <label htmlFor="UserRole" className="form-label">
                            User Role <span className="required-field">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={ownerUserRole}
                            disabled
                          />
                          {errors.userRole && (
                            <small className="text-danger">
                              {errors.userRole}
                            </small>
                          )}{" "}
                          {/* Show error */}
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="mb-3">
                          <label htmlFor="EmailId" className="form-label">
                            Email Address{" "}
                            <span className="required-field">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={ownerEmailId}
                            onChange={(e) => setOwnerEmailId(e.target.value)}
                          />
                          {errors.emailId && (
                            <small className="text-danger">
                              {errors.emailId}
                            </small>
                          )}{" "}
                          {/* Show error */}
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="mb-3">
                          <label htmlFor="contactNo" className="form-label">
                            Contact No <span className="required-field">*</span>
                          </label>
                          <PhoneInput
                            international
                            defaultCountry="IN"
                            value={ownerContactNo}
                            maxLength="15"
                            onChange={handlePhoneChange}
                          />
                          {errors.contactNo && (
                            <small className="text-danger">
                              {errors.contactNo}
                            </small>
                          )}{" "}
                          {/* Show error */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-start mt-4">
                  <button
                    type="submit"
                    className="btn btn-secondary"
                    disabled={isButtonDisabled}
                  >
                    Update
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
