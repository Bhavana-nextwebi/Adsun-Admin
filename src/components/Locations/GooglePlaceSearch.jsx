import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getAllCategories,
  searchPlaces,
} from "../../services/searchLocationsService";
import { handleErrors } from "../../utils/errorHandler";
import ComponentHeader from "../Common/OtherElements/ComponentHeader";
import { usePageLevelAccess } from "../../hooks/usePageLevelAccess";
import {
  useNavigate,
  useLocation,
} from "react-router-dom";

export const GooglePlaceSearch = () => {
  const [categories, setCategories] = useState([]);

  // CATEGORY
  const [searchText, setSearchText] = useState("");

  // AUTO FILLED FROM NAVIGATION
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // DISPLAY IN KM
  const [radiusKm, setRadiusKm] = useState("1");

  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const navigate = useNavigate();
  const routeLocation = useLocation();

  const { pageAccessData } =
    usePageLevelAccess("google-search/add");

  // PAGE ACCESS
  useEffect(() => {
    if (
      pageAccessData &&
      !pageAccessData.viewAccess
    ) {
      navigate("/404-error-page");
    }
  }, [pageAccessData, navigate]);

  // LOAD CATEGORY DATA
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response =
        await getAllCategories();

      if (response?.isSuccess) {
        setCategories(response.result || []);
      }
    } catch (error) {
      handleErrors(error);
    }
  };

  // AUTO POPULATE LAT/LNG
  useEffect(() => {
    if (routeLocation.state) {
      setLatitude(
        routeLocation.state.latitude || ""
      );

      setLongitude(
        routeLocation.state.longitude || ""
      );
    }
  }, [routeLocation.state]);

  // VALIDATION
  const validate = () => {
    const errors = {};

    if (!searchText) {
      errors.searchText =
        "Category required";
    }

    if (!latitude) {
      errors.latitude =
        "Latitude required";
    }

    if (!longitude) {
      errors.longitude =
        "Longitude required";
    }

    if (!radiusKm) {
      errors.radiusKm =
        "Radius required";
    }

    return errors;
  };

  // SEARCH
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate();

    setFormErrors(errors);

    if (Object.keys(errors).length > 0)
      return;

    // KM TO METERS
    const radiusInMeters =
      Number(radiusKm) * 1000;

    const location = `@${latitude},${longitude},${radiusInMeters}m`;

    try {
      setIsLoading(true);

      const response =
        await searchPlaces({
          searchText,
          location,
        });

      if (response?.isSuccess) {
        toast.success(
          "Search completed successfully!"
        );

        navigate("/google-search/search");
      }
    } catch (error) {
      handleErrors(error);
    } finally {
      setIsLoading(false);
    }
  };

  // RESET
  const handleReset = () => {
    setSearchText("");
    setRadiusKm("1");
    setFormErrors({});
  };

  return (
    <div className="container-fluid py-3">
      <ComponentHeader title="Google Places Search" />

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white">
          <h5 className="mb-0">
            Search Places
          </h5>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">

              {/* CATEGORY */}
              <div className="col-lg-3 col-md-6 col-12">
                <label className="form-label fw-semibold">
                  Category
                </label>

                <select
                  className="form-select shadow-sm"
                  value={searchText}
                  onChange={(e) =>
                    setSearchText(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select Category
                  </option>

                  {categories.map((c) => (
                    <option
                      key={c.id}
                      value={c.categoryName}
                    >
                      {c.categoryName}
                    </option>
                  ))}
                </select>

                <small className="text-danger">
                  {formErrors.searchText}
                </small>
              </div>

              {/* RADIUS */}
              <div className="col-lg-3 col-md-6 col-12">
                <label className="form-label fw-semibold">
                  Radius
                </label>

                <div className="input-group shadow-sm">
                  <input
                    type="number"
                    className="form-control"
                    value={radiusKm}
                    onChange={(e) =>
                      setRadiusKm(
                        e.target.value
                      )
                    }
                  />

                  <span className="input-group-text">
                    KM
                  </span>
                </div>

                <small className="text-danger">
                  {formErrors.radiusKm}
                </small>
              </div>

            
            

              {/* LATITUDE */}
              <div className="col-lg-3 col-md-6 col-12">
                <label className="form-label fw-semibold">
                  Latitude
                </label>

                <input
                  type="text"
                  className="form-control shadow-sm"
                  value={latitude || ""}
                  readOnly
                />

                <small className="text-danger">
                  {formErrors.latitude}
                </small>
              </div>

              {/* LONGITUDE */}
              <div className="col-lg-3 col-md-6 col-12">
                <label className="form-label fw-semibold">
                  Longitude
                </label>

                <input
                  type="text"
                  className="form-control shadow-sm"
                  value={longitude || ""}
                  readOnly
                />

                <small className="text-danger">
                  {formErrors.longitude}
                </small>
              </div>

              {/* RESET */}
              <div className="col-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary shadow-sm"
                  onClick={handleReset}
                >
                  <i className="fa fa-refresh me-2"></i>
                  Reset
                </button>
              </div>
               <div className="col-3">
                <button
                  type="submit"
                  className="btn btn-primary w-100 shadow-sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Searching
                    </>
                  ) : (
                    <>
                      <i className="fa fa-search me-2"></i>
                      Search
                    </>
                  )}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};