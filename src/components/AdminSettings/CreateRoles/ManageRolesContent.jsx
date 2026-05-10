import React, { useEffect, useState } from 'react';
import { fetchRoles, deleteRole } from '../../../services/roleService';
import { paginateData, calculateTotalPages } from '../../../assets/js/script';
import TableHeader from '../../Common/TableComponent/TableHeader';
import EntriesDropdown from '../../Common/TableComponent/EntriesDropdown';
import TablesRow from '../../Common/TableComponent/TablesRow';
import { Pagination } from '../../Common/TableComponent/Pagination';
import { AddRoles } from './AddRoles';
import { Loading } from '../../Common/OtherElements/Loading';
import Swal from 'sweetalert2';
import { confirmDelete } from '../../Common/OtherElements/confirmDeleteClone';
import { TableDataStatusError } from '../../Common/OtherElements/TableDataStatusError';
import { handleErrors } from '../../../utils/errorHandler';
import { usePageLevelAccess } from '../../../hooks/usePageLevelAccess';
import { useNavigate } from 'react-router-dom';


export const ManageRolesContent = () => {
    const [pageAccessDetails, setPageAccessDetails] = useState([]);
    const PageLevelAccessurl = 'create-role';
    const navigate = useNavigate();
    const { pageAccessData } = usePageLevelAccess(PageLevelAccessurl);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [managePageGroup, setManagePageGroup] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPageGroup, setSelectedPageGroup] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (pageAccessData) {
            if(!pageAccessData.addAccess && !pageAccessData.viewAccess){
            navigate('/404-error-page');
            } else{
                setPageAccessDetails(pageAccessData);
            }
            
        } else {
            console.log('No page access details found');
        }
    },[pageAccessData, navigate])
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetchRoles();
            setManagePageGroup(response);
        } catch (error) {
            handleErrors(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredRoles = managePageGroup.filter(item =>
        item.roleName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const currentData = paginateData(filteredRoles, currentPage, entriesPerPage);
    const totalPages = calculateTotalPages(filteredRoles.length, entriesPerPage);

    const handleEntriesChange = value => {
        setEntriesPerPage(value);
        setCurrentPage(1);
    };

    const handlePageChange = newPage => {
        setCurrentPage(newPage);
    };

    const handleDelete = async (roleId) => {
        const confirmed = await confirmDelete('role');
        if (confirmed) {
            try {
                await deleteRole(roleId);
                setManagePageGroup(prev => prev.filter(item => item.id !== roleId));
                Swal.fire('Deleted!', 'Role has been deleted successfully.', 'success');
            } catch (error) {
                handleErrors(error);
            }
        }
    };

    const handleSearchChange = e => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    return (
        <>
        {pageAccessDetails.addAccess ? (
            <AddRoles
                editMode={editMode}
                initialData={selectedPageGroup}
                onSuccess={fetchData}
                setSelectedPageGroup={setSelectedPageGroup}
                setEditMode={setEditMode}
            />
        ) : ''}
        {pageAccessDetails.viewAccess ? (
            <div className="row">
                <div className="col-xxl-12">
                    <div className="card mt-xxl-n5">
                        <div className="card-header">
                            <h5 className="mb-sm-2 mt-sm-2">Manage Roles</h5>
                        </div>
                        <div className="card-body manage-amenity-master-card-body">
                            <div className="pagination-details-responsive justify-content-between mb-3">
                                <EntriesDropdown
                                    entriesPerPage={entriesPerPage}
                                    onEntriesChange={handleEntriesChange}
                                />
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="form-control mb-2"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </div>
                            {loading ? (
                                <Loading />
                            ) : (
                                <div className='table-responsive'>
                                    <table className="table align-middle table-bordered">
                                        <TableHeader columns={['#', 'Role Name', 'Manage Access', 'Added On', 'Action']} />
                                        <tbody className="manage-page-group-table-values">
                                            {currentData.length === 0 ? (
                                                <TableDataStatusError colspan="5" />
                                            ) : (
                                                currentData.map((item, index) => (
                                                    <TablesRow
                                                        key={item.id}
                                                        rowData={{
                                                            id: (currentPage - 1) * entriesPerPage + index + 1,
                                                            name: item.roleName,
                                                            manageaccess: (
                                                                <a href={`/Manage-role-access/${item.id}/${item.roleName}`}>
                                                                    <i className="ri-user-settings-line"></i>
                                                                </a>
                                                            ),
                                                            addedon: new Date(item.addedOn).toLocaleDateString()
                                                        }}
                                                        columns={['id', 'name', 'manageaccess', 'addedon']}
                                                        hideIcons={false}
                                                        onEdit={() => {
                                                            setSelectedPageGroup(item);
                                                            setEditMode(true);
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
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
                                totalEntries={filteredRoles.length}
                                entriesPerPage={entriesPerPage}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
            ) : ''}
        </>
    );
};
