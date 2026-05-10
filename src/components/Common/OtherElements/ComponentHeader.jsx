import React from 'react';
import { Link } from 'react-router-dom';

const ComponentHeader = ({ title }) => {


  return (
    <div className="row">
      <div className="col-12">
        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
          <h4 className="mb-sm-0">{title}</h4>
          <div className="page-title-right">
            <ol className="breadcrumb m-0">
              <li className="breadcrumb-item">
                <Link to="/">
                <i className="ri-home-2-fill"></i>
                </Link>
              </li>
              <li className="breadcrumb-item">
                {title}
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};


export default ComponentHeader;
