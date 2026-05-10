import React, { useEffect, useState } from "react";
import allImages from "../../../assets/images-import";
import { Link, useLocation } from "react-router-dom";
import { getMenus } from "../../../services/manageAccess";
import * as bootstrap from "bootstrap";
import { handleErrors } from "../../../utils/errorHandler";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

export const Navbar = () => {
  console.log(bootstrap);
  const [menus, setMenus] = useState([]);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await getMenus();
        const filteredMenus = response.data.result.filter(
          (menu) => menu.showInMenu
        );
        setMenus(filteredMenus);
      } catch (error) {
        handleErrors(error);
      }
    };
    fetchMenus();
  }, []);

  const groupedMenus = menus.reduce((acc, menu) => {
    if (!acc[menu.pageGroupName]) {
      acc[menu.pageGroupName] = [];
    }
    acc[menu.pageGroupName].push(menu);
    return acc;
  }, {});

  return (
    <div className="app-menu navbar-menu">
      <div className="navbar-brand-box">
        <a href="/" className="logo logo-dark">
          <span className="logo-sm">
            <img src={allImages.AdsunLogo} alt="" height="50" />
          </span>
          <span className="logo-lg">
            <img src={allImages.AdsunLogo} alt="" height="80" />
          </span>
        </a>
        <a href="/" className="logo logo-light">
          <span className="logo-sm">
            <img src={allImages.AdsunLogo} alt="" height="80" />
          </span>
          <span className="logo-lg">
            <img src={allImages.AdsunLogo} alt="" height="80" />
          </span>
        </a>
        <button
          type="button"
          className="btn btn-sm p-0 fs-20 header-item float-end btn-vertical-sm-hover"
          id="vertical-hover"
        >
          <i className="ri-record-circle-line"></i>
        </button>
      </div>

      <SimpleBar className="h-100" id="scrollbar">
        <div className="menu-title">
          <span data-key="t-menu">Menu</span>
        </div>
        <div className="container-fluid">
          <ul className="navbar-nav" id="navbar-nav">
            {Object.keys(groupedMenus).map((groupName, index) => {
              const groupItems = groupedMenus[groupName];
              const visiblePages = groupItems.filter((page) => page.showInMenu);

              return (
                <li className="nav-item" key={index}>
                  {visiblePages.length > 1 ? (
                    <>
                      <a
                        className="nav-link menu-link"
                        href={`#sidebar${groupName.replace(/\s+/g, "")}`}
                        data-bs-toggle="collapse"
                        role="button"
                        aria-expanded="false"
                        aria-controls={`sidebar${groupName.replace(
                          /\s+/g,
                          ""
                        )}`}
                      >
                        <i
                          dangerouslySetInnerHTML={{
                            __html: groupItems[0].groupIcon,
                          }}
                        ></i>
                        <span>{groupName}</span>
                      </a>
                      <div
                        className="collapse menu-dropdown"
                        id={`sidebar${groupName.replace(/\s+/g, "")}`}
                      >
                        <ul className="nav nav-sm flex-column">
                          {visiblePages.map((page) => (
                            <li
                              className={`nav-item ${
                                isActive(`/${page.pageLink}`) ? "active" : ""
                              }`}
                              key={page.pageId}
                            >
                              <Link
                                to={`/${page.pageLink}`}
                                className="nav-link"
                                data-key={page.pageDesc}
                              >
                                {page.pageName}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <Link
                      to={`/${visiblePages[0].pageLink}`}
                      className="nav-link menu-link"
                    >
                      <i
                        dangerouslySetInnerHTML={{
                          __html: groupItems[0].groupIcon,
                        }}
                      ></i>
                      <span>{groupName}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </SimpleBar>

      <div className="sidebar-background"></div>
    </div>
  );
};
