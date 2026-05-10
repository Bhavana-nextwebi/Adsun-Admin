import React from 'react';

const TableHeader = ({ columns }) => {
    return (
        <thead className="manage-page-group-table-header">
            <tr className="form-label">
                {columns.map((col, index) => (
                    <th key={index}>{col}</th>
                ))}
            </tr>
        </thead>
    );
};

export default TableHeader;
