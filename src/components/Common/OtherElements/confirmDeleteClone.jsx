import Swal from "sweetalert2";

export const confirmDelete = async (entityName) => {
  const result = await Swal.fire({
    title: `Are you sure?`,
    text: `Do you really want to delete this ${entityName}? This action cannot be undone.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  });

  return result.isConfirmed;
};

export const confirmClone = async (entityName) => {
  const result = await Swal.fire({
    title: `Are you sure?`,
    text: `Do you really want to clone this ${entityName}?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, clone it!",
    cancelButtonText: "Cancel",
  });
  return result.isConfirmed;
};

export const cancelVerified = async (entityName) => {
  const result = await Swal.fire({
    title: `Are you sure?`,
    text: `Do you really want to do this ${entityName}?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes,  it!",
    cancelButtonText: "Cancel",
  });
  return result.isConfirmed;
};
