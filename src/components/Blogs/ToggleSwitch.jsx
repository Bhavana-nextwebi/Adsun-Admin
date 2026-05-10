import React, { useState } from 'react';
import { updateBlogStatus } from '../../services/blogsServices';
import Swal from 'sweetalert2';
import { handleErrors } from '../../utils/errorHandler';

const ToggleSwitch = ({ blogId, initialStatus, onStatusChange }) => {
  const [isActive, setIsActive] = useState(initialStatus === 'Active');

  const handleToggle = async () => {
    const modalTitle = isActive ? 'Draft Blog' : 'Publish Blog';
    const modalMessage = isActive 
      ? 'Are you sure you want to draft this blog?' 
      : 'Are you sure you want to publish this blog?';

    const result = await Swal.fire({
      title: modalTitle,
      text: modalMessage,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      const newStatus = isActive ? 'Draft' : 'Active';
      try {
        await updateBlogStatus(blogId, newStatus);

        setIsActive(!isActive);
        onStatusChange(newStatus);

        Swal.fire(
          'Success!',
          `The blog has been ${newStatus === 'Active' ? 'published' : 'drafted'}.`,
          'success'
        );
      } catch (error) {
    handleErrors(error);
      }
    }
  };

  return (
    <>
      <label className="switch">
        <div className="form-check form-switch form-switch-custom form-switch-primary">
          <input
            className="form-check-input"
            type="checkbox"
            checked={isActive}
            onChange={handleToggle}
          />
        </div>
        <span className="slider round"></span>
      </label>
    </>
  );
};

export default ToggleSwitch;
