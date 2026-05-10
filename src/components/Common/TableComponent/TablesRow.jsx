import React from 'react';
import { BootstrapTooltip } from '../../../assets/js/script';


const TablesRow = ({ rowData, columns, hideIcons, onEdit, onDelete, onAccessChange, showIcons, onClone, pageLevelAccessData }) => {
    const handleCheckboxChange = (field) => {
        const newValue = !rowData[field];
        onAccessChange({ ...rowData, field, value: newValue });
    };

    const formatTextWithLineBreaks = (text) => {
        if (typeof text !== 'string') return text;
        const words = text.split(' ');
        return words.map((word, index) => ((index + 1) % 10 === 0 ? word + '<br/>' : word)).join(' ');
    };

    return (
        <tr className="manage-page-group">
            {columns.map((column) => (
                <td key={column}>
                    {column === 'icon' ? (
                        <span dangerouslySetInnerHTML={{ __html: rowData.icon }} />
                    ) : (
                        typeof rowData[column] === 'string' ? (
                            <span
                                dangerouslySetInnerHTML={{ __html: formatTextWithLineBreaks(rowData[column]) }}
                            />
                        ) : (
                            rowData[column]
                        )
                    )}
                </td>
            ))}

            {hideIcons && (
                <>
                    <td>
                        <div className="form-check form-switch form-switch-custom form-switch-primary">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id={`viewAccess-${rowData.id}`}
                                checked={rowData.viewAccess}
                                onChange={() => handleCheckboxChange('viewAccess')}
                            />
                        </div>
                    </td>
                    <td>
                        <div className="form-check form-switch form-switch-custom form-switch-primary">

                            <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id={`addAccess-${rowData.id}`}
                                checked={rowData.addAccess}
                                onChange={() => handleCheckboxChange('addAccess')}
                            />
                        </div>
                    </td>
                    <td>
                        <div className="form-check form-switch form-switch-custom form-switch-primary">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id={`editAccess-${rowData.id}`}
                                checked={rowData.editAccess}
                                onChange={() => handleCheckboxChange('editAccess')}
                            />

                        </div>
                    </td>
                    <td>
                        <div className="form-check form-switch form-switch-custom form-switch-primary">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id={`deleteAccess-${rowData.id}`}
                                checked={rowData.deleteAccess}
                                onChange={() => handleCheckboxChange('deleteAccess')}
                            />
                        </div>
                    </td>
                    <td>
                        <div className="form-check form-switch form-switch-custom form-switch-primary">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id={`downloadAccess-${rowData.id}`}
                                checked={rowData.downloadAccess}
                                onChange={() => handleCheckboxChange('downloadAccess')}
                            />
                        </div>
                    </td>
                </>
            )}

            {!hideIcons && (
                <td>
                    {showIcons && (
                        <BootstrapTooltip title="Clone">
                            {pageLevelAccessData.addAccess ? (
                                <span className="cursor-pointer" data-toggle="tooltip" onClick={() => onClone(rowData.id)}>
                                    <i className="ri-file-copy-line"></i>
                                </span>
                            ) : ''}
                        </BootstrapTooltip>
                    )}
                    <BootstrapTooltip title="Edit">
                        {pageLevelAccessData.editAccess ? (
                            <span className="cursor-pointer" onClick={onEdit} data-toggle="tooltip">
                                <i className="ri-pencil-fill"></i>
                            </span>
                        ) : ''}
                    </BootstrapTooltip>
                    <BootstrapTooltip title="Delete">
                        {pageLevelAccessData.deleteAccess ? (
                            <span className="cursor-pointer" onClick={onDelete} data-toggle="tooltip">
                                <i className="ri-delete-bin-6-line"></i>
                            </span>
                        ) : ''}
                    </BootstrapTooltip>
                    {!pageLevelAccessData.editAccess && !pageLevelAccessData.deleteAccess ?
                        (pageLevelAccessData.addAccess ? '' : (
                            <span style={{ color: '#dc3545' }}>
                                Forbidden
                            </span>
                        )) : ''
                    }
                </td>
            )}
        </tr>
    );
};

export default TablesRow;
