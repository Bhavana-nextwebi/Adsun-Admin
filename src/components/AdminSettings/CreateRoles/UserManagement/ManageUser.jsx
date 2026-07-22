import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import TableHeader from "../../../Common/TableComponent/TableHeader";
import EntriesDropdown from "../../../Common/TableComponent/EntriesDropdown";
import TablesRow from "../../../Common/TableComponent/TablesRow";
import { Pagination } from "../../../Common/TableComponent/Pagination";
import { Loading } from "../../../Common/OtherElements/Loading";
import ResetPasswordModal from "./ModalComponents/ResetPasswordModal";

import {
  getUsers,
  deleteUser,
  createPassword,
} from "../../../../services/newUserService";

import allImages from "../../../../assets/images-import";
import { confirmDelete } from "../../../Common/OtherElements/confirmDeleteClone";
import { TableDataStatusError } from "../../../Common/OtherElements/TableDataStatusError";
import { handleErrors } from "../../../../utils/errorHandler";
import { usePageLevelAccess } from "../../../../hooks/usePageLevelAccess";

export const ManageUser = () => {
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [manageUsers, setManageUsers] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState({
    id: null,
    userName: "",
  });

  const navigate = useNavigate();

  const { pageAccessData } = usePageLevelAccess("user");
  const [pageAccessDetails, setPageAccessDetails] = useState({});

  useEffect(() => {
    if (pageAccessData) {
      if (!pageAccessData.viewAccess) {
        navigate("/404-error-page");
      } else {
        setPageAccessDetails(pageAccessData);
      }
    }
  }, [pageAccessData, navigate]);

  // ✅ FETCH USERS (Backend pagination + search)
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers({
        pageSize: entriesPerPage,
        pageNo: currentPage,
        sParam: searchQuery, // 👈 search term sent to backend
      });

      setManageUsers(response.data.result || []);
      setTotalRecords(response.data.totalRecords || 0);
    } catch (error) {
      handleErrors(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
   fetchUsers();
   // eslint-disable-next-line
}, []);

  // 🔥 Debounce search (prevents API spam)
useEffect(() => {
  const delay = setTimeout(() => {
    setCurrentPage(1);
    fetchUsers();
  }, 500);

  return () => clearTimeout(delay);

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchQuery]);
  const totalPages = Math.ceil(totalRecords / entriesPerPage);

  const handleEntriesChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = async (userId) => {
    const confirmed = await confirmDelete("user");
    if (!confirmed) return;

    try {
      await deleteUser(userId);
      toast.success("User deleted successfully!");
      fetchUsers();
    } catch (error) {
      handleErrors(error);
    }
  };

  const handleResetPassword = async ({ id, newPassword }) => {
    try {
      await createPassword({ id, newPassword });
      toast.success("Password reset successfully!");
      setShowModal(false);
    } catch (error) {
      handleErrors(error);
    }
  };

  return (
    <>
      <ToastContainer />

      {pageAccessDetails.viewAccess && (
        <div className="row">
          <div className="col-xxl-12">
            <div className="card mt-xxl-n5">
              <div className="card-header">
                <h5 className="mb-2 mt-2">Manage Users</h5>
              </div>

              <div className="card-body">

                {/* Top Controls */}
                <div className="d-flex justify-content-between mb-3">
                  <EntriesDropdown
                    entriesPerPage={entriesPerPage}
                    onEntriesChange={handleEntriesChange}
                    options={[10, 25, 50, 100]}
                  />

                  <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Search user..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Table */}
                {loading ? (
                  <Loading />
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered align-middle">

                      <TableHeader
                        columns={[
                          "#",
                          "Profile Image",
                          "Name",
                          "Email",
                          "Phone",
                          "Added On",
                          "Reset Password",
                          "Action",
                        ]}
                      />

                      <tbody>
                        {manageUsers.length === 0 ? (
                          <TableDataStatusError colspan="8" />
                        ) : (
                          manageUsers.map((item, index) => (
                            <TablesRow
                              key={item.id}
                              rowData={{
                                userId:
                                  (currentPage - 1) * entriesPerPage +
                                  index +
                                  1,
                                profileImage: (
                                  <img
                                    src={
                                    `https://4.nxtai.dev/${item.profileImage}` ||
                                      allImages.defaultprofile
                                    }
                                    alt="profile"
                                    className="profile-img"
                                  />
                                ),
                                userName: item.userName,
                                emailId: item.emailId,
                                contactNo: item.contactNo,
                                addedOn: item.registeredOn
                                  ? new Date(item.registeredOn).toLocaleDateString()
                                  : "-",
                                resetpassword: (
                                  <span
                                    className="badge text-bg-warning"
                                    style={{ fontSize: "11px" }}
                                  >
                                    <span
                                      style={{ cursor: "pointer" }}
                                      onClick={() => {
                                        setSelectedUser({
                                          id: item.id,
                                          userName: item.userName,
                                        });
                                        setShowModal(true);
                                      }}
                                    >
                                      Reset Password
                                    </span>
                                  </span>
                                ),
                              }}
                              columns={[
                                "userId",
                                "profileImage",
                                "userName",
                                "emailId",
                                "contactNo",
                                "addedOn",
                                "resetpassword",
                              ]}
                              onEdit={() => navigate(`update/${item.id}`)}
                              onDelete={() => handleDelete(item.id)}
                              pageLevelAccessData={pageAccessDetails}
                            />
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalEntries={totalRecords}
                  entriesPerPage={entriesPerPage}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <ResetPasswordModal
        show={showModal}
        onHide={() => setShowModal(false)}
        userId={selectedUser.id}
        userName={selectedUser.userName}
        onReset={handleResetPassword}
      />
    </>
  );
};