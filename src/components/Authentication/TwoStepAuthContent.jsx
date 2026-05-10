import React from "react";
import allImages from "../../assets/images-import";

export const TwoStepAuthContent = () => {
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
                  <div className="mb-4">
                    <div className="avatar-lg mx-auto">
                      <div className="avatar-title bg-light text-primary display-5 rounded-circle shadow">
                        <i className="ri-mail-line"></i>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 mt-4">
                    <div className="text-muted text-center mb-4 mx-lg-3">
                      <h4 className="">Verify Your Email</h4>
                      <p>
                        Please enter the 4 digit code sent to{" "}
                        <span className="fw-semibold">example@abc.com</span>
                      </p>
                    </div>

                    <form autoComplete="off">
                      <div className="row">
                        <div className="col-3">
                          <div className="mb-3">
                            <label
                              htmlFor="digit1-input"
                              className="visually-hidden"
                            >
                              Digit 1
                            </label>
                            <input
                              type="text"
                              className="form-control form-control-lg bg-light border-light text-center"
                              onkeyup="moveToNext(1, event)"
                              maxLength="1"
                              id="digit1-input"
                            />
                          </div>
                        </div>

                        <div className="col-3">
                          <div className="mb-3">
                            <label
                              htmlFor="digit2-input"
                              className="visually-hidden"
                            >
                              Digit 2
                            </label>
                            <input
                              type="text"
                              className="form-control form-control-lg bg-light border-light text-center"
                              onkeyup="moveToNext(2, event)"
                              maxLength="1"
                              id="digit2-input"
                            />
                          </div>
                        </div>

                        <div className="col-3">
                          <div className="mb-3">
                            <label
                              htmlFor="digit3-input"
                              className="visually-hidden"
                            >
                              Digit 3
                            </label>
                            <input
                              type="text"
                              className="form-control form-control-lg bg-light border-light text-center"
                              onkeyup="moveToNext(3, event)"
                              maxLength="1"
                              id="digit3-input"
                            />
                          </div>
                        </div>

                        <div className="col-3">
                          <div className="mb-3">
                            <label
                              htmlFor="digit4-input"
                              className="visually-hidden"
                            >
                              Digit 4
                            </label>
                            <input
                              type="text"
                              className="form-control form-control-lg bg-light border-light text-center"
                              onkeyup="moveToNext(4, event)"
                              maxLength="1"
                              id="digit4-input"
                            />
                          </div>
                        </div>
                      </div>
                    </form>

                    <div className="mt-3">
                      <button type="button" className="btn btn-success w-100">
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="mb-0">
                  Didn't receive a code ?{" "}
                  <a
                    href="/auth/password-reset"
                    className="fw-semibold text-primary text-decoration-underline"
                  >
                    Resend
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
