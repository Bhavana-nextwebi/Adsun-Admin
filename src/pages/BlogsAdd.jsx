import React from "react";
import { ToastContainer } from "react-toastify";
import { AddBlogs } from "../components/Blogs/AddBlogs";
export const BlogsAdd = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <AddBlogs />
        </div>
      </div>
    </div>
  );
};