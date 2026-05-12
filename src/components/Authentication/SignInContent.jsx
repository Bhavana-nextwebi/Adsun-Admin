import React, { useState } from "react";
import Cookies from "js-cookie";
import allImages from "../../assets/images-import.jsx";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../Interceptors/axiosInstance.jsx";

export const SignInContent = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [keepLogged, setKeepLogged] = useState(false);
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const redirectAfterLogin = localStorage.getItem("redirectAfterLogin");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }
    setError("");

    const loginData = {
      userName: username,
      password: password,
      keepLogged: keepLogged ? "true" : "false",
    };

    try {
      setIsButtonDisabled(true);
      const response = await axiosInstance.post("auth/login", loginData, {
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
      });
      setIsButtonDisabled(false);

      if (!response.data) {
        throw new Error("Login failed");
      }

      const data = response.data.result;

      Cookies.set("accessToken", data.accessToken, { expires: 1 });
      Cookies.set("refreshToken", data.refreshToken, { expires: 7 });

      if (redirectAfterLogin) {
        navigate(redirectAfterLogin);
        localStorage.removeItem("redirectAfterLogin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setIsButtonDisabled(false);
      console.error("Error during login:", error);
      setError("Login failed. Please check your credentials and try again.");
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prevState) => !prevState);
  };

  return (
    <>
      <style>
        {`
                   .form-check-input:checked {
    background-color: #282059 !important;
    border-color: #282059 !important;
}
                `}
      </style>

      <div className="auth-page-wrapper auth-bg-cover py-5 d-flex justify-content-center align-items-center min-vh-100">
        <div className="auth-page-content overflow-hidden pt-lg-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div
                  className="card overflow-hidden"
                  style={{ boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px" }}
                >
                  <div className="row g-0 aligning-item">
                    <div className="col-lg-6">
                      <div
                        className="p-lg-5 p-4 auth-one-bg"
                        style={{
                          backgroundImage: `url(${allImages.LocationTrackNew})`,
                          backgroundPosition: "center",
                          opacity: 0.9,
                          height: "540px",
                          backgroundRepeat: "no-repeat",
                          backgroundSize:"cover"
                        }}
                      ></div>
                    </div>

                    <div className="col-lg-6">
                      <div className="card-body p-md-5 mx-md-4">
                        <div className="text-center mt-2 mb-2">
                          <a
                            href="https://www.jltcabz.com/Default.aspx"
                            className="d-inline-block auth-logo"
                            style={{
                              marginBottom: "30px",
                            }}
                          >
                            <img
                              src={allImages.AdsunLogo}
                              alt="Logo"
                              height="60"
                            />
                          </a>
                        </div>
                        <div className="text-center">
                          <h4
                            className="fw-bolder"
                            style={{
                              color: "#000",
                              fontSize: "16px",
                              marginBottom: "4px",
                            }}
                          >
                            Welcome Back!
                          </h4>
                          <p>Log in to continue Adsun</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                          {error && (
                            <div className="alert alert-danger">{error}</div>
                          )}
                          <div className="mb-4 mt-2">
                            <div className="form-outline position-relative auth-pass-inputgroup">
                              <input
                                type="text"
                                className="form-control"
                                id="txtUserName"
                                style={{ minHeight: "50px" }}
                                placeholder="Enter User Name"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="mb-4 mt-2">
                            <div className="form-outline position-relative auth-pass-inputgroup">
                              <input
                                type={isPasswordVisible ? "text" : "password"}
                                className="form-control pe-5"
                                id="txtPassword"
                                style={{ minHeight: "50px" }}
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                              />
                              <button
                                type="button"
                                style={{ boxShadow: "none" }}
                                className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted shadow-none password-addon mt-2"
                                onClick={togglePasswordVisibility}
                              >
                                <i
                                  className={
                                    isPasswordVisible
                                      ? "mdi mdi-eye-off align-middle"
                                      : "mdi mdi-eye align-middle"
                                  }
                                ></i>
                              </button>
                            </div>
                          </div>

                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <div className="form-check mb-0">
                              <input
                                className="form-check-input me-2"
                                type="checkbox"
                                checked={keepLogged}
                                onChange={(e) =>
                                  setKeepLogged(e.target.checked)
                                }
                                id="chkLogKeep"
                              />
                              <label
                                className="form-check-label"
                                htmlFor="chkLogKeep"
                              >
                                Remember me
                              </label>
                            </div>
                            <a href="/forgot-password" className="text-muted">
                              Forgot password?
                            </a>
                          </div>

                          <div className="text-center pt-1 mt-5 pb-1">
                            <button
                              type="submit"
                              className="btn btn-secondary btn-primary-login w-100"
                              disabled={isButtonDisabled}
                            >
                              {isButtonDisabled ? "Signing In..." : "Log In"}
                            </button>
                          </div>
                        </form>
                      </div>
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
