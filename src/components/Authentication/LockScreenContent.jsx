import React from "react";
import allImages from "../../assets/images-import";

export const LockScreenContent = () => {
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
                    <h5 className="text-primary">Lock Screen</h5>
                    <p className="text-muted">
                      Enter your password to unlock the screen!
                    </p>
                  </div>
                  <div className="user-thumb text-center">
                    <img
                      src={allImages.profileImage}
                      className="rounded-circle img-thumbnail avatar-lg shadow"
                      alt="thumbnail"
                    />
                    <h5 className="font-size-15 mt-3">Anna Adame</h5>
                  </div>
                  <div className="p-2 mt-4">
                    <form>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="userpassword">
                          Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="userpassword"
                          placeholder="Enter password"
                          required
                        />
                      </div>
                      <div className="mb-2 mt-4">
                        <button className="btn btn-success w-100" type="submit">
                          Unlock
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="mb-0">
                  Not you ? return{" "}
                  <a
                    href="/auth/signin"
                    className="fw-semibold text-primary text-decoration-underline"
                  >
                    {" "}
                    Signin{" "}
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
