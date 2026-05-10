import React from 'react'

export const TableDataStatusError = ({ colspan }) => {
    return (
        <>
            <tr>
                <td colSpan={colspan} className="text-center">
                    <i className="ri-error-warning-line me-3 align-middle fs-16 text-danger"></i><strong>No Data Found.</strong>
                </td>
            </tr>
        </>
    )
}
