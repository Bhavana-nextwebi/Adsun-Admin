import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { paginateData, calculateTotalPages } from '../../../assets/js/script';
import TableHeader from '../../Common/TableComponent/TableHeader';
import EntriesDropdown from '../../Common/TableComponent/EntriesDropdown';
import TablesRow from '../../Common/TableComponent/TablesRow';
import { Pagination } from '../../Common/TableComponent/Pagination';
import { fetchManageAccessData, updatePageAccess } from '../../../services/manageAccess';
import { Loading } from '../../Common/OtherElements/Loading';
import { TableDataStatusError } from '../../Common/OtherElements/TableDataStatusError';
import { handleErrors } from '../../../utils/errorHandler';
import { usePageLevelAccess } from '../../../hooks/usePageLevelAccess';
import { useNavigate } from 'react-router-dom';


export const ManageAccessContent = () => {
    const { roleId } = useParams();
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [accessData, setAccessData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const PageLevelAccessurl = 'Manage-role-access/:roleId/:roleName';
    const navigate = useNavigate();
    const { pageAccessData } = usePageLevelAccess(PageLevelAccessurl);
    const tableColumns = ['Id', 'Page Group', 'Page Name', 'Page Link', 'View', 'Add', 'Edit', 'Delete', 'Download'];

    useEffect(() => {
        if (pageAccessData) {
            if (!pageAccessData.viewAccess) {
                navigate('/400-error-page');
            } else {
                return;
            }

        } else {
            console.log('No page access details found');
        }
    })

    useEffect(() => {
        const getData = async () => {
            try {
                const data = await fetchManageAccessData(roleId);
                setAccessData(data);
            } catch (error) {
                handleErrors(error);
            } finally {
                setLoading(false);
            }
        };

        getData();
    }, [roleId]);

    const handleEntriesChange = (value) => {
        setEntriesPerPage(value);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => setCurrentPage(newPage);

    const handleAccessChange = async (updatedRow) => {
        try {
            const itemToUpdate = accessData.find(item => item.pageId === updatedRow.id);
            if (itemToUpdate) {
                const updatedData = { ...itemToUpdate, [updatedRow.field]: updatedRow.value };
                await updatePageAccess(updatedData);

                setAccessData(prevData =>
                    prevData.map(item => (item.pageId === updatedRow.id ? updatedData : item))
                );
            } else {
                console.log('No matching pageId found to update.');
            }
        } catch (error) {
            handleErrors(error);
        }
    };

    const filteredData = accessData.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        return (
            item.pageGroupName.toLowerCase().includes(searchLower) ||
            item.pageName.toLowerCase().includes(searchLower)
        );
    });

    const currentData = paginateData(filteredData, currentPage, entriesPerPage);
    const totalPages = calculateTotalPages(filteredData.length, entriesPerPage);

    return (
        <div className="row">
            <div className="col-xxl-12">
                <div className="card mt-xxl-n5">
                    <div className="card-header">
                        <h5 className="mb-sm-2 mt-sm-2">Manage Role Access</h5>
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
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {loading ? (
                            <Loading />
                        ) : (
                            <div className='table-responsive'>
                                <table className="table align-middle table-bordered">
                                    <TableHeader columns={tableColumns} />
                                    <tbody className="manage-page-group-table-values">
                                        {currentData.length > 0 ? (
                                            currentData.map((item, index) => (
                                                <TablesRow
                                                    key={item.pageId}
                                                    rowData={{
                                                        id: item.pageId,
                                                        pagegroup: item.pageGroupName,
                                                        pagename: item.pageName,
                                                        pagelink: item.pageLink,
                                                        viewAccess: item.viewAccess,
                                                        addAccess: item.addAccess,
                                                        editAccess: item.editAccess,
                                                        deleteAccess: item.deleteAccess,
                                                        downloadAccess: item.downloadAccess,
                                                    }}
                                                    columns={['id', 'pagegroup', 'pagename', 'pagelink']}
                                                    hideIcons={true}
                                                    onAccessChange={handleAccessChange}
                                                />
                                            ))
                                        ) : (
                                            <TableDataStatusError colspan="9" />
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
    );
};
