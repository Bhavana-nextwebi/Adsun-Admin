import React, { useState, useEffect } from "react";
import { changePassword } from "../../services/newUserService";
import { toast, ToastContainer } from "react-toastify";
import { useDispatch } from "react-redux";
import { validatePasswords } from "../../utils/validation";
import { logoutUser } from "../../redux/auth/loginThunk";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";

export const ProfilePagePasswordReset = ({ onBack }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const handleLogout = async () => {
    await dispatch(logoutUser());
    Cookies.remove("accessToken");
    navigate("/auth/signin");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validatePasswords(
      currentPassword,
      newPassword,
      confirmPassword
    );
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const data = {
        currentPassword,
        newPassword,
      };
      setIsButtonDisabled(true);
      await changePassword(data);
      handleLogout();
      toast.success("Password updated successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      setIsButtonDisabled(false);
    } catch (error) {
      setIsButtonDisabled(false);
      toast.error("The current password does not match.", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error("Error updating password:", error);
    }
  };

  const validateNewPassword = (password) => {
    setPasswordRules({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  useEffect(() => {
    validateNewPassword(newPassword);
  }, [newPassword]);

  return (
    <>
      <ToastContainer />
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">Change Password</h4>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-xxl-6">
          <div className="card mt-xxl-n5">
            <div className="card-header">
              <h5 className="mb-sm-1 mt-sm-1">Update Password</h5>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-lg-12">
                    <div className="mb-3">
                      <label htmlFor="currentPassword" className="form-label">
                        Current Password{" "}
                        <span className="required-field">*</span>
                      </label>
                      <div className="input-group">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          className="form-control"
                          value={currentPassword}
                          placeholder="Enter Your Current Password"
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <span
                          className="input-group-text"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          style={{ cursor: "pointer" }}
                        >
                          <i
                            className={
                              showCurrentPassword
                                ? "ri-eye-line"
                                : "ri-eye-off-line"
                            }
                          />
                        </span>
                      </div>
                      {errors.currentPassword && (
                        <div className="text-danger">
                          {errors.currentPassword}
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="newPassword" className="form-label">
                        New Password <span className="required-field">*</span>
                      </label>
                      <div className="input-group">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          className="form-control"
                          value={newPassword}
                          placeholder="Enter Your New Password"
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <span
                          className="input-group-text"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={{ cursor: "pointer" }}
                        >
                          <i
                            className={
                              showNewPassword
                                ? "ri-eye-line"
                                : "ri-eye-off-line"
                            }
                          />
                        </span>
                      </div>
                      {errors.newPassword && (
                        <div className="text-danger">{errors.newPassword}</div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">
                        Confirm New Password
                      </label>
                      <div className="input-group">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="form-control"
                          value={confirmPassword}
                          placeholder="Confirm Your New Password"
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <span
                          className="input-group-text"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          style={{ cursor: "pointer" }}
                        >
                          <i
                            className={
                              showConfirmPassword
                                ? "ri-eye-line"
                                : "ri-eye-off-line"
                            }
                          />
                        </span>
                      </div>
                      {errors.confirmPassword && (
                        <div className="text-danger">
                          {errors.confirmPassword}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      type="submit"
                      className="btn btn-secondary me-2"
                      disabled={isButtonDisabled}
                    >
                      {isButtonDisabled ? "Updating.." : "Update Password"}
                    </button>
                  </div>
                  <div className="mt-4">
                    <h5 style={{ color: "#1f156d" }}>
                      New Password must meet the following criteria:
                    </h5>
                    <ul
                      style={{
                        listStyleType: "none",
                        padding: 0,
                        fontSize: "16px",
                      }}
                    >
                      <li
                        style={{
                          color: passwordRules.length ? "green" : "red",
                        }}
                      >
                        {passwordRules.length ? (
                          <i className="ri-check-line" />
                        ) : (
                          <i className="ri-error-warning-fill"></i>
                        )}{" "}
                        At least 8 characters long
                      </li>
                      <li
                        style={{
                          color: passwordRules.uppercase ? "green" : "red",
                        }}
                      >
                        {passwordRules.uppercase ? (
                          <i className="ri-check-line" />
                        ) : (
                          <i className="ri-error-warning-fill"></i>
                        )}{" "}
                        At least one uppercase letter
                      </li>
                      <li
                        style={{
                          color: passwordRules.lowercase ? "green" : "red",
                        }}
                      >
                        {passwordRules.lowercase ? (
                          <i className="ri-check-line" />
                        ) : (
                          <i className="ri-error-warning-fill"></i>
                        )}{" "}
                        At least one lowercase letter
                      </li>
                      <li
                        style={{
                          color: passwordRules.number ? "green" : "red",
                        }}
                      >
                        {passwordRules.number ? (
                          <i className="ri-check-line" />
                        ) : (
                          <i className="ri-error-warning-fill"></i>
                        )}{" "}
                        At least one number
                      </li>
                      <li
                        style={{
                          color: passwordRules.specialChar ? "green" : "red",
                        }}
                      >
                        {passwordRules.specialChar ? (
                          <i className="ri-check-line" />
                        ) : (
                          <i className="ri-error-warning-fill"></i>
                        )}{" "}
                        At least one special character (e.g., !@#$%^&*)
                      </li>
                    </ul>
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
