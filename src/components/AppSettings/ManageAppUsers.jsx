import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { paginateData, calculateTotalPages } from "../../assets/js/script";
import TableHeader from "../Common/TableComponent/TableHeader";
import EntriesDropdown from "../Common/TableComponent/EntriesDropdown";
import TablesRow from "../Common/TableComponent/TablesRow";
import { Pagination } from "../Common/TableComponent/Pagination";
import { getAppUsers, deleteAppUser,ChangePassword } from "../../services/appUserServices";
import { Loading } from "../Common/OtherElements/Loading";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import allImages from "../../assets/images-import";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import { handleErrors } from "../../utils/errorHandler";
import { usePageLevelAccess } from "../../hooks/usePageLevelAccess";
import { Eye, EyeOff } from "lucide-react";

export const ManageAppUser = () => {
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [manageAppUsers, setManageAppUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageAccessDetails, setPageAccessDetails] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
const [selectedUserGuid, setSelectedUserGuid] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [passwordLoading, setPasswordLoading] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

 const filteredData = manageAppUsers.filter((user) => {
  const query = searchQuery.toLowerCase();

  return (
    user.firstName?.toLowerCase().includes(query) ||
    user.lastName?.toLowerCase().includes(query) ||
    user.emailId?.toLowerCase().includes(query) ||
    user.mobileNo?.toLowerCase().includes(query)
  );
});
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
  const handleChangePassword = async () => {
  if (!newPassword || !confirmPassword) {
    Swal.fire("Error", "Please fill all fields", "error");
    return;
  }

  if (newPassword !== confirmPassword) {
    Swal.fire("Error", "Passwords do not match", "error");
    return;
  }

  try {
    setPasswordLoading(true);

    await ChangePassword({
      userGuid: selectedUserGuid,
      newPassword: newPassword,
    });

    Swal.fire(
      "Success",
      "Password updated successfully",
      "success"
    );

    setShowPasswordModal(false);
    setNewPassword("");
    setConfirmPassword("");
    setSelectedUserGuid("");
  } catch (error) {
    handleErrors(error);
  } finally {
    setPasswordLoading(false);
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
  autoComplete="new-password"
  name="search_random_app_user"
  id="search_random_app_user"
  spellCheck={false}
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
                           "Change Password",
                          "Added On",
                          "Action",
                        ]}
                      />
                      <tbody className="manage-property-owner-table-values">
                        {currentData.length === 0 ? (
                          <TableDataStatusError colspan="9" />
                        ) : (
                          currentData.map((item, index) => (
                            <TablesRow
                              key={item.id}
                              rowData={{
                                userId:
                                  (currentPage - 1) * entriesPerPage + index + 1,
                                profileImage: (
                                  <img
                                    src={  item.proFileImage
          ? `https://4.nxtai.dev/${item.proFileImage}`
          : allImages.defaultprofile}
                                    alt="Profile"
                                    className="profile-img"
                                  />
                                ),
                                FirstName: item.firstName,
                                LastName: item.lastName,
                                emailId: item.emailId,
                                MobileNo: item.mobileNo,
                                changePassword: (
 <button
  type="button"
  className="btn btn-sm"
  style={{
    background:
      "linear-gradient(135deg, #f59e0b, #facc15)",
    border: "none",
    color: "#000",
    fontWeight: "600",
    borderRadius: "8px",
    padding: "6px 12px",
    whiteSpace: "nowrap",
  }}
  onClick={() => {
    setSelectedUserGuid(item.userGuid);
    setShowPasswordModal(true);
  }}
>
  Change Password
</button>
),
                                addedOn: new Date(item.createdOn).toLocaleDateString(),
                              }}
                              columns={[
                                "userId",
                                "profileImage",
                                "FirstName",
                                "LastName",
                                "emailId",
                                "MobileNo",
                                "changePassword",
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
      {showPasswordModal && (
  <div
    className="modal fade show d-block"
    tabIndex="-1"
    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
  >
    <div className="modal-dialog modal-dialog-centered">
      <div
        className="modal-content border-0"
        style={{
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          className="modal-header border-0"
          style={{
            background:
              "linear-gradient(135deg, #f59e0b, #facc15)",
          }}
        >
          <h5 className="modal-title fw-bold text-dark">
            Change Password
          </h5>

          <button
            type="button"
            className="btn-close"
            onClick={() => setShowPasswordModal(false)}
          ></button>
        </div>

        {/* Body */}
        <div className="modal-body p-4">
          <div className="mb-3">
            <label className="form-label fw-semibold">
              New Password
            </label>

          <div className="position-relative">
  <input
    type={showNewPassword ? "text" : "password"}
    className="form-control pe-5"
    placeholder="Enter new password"
    autoComplete="new-password"
    value={newPassword}
    onChange={(e) => setNewPassword(e.target.value)}
  />

  <button
    type="button"
    className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent"
    onClick={() => setShowNewPassword(!showNewPassword)}
  >
    {showNewPassword ? (
      <Eye size={18} />
    ) : (
      <EyeOff size={18} />
    )}
  </button>
</div>

      </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Confirm Password
            </label>
<div className="position-relative">
  <input
    type={showConfirmPassword ? "text" : "password"}
    className="form-control pe-5"
    placeholder="Confirm password"
    autoComplete="new-password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
  />

  <button
    type="button"
    className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent"
    onClick={() =>
      setShowConfirmPassword(!showConfirmPassword)
    }
  >
    {showConfirmPassword ? (
      <Eye size={18} />
    ) : (
      <EyeOff size={18} />
    )}
  </button>
</div>
    
            
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer border-0">
          <button
  type="button"
  className="btn btn-light"
  onClick={() => setShowPasswordModal(false)}
>
  Cancel
</button>

          <button
  type="button"
  className="btn"
  style={{
    background:
      "linear-gradient(135deg, #f59e0b, #facc15)",
    color: "#000",
    fontWeight: "600",
    border: "none",
  }}
  onClick={handleChangePassword}
  disabled={passwordLoading}
>
  {passwordLoading ? "Updating..." : "Update Password"}
</button>
        </div>
      </div>
    </div>
  </div>
)}
    </>
  );
};