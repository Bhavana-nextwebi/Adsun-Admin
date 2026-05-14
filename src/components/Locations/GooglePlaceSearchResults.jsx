import React from "react";

import {
  useLocation,
  useNavigate
} from "react-router-dom";

import * as XLSX from "xlsx";

import { saveAs } from "file-saver";

import ComponentHeader from
  "../Common/OtherElements/ComponentHeader";

export const GooglePlaceSearchResults = () => {

  const location = useLocation();

  const navigate = useNavigate();

  const {
    searchResults = [],
    searchInfo = {},
    userDetails = {}
  } = location.state || {};

  // EXPORT EXCEL
  const exportToExcel = () => {

    if (searchResults.length === 0)
      return;

    const excelData =
      searchResults.map(
        (item, index) => ({

          "SL No":
            index + 1,

          "Search Name":
            item.title || "N/A",

          "Category":
            item.type || "N/A",

          "Address":
            item.address || "N/A",

          "Phone":
            item.phone || "N/A",

          "Email":
            item.email || "N/A",

          "Rating":
            item.rating || "N/A",

          "Reviews":
            item.review || "N/A",

          "Price":
            item.priceDesc || "N/A",

          "Latitude":
            item.latitude || "N/A",

          "Longitude":
            item.longitude || "N/A",

          "User Name":
            userDetails.userName || "N/A",

          "Area":
            userDetails.area || "N/A",

          "City":
            userDetails.city || "N/A",

          "State":
            userDetails.state || "N/A",

          "Country":
            userDetails.country || "N/A"
        })
      );

    const worksheet =
      XLSX.utils.json_to_sheet(
        excelData
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Google Results"
    );

    const excelBuffer =
      XLSX.write(
        workbook,
        {
          bookType: "xlsx",
          type: "array"
        }
      );

    const data = new Blob(
      [excelBuffer],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
      }
    );

    saveAs(
      data,
      `Google_Search_Results_${new Date().getTime()}.xlsx`
    );
  };

  const thStyle = {
    fontSize: "13px",
    fontWeight: "700",
    color: "#374151",
    verticalAlign: "middle",
    whiteSpace: "nowrap"
  };

  const tdStyle = {
    fontSize: "12px",
    color: "#1F2937",
    verticalAlign: "middle",
    lineHeight: "1.6"
  };

  return (

    <div className="container-fluid py-3">

      <ComponentHeader
        title="Google Search Results"
      />

      {/* USER DETAILS */}
      <div className="card border-0 shadow-sm mb-4"
        style={{
          borderRadius: "18px"
        }}
      >

        <div
          className="card-header border-0"
          style={{
            background:
              "linear-gradient(90deg,#0F172A,#1E293B)",
            borderTopLeftRadius: "18px",
            borderTopRightRadius: "18px"
          }}
        >

          <h5 className="text-white mb-0 fw-bold">
            Searched User Details
          </h5>

        </div>

        <div className="card-body">

          <div className="row g-3">

            <div className="col-lg-2 col-md-4 col-6">

              <div
                className="p-3 rounded-4 h-100"
                style={{
                  background: "#F8FAFC"
                }}
              >

                <small className="text-muted">
                  User Name
                </small>

                <div className="fw-bold mt-1">
                  {userDetails.userName || "N/A"}
                </div>

              </div>

            </div>

            <div className="col-lg-2 col-md-4 col-6">

              <div
                className="p-3 rounded-4 h-100"
                style={{
                  background: "#F8FAFC"
                }}
              >

                <small className="text-muted">
                  Area
                </small>

                <div className="fw-bold mt-1">
                  {userDetails.area || "N/A"}
                </div>

              </div>

            </div>

            <div className="col-lg-2 col-md-4 col-6">

              <div
                className="p-3 rounded-4 h-100"
                style={{
                  background: "#F8FAFC"
                }}
              >

                <small className="text-muted">
                  City
                </small>

                <div className="fw-bold mt-1">
                  {userDetails.city || "N/A"}
                </div>

              </div>

            </div>

            <div className="col-lg-2 col-md-4 col-6">

              <div
                className="p-3 rounded-4 h-100"
                style={{
                  background: "#F8FAFC"
                }}
              >

                <small className="text-muted">
                  State
                </small>

                <div className="fw-bold mt-1">
                  {userDetails.state || "N/A"}
                </div>

              </div>

            </div>

            <div className="col-lg-2 col-md-4 col-6">

              <div
                className="p-3 rounded-4 h-100"
                style={{
                  background: "#F8FAFC"
                }}
              >

                <small className="text-muted">
                  Country
                </small>

                <div className="fw-bold mt-1">
                  {userDetails.country || "N/A"}
                </div>

              </div>

            </div>

            <div className="col-lg-2 col-md-4 col-6">

              <div
                className="p-3 rounded-4 h-100"
                style={{
                  background: "#EFF6FF"
                }}
              >

                <small className="text-muted">
                  Coordinates
                </small>

                <div
                  className="fw-bold mt-1"
                  style={{
                    fontSize: "11px"
                  }}
                >
                  {searchInfo.latitude},
                  {" "}
                  {searchInfo.longitude}
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* TOP SUMMARY */}
      <div className="row g-3 mb-4">

        <div className="col-lg-3 col-md-6">

          <div
            className="card border-0 shadow-sm h-100"
            style={{
              borderRadius: "16px"
            }}
          >

            <div className="card-body">

              <div className="d-flex align-items-center justify-content-between">

                <div>

                  <small className="text-muted">
                    Category
                  </small>

                  <h6 className="fw-bold mt-2 mb-0">
                    {searchInfo.category || "N/A"}
                  </h6>

                </div>

                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "50px",
                    height: "50px",
                    background: "#EEF2FF"
                  }}
                >

                  <i
                    className="ri-apps-2-fill"
                    style={{
                      fontSize: "22px",
                      color: "#4F46E5"
                    }}
                  ></i>

                </div>

              </div>

            </div>

          </div>

        </div>

        <div className="col-lg-3 col-md-6">

          <div
            className="card border-0 shadow-sm h-100"
            style={{
              borderRadius: "16px"
            }}
          >

            <div className="card-body">

              <div className="d-flex align-items-center justify-content-between">

                <div>

                  <small className="text-muted">
                    Radius
                  </small>

                  <h6 className="fw-bold mt-2 mb-0">
                    {searchInfo.radiusKm} KM
                  </h6>

                </div>

                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "50px",
                    height: "50px",
                    background: "#ECFDF5"
                  }}
                >

                  <i
                    className="ri-focus-2-fill"
                    style={{
                      fontSize: "22px",
                      color: "#059669"
                    }}
                  ></i>

                </div>

              </div>

            </div>

          </div>

        </div>

     

        <div className="col-lg-3 col-md-6">

          <div
            className="card border-0 shadow-sm h-100"
            style={{
              borderRadius: "16px"
            }}
          >

            <div className="card-body">

              <div className="d-flex align-items-center justify-content-between">

                <div>

                  <small className="text-muted">
                    Total Results
                  </small>

                  <h4
                    className="fw-bold mt-2 mb-0"
                    style={{
                      color: "#2563EB"
                    }}
                  >
                    {searchResults.length}
                  </h4>

                </div>

                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "50px",
                    height: "50px",
                    background: "#DBEAFE"
                  }}
                >

                  <i
                    className="ri-building-2-fill"
                    style={{
                      fontSize: "22px",
                      color: "#2563EB"
                    }}
                  ></i>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* TABLE CARD */}
      <div
        className="card border-0 shadow-sm"
        style={{
          borderRadius: "18px",
          overflow: "hidden"
        }}
      >

        {/* HEADER */}
        <div
          className="card-header border-0"
          style={{
            background:
              "linear-gradient(90deg,#2563EB,#4F46E5)",
            padding: "18px 24px"
          }}
        >

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">

            <div>

              <h5 className="text-white fw-bold mb-1">
                Google Search Results
              </h5>

              <small
                style={{
                  color: "#E0E7FF"
                }}
              >
                Showing all searched business details
              </small>

            </div>

            <div className="d-flex align-items-center gap-2">

              <button
                className="btn btn-success d-flex align-items-center gap-2"
                style={{
                  borderRadius: "10px",
                  fontWeight: "600"
                }}
                onClick={exportToExcel}
                disabled={searchResults.length === 0}
              >

                <i className="ri-file-excel-2-fill"></i>

                Export Excel

              </button>

              <button
                className="btn btn-light d-flex align-items-center gap-2"
                style={{
                  borderRadius: "10px",
                  fontWeight: "600"
                }}
                onClick={() => navigate(-1)}
              >

                <i className="ri-arrow-left-line"></i>

                Back

              </button>

            </div>

          </div>

        </div>

        {/* BODY */}
        <div className="card-body p-0">

          <div className="table-responsive">

            <table
              className="table align-middle table-hover mb-0"
            >

              <thead className="table-light">

                <tr>

                  <th
                    className="text-center"
                    width="60"
                    style={thStyle}
                  >
                    #
                  </th>

                  <th style={thStyle}>
                    Business Details
                  </th>

                  <th style={thStyle}>
                    Contact
                  </th>

                  <th style={thStyle}>
                    Ratings
                  </th>

                  <th style={thStyle}>
                    Location
                  </th>

                  <th style={thStyle}>
                    Price
                  </th>

                </tr>

              </thead>

              <tbody>

                {searchResults.length === 0 ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="text-center py-5"
                    >

                      <div className="d-flex flex-column align-items-center">

                        <i
                          className="ri-search-eye-line mb-2"
                          style={{
                            fontSize: "45px",
                            color: "#9CA3AF"
                          }}
                        ></i>

                        <h6 className="text-muted">
                          No search results found
                        </h6>

                      </div>

                    </td>

                  </tr>

                ) : (

                  searchResults.map(
                    (item, index) => (

                      <tr key={index}>

                        <td
                          className="text-center"
                          style={tdStyle}
                        >

                          <div
                            className="fw-bold"
                            style={{
                              color: "#2563EB"
                            }}
                          >
                            {index + 1}
                          </div>

                        </td>

                        {/* BUSINESS */}
                        <td style={tdStyle}>

                          <div className="d-flex flex-column">

                            <div
                              className="fw-bold mb-1"
                              style={{
                                fontSize: "13px",
                                color: "#111827"
                              }}
                            >
                              {item.title || "N/A"}
                            </div>

                            <div className="mb-2">

                              <span
                                className="badge rounded-pill"
                                style={{
                                  background: "#EEF2FF",
                                  color: "#4338CA",
                                  padding: "6px 10px"
                                }}
                              >
                                {item.type || "No Category"}
                              </span>

                            </div>

                            <div className="d-flex gap-2">

                              <i
                                className="ri-map-pin-line mt-1"
                                style={{
                                  color: "#DC2626"
                                }}
                              ></i>

                              <span>
                                {item.address || "Address unavailable"}
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* CONTACT */}
                        <td
                          style={{
                            ...tdStyle,
                            minWidth: "260px"
                          }}
                        >

                          <div className="d-flex flex-column gap-2">

                            <div className="d-flex align-items-center gap-2">

                              <i
                                className="ri-phone-fill"
                                style={{
                                  color: "#16A34A"
                                }}
                              ></i>

                              <span>
                                {item.phone || "No Phone"}
                              </span>

                            </div>

                            <div className="d-flex align-items-center gap-2">

                              <i
                                className="ri-mail-fill"
                                style={{
                                  color: "#2563EB"
                                }}
                              ></i>

                              <span>
                                {item.email || "No Email"}
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* RATINGS */}
                        <td style={tdStyle}>

                          <div className="d-flex flex-column gap-2">

                            <div
                              className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill"
                              style={{
                                background: "#ECFDF5",
                                color: "#065F46",
                                width: "fit-content",
                                fontWeight: "600"
                              }}
                            >

                              <i className="ri-star-fill"></i>

                              {item.rating || "0"}

                            </div>

                            <div
                              className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill"
                              style={{
                                background: "#EFF6FF",
                                color: "#1D4ED8",
                                width: "fit-content",
                                fontWeight: "600"
                              }}
                            >

                              <i className="ri-chat-3-fill"></i>

                              {item.review || "0"} Reviews

                            </div>

                          </div>

                        </td>

                        {/* LOCATION */}
                        <td style={tdStyle}>

                          {item.latitude &&
                          item.longitude ? (

                            <div
                              className="d-flex flex-column"
                              style={{
                                fontSize: "11px"
                              }}
                            >

                              <span>
                                <strong>Lat:</strong>
                                {" "}
                                {item.latitude}
                              </span>

                              <span>
                                <strong>Lng:</strong>
                                {" "}
                                {item.longitude}
                              </span>

                            </div>

                          ) : (

                            <span className="text-muted">
                              Coordinates unavailable
                            </span>

                          )}

                        </td>

                        {/* PRICE */}
                        <td style={tdStyle}>

                          {item.priceDesc ? (

                            <span
                              className="badge rounded-pill"
                              style={{
                                background: "#FEF3C7",
                                color: "#92400E",
                                padding: "8px 12px",
                                fontWeight: "600"
                              }}
                            >
                              {item.priceDesc}
                            </span>

                          ) : (

                            <span className="text-muted">
                              Not Mentioned
                            </span>

                          )}

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
};