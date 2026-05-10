import React from 'react';

const EntriesDropdown = ({ entriesPerPage, onEntriesChange}) => {
    const options = [10, 30, 50, 100, 200];
    return (
        <label className="form-label form-select-entry-count">
            Show&nbsp;
            <div className="dropdown">
                <button
                    className="form-select entried-dropdown-style"
                    type="button"
                    id="entriesDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    {entriesPerPage}
                </button>
                <ul className="dropdown-menu" aria-labelledby="entriesDropdown">
                    {options.map((option, index) => (
                        <li key={index}>
                            <button className="dropdown-item" onClick={() => onEntriesChange(option)}>
                                {option}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            &nbsp;Entries
        </label>
    );
};

export default EntriesDropdown;
