import React, { useState, useEffect } from "react";
import allImages from "../../../assets/images-import.jsx";
import { useNavbarToggle } from "../../../assets/js/script";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../../redux/auth/loginThunk";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile } from "../../../services/newUserService.jsx";
import { handleErrors } from "../../../utils/errorHandler.jsx";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userName, setUserName] = useState();
  const [profileImage, setProfileImage] = useState(allImages.Avatar1);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/auth/signin");
  };

  const { handlenavbarClick, isClass } = useNavbarToggle();
  

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await fetchUserProfile();
        setUserName(userData.data.result.userName);
        setProfileImage(userData.data.result.profileImage);
      } catch (error) {
        handleErrors(error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <>
      <header id="page-topbar">
        <div className="layout-width">
          <div className="navbar-header">
            <div className="d-flex">
              <div className="navbar-brand-box horizontal-logo">
                <span className="logo-sm">
                  <img src={allImages.AdsunLogo} alt="" height="50" />
                </span>
                <span className="logo-lg">
                  <img src={allImages.AdsunLogo} alt="" height="100" />
                </span>

                <span className="logo-sm">
                  <img src={allImages.AdsunLogo} alt="" height="80" />
                </span>
                <span className="logo-lg">
                  <img src={allImages.AdsunLogo} alt="" height="100" />
                </span>
              </div>

              <button
                type="button"
                onClick={handlenavbarClick}
                className="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger shadow-none"
                id="topnav-hamburger-icon"
              >
                <span className={`hamburger-icon ${isClass ? "open" : ""}`}>
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>

              {/* <form className="app-search d-none d-md-block">
                                <div className="position-relative">
                                    <input type="text" className="form-control" placeholder="Search..." autoComplete="off"
                                        id="search-options" />
                                    <span className="mdi mdi-magnify search-widget-icon"></span>
                                    <span className="mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none"
                                        id="search-close-options"></span>
                                </div>
                            </form> */}
            </div>

            <div className="d-flex align-items-center">
              {/* <div className="dropdown d-md-none topbar-head-dropdown header-item">
                                <button type="button"
                                    className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle shadow-none"
                                    id="page-header-search-dropdown" data-bs-toggle="dropdown" aria-haspopup="true"
                                    aria-expanded="false">
                                    <i className="bx bx-search fs-22"></i>
                                </button>
                                <div className="dropdown-menu dropdown-menu-lg dropdown-menu-end p-0"
                                    aria-labelledby="page-header-search-dropdown">
                                    <form className="p-3">
                                        <div className="form-group m-0">
                                            <div className="input-group">
                                                <input type="text" className="form-control" placeholder='Search ...'
                                                    aria-label="Recipient's username" />
                                                <button className="btn btn-primary" type="submit"><i
                                                    className="mdi mdi-magnify"></i></button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div> */}

            
              <div className="dropdown ms-sm-3 header-item topbar-user">
                <button
                  type="button"
                  className="btn shadow-none"
                  id="page-header-user-dropdown"
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <span className="d-flex align-items-center">
                    <img
                      className="rounded-circle header-profile-user"
                      src={
                        profileImage ? `https://4.nxtai.dev/${profileImage}`: allImages.defaultprofile
                      }
                      alt="Header Avatar"
                    />
                    <span className="text-start ms-xl-2">
                      <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">
                        {userName}
                      </span>
                    </span>
                  </span>
                </button>
                <div className="dropdown-menu dropdown-menu-end">
                  <h6 className="dropdown-header">Welcome, {userName}</h6>
                  <a className="dropdown-item" href="/my-profile">
                    <i className="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>{" "}
                    <span className="align-middle">Profile</span>
                  </a>
                  <a className="dropdown-item" href="/change-password">
                    <i className="mdi mdi-lock text-muted fs-16 align-middle me-1"></i>{" "}
                    <span className="align-middle">Change Password</span>
                  </a>
                  <span className="dropdown-item" onClick={handleLogout}>
                    <i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>{" "}
                    <span className="align-middle">Logout</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
