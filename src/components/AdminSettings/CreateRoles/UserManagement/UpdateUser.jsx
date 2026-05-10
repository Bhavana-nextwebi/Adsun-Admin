import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUserById, updateUser } from '../../../../services/newUserService';
import { fetchRoles } from '../../../../services/roleService';
import allImages from '../../../../assets/images-import';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { handleErrors } from '../../../../utils/errorHandler';
import PhoneInput from 'react-phone-number-input';
import { Link } from 'react-router-dom';
import { validateUserUpdate } from '../../../../utils/validation';
import { usePageLevelAccess } from '../../../../hooks/usePageLevelAccess';
import { useNavigate } from 'react-router-dom';

export const UpdateUser = ({ onBack }) => {
    const { id } = useParams();

    const [formData, setFormData] = useState({
        userId: '',
        userName: '',
        userRole: '',
        emailId: '',
        contactNo: '',
        profileImage: null,
    });

    const [currentProfileImage, setCurrentProfileImage] = useState(null);
    const [roles, setRoles] = useState([]);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [errors, setErrors] = useState({}); 
    const PageLevelAccessurl = 'user/update/:id';
    const navigate = useNavigate();
    const { pageAccessData } = usePageLevelAccess(PageLevelAccessurl);

    useEffect(() => {
        if (pageAccessData) {
            if (!pageAccessData.editAccess || !pageAccessData.viewAccess) {
                navigate('/404-error-page');
            } else {
                return;
            }
  
        } else {
            console.log('No page access details found');
        }
    })

    useEffect(() => {
        const fetchData = async () => {
            if (!id) {
                console.error('No id provided in the URL.');
                return;
            }

            try {
                const userData = await fetchUserById(id);
                if (userData) {
                    setFormData({
                        userId: userData.userId,
                        userName: userData.userName,
                        userRole: userData.userRole,
                        emailId: userData.emailId,
                        contactNo: userData.contactNo,
                        profileImage: userData.profileImage || null,
                    });
                    setCurrentProfileImage(userData.profileImage || allImages.defaultprofile);
                } else {
                    console.error('No data found for the user.');
                }

                const rolesData = await fetchRoles();
                setRoles(rolesData);
            } catch (error) {
                handleErrors(error);
            }
        };

        fetchData();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleProfileChange = (e) => {
        const file = e.target.files[0];
        setFormData((prevState) => ({ ...prevState, profileImage: file }));

        if (file) {
            const fileURL = URL.createObjectURL(file);
            setCurrentProfileImage(fileURL);
        } else {
            setCurrentProfileImage(allImages.defaultprofile);
        }
    };

    const handlePhoneChange = (phone) => {
        setFormData((prevState) => ({ ...prevState, contactNo: phone }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateUserUpdate(formData);  // Call validation

        if (Object.keys(errors).length > 0) {
            setErrors(errors);  // Set errors if any
            return;  // Don't proceed with the submission if validation fails
        }

        const { userId, userName, userRole, emailId, contactNo, profileImage } = formData;

        try {
            const updateData = new FormData();
            updateData.append('Id', id);
            updateData.append('UserId', userId);
            updateData.append('UserName', userName);
            updateData.append('UserRole', userRole);
            updateData.append('EmailId', emailId);
            updateData.append('ContactNo', contactNo);

            if (profileImage) {
                updateData.append('proFileImage', profileImage);
            }

            setIsButtonDisabled(true);
            await updateUser(updateData);
            toast.success('Update successful!', { position: "top-right", autoClose: 2000 });
            setIsButtonDisabled(false);
        } catch (error) {
            handleErrors(error);
            setIsButtonDisabled(false);
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="row">
                <div className="col-12">
                    <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                        <h4 className="mb-sm-0">Update User</h4>
                        <div className="page-title-right">
                            <ol className="breadcrumb m-0">
                                <li className="breadcrumb-item">
                                    <Link to="/">
                                        <i className="ri-home-2-fill"></i>
                                    </Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link to="/user">
                                        Manage Users
                                    </Link>
                                </li>
                                <li className="breadcrumb-item">
                                    Update User-{id}
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-xxl-12">
                    <div className="card mt-xxl-n5">
                        <div className="card-header">
                            <h5 className="mb-sm-1 mt-sm-1">Update User</h5>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="text-center">
                                            <div className="profile-user position-relative d-inline-block mx-auto mb-4">
                                                <img
                                                    src={currentProfileImage}
                                                    className="rounded-circle avatar-xl img-thumbnail user-profile-image shadow"
                                                    alt="user-profile-image"
                                                />
                                                <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                                                    <input id="profileImage" type="file" className="profile-img-file-input" onChange={handleProfileChange} />
                                                    <label htmlFor="profileImage" className="profile-photo-edit avatar-xs">
                                                        <span className="avatar-title rounded-circle bg-light text-body shadow">
                                                            <i className="ri-camera-fill"></i>
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-6 col-md-6 col-sm-12">
                                                <div className="mb-3">
                                                    <label htmlFor="userId" className="form-label">User Id <span className='required-field'>*</span></label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${errors.userId ? 'is-invalid' : ''}`}
                                                        name="userId"
                                                        value={formData.userId}
                                                        onChange={handleInputChange}
                                                    />
                                                    {errors.userId && <p className="text-danger">{errors.userId}</p>}
                                                </div>
                                            </div>
                                            <div className="col-lg-6 col-md-6 col-sm-12">
                                                <div className="mb-3">
                                                    <label htmlFor="userName" className="form-label">User Name <span className='required-field'>*</span></label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${errors.userName ? 'is-invalid' : ''}`}
                                                        name="userName"
                                                        value={formData.userName}
                                                        onChange={handleInputChange}
                                                    />
                                                    {errors.userName && <p className="text-danger">{errors.userName}</p>}
                                                </div>
                                            </div>
                                            <div className="col-lg-6 col-md-6 col-sm-12">
                                                <div className="mb-3">
                                                    <label htmlFor="emailId" className="form-label">Email Address <span className='required-field'>*</span></label>
                                                    <input
                                                        type="email"
                                                        className={`form-control ${errors.emailId ? 'is-invalid' : ''}`}
                                                        name="emailId"
                                                        value={formData.emailId}
                                                        onChange={handleInputChange}
                                                    />
                                                    {errors.emailId && <p className="text-danger">{errors.emailId}</p>}
                                                </div>
                                            </div>
                                            <div className="col-lg-6 col-md-6 col-sm-12">
                                                <div className="mb-3">
                                                    <label htmlFor="userRole" className="form-label">User Role <span className='required-field'>*</span></label>
                                                    <select
                                                        className={`form-select ${errors.userRole ? 'is-invalid' : ''}`}
                                                        name="userRole"
                                                        value={formData.userRole}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="">Select Role</option>
                                                        {roles.map((role) => (
                                                            <option key={role.id} value={role.id}>
                                                                {role.roleName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.userRole && <p className="text-danger">{errors.userRole}</p>}
                                                </div>
                                            </div>
                                            <div className="col-lg-6 col-md-6 col-sm-12">
                                                <div className="mb-3">
                                                    <label htmlFor="contactNo" className="form-label">Phone Number <span className='required-field'>*</span></label>
                                                    <PhoneInput
                                                    international
                                                    id="ContactNo"
                                                    value={formData.contactNo}
                                                    onChange={handlePhoneChange}
                                                    maxLength="15"
                                                    defaultCountry='IN'
                                                />
                                                    {errors.contactNo && <p className="text-danger">{errors.contactNo}</p>}
                                                </div>
                                            </div>
                                            
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <button
                                        type="submit"
                                        className="btn btn-secondary"
                                        disabled={isButtonDisabled}
                                    >
                                        Update User
                                    </button>
                                   
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
