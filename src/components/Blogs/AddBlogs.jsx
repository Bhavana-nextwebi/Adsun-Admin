import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";

import { Editor } from "@tinymce/tinymce-react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import "react-quill/dist/quill.snow.css";
import { validateBlogData } from "../../utils/validation";
import {
  fetchBlogData,
  addBlog,
  updateBlog,
} from "../../services/blogsServices";
import allImages from "../../assets/images-import";
import { handleErrors } from "../../utils/errorHandler";
import { Link } from "react-router-dom";
import { Loading } from "../Common/OtherElements/Loading";
import { usePageLevelAccess } from "../../hooks/usePageLevelAccess";
import { useNavigate } from "react-router-dom";
export const AddBlogs = ({
  editMode = false,
  setSelectedPageGroup,
  setEditMode,
}) => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    BlogName: "",
    BlogUrl: "",
    BlogDesc: "",
    PostedBy: "",
    PostedOn: "",
    BlogCategory: "",
    BlogTags: "",
    PageTitle: "",
    MetaKeys: "",
    MetaDesc: "",
    ThumbImage: "",
    BigImage: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [PageLevelAccessurl, setPageLevelAccessurl] = useState();

  useEffect(() => {
    if (id) {
      setPageLevelAccessurl("/blogs/update/:id");
    } else {
      setPageLevelAccessurl("blogs/add");
    }
  }, [id]);
  const navigate = useNavigate();
  const { pageAccessData } = usePageLevelAccess(PageLevelAccessurl);

  useEffect(() => {
    if (pageAccessData) {
      if (id) {
        if (!pageAccessData.editAccess) {
          navigate("/404-error-page");
        } else {
          return;
        }
      } else {
        if (!pageAccessData.addAccess) {
          navigate("/404-error-page");
        } else {
          return;
        }
      }
    } else {
      console.log("No page access details found");
    }
  });
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const data = await fetchBlogData(id);
          if (data) {
            setFormData({
              BlogCategory: data.blogCategory || "",
              BlogName: data.blogName || "",
              BlogUrl: data.blogUrl || "",
              BlogTags: data.blogTags || "",
              BlogDesc: data.blogDesc || "",
              PostedBy: data.postedBy || "",
              PostedOn: formatDate(data.postedOn) || "",
              PageTitle: data.pageTitle || "",
              MetaKeys: data.metaKeys || "",
              MetaDesc: data.metaDesc || "",
              ThumbImagePreview: data.thumbImage || "",
              BigImagePreview: data.bigImage || "",
            });
            setContent(data.blogDesc || "<p>No description</p>");
          }
        } catch (error) {
          handleErrors(error);
        }
      } else {
        setFormData({
          BlogCategory: "",
          BlogName: "",
          BlogUrl: "",
          BlogTags: "",
          BlogDesc: "",
          PostedBy: "",
          PostedOn: "",
          PageTitle: "",
          MetaKeys: "",
          MetaDesc: "",
          ThumbImagePreview: "",
          BigImagePreview: "",
        });
        setContent("");
      }
    };

    const dateInput = document.getElementById("PostedOn");
    flatpickr(dateInput, {
      dateFormat: "d-M-Y",
      monthSelectorType: "static",
      onChange: (selectedDates, dateStr) => {
        setFormData((prevData) => ({ ...prevData, PostedOn: dateStr }));
      },
    });

    fetchData();
  }, [id]);

  const [content, setContent] = useState();
  const handleEditorChange = (content) => {
    setContent(content);
    setFormData((prevData) => ({
      ...prevData,
      BlogDesc: content,
    }));
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "PostedOn") {
      const date = new Date(value);
      const formattedDate = formatDate(date);
      setFormData((prevData) => ({ ...prevData, [name]: formattedDate }));
    } else if (name === "BlogName") {
      const urlSlug = value
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/\s+/g, "-");
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
        BlogUrl: urlSlug,
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { valid, errors } = validateBlogData(formData);

    setErrors(errors);

    if (valid) {
      setLoading(true);
      try {
        if (id) {
          setIsButtonDisabled(true);
          await updateBlog({ ...formData, id });
          toast.success("Blog updated successfully!");
          setIsButtonDisabled(false);
        } else {
          setIsButtonDisabled(true);
          await addBlog(formData);
          toast.success("Blog added successfully!");
          setIsButtonDisabled(false);
        }
      } catch (error) {
        handleErrors(error);
        setIsButtonDisabled(false);
      } finally {
        setLoading(false);
        setIsButtonDisabled(false);
      }
    }
  };
  const handleImageChange = (e, imageType) => {
    const file = e.target.files[0];

    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const { width, height } = img;
        if (
          (imageType === "ThumbImage" && (width !== 416 || height !== 326)) ||
          (imageType === "BigImage" && (width !== 1076 || height !== 509))
        ) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [imageType]: `${
              imageType === "ThumbImage" ? "Thumbnail" : "Big"
            } Image must be ${
              imageType === "ThumbImage" ? "416x326" : "1076x509"
            }.`,
          }));
        } else {
          if (formData[imageType]?.name !== file.name) {
            setFormData((prevData) => ({
              ...prevData,
              [imageType]: file,
              [`${imageType}Preview`]: URL.createObjectURL(file),
            }));
          }

          setErrors((prevErrors) => ({
            ...prevErrors,
            [imageType]: "",
          }));
        }
      };
      return () => URL.revokeObjectURL(img.src);
    }
  };
  const handleAddNewClick = () => {
    setFormData({
      BlogCategory: "",
      BlogName: "",
      BlogUrl: "",
      PostedBy: "",
      PostedOn: "",
      BlogTags: "",
      BlogDesc: "",
      PageTitle: "",
      MetaKeys: "",
      MetaDesc: "",
      ThumbImage: "",
      BigImage: "",
    });
    setErrors({});
    setApiError("");
    setSelectedPageGroup(null);
    setEditMode(false);
  };

  return (
    <>
      {id ? (
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0">Blog Details</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <Link to="/">
                      <i className="ri-home-2-fill"></i>
                    </Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="/blogs">Manage Blogs</Link>
                  </li>
                  <li className="breadcrumb-item">Update Blog-{id}</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0">Add Blog</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <Link to="/">
                      <i className="ri-home-2-fill"></i>
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Add Blog</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="card-body p-2">
        <form onSubmit={handleSubmit} method="POST">
          <div className="row">
            <div className="col-lg-8">
              <div className="card mt-xxl-n5 p-3">
                <div className="card-header-wrapper p-1">
                  <h5 className="blogs-heading">Blog Details</h5>
                </div>
                <div className="blog-name-wrapper mt-3">
                  <div className="mb-3 col-lg-6">
                    <label className="form-label">
                      Blog Name <span className="required-field">*</span>
                    </label>
                    <input
                      type="text"
                      name="BlogName"
                      value={formData.BlogName}
                      placeholder="Enter Blog Name"
                      onChange={handleInputChange}
                      className={`form-control ${
                        errors.BlogName ? "is-invalid" : ""
                      }`}
                    />
                    {errors.BlogName && (
                      <div className="invalid-feedback">{errors.BlogName}</div>
                    )}
                  </div>

                  <div className="mb-3 col-lg-6">
                    <label className="form-label">
                      Blog URL <span className="required-field">*</span>
                    </label>
                    <input
                      type="text"
                      name="BlogUrl"
                      value={formData.BlogUrl}
                      placeholder="Enter Blog URL"
                      onChange={handleInputChange}
                      className={`form-control ${
                        errors.BlogUrl ? "is-invalid" : ""
                      }`}
                      disabled
                    />
                    {errors.BlogUrl && (
                      <div className="invalid-feedback">{errors.BlogUrl}</div>
                    )}
                  </div>
                </div>

                <div className="">
                  <div className="mb-3">
                    <label className="form-label">
                      Blog Description <span className="required-field">*</span>
                    </label>

                    <Editor
                      tinymceScriptSrc="/tinymce/tinymce.min.js"
                      value={content}
                      init={{
                        height: 500,
                        menubar: false,
                        plugins: [
                          "advlist",
                          "autolink",
                          "link",
                          "image",
                          "lists",
                          "charmap",
                          "preview",
                          "anchor",
                          "pagebreak",
                          "searchreplace",
                          "wordcount",
                          "visualblocks",
                          "code",
                          "fullscreen",
                          "insertdatetime",
                          "media",
                          "table",
                          "emoticons",
                          "template",
                          "help",
                        ],
                        toolbar:
                          "undo redo | styles | bold italic | forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | preview media fullscreen | emoticons | help",
                      }}
                      onEditorChange={handleEditorChange}
                    />
                    {errors.BlogDesc ? (
                      <div style={{ color: "#dc3545", fontSize: ".875em" }}>
                        {errors.BlogDesc}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card mt-xxl-n5 p-2">
                <div className="card-header-wrapper">
                  <h5 className="">Posted Details</h5>
                </div>
                <div className="mt-2">
                  <div className="mb-3">
                    <label className="form-label">
                      Posted By <span className="required-field">*</span>
                    </label>
                    <input
                      type="text"
                      name="PostedBy"
                      value={formData.PostedBy}
                      placeholder="Enter Posted By"
                      onChange={handleInputChange}
                      className={`form-control ${
                        errors.PostedBy ? "is-invalid" : ""
                      }`}
                    />
                    {errors.PostedBy && (
                      <div className="invalid-feedback">{errors.PostedBy}</div>
                    )}
                  </div>
                </div>

                <div className="">
                  <div className="mb-3">
                    <label className="form-label">
                      Posted On <span className="required-field">*</span>
                    </label>
                    <input
                      type="text"
                      name="PostedOn"
                      value={formData.PostedOn}
                      placeholder="Enter Posted On Date"
                      onChange={handleInputChange}
                      id="PostedOn"
                      className={`form-control ${
                        errors.PostedOn ? "is-invalid" : ""
                      }`}
                      readOnly
                    />
                    {errors.PostedOn && (
                      <div className="invalid-feedback">{errors.PostedOn}</div>
                    )}
                  </div>
                </div>

                <div className="">
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      name="BlogCategory"
                      value={formData.BlogCategory}
                      placeholder="Enter the Category"
                      onChange={handleInputChange}
                      className={`form-control ${
                        errors.BlogCategory ? "is-invalid" : ""
                      }`}
                    />
                    {errors.BlogCategory && (
                      <div className="invalid-feedback">
                        {errors.BlogCategory}
                      </div>
                    )}
                  </div>
                </div>

                <div className="">
                  <div className="mb-3">
                    <label className="form-label">
                      Tags <span className="required-field">*</span>
                    </label>
                    <input
                      type="text"
                      name="BlogTags"
                      value={formData.BlogTags}
                      placeholder="Enter the Tags"
                      onChange={handleInputChange}
                      className={`form-control ${
                        errors.BlogTags ? "is-invalid" : ""
                      }`}
                    />
                    {errors.BlogTags && (
                      <div className="invalid-feedback">{errors.BlogTags}</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="">
                <div className="card mt-xxl-n5 p-3">
                  <div className="card-header-wrapper">
                    <h5 className="">Meta Data</h5>
                  </div>
                  <div className="mt-3">
                    <div className="">
                      <label className="form-label">Meta Title</label>
                      <input
                        type="text"
                        name="PageTitle"
                        value={formData.PageTitle}
                        placeholder="Enter the Page Title"
                        onChange={handleInputChange}
                        className={`form-control ${
                          errors.PageTitle ? "is-invalid" : ""
                        }`}
                      />
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="">
                      <label className="form-label">Meta Keys</label>
                      <input
                        type="text"
                        name="MetaKeys"
                        value={formData.MetaKeys}
                        placeholder="Enter the Meta Keys"
                        onChange={handleInputChange}
                        className={`form-control ${
                          errors.MetaKeys ? "is-invalid" : ""
                        }`}
                      />
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="">
                      <label className="form-label">Meta Description</label>
                      <textarea
                        name="MetaDesc"
                        value={formData.MetaDesc}
                        placeholder="Enter the Meta Description"
                        onChange={handleInputChange}
                        className="form-control"
                        rows="3"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="card mt-xxl-n5 p-3">
                <div className="card-header-wrapper">
                  <h5 className="">Images</h5>
                </div>
                <div className="mt-3">
                  <h6 className="form-label">Thumb Image</h6>

                  <p>Image Size Should Be 416 px X 326 px </p>
                  <div className="d-flex justify-content-center">
                    <div className="profile-user position-relative d-inline-block mx-auto mb-4">
                      <img
                        src={
                          formData.ThumbImagePreview || allImages.DefultImage
                        }
                        className="rounded-circle avatar-xl img-thumbnail user-profile-image shadow"
                        alt="Thumbnail Preview"
                      />

                      <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                        <input
                          id="thumbImage"
                          type="file"
                          accept="image/*"
                          className="profile-img-file-input"
                          onChange={(e) => handleImageChange(e, "ThumbImage")}
                        />
                        <label
                          htmlFor="thumbImage"
                          className="profile-photo-edit avatar-xs"
                        >
                          <span className="avatar-title rounded-circle bg-light text-body shadow">
                            <i className="ri-camera-fill"></i>
                          </span>
                        </label>
                      </div>
                      {errors.ThumbImage && (
                        <div className="invalid-feedback d-block">
                          {errors.ThumbImage}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <h6 className="form-label">Big Image</h6>
                  <p>Image Size Should Be 1076 px X 509 px </p>
                  <div className="d-flex justify-content-center">
                    <div className="profile-user position-relative d-inline-block mx-auto mb-4">
                      <img
                        src={formData.BigImagePreview || allImages.DefultImage}
                        className="rounded-circle avatar-xl img-thumbnail user-profile-image shadow"
                        alt="Big Banner Preview"
                      />

                      <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                        <input
                          id="bigImage"
                          type="file"
                          accept="image/*"
                          className="profile-img-file-input"
                          onChange={(e) => handleImageChange(e, "BigImage")}
                        />
                        <label
                          htmlFor="bigImage"
                          className="profile-photo-edit avatar-xs"
                        >
                          <span className="avatar-title rounded-circle bg-light text-body shadow">
                            <i className="ri-camera-fill"></i>
                          </span>
                        </label>
                      </div>
                      {errors.BigImage && (
                        <div className="invalid-feedback d-block">
                          {errors.BigImage}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-12">
            <div className="pt-4">
              <button
                type="submit"
                className="btn btn-secondary"
                disabled={isButtonDisabled}
              >
                {isButtonDisabled
                  ? id
                    ? "Updating"
                    : "Saving"
                  : id
                  ? "Update"
                  : "Save"}
              </button>
              {editMode && (
                <button
                  type="button"
                  onClick={handleAddNewClick}
                  className="btn btn-danger ms-1"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
          {loading && <Loading />}
          {apiError && <div className="alert alert-danger">{apiError}</div>}
        </form>
      </div>
    </>
  );
};
