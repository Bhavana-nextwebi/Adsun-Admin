import React from "react";
import allImages from "../../assets/images-import";
export const SuccessMsgContent = () => {
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
                <div className="card-body p-4 text-center">
                  <div className="avatar-lg mx-auto mt-2">
                    <div className="avatar-title bg-light text-success display-3 rounded-circle">
                      <i className="ri-checkbox-circle-fill"></i>
                    </div>
                  </div>
                  <div className="mt-4 pt-2">
                    <h4>Well done !</h4>
                    <p className="text-muted mx-4">
                      Aww yeah, you successfully read this important message.
                    </p>
                    <div className="mt-4">
                      <a href="/auth/signin" className="btn btn-success w-100">
                        Back to Dashboard
                      </a>
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
