import React from "react";
import allImages from "../../assets/images-import";

export const PasswordChangeContent = () => {
  return (
    <>
      <div className="auth-page-content">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="text-center mt-sm-5 mb-4 text-white-50">
                <div>
                  <a href="index.html" className="d-inline-block auth-logo">
                    <img src={allImages.logoImage} alt="" height="20" />
                  </a>
                </div>
                <p className="mt-3 fs-15 fw-medium">JLT</p>
              </div>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 col-xl-5">
              <div className="card mt-4">
                <div className="card-body p-4">
                  <div className="text-center mt-2">
                    <h5 className="text-primary">Create new password</h5>
                    <p className="text-muted">
                      Your new password must be different from previous used
                      password.
                    </p>
                  </div>

                  <div className="p-2">
                    <form action="auth-signin-basic.html">
                      <div className="mb-3">
                        <label className="form-label" htmlFor="password-input">
                          Password
                        </label>
                        <div className="position-relative auth-pass-inputgroup">
                          <input
                            type="password"
                            className="form-control pe-5 password-input"
                            onpaste="return false"
                            placeholder="Enter password"
                            id="password-input"
                            aria-describedby="passwordInput"
                            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                            required
                          />
                          <button
                            className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted password-addon"
                            type="button"
                            id="password-addon"
                          >
                            <i className="ri-eye-fill align-middle"></i>
                          </button>
                        </div>
                        <div id="passwordInput" className="form-text">
                          Must be at least 8 characters.
                        </div>
                      </div>

                      <div className="mb-3">
                        <label
                          className="form-label"
                          htmlFor="confirm-password-input"
                        >
                          Confirm Password
                        </label>
                        <div className="position-relative auth-pass-inputgroup mb-3">
                          <input
                            type="password"
                            className="form-control pe-5 password-input"
                            onpaste="return false"
                            placeholder="Confirm password"
                            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                            id="confirm-password-input"
                            required
                          />
                          <button
                            className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted password-addon"
                            type="button"
                            id="confirm-password-input"
                          >
                            <i className="ri-eye-fill align-middle"></i>
                          </button>
                        </div>
                      </div>

                      <div
                        id="password-contain"
                        className="p-3 bg-light mb-2 rounded"
                      >
                        <h5 className="fs-13">Password must contain:</h5>
                        <p id="pass-length" className="invalid fs-12 mb-2">
                          Minimum <b>8 characters</b>
                        </p>
                        <p id="pass-lower" className="invalid fs-12 mb-2">
                          At <b>lowercase</b> letter (a-z)
                        </p>
                        <p id="pass-upper" className="invalid fs-12 mb-2">
                          At least <b>uppercase</b> letter (A-Z)
                        </p>
                        <p id="pass-number" className="invalid fs-12 mb-0">
                          A least <b>number</b> (0-9)
                        </p>
                      </div>

                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          value=""
                          id="auth-remember-check"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="auth-remember-check"
                        >
                          Remember me
                        </label>
                      </div>

                      <div className="mt-4">
                        <button className="btn btn-success w-100" type="submit">
                          Reset Password
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="mb-0">
                  Wait, I remember my password...{" "}
                  <a
                    href="/auth/signin"
                    className="fw-semibold text-primary text-decoration-underline"
                  >
                    {" "}
                    Click here{" "}
                  </a>{" "}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
