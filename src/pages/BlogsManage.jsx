import React from "react";
import { ToastContainer } from "react-toastify";
import { ManageBlogs } from "../components/Blogs/ManageBlogs";
export const BlogsManage = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <ManageBlogs />
        </div>
      </div>
    </div>
  );
};