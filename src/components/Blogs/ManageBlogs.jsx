import React, { useEffect, useState, useRef } from "react";
import {
  deleteBlog,
  updateBlogStatus,
  paginationBlogs,
} from "../../services/blogsServices";
import TableHeader from "../Common/TableComponent/TableHeader";
import TablesRow from "../Common/TableComponent/TablesRow";
import { useNavigate } from "react-router-dom";
import ToggleSwitch from "./ToggleSwitch";
import ToggleSwitchFeatured from "./ToggleSwitchFeatured";
import Swal from "sweetalert2";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import { handleErrors } from "../../utils/errorHandler";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import { Pagination } from "../Common/TableComponent/Pagination";
import { usePageLevelAccess } from "../../hooks/usePageLevelAccess";

export const ManageBlogs = () => {
  const navigate = useNavigate();
  const [entriesPerPage, setEntriesPerPage] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [manageBlogs, setManageBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedTerm, setSearchedTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [pageAccessDetails, setPageAccessDetails] = useState([]);
  const PageLevelAccessurl = "blogs";
  const { pageAccessData } = usePageLevelAccess(PageLevelAccessurl);

  useEffect(() => {
    if (pageAccessData) {
      if (!pageAccessData.viewAccess) {
        navigate("/404-error-page");
      } else {
        setPageAccessDetails(pageAccessData);
      }
    } else {
      console.log("No page access details found");
    }
  }, [pageAccessData, navigate]);
  const searchInputRef = useRef(null);
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      const formData = {
        pageSize: entriesPerPage,
        pageNo: currentPage,
        fromDate,
        toDate,
        fiterParam: searchedTerm,
      };
      try {
        const response = await paginationBlogs(formData);
        const { data } = response;
        setManageBlogs(data.result);
        setTotalCount(data.result[0]?.totalCount || 0);
      } catch (error) {
        handleErrors(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [entriesPerPage, currentPage, fromDate, toDate, searchedTerm]);

  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete("Blog");
    if (confirmed) {
      try {
        await deleteBlog(id);
        setManageBlogs((prev) => prev.filter((item) => item.id !== id));
        Swal.fire(
          "Deleted!",
          "The blog has been deleted successfully.",
          "success"
        );
      } catch (error) {
        handleErrors(error);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateBlogStatus(id, newStatus);
      setManageBlogs((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      handleErrors(error);
    }
  };

  const handleSearchClick = () => {
    setSearchedTerm(searchTerm);
  };

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const totalPages = Math.ceil(totalCount / entriesPerPage);

  return (
    <>
      <style>
        {`
                   .table>:not(caption)>*>* {
                      padding: .75rem 0.5rem !important;
                    }
                `}
      </style>
      {pageAccessDetails.viewAccess ? (
        <div className="row">
          <div className="col-xxl-12">
            <div className="card mt-xxl-n5">
              <div className="card-header">
                <h5 className="mb-sm-2 mt-sm-2">Manage Blogs</h5>
              </div>
              <div className="card-body manage-amenity-master-card-body">
                <div className="responsive-filter-type mb-3">
                  <div className="entries-dropdown">
                    <label htmlFor="entriesPerPage" className="form-label me-2">
                      Show entries:
                    </label>
                    <select
                      className="form-select"
                      id="entriesPerPage"
                      value={entriesPerPage}
                      onChange={handleEntriesPerPageChange}
                    >
                      <option value="30">30</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="200">200</option>
                    </select>
                  </div>
                  <div className="date-filters">
                    <label htmlFor="fromDate" className="form-label me-2">
                      From Date:
                    </label>
                    <Flatpickr
                      id="fromDate"
                      className="form-control"
                      placeholder="Select From Date"
                      value={fromDate}
                      onChange={([date]) => setFromDate(date)}
                      options={{
                        dateFormat: "Y-m-d",
                        monthSelectorType: "static",
                      }}
                    />
                  </div>
                  <div className="date-filters">
                    <label htmlFor="toDate" className="form-label me-2">
                      To Date:
                    </label>
                    <Flatpickr
                      id="toDate"
                      className="form-control"
                      placeholder="Select To Date"
                      value={toDate}
                      onChange={([date]) => setToDate(date)}
                      options={{
                        dateFormat: "Y-m-d",
                        monthSelectorType: "static",
                      }}
                    />
                  </div>
                  <div className="search-input">
                    <label htmlFor="search" className="form-label me-2">
                      Search:
                    </label>
                    <input
                      type="text"
                      id="search"
                      className="form-control"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search..."
                      ref={searchInputRef}
                    />
                  </div>
                  <div className="pt-2">
                    <button
                      className="btn btn-secondary btn-properties-search"
                      onClick={handleSearchClick}
                    >
                      Search
                    </button>
                  </div>
                </div>

                {loading ? (
                  <Loading />
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle table-bordered">
                      <TableHeader
                        columns={[
                          "#",
                          "Blog Name",
                          "Blog Category",
                          "Posted By",
                          "Tags",
                          "Posted On",
                          "Status",
                          "Published?",
                          "Featured?",
                          "Action",
                        ]}
                      />
                      <tbody className="manage-page-group-table-values p-3">
                        {manageBlogs.length === 0 ? (
                          <TableDataStatusError colspan="10" />
                        ) : (
                          manageBlogs.map((item, index) => (
                            <TablesRow
                              key={item.id}
                              rowData={{
                                BlogId:
                                  (currentPage - 1) * entriesPerPage +
                                  index +
                                  1,
                                BlogName: item.blogName,
                                BlogCategory: item.blogCategory,
                                PostedBy: item.postedBy,
                                BlogTags: item.blogTags,
                                PostedOn: new Date(
                                  item.postedOn
                                ).toLocaleDateString(),
                                status: (
                                  <span
                                    style={{ fontSize: "12px" }}
                                    className={`badge badge-soft-${
                                      item.status === "Active"
                                        ? "success"
                                        : "danger"
                                    } badge-border`}
                                  >
                                    {item.status === "Active"
                                      ? "Active"
                                      : "Draft"}
                                  </span>
                                ),
                                publish: (
                                  <ToggleSwitch
                                    blogId={item.id}
                                    initialStatus={item.status}
                                    onStatusChange={(newStatus) =>
                                      handleStatusChange(item.id, newStatus)
                                    }
                                  />
                                ),
                                featured: (
                                  <ToggleSwitchFeatured
                                    flatId={item.id}
                                    initialStatus={item.featured}
                                  />
                                ),
                              }}
                              columns={[
                                "BlogId",
                                "BlogName",
                                "BlogCategory",
                                "PostedBy",
                                "BlogTags",
                                "PostedOn",
                                "status",
                                "publish",
                                "featured",
                              ]}
                              hideIcons={false}
                              onEdit={() => {
                                navigate(`update/${item.id}`);
                              }}
                              onDelete={() => handleDelete(item.id)}
                              pageLevelAccessData={pageAccessDetails}
                            />
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalEntries={totalCount}
                  entriesPerPage={entriesPerPage}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};
