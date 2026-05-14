import React, {
  useEffect,
  useState,
  useCallback
} from 'react';

import {
  useNavigate,
  useLocation,
} from 'react-router-dom';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import {
  paginateData,
  calculateTotalPages,
} from '../../assets/js/script';

import TableHeader from '../Common/TableComponent/TableHeader';

import EntriesDropdown from '../Common/TableComponent/EntriesDropdown';

import { Pagination } from '../Common/TableComponent/Pagination';

import { Loading } from '../Common/OtherElements/Loading';

import { TableDataStatusError } from '../Common/OtherElements/TableDataStatusError';

import { handleErrors } from '../../utils/errorHandler';

import { usePageLevelAccess } from '../../hooks/usePageLevelAccess';

import { getSearchResultsBySearchId } from '../../services/searchLocationsService';

export const SearchResults = () => {
  const [data, setData] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    searchQuery,
    setSearchQuery,
  ] = useState('');

  const [
    entriesPerPage,
    setEntriesPerPage,
  ] = useState(10);

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    pageAccessDetails,
    setPageAccessDetails,
  ] = useState([]);

  const navigate =
    useNavigate();

  const routeLocation =
    useLocation();
// const { id } =
//   useParams();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
const id = queryParams.get("searchId");
 const searchId =
  id ||
  routeLocation.state
    ?.searchId ||
  null;

  const searchInfo =
    routeLocation.state
      ?.searchInfo || {};

  const userDetails =
    routeLocation.state
      ?.userDetails || null;

  const PageLevelAccessurl =
    'google-search';

  const { pageAccessData } =
    usePageLevelAccess(
      PageLevelAccessurl
    );

  useEffect(() => {
    if (pageAccessData) {
      if (
        !pageAccessData.viewAccess
      ) {
        navigate(
          '/404-error-page'
        );
      } else {
        setPageAccessDetails(
          pageAccessData
        );
      }
    }
  }, [
    pageAccessData,
    navigate,
  ]);



  const fetchData = useCallback(
  async () => {
    try {
      setLoading(true);

      const response =
        await getSearchResultsBySearchId(
          searchId
        );

      if (
        response?.isSuccess
      ) {
        setData(
          response.result || []
        );
      } else {
        setData([]);
      }
    } catch (error) {
      handleErrors(error);
      setData([]);
    } finally {
      setLoading(false);
    }
  },
  [searchId]
);
useEffect(() => {
  if (searchId) {
    fetchData();
  } else {
    setLoading(false);
  }
}, [searchId, fetchData]);
  const filteredData =
    data.filter((item) => {
      const query =
        searchQuery.toLowerCase();

      return (
        item.title
          ?.toLowerCase()
          .includes(query) ||
        item.address
          ?.toLowerCase()
          .includes(query) ||
        item.type
          ?.toLowerCase()
          .includes(query) ||
        item.phone
          ?.toLowerCase()
          .includes(query) ||
        item.priceDesc
          ?.toLowerCase()
          .includes(query)
      );
    });

  const currentData =
    paginateData(
      filteredData,
      currentPage,
      entriesPerPage
    );

  const totalPages =
    calculateTotalPages(
      filteredData.length,
      entriesPerPage
    );

  const handleEntriesChange = (
    value
  ) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  const renderStars = (
    rating
  ) => {
    if (!rating) return '-';

    const full =
      Math.floor(rating);

    const half =
      rating % 1 >= 0.5;

    return (
      <span title={`${rating}`}>
        {Array.from({
          length: full,
        }).map((_, i) => (
          <i
            key={`f${i}`}
            className="fa fa-star text-warning"
            style={{
              fontSize: '12px',
            }}
          ></i>
        ))}

        {half && (
          <i
            className="fa fa-star-half-o text-warning"
            style={{
              fontSize: '12px',
            }}
          ></i>
        )}

        <span className="ms-1 text-muted small">
          ({rating})
        </span>
      </span>
    );
  };

  const exportToExcel =
    () => {
      const exportData =
        filteredData.map(
          (item, index) => ({
            'S.No':
              index + 1,

            Title:
              item.title || '-',

            Type:
              item.type || '-',

            Address:
              item.address || '-',

            Phone:
              item.phone || '-',

            Rating:
              item.rating || '-',

            Reviews:
              item.review || '-',

            Price:
              item.priceDesc || '-',

            Hours:
              item.hours || '-',

            Latitude:
              item.latitude || '-',

            Longitude:
              item.longitude || '-',

            'Added On':
              item.addedOn
                ? new Date(
                    item.addedOn
                  ).toLocaleString()
                : '-',
          })
        );

      const worksheet =
        XLSX.utils.json_to_sheet(
          exportData
        );

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        'Search Results'
      );

      const excelBuffer =
        XLSX.write(workbook, {
          bookType: 'xlsx',
          type: 'array',
        });

      const fileData =
        new Blob(
          [excelBuffer],
          {
            type:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
          }
        );

      saveAs(
        fileData,
        `Search_Results_${Date.now()}.xlsx`
      );
    };

  return (
    <>
      {pageAccessDetails.viewAccess ? (
        <div className="row">
          <div className="col-xxl-12">
            <div className="card mt-xxl-n5 shadow-sm border-0">
              <div className="card-header d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h5 className="mb-0">
                    Search Results
                  </h5>

                  {searchInfo.category && (
                    <small className="text-muted">
                      Category:{' '}
                      <strong>
                        {
                          searchInfo.category
                        }
                      </strong>

                      {searchInfo.radiusKm &&
                        ` · Radius: ${searchInfo.radiusKm} KM`}
                    </small>
                  )}
                </div>

                <div className="d-flex gap-2 align-items-center flex-wrap">
                  {userDetails && (
                    <span className="text-muted small">
                      User:{' '}
                      <strong>
                        {
                          userDetails.userName
                        }
                      </strong>
                    </span>
                  )}

                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() =>
                      navigate(
                        '/google-search/savedsearch',
                        {
                          state: {
                            userDetails,
                          },
                        }
                      )
                    }
                  >
                    <i className="fa fa-arrow-left me-1"></i>
                    Back
                  </button>
                </div>
              </div>

              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <EntriesDropdown
                    entriesPerPage={
                      entriesPerPage
                    }
                    onEntriesChange={
                      handleEntriesChange
                    }
                    options={[
                      10,
                      25,
                      50,
                      100,
                    ]}
                  />

                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className="btn btn-success"
                      onClick={
                        exportToExcel
                      }
                      disabled={
                        filteredData.length ===
                        0
                      }
                    >
                      <i className="fa fa-file-excel-o me-1"></i>
                      Export Excel
                    </button>

                    <input
                      type="text"
                      className="form-control"
                      style={{
                        width: '260px',
                      }}
                      placeholder="Search by name, address, type..."
                      value={
                        searchQuery
                      }
                      onChange={(
                        e
                      ) => {
                        setSearchQuery(
                          e.target
                            .value
                        );

                        setCurrentPage(
                          1
                        );
                      }}
                    />
                  </div>
                </div>

                {loading ? (
                  <Loading />
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover align-middle">
                      <TableHeader
                        columns={[
                          '#',
                          'Title',
                          'Type',
                          'Address',
                          'Phone',
                          'Rating',
                          'Reviews',
                          'Price',
                          'Hours',
                          'Coordinates',
                          'Added On',
                        ]}
                      />

                      <tbody>
                        {currentData.length ===
                        0 ? (
                          <TableDataStatusError colspan="12" />
                        ) : (
                          currentData.map(
                            (
                              item,
                              index
                            ) => (
                              <tr
                                key={
                                  item.id
                                }
                              >
                                <td>
                                  {(currentPage -
                                    1) *
                                    entriesPerPage +
                                    index +
                                    1}
                                </td>

                                <td
                                  style={{
                                    minWidth:
                                      '220px',
                                  }}
                                >
                                  <div className="fw-semibold">
                                    {
                                      item.title
                                    }
                                  </div>

                                  {item.desc && (
                                    <small
                                      className="text-muted d-block"
                                      style={{
                                        maxWidth:
                                          '220px',
                                        overflow:
                                          'hidden',
                                        textOverflow:
                                          'ellipsis',
                                        whiteSpace:
                                          'nowrap',
                                      }}
                                      title={
                                        item.desc
                                      }
                                    >
                                      {
                                        item.desc
                                      }
                                    </small>
                                  )}
                                </td>

                                <td>
                                  <span className="badge bg-info text-dark">
                                    {item.type ||
                                      '-'}
                                  </span>
                                </td>

                                <td
                                  style={{
                                    minWidth:
                                      '250px',
                                  }}
                                >
                                  <small>
                                    {item.address ||
                                      '-'}
                                  </small>
                                </td>

                                <td
                                  style={{
                                    minWidth:
                                      '150px',
                                  }}
                                >
                                  {item.phone ? (
                                    <a
                                      href={`tel:${item.phone}`}
                                      className="text-decoration-none"
                                    >
                                      {
                                        item.phone
                                      }
                                    </a>
                                  ) : (
                                    '-'
                                  )}
                                </td>

                                <td
                                  style={{
                                    minWidth:
                                      '120px',
                                  }}
                                >
                                  {renderStars(
                                    item.rating
                                  )}
                                </td>

                                <td>
                                  {item.review?.toLocaleString() ||
                                    '-'}
                                </td>

                                <td>
                                  {item.priceDesc ? (
                                    <span className="badge bg-secondary">
                                      {
                                        item.priceDesc
                                      }
                                    </span>
                                  ) : (
                                    '-'
                                  )}
                                </td>

                                <td
                                  style={{
                                    minWidth:
                                      '140px',
                                  }}
                                >
                                  {item.hours ? (
                                    <small
                                      className={
                                        item.hours
                                          .toLowerCase()
                                          .includes(
                                            'open'
                                          )
                                          ? 'text-success fw-semibold'
                                          : 'text-danger fw-semibold'
                                      }
                                    >
                                      {
                                        item.hours
                                      }
                                    </small>
                                  ) : (
                                    '-'
                                  )}
                                </td>

                                <td
                                  style={{
                                    minWidth:
                                      '150px',
                                  }}
                                >
                                  <div>
                                    <small>
                                      <strong>
                                        Lat:
                                      </strong>{' '}
                                      {item.latitude ??
                                        '-'}
                                    </small>
                                  </div>

                                  <div>
                                    <small>
                                      <strong>
                                        Lng:
                                      </strong>{' '}
                                      {item.longitude ??
                                        '-'}
                                    </small>
                                  </div>
                                </td>

                                <td
                                  style={{
                                    minWidth:
                                      '180px',
                                  }}
                                >
                                  {item.addedOn
                                    ? new Date(
                                        item.addedOn
                                      ).toLocaleString()
                                    : '-'}
                                </td>
                              </tr>
                            )
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                <Pagination
                  currentPage={
                    currentPage
                  }
                  totalPages={
                    totalPages
                  }
                  totalEntries={
                    filteredData.length
                  }
                  entriesPerPage={
                    entriesPerPage
                  }
                  onPageChange={
                    setCurrentPage
                  }
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};