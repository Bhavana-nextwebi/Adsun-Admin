import React, { useEffect, useState } from "react";
import {
  FaKey,
  FaSearch,
  FaCoins,
  FaCheckCircle,
  FaSyncAlt,
} from "react-icons/fa";
import { SearchCreditDetails } from "../../services/searchLocationsService";

const GoogleSearchCreditsCard = () => {
  const [loading, setLoading] = useState(false);
  const [creditData, setCreditData] = useState(null);

  const fetchCredits = async () => {
    try {
      setLoading(true);

      const response = await SearchCreditDetails();

      if (response?.isSuccess) {
        setCreditData(response.result);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  return (
    <div
      className="container-fluid py-5"
      style={{
        background: "#f4f7fb",
        minHeight: "100vh",
      }}
    >
      <div className="row justify-content-center">
        <div className="col-xl-7 col-lg-8 col-md-8 col-sm-12">
          <div
            className="card border-0"
            style={{
              borderRadius: "28px",
              background: "#ffffff",
              boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
              overflow: "hidden",
              maxWidth:"900px"
            }}
          >
            {/* Header */}
            <div
              className="p-4"
              style={{
                background:
                  "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="fw-bold text-white mb-1">
                    Google Search Credits
                  </h3>

                  <p
                    className="mb-0"
                    style={{
                      color: "rgba(255,255,255,0.75)",
                    }}
                  >
                    API Usage Monitoring Dashboard
                  </p>
                </div>

                <button
                  className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
                  onClick={fetchCredits}
                  disabled={loading}
                  style={{
                    width: "45px",
                    height: "45px",
                  }}
                >
                  <FaSyncAlt
                    className={loading ? "fa-spin" : ""}
                    size={16}
                  />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="card-body p-4">
              {loading ? (
                <div className="text-center py-5">
                  <div
                    className="spinner-border text-primary"
                    role="status"
                  ></div>

                  <p className="text-muted mt-3 mb-0">
                    Fetching credits...
                  </p>
                </div>
              ) : (
                <>
                  {/* Credit Card */}
                  <div
                    className="p-4 mb-4"
                    style={{
                      borderRadius: "22px",
                      background:
                        "linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%)",
                      border: "1px solid #dbeafe",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p
                          className="mb-2"
                          style={{
                            color: "#6b7280",
                            fontWeight: 500,
                          }}
                        >
                          Remaining Credits
                        </p>

                        <h1
                          className="fw-bold mb-0"
                          style={{
                            fontSize: "3rem",
                            color: "#111827",
                          }}
                        >
                          {creditData?.remainingCredits || 0}
                        </h1>
                      </div>

                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "24px",
                          background:
                            "linear-gradient(135deg, #f59e0b, #fbbf24)",
                          boxShadow: "0 10px 25px rgba(245,158,11,0.35)",
                        }}
                      >
                        <FaCoins size={34} color="#fff" />
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="row g-3 mb-3">
                    {/* API Calls */}
                    <div className="col-md-6">
                      <div
                        className="h-100 p-4"
                        style={{
                          borderRadius: "20px",
                          background: "#f9fafb",
                          border: "1px solid #edf2f7",
                        }}
                      >
                        <div className="d-flex align-items-center mb-3">
                          <div
                            className="d-flex align-items-center justify-content-center me-3"
                            style={{
                              width: "45px",
                              height: "45px",
                              borderRadius: "14px",
                              background: "#dbeafe",
                            }}
                          >
                            <FaSearch color="#2563eb" />
                          </div>

                          <div>
                            <p className="mb-0 text-muted small">
                              Total API Calls
                            </p>
                          </div>
                        </div>

                        <h3 className="fw-bold text-dark mb-0">
                          {creditData?.totalApiCalls || 0}
                        </h3>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-md-6">
                      <div
                        className="h-100 p-4"
                        style={{
                          borderRadius: "20px",
                          background: "#f9fafb",
                          border: "1px solid #edf2f7",
                        }}
                      >
                        <div className="d-flex align-items-center mb-3">
                          <div
                            className="d-flex align-items-center justify-content-center me-3"
                            style={{
                              width: "45px",
                              height: "45px",
                              borderRadius: "14px",
                              background: "#dcfce7",
                            }}
                          >
                            <FaCheckCircle color="#16a34a" />
                          </div>

                          <div>
                            <p className="mb-0 text-muted small">
                              API Status
                            </p>
                          </div>
                        </div>

                        <h5
                          className="fw-bold mb-0"
                          style={{
                            color: "#16a34a",
                          }}
                        >
                          Active
                        </h5>
                      </div>
                    </div>
                  </div>

                  {/* API Key */}
                  <div
                    className="p-4"
                    style={{
                      borderRadius: "20px",
                      background: "#f9fafb",
                      border: "1px solid #edf2f7",
                    }}
                  >
                    <div className="d-flex align-items-center mb-3">
                      <div
                        className="d-flex align-items-center justify-content-center me-3"
                        style={{
                          width: "45px",
                          height: "45px",
                          borderRadius: "14px",
                          background: "#fef3c7",
                        }}
                      >
                        <FaKey color="#d97706" />
                      </div>

                      <div>
                        <p className="mb-0 text-muted small">API Key</p>
                      </div>
                    </div>

                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: "14px",
                        color: "#374151",
                        background: "#ffffff",
                        padding: "12px",
                        borderRadius: "12px",
                        border: "1px dashed #d1d5db",
                        wordBreak: "break-all",
                      }}
                    >
                      {creditData?.apiKey || "N/A"}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div
              className="text-center py-3"
              style={{
                background: "#f9fafb",
                borderTop: "1px solid #edf2f7",
              }}
            >
              <small className="text-muted">
                Google Search API Monitoring Dashboard
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleSearchCreditsCard;