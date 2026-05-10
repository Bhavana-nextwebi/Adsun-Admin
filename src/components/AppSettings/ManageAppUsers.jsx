import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { paginateData, calculateTotalPages } from "../../assets/js/script";
import TableHeader from "../Common/TableComponent/TableHeader";
import EntriesDropdown from "../Common/TableComponent/EntriesDropdown";
import TablesRow from "../Common/TableComponent/TablesRow";
import { Pagination } from "../Common/TableComponent/Pagination";
import { getAppUsers, deleteAppUser } from "../../services/appUserServices";
import { Loading } from "../Common/OtherElements/Loading";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import allImages from "../../assets/images-import";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import { handleErrors } from "../../utils/errorHandler";
import { usePageLevelAccess } from "../../hooks/usePageLevelAccess";

export const ManageAppUser = () => {
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [manageAppUsers, setManageAppUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageAccessDetails, setPageAccessDetails] = useState([]);

  const PageLevelAccessurl = "app-user";
  const navigate = useNavigate();
  const { pageAccessData } = usePageLevelAccess(PageLevelAccessurl);

  useEffect(() => {
    if (pageAccessData) {
      if (!pageAccessData.viewAccess) {
        navigate("/404-error-page");
      } else {
        setPageAccessDetails(pageAccessData);
      }
    }
  }, [pageAccessData, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAppUsers();
        setManageAppUsers(response.data.result);
      } catch (error) {
        handleErrors(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = manageAppUsers.filter((user) =>
   user.firstName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentData = paginateData(filteredData, currentPage, entriesPerPage);
  const totalPages = calculateTotalPages(filteredData.length, entriesPerPage);

  const handleEntriesChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => setCurrentPage(newPage);

  const handleDelete = async (userId) => {
    const confirmed = await confirmDelete("appUser");
    if (confirmed) {
      try {
        await deleteAppUser(userId);
        setManageAppUsers((prev) => prev.filter((item) => item.id !== userId));
        Swal.fire("Deleted!", "User deleted successfully!", "success");
      } catch (error) {
        handleErrors(error);
      }
    }
  };

  return (
    <>
      <ToastContainer />
      {pageAccessDetails.viewAccess ? (
        <div className="row">
          <div className="col-xxl-12">
            <div className="card mt-xxl-n5">
              <div className="card-header">
                <h5 className="mb-sm-2 mt-sm-2">Manage App Users</h5>
              </div>
              <div className="card-body manage-amenity-master-card-body">
                <div className="pagination-details-responsive justify-content-between mb-3">
                  <EntriesDropdown
                    entriesPerPage={entriesPerPage}
                    onEntriesChange={handleEntriesChange}
                    options={[10, 25, 50, 100]}
                  />
                  <div>
                    <input
                      type="text"
                      placeholder="Search..."
                      className="form-control mb-2"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
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
                          "Profile Image",
                          "First Name",
                          "Last Name",
                          "Email Address",
                          "Phone Number",
                          "Added On",
                          "Action",
                        ]}
                      />
                      <tbody className="manage-property-owner-table-values">
                        {currentData.length === 0 ? (
                          <TableDataStatusError colspan="8" />
                        ) : (
                          currentData.map((item, index) => (
                            <TablesRow
                              key={item.id}
                              rowData={{
                                userId:
                                  (currentPage - 1) * entriesPerPage + index + 1,
                                profileImage: (
                                  <img
                                    src={item.proFileImage || allImages.defaultprofile}
                                    alt="Profile"
                                    className="profile-img"
                                  />
                                ),
                                FirstName: item.firstName,
                                LastName: item.lastName,
                                emailId: item.emailId,
                                MobileNo: item.mobileNo,
                                addedOn: new Date(item.registeredOn).toLocaleDateString(),
                              }}
                              columns={[
                                "userId",
                                "profileImage",
                                "FirstName",
                                "LastName",
                                "emailId",
                                "MobileNo",
                                "addedOn",
                              ]}
                              hideIcons={false}
                              onEdit={() => navigate(`add/${item.id}`)}
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
                  totalEntries={filteredData.length}
                  entriesPerPage={entriesPerPage}
                  onPageChange={handlePageChange}
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