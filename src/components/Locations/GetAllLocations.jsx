import React, { useEffect, useState } from 'react';
import { getAllUserLocations} from '../../services/searchLocationsService';
import { paginateData, calculateTotalPages } from '../../assets/js/script';
import TableHeader from '../Common/TableComponent/TableHeader';
import EntriesDropdown from '../Common/TableComponent/EntriesDropdown';
import { Pagination } from '../Common/TableComponent/Pagination';
import { Loading } from '../Common/OtherElements/Loading';
import { TableDataStatusError } from '../Common/OtherElements/TableDataStatusError';
import { handleErrors } from '../../utils/errorHandler';
import { usePageLevelAccess } from '../../hooks/usePageLevelAccess';
import { useNavigate } from 'react-router-dom';


export const GetAllLocations = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageAccessDetails, setPageAccessDetails] = useState([]);

  const PageLevelAccessurl = 'google-search';
  const navigate = useNavigate();
  const { pageAccessData } = usePageLevelAccess(PageLevelAccessurl);

  useEffect(() => {
    if (pageAccessData) {
      if (!pageAccessData.viewAccess) {
        navigate('/404-error-page');
      } else {
        setPageAccessDetails(pageAccessData);
      }
    }
  }, [pageAccessData, navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getAllUserLocations();

      if (response?.isSuccess) {
        setData(response.result || []);
      }
    } catch (error) {
      handleErrors(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter((item) => {
    const query = searchQuery.toLowerCase();

    return (
      item.userName?.toLowerCase().includes(query) ||
      item.city?.toLowerCase().includes(query) ||
      item.state?.toLowerCase().includes(query) ||
      item.country?.toLowerCase().includes(query)
    );
  });

  const currentData = paginateData(filteredData, currentPage, entriesPerPage);
  const totalPages = calculateTotalPages(filteredData.length, entriesPerPage);

  const handleEntriesChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  const parseCoords = (coord) => {
    if (!coord) return { lat: '-', lng: '-' };
    const [lat, lng] = coord.split(',');
    return { lat, lng };
  };

  return (
    <>
      {pageAccessDetails.viewAccess ? (
        <div className="row">
          <div className="col-xxl-12">
            <div className="card mt-xxl-n5">
              <div className="card-header">
                <h5 className="mb-sm-2 mt-sm-2">User Locations</h5>
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
                    placeholder="Search by name, city, state, country..."
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
    "#",
    "User Name",
    "City",
    "State",
    "Country",
    "Area",
    "Coordinates",
    "Added On",
    "Action",
    "Status",
   
  ]}
/>
                       <tbody>
                        {currentData.length === 0 ? (
                          <TableDataStatusError colspan="9" />
                        ) : (
                          currentData.map((item, index) => {
                            const { lat, lng } = parseCoords(item.jioCoOrdinate);

                            return (
                              <tr key={item.id}>
                                <td>
                                  {(currentPage - 1) * entriesPerPage + index + 1}
                                </td>

                                <td>{item.userName}</td>
                                <td>{item.city}</td>
                                <td>{item.state}</td>
                                <td>{item.country}</td>
                                <td>{item.area}</td>

                                <td style={{ minWidth: '160px' }}>
                                  <div>Lat: {lat}</div>
                                  <div>Lng: {lng}</div>
                                </td>

                                <td>
                                  {item.addedOn
                                    ? new Date(item.addedOn).toLocaleString()
                                    : '-'}
                                </td>
  
    <td>
  <button
    className="btn btn-sm btn-primary"
    onClick={() => {
      const coords = item.jioCoOrdinate || "";
      const [latitude, longitude] = coords.split(",").map(x => x.trim());

   navigate(`/google-search/search`, {
  state: {
    userDetails: {
      userGuid: item.userGuid,
      shareId: item.id,
      userName: item.userName,
      city: item.city,
      state: item.state,
      country: item.country,
      area: item.area,
      status: item.status,
      addedOn: item.addedOn,
    },

    // ✅ OUTSIDE userDetails
    latitude: latitude,
    longitude: longitude,
  },
});
    }}
  >
    Search
  </button>
</td>
  
  
                                <td>
                                  <span
                                    className={`badge ${
                                      item.status === 'Active'
                                        ? 'bg-success'
                                        : 'bg-danger'
                                    }`}
                                  >
                                    {item.status}
                                  </span>
                                </td>
                                
  
                              
                              </tr>
                            );
                          })
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