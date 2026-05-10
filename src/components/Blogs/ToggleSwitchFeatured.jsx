import React, { useState } from 'react';
import { updateBlogFeaturedStatus } from '../../services/blogsServices';
import Swal from 'sweetalert2';
import { handleErrors } from '../../utils/errorHandler';

const ToggleSwitch = ({ flatId, initialStatus }) => {
  const [isActive, setIsActive] = useState(initialStatus === 'Yes');

  const handleToggle = async () => {
    const modalTitle = isActive ? 'Remove Blog from Featured' : 'Feature the Blog';
    const modalMessage = isActive 
      ? 'Are you sure you want to remove this Blog from featured?' 
      : 'Are you sure you want to feature this Blog?';

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
      const newStatus = isActive ? 'No' : 'Yes';
      try {
        await updateBlogFeaturedStatus(flatId, newStatus);
        setIsActive(!isActive); 

        Swal.fire(
          'Success!',
          `The blog has been ${newStatus === 'Yes' ? 'featured' : 'removed from featured'}.`,
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
