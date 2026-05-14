import React, { useEffect, useState,useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { paginateData, calculateTotalPages } from '../../assets/js/script';
import TableHeader from '../Common/TableComponent/TableHeader';
import EntriesDropdown from '../Common/TableComponent/EntriesDropdown';
import { Pagination } from '../Common/TableComponent/Pagination';
import { Loading } from '../Common/OtherElements/Loading';
import { TableDataStatusError } from '../Common/OtherElements/TableDataStatusError';
import { handleErrors } from '../../utils/errorHandler';
import { usePageLevelAccess } from '../../hooks/usePageLevelAccess';
import { getSavedSearchByUserGuid ,getAllSavedSearches} from '../../services/searchLocationsService';

export const SavedSearchList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageAccessDetails, setPageAccessDetails] = useState([]);

  const navigate = useNavigate();
  const routeLocation = useLocation();
  const queryParams = new URLSearchParams(routeLocation.search);
const userGuidFromQuery =
  queryParams.get("userGuid");

  const userDetails = routeLocation.state?.userDetails || null;
  const highlightCriteria = routeLocation.state?.highlightCriteria;

  const PageLevelAccessurl = 'google-search';
  const { pageAccessData } = usePageLevelAccess(PageLevelAccessurl);
  const getRadiusFromCoordinates = (coord) => {
  if (!coord) return null;

  const cleaned = coord.replace("@", "").split(",");

  const radiusPart = cleaned[2]; // "5000m"
  if (!radiusPart) return null;

  const meters = parseFloat(radiusPart.replace("m", ""));
  if (isNaN(meters)) return null;

  return (meters / 1000).toFixed(2);
};

  useEffect(() => {
    if (pageAccessData) {
      if (!pageAccessData.viewAccess) {
        navigate('/404-error-page');
      } else {
        setPageAccessDetails(pageAccessData);
      }
    }
  }, [pageAccessData, navigate]);


const fetchData = useCallback(async () => {
  try {
    setLoading(true);

  const guid =
  userGuidFromQuery ||
  routeLocation.state?.userGuid ||
  routeLocation.state?.userDetails?.userGuid;
    let response;

    if (guid) {
      response = await getSavedSearchByUserGuid(guid);
    } else {
      response = await getAllSavedSearches();
    }

    console.log("GUID:", guid);
    console.log("RESPONSE:", response);

    if (response?.isSuccess) {
      setData(response.result || []);
    } else {
      setData([]);
    }

  } catch (error) {
    handleErrors(error);
    setData([]);
  } finally {
    setLoading(false);
  }
}, [routeLocation.state, userGuidFromQuery]);
useEffect(() => {
  fetchData();
}, [fetchData]);
const isHighlighted = (item) => {
  if (!highlightCriteria) return false;

  if (!item?.coOrdinates) return false;

  // remove @ and m, split cleanly
  const cleanCoords = item.coOrdinates
    .replace("@", "")
    .replace("m", "")
    .split(",");

  const itemLat = Number(cleanCoords[0]?.trim());
  const itemLng = Number(cleanCoords[1]?.trim());

  const searchLat = Number(highlightCriteria.latitude);
  const searchLng = Number(highlightCriteria.longitude);

  const sameCategory =
    item.category?.toLowerCase()?.trim() ===
    highlightCriteria.category?.toLowerCase()?.trim();

  const sameLat = Math.abs(itemLat - searchLat) < 0.000001;
  const sameLng = Math.abs(itemLng - searchLng) < 0.000001;

  return sameCategory && sameLat && sameLng;
};
  const filteredData = data.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.category?.toLowerCase().includes(query) ||
      item.city?.toLowerCase().includes(query) ||
      item.state?.toLowerCase().includes(query) ||
      item.area?.toLowerCase().includes(query) ||
      item.status?.toLowerCase().includes(query)
    );
  });

  const currentData = paginateData(filteredData, currentPage, entriesPerPage);
  const totalPages = calculateTotalPages(filteredData.length, entriesPerPage);

  const handleEntriesChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

 const handleViewResults = (item) => {
  let url = `/google-search/place-results?searchId=${item.id}`;

  if (userGuidFromQuery) {
    url += `&userGuid=${userGuidFromQuery}`;
  }
  else{
    url+=`&userGuid=${item.userGuid}`
  }
 
  navigate(url, {
    state: {
      searchInfo: {
        category: item.category,
        coOrdinates: item.coOrdinates,
        addedOn: item.addedOn,
      },
      userDetails,
    },
  });
};

  return (
    <>
      {pageAccessDetails.viewAccess ? (
        <div className="row">
          <div className="col-xxl-12">
            <div className="card mt-xxl-n5">
              <div className="card-header d-flex align-items-center justify-content-between">
                <h5 className="mb-sm-2 mt-sm-2">Saved Searches</h5>
                {userDetails && (
                  <span className="text-muted small">
                    User: <strong>{userDetails.userName}</strong>
                    {userDetails.city && ` — ${userDetails.city}`}
                    {userDetails.state && `, ${userDetails.state}`}
                  </span>
                )}
              </div>

              <div className="card-body p-4">
                <div className="d-flex justify-content-between mb-3">
                  <EntriesDropdown
                    entriesPerPage={entriesPerPage}
                    onEntriesChange={handleEntriesChange}
                    options={[10, 25, 50, 100]}
                  />
                  <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Search by category, city, state, area..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                {loading ? (
                  <Loading />
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered align-middle">
                      <TableHeader
                        columns={[
                          '#',
                          'UserName',
                          'Category',
                          'Area',
                          'City',
                          'State',
                          'Coordinates',
                          'Radius(km)',
                           'Action',
                            'Added On',
                          'Status',
                         
                        ]}
                      />
                      <tbody>
                        {currentData.length === 0 ? (
                          <TableDataStatusError colspan="9" />
                        ) : (
                          currentData.map((item, index) => (
                            <tr
  key={item.id}
  id={item.id}
  className={`align-middle transition-row ${
    isHighlighted(item)
      ? "bg-warning-subtle border-start border-4 border-warning shadow-sm"
      : ""
  }`}
  style={{
    transition: "all 0.2s ease-in-out",
  }}
>
                              <td>
                                {(currentPage - 1) * entriesPerPage + index + 1}
                          
                              </td>
                                <td>{item.userName || '-'}</td>
                              <td>{item.category || '-'}</td>
                               <td>{item.area || '-'}</td>
                              <td>{item.city || '-'}</td>
                              <td>{item.state || '-'}</td>
                              <td>{item.coOrdinates || '-'}</td>
                              {/* <td style={{ minWidth: '160px' }}>
                                <small className="text-muted">{item.coOrdinates || '-'}</small>
                              </td> */}
                              
                              <td>
 
    {getRadiusFromCoordinates(item.coOrdinates)
      ? `${getRadiusFromCoordinates(item.coOrdinates)} km`
      : '-'}
  
</td>
<td>
                                <button
                                  className="btn btn-sm btn-primary"
                                  title="View Search Results"
                                  onClick={() => handleViewResults(item)}
                                >
                                  <i className="fa fa-search me-1"></i>
                                  View Results
                                </button>
                              </td>
                               <td>
                                {item.addedOn
                                  ? new Date(item.addedOn).toLocaleString()
                                  : '-'}
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    item.status === 'Active' ? 'bg-success' : 'bg-danger'
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </td>

                              
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalEntries={filteredData.length}
                  entriesPerPage={entriesPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};