import React from 'react';

export const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    totalEntries,
    entriesPerPage
}) => {
    const startEntry = (currentPage - 1) * entriesPerPage + 1;
    const endEntry = Math.min(currentPage * entriesPerPage, totalEntries);

    const getPageNumbers = () => {
        let pageNumbers = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pageNumbers.push(i);
                }
                pageNumbers.push('...'); 
                pageNumbers.push(totalPages); 
            } else if (currentPage >= totalPages - 2) {
                pageNumbers.push(1); 
                pageNumbers.push('...'); 
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pageNumbers.push(i);
                }
            } else {
                pageNumbers.push(1); 
                pageNumbers.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pageNumbers.push(i);
                }
                pageNumbers.push('...'); 
                pageNumbers.push(totalPages); 
            }
        }

        return pageNumbers;
    };

    return (
        <div className="align-items-center mt-4 p-3 justify-content-between pagination-details-responsive">
            <div className="flex-shrink-0 pt-2">
                <div className="text-muted">
                    Showing <span className="fw-semibold" style={{color:'#878a99'}}>{startEntry}</span> to <span className="fw-semibold" style={{color:'#878a99'}}>{endEntry}</span> of <span className="fw-semibold" style={{color:'#878a99'}}>{totalEntries}</span> results
                </div>
            </div>
            <ul className="pagination pagination-separated pagination-sm mb-0 pt-2">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        ←
                    </button>
                </li>

                {getPageNumbers().map((page, index) => (
                    <li key={index} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                        {typeof page === 'number' ? (
                            <button
                                className="page-link"
                                onClick={() => onPageChange(page)}
                            >
                                {page}
                            </button>
                        ) : (
                            <span className="page-link">{page}</span> 
                        )}
                    </li>
                ))}

                <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        →
                    </button>
                </li>
            </ul>
        </div>
    );
};
