import React, { useEffect, useState } from 'react';
import { fetchAllCategories, deleteCategory  } from '../../services/categoryService';
import { paginateData, calculateTotalPages } from '../../assets/js/script';
import TableHeader from '../Common/TableComponent/TableHeader';
import EntriesDropdown from '../Common/TableComponent/EntriesDropdown';
import TablesRow from '../Common/TableComponent/TablesRow';
import { Pagination } from '../Common/TableComponent/Pagination';
import { AddCategory } from './AddCategory';
import { Loading } from '../Common/OtherElements/Loading';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { confirmDelete } from '../Common/OtherElements/confirmDeleteClone';
import { TableDataStatusError } from '../Common/OtherElements/TableDataStatusError';
import { handleErrors } from '../../utils/errorHandler';
import { usePageLevelAccess } from '../../hooks/usePageLevelAccess';


export const ManageCategoryContent = () => {
    const [pageAccessDetails, setPageAccessDetails] = useState([]);
    const PageLevelAccessurl = 'category-master';
    const navigate = useNavigate();
    const { pageAccessData } = usePageLevelAccess(PageLevelAccessurl);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [manageCategory, setManageCategory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        console.log(pageAccessData)
       
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
            const response = await fetchAllCategories();
            setManageCategory(response.data.result);
        } catch (error) {
            handleErrors(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

   const filteredData = manageCategory.filter(item =>
    (item?.categoryName || "")
        .toLowerCase()
        .includes((searchQuery || "").toLowerCase())
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

 const handleDelete = async (CategoryId) => {
    const confirmed = await confirmDelete('Category');

    if (confirmed) {
        try {
            await deleteCategory(CategoryId);

            setManageCategory((prev) =>
                prev.filter((item) => item.id !== CategoryId)
            );

            Swal.fire(
                'Deleted!',
                'The Category has been deleted successfully.',
                'success'
            );
        } catch (error) {
            handleErrors(error);
        }
    }
};

    return (
        <>
            {pageAccessDetails.addAccess ? (
                <AddCategory
                    editMode={editMode}
                    initialData={selectedCategory}
                    onSuccess={fetchData}
                    setSelectedCategory={setSelectedCategory}
                    setEditMode={setEditMode}
                />
            ) : ''}

            {pageAccessDetails.viewAccess ? (
                <div className="row">
                    <div className="col-xxl-12">
                        <div className="card mt-xxl-n5">
                            <div className="card-header">
                                <h5 className="mb-sm-2 mt-sm-2">Manage category</h5>
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
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                                {
                                    loading ? (
                                        <Loading />
                                    ) : (
                                        <div className='table-responsive'>
                                            <table className="table align-middle table-bordered">
                                                <TableHeader columns={['#', 'Title', 'Added On', 'Action']} />
                                                <tbody className="manage-page-group-table-values">
                                                    {currentData.length === 0 ? (
                                                        <TableDataStatusError colspan="6" />
                                                    ) : (
                                                        currentData.map((item, index) => (
                                                            <TablesRow
                                                                key={item.id}
                                                                rowData={{
                                                                    id: (currentPage - 1) * entriesPerPage + index + 1,
                                
                                                                    title: item.categoryName,
                                                                  
                                                                    date: new Date(item.addedOn).toLocaleDateString(),
                                                                    
                                                                }}
                                                                columns={['id',  'title', 'date']}
                                                                hideIcons={false}
                                                                onEdit={() => {
                                                                    setSelectedCategory(item);
                                                                    setEditMode(true);
                                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                                }}
                                                                onDelete={() => handleDelete(item.id)}
                                                                pageLevelAccessData = {pageAccessDetails}
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
            ) : ''}
        </>
    );
};
