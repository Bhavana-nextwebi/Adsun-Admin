import React, { useEffect, useState } from 'react';
import { fetchPageMasters, deletePageMaster } from '../../../services/pageMasterService';
import { paginateData, calculateTotalPages } from '../../../assets/js/script';
import TableHeader from '../../Common/TableComponent/TableHeader';
import EntriesDropdown from '../../Common/TableComponent/EntriesDropdown';
import TablesRow from '../../Common/TableComponent/TablesRow';
import { Pagination } from '../../Common/TableComponent/Pagination';
import { AddPageMaster } from './AddPageMaster';
import { Loading } from '../../Common/OtherElements/Loading';
import Swal from 'sweetalert2';
import { confirmDelete } from '../../Common/OtherElements/confirmDeleteClone';
import { TableDataStatusError } from '../../Common/OtherElements/TableDataStatusError';
import { handleErrors } from '../../../utils/errorHandler';
import { useNavigate } from 'react-router-dom';
import { usePageLevelAccess } from '../../../hooks/usePageLevelAccess';


export const ManageMasterContent = () => {
    const [pageAccessDetails, setPageAccessDetails] = useState([]);
    const PageLevelAccessurl = 'page-master';
    const { pageAccessData } = usePageLevelAccess(PageLevelAccessurl);
    const navigate = useNavigate();
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [managePagegroup, setManagePageGroup] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPageGroup, setSelectedPageGroup] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (pageAccessData) {
            if (!pageAccessData.addAccess && !pageAccessData.viewAccess) {
                navigate('/404-error-page');
            } else {
                setPageAccessDetails(pageAccessData);
            }

        } else {
            console.log('No page access details found');
        }
    },[pageAccessData, navigate])

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetchPageMasters();
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

    const filteredData = managePagegroup.filter(item =>
        item.pageGroupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.pageName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentData = paginateData(filteredData, currentPage, entriesPerPage);
    const totalPages = calculateTotalPages(filteredData.length, entriesPerPage);

    const handleEntriesChange = (value) => {
        setEntriesPerPage(value);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleDelete = async (groupId) => {
        const confirmed = await confirmDelete('page master');
        if (confirmed) {
            try {
                await deletePageMaster(groupId);
                setManagePageGroup((prev) => prev.filter((item) => item.id !== groupId));
                Swal.fire('Deleted!', 'The page master has been deleted successfully.', 'success');
            } catch (error) {
                handleErrors(error);
            }
        }
    };


    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    return (
        <>
            {pageAccessDetails.addAccess ? (
                <AddPageMaster
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
                                <h5 className="mb-sm-2 mt-sm-2">Manage Page Master</h5>
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
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                        />
                                    </div>
                                </div>
                                {
                                    loading ? (
                                        <Loading />
                                    ) : (
                                        <div className='table-responsive'>
                                            <table className="table align-middle table-bordered">
                                                <TableHeader columns={['#', 'Group', 'Show Menu', 'Title', 'Page Link', 'Added On', 'Action']} />
                                                <tbody className="manage-page-group-table-values">
                                                    {
                                                        currentData.length === 0 ? (
                                                            <TableDataStatusError colspan="7" />
                                                        ) : (
                                                            currentData.map((item, index) => (
                                                                <TablesRow
                                                                    key={item.id}
                                                                    rowData={{
                                                                        id: (currentPage - 1) * entriesPerPage + index + 1,
                                                                        group: item.pageGroupName,
                                                                        showmenu: item.showInMenu ? 'Yes' : 'No',
                                                                        title: item.pageName,
                                                                        pagelink: item.pageLink,
                                                                        addedon: new Date(item.addedOn).toLocaleDateString(),
                                                                    }}
                                                                    columns={['id', 'group', 'showmenu', 'title', 'pagelink', 'addedon']}
                                                                    hideIcons={false}
                                                                    onEdit={() => {
                                                                        setSelectedPageGroup(item);
                                                                        setEditMode(true);
                                                                        window.scrollTo({
                                                                            top: 0,
                                                                            behavior: 'smooth'
                                                                        });
                                                                    }}
                                                                    onDelete={() => handleDelete(item.id)}
                                                                    pageLevelAccessData={pageAccessDetails}
                                                                />
                                                            ))
                                                        )
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                                }

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
            ) : ''}
        </>
    );
};
