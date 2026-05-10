import { isValidPhoneNumber } from "react-phone-number-input";
//validation for page group
export const validateAddPageGroup = (formData) => {
  let valid = true;
  const errors = {};

  if (!formData.groupName.trim()) {
    errors.groupName = "Group Name is required";
    valid = false;
  } else if (formData.groupName.length > 50) {
    errors.groupName = "Valid Group Name is required";
    valid = false;
  }

  if (!formData.groupIcon.trim()) {
    errors.groupIcon = "Group Icon is required";
    valid = false;
  }

  if (!formData.groupOrder.trim()) {
    errors.groupOrder = "Group Order is required";
    valid = false;
  } else if (isNaN(formData.groupOrder) || formData.groupOrder.length > 100) {
    errors.groupOrder = "Valid Group Order is required";
    valid = false;
  }

  return { valid, errors };
};

//validation for page master
export const validatePageMaster = (data) => {
  const errors = {};
  let valid = true;

  if (!data.pageGroup) {
    errors.pageGroup = "Page Group is required";
    valid = false;
  }
  if (!data.pageName) {
    errors.pageName = "Page Name is required";
    valid = false;
  } else if (data.pageName.length > 50) {
    errors.pageName = "Valid Page Name is required";
    valid = false;
  }
  if (!data.pageLink) {
    errors.pageLink = "Page Link is required";
    valid = false;
  }
  if (
    data.pageDesc !== null &&
    data.pageDesc.trim() !== "" &&
    data.pageDesc.length > 100
  ) {
    errors.pageDesc = "Valid Page Description is required";
    valid = false;
  }

  return { valid, errors };
};

//validation for creating roles
export const validateRoles = (formData) => {
  const errors = {};
  const { roleName } = formData;

  if (!roleName) {
    errors.roleName = "Role name is required.";
  } else if (roleName.length > 50) {
    errors.roleName = "Valid Role Name is required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

//validation for amenity master
export const validateAmenityMaster = (formData) => {
  const errors = {};
  let valid = true;

  if (!formData.amenityName) {
    errors.amenityName = "Amenity Name is required.";
    valid = false;
  } else if (formData.amenityName.length > 50) {
    errors.amenityName = "Valid Amenity Name is required";
    valid = false;
  }

  if (!formData.amenityIcon) {
    errors.amenityIcon = "Amenity Icon is required.";
    valid = false;
  }

  return { valid, errors };
};

//validation for BHK Type Master
export const validateBHKType = (formData) => {
  const errors = {};
  const { bhkType } = formData;

  if (!bhkType) {
    errors.bhkType = "BHK Type is required.";
  } else if (bhkType.length > 50) {
    errors.bhkType = "Valid BHK Type is required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

//validation for Property Type Master
export const validatePropertyType = (data) => {
  const errors = {};
  let valid = true;

  if (!data.propertyType) {
    valid = false;
    errors.propertyType = "Property Type is required.";
  } else if (data.propertyType.length > 50) {
    errors.propertyType = "Valid Property type is required";
    valid = false;
  }

  return { valid, errors };
};

//validation for city type master
export const validateCity = (data) => {
  const errors = {};
  let valid = true;

  if (!data.cityName) {
    errors.cityName = "City name is required";
    valid = false;
  } else if (data.cityName.length > 50) {
    errors.cityName = "Valid City Name is required";
    valid = false;
  }

  return { valid, errors };
};

//validation for brand master
export const validateBrand = (data) => {
  const errors = {};
  let valid = true;

  if (!data.brandName) {
    errors.brandName = "Brand name is required";
    valid = false;
  } else if (data.brandName.length > 50) {
    errors.brandName = "Valid Brand Name is required";
    valid = false;
  }

  return { valid, errors };
};

export const validateSpecs = (data) => {
  const errors = {};
  let valid = true;

  if (!data.specName) {
    errors.specName = "Specification name is required";
    valid = false;
  } else if (data.specName.length > 50) {
    errors.specName = "Valid Specification Name is required";
    valid = false;
  }

  return { valid, errors };
};

//validation for location type master
export const validateLocation = (formData) => {
  let errors = {};
  let valid = true;

  if (!formData.cityName) {
    errors.cityName = "City is required";
    valid = false;
  }

  if (!formData.locationName) {
    errors.locationName = "Location name is required";
    valid = false;
  } else if (formData.locationName.length > 50) {
    errors.locationName = "Valid Location name is required";
    valid = false;
  }

  return { valid, errors };
};

//validation for property owner
export const validatePropertyOwnerForm = (values) => {
  const errors = {};

  if (!values.firstName) {
    errors.firstName = "First name is required.";
  }

  if (!values.lastName) {
    errors.lastName = "Last name is required.";
  }

  if (!values.emailAddress) {
    errors.emailAddress = "Email address is required.";
  } else if (!/\S+@\S+\.\S+/.test(values.emailAddress)) {
    errors.emailAddress = "Email address is invalid.";
  }
  if (!values.DOB) {
    errors.DOB = "Date of Birth is required";
  }
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(values.PANNo)) {
    errors.PANNo = "Valid Pan card is required";
  }

  if (!values.contactNo) {
    errors.contactNo = "Phone number is required.";
  }
  if (!values.CompleteAddress) {
    errors.CompleteAddress = "Address is required";
  }
  if (!values.owner_password) {
    errors.owner_password = "Password is required.";
  } else if (values.owner_password.length < 8) {
    errors.owner_password = "Password must be at least 8 characters.";
  } else if (
    !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/.test(values.owner_password)
  ) {
    errors.owner_password =
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
  }

  if (!values.owner_confirm_password) {
    errors.owner_confirm_password = "Please confirm your password.";
  } else if (values.owner_password !== values.owner_confirm_password) {
    errors.owner_confirm_password = "Passwords do not match.";
  }

  return errors;
};

//validation for SWR property
export const validateFields = (data) => {
  const errors = {};
  let valid = true;

  if (!data.city) {
    errors.city = "City is required";
    valid = false;
  }
  if (!data.propertyLocation) {
    errors.propertyLocation = "Property location is required";
    valid = false;
  }
  if (!data.propertyType) {
    errors.propertyType = "Property type is required";
    valid = false;
  }
  if (!data.propertyName) {
    errors.propertyName = "Property name is required";
    valid = false;
  } else if (data.propertyName.length > 100) {
    errors.propertyName = "Property name must be less than 100 characters";
    valid = false;
  }
  if (!data.noOfFlats) {
    errors.noOfFlats = "Number of flats is required";
    valid = false;
  } else if (data.noOfFlats > 1000) {
    errors.noOfFlats = "Valid Number of flats is required";
  }
  if (!data.handOverDate) {
    errors.handOverDate = "Hand Over Date is required";
  }
  if (!data.rentStatDate) {
    errors.handOverDate = "Hand Over Date is required";
  }
  if (!data.renewalDate) {
    errors.handOverDate = "Hand Over Date is required";
  }
  if (!data.noOfFloors) {
    errors.noOfFloors = "Number of floors is required";
    valid = false;
  } else if (data.noOfFloors > 100) {
    errors.noOfFloors = "Valid Number of floors is required";
    valid = false;
  }
  if (!data.buldingAge) {
    errors.buldingAge = "Building age is required";
    valid = false;
  } else if (data.buldingAge > 100 || data.buldingAge < 1) {
    errors.buldingAge = "Valid Building age is required";
    valid = false;
  }

  if (
    data.powerBackup !== null &&
    data.powerBackup.trim() !== "" &&
    data.powerBackup.length > 50
  ) {
    errors.powerBackup = "Valid Power backup is required";
    valid = false;
  }

  if (
    data.waterSource !== null &&
    data.waterSource.trim() !== "" &&
    data.waterSource.length > 50
  ) {
    errors.waterSource = "Valid water source is required";
    valid = false;
  }
  if (!data.eBillGenerateDate) {
    errors.eBillGenerateDate = "Electricity Bill Generation Date is required";
    valid = false;
  } else if (
    data.eBillGenerateDate.length < 1 ||
    data.eBillGenerateDate.length > 31
  ) {
    errors.eBillGenerateDate =
      "Valid Electricity Bill Generation Date is required";
    valid = false;
  }

  if (!data.eBillDueDate) {
    errors.eBillDueDate = "Electricity Bill Due Date is required";
    valid = false;
  } else if (data.eBillDueDate.length < 1 || data.eBillDueDate.length > 31) {
    errors.eBillDueDate = "Valid Electricity Bill Due Date is required";
    valid = false;
  }

  if (!data.propertyAddress) {
    errors.propertyAddress = "Property address is required";
    valid = false;
  } else if (data.propertyAddress.length > 250) {
    errors.propertyAddress = "Property Address must not exceed 250 characters";
  }

  return { valid, errors };
};

//validation for Flat Master
export const validateFlatFields = (data) => {
  const errors = {};

  if (!data.flatNo || data.flatNo.length < 1 || data.flatNo.length > 50) {
    errors.flatNo = "Valid Flat No is required.";
  }
  if (!data.floorNo || data.floorNo < 0 || data.floorNo > 100) {
    errors.floorNo = "Valid Floor No is required.";
  }
  if (!data.flatSeries || data.flatSeries < 1 || data.flatSeries > 20) {
    errors.flatSeries = "Valid Flat Series is required.";
  }
  if (!data.flatName || data.flatName.length > 150) {
    errors.flatName = "Valid Flat Name is required.";
  }
  if (!data.flatUrl || data.flatUrl.length > 150) {
    errors.flatUrl = "Valid Flat URL is required.";
  }
  if (!data.propertyManagedBy) {
    errors.propertyManagedBy = "Property Managed By is required.";
  }
  if (!data.preferredTenants) {
    errors.preferredTenants = "Preferred Tenants is required.";
  }
  if (!data.parking) {
    errors.parking = "Parking is required.";
  }
  if (!data.bhkType) {
    errors.bhkType = "BHK Type is required.";
  }
  if (!data.furnished) {
    errors.furnished = "Furnished is required.";
  }
  if (!data.flatDesc) {
    errors.flatDesc = "Flat Description is required.";
  }
  if (!data.ownerGuid) {
    errors.ownerGuid = "Select atleast one owner.";
  }
  if (
    data.operatingSince &&
    (data.operatingSince.length > 4 || data.operatingSince.length < 4)
  ) {
    errors.operatingSince = "Valid Operating Since must contain 4 characters";
  }
  if (!data.flatSize || data.flatSize < 1 || data.flatSize > 100000) {
    errors.flatSize = "Valid Flat Size is required.";
  }
  if (!data.noOfBalcony || data.noOfBalcony < 0 || data.noOfBalcony > 10) {
    errors.noOfBalcony = "Valid No Of Balcony is required.";
  }
  if (!data.noOfBedRooms || data.noOfBedRooms < 0 || data.noOfBedRooms > 10) {
    errors.noOfBedRooms = "Valid No Of Bedrooms is required.";
  }
  if (
    !data.noOfBathRooms ||
    data.noOfBathRooms < 0 ||
    data.noOfBathRooms > 10
  ) {
    errors.noOfBathRooms = "Valid No Of Bathrooms is required.";
  }
  if (!data.availableFrom) {
    errors.availableFrom = "Available From is required.";
  }
  if (!data.handoverDate) {
    errors.handoverDate = "Hand Over Date is required.";
  }
  if (!data.renewalDate) {
    errors.renewalDate = "Renewal Date is required.";
  }
  if (
    data.eMeterNo !== null &&
    data.eMeterNo.trim() !== "" &&
    data.eMeterNo.length > 30
  ) {
    errors.eMeterNo = "Valid Electricity Meter Number is required";
  }
  if (
    data.wMeterNo !== null &&
    data.wMeterNo.trim() === "" &&
    data.wMeterNo.length > 30
  ) {
    errors.wMeterNo = "Valid Water Meter Number is required.";
  }
  if (
    data.waterBill !== null &&
    data.waterBill.trim() === "" &&
    data.waterBill.length > 10
  ) {
    errors.waterBill = "Valid Water Bill is required.";
  }
  if (
    data.facing !== null &&
    data.facing.trim() === "" &&
    data.facing.length > 20
  ) {
    errors.facing = "Valid Flat Facing is required.";
  }
  if (!data.stayType) {
    errors.stayType = "Select atleast one stay type.";
  }
  if (
    data.pageTitle !== null &&
    data.pageTitle.trim() === "" &&
    data.pageTitle.length > 200
  ) {
    errors.pageTitle = "Valid Page Title is required.";
  }
  if (!Array.isArray(data.amenityIds) || data.amenityIds.length === 0) {
    errors.amenityIds = "Select at least one Amenity.";
  }

  if (
    !data.flatPricing.monthlyRentST ||
    data.flatPricing.monthlyRentST < 1 ||
    data.flatPricing.monthlyRentST > 1000000
  ) {
    errors.flatPricing = errors.flatPricing || {};
    errors.monthlyRentST = "Valid Monthly Rent (ST) is required.";
  }
  if (
    !data.flatPricing.monthlyRentSTDeposit ||
    data.flatPricing.monthlyRentSTDeposit < 1 ||
    data.flatPricing.monthlyRentSTDeposit > 1000000
  ) {
    errors.flatPricing = errors.flatPricing || {};
    errors.monthlyRentSTDeposit =
      "Valid Monthly Rent Deposit (ST) is required.";
  }
  if (
    !data.flatPricing.monthlyRentLT ||
    data.flatPricing.monthlyRentLT < 1 ||
    data.flatPricing.monthlyRentLT > 1000000
  ) {
    errors.flatPricing = errors.flatPricing || {};
    errors.monthlyRentLT = "Valid Monthly Rent (LT) is required.";
  }
  if (
    !data.flatPricing.monthlyRentLTDeposit ||
    data.flatPricing.monthlyRentLTDeposit < 1 ||
    data.flatPricing.monthlyRentLTDeposit > 1000000
  ) {
    errors.flatPricing = errors.flatPricing || {};
    errors.monthlyRentLTDeposit =
      "Valid Monthly Rent Deposit (LT) is required.";
  }
  if (
    !data.flatPricing.dailyRent ||
    data.flatPricing.dailyRent < 1 ||
    data.flatPricing.dailyRent > 1000000
  ) {
    errors.flatPricing = errors.flatPricing || {};
    errors.dailyRent = "Valid Daily Rent is required.";
  }
  if (data.flatPricing.flatMaintenance < 0) {
    errors.flatPricing = errors.flatPricing || {};
    errors.flatMaintenance = "Valid Flat Maintainence is required.";
  }
  if (
    !data.flatPricing.dailyRentDeposit ||
    data.flatPricing.dailyRentDeposit < 1 ||
    data.flatPricing.dailyRentDeposit > 1000000
  ) {
    errors.flatPricing = errors.flatPricing || {};
    errors.dailyRentDeposit = "Valid Daily Rent Deposit is required.";
  }
  if (
    !data.flatPricing.ownerRent ||
    data.flatPricing.ownerRent < 1 ||
    data.flatPricing.ownerRent > 1000000
  ) {
    errors.flatPricing = errors.flatPricing || {};
    errors.ownerRent = "Valid Owner Rent is required.";
  }
  if (data.flatPricing.fixedWaterBill < 0) {
    errors.flatPricing = errors.flatPricing || {};
    errors.fixedWaterBill = "Valid Fixed Water Bill is required.";
  }
  return errors;
};

//flat gallery validation
export const validateImageForm = ({ fileName, fileAlt }) => {
  const errors = {};

  if (fileName && fileName.trim() === "") {
    errors.fileName = "Valid File name is required.";
  }

  if (fileAlt && fileAlt.trim() === "") {
    errors.fileAlt = "Valid File alt is required.";
  }

  return errors;
};

export const validateVideoForm = ({ fileName, fileAlt, videoUrl }) => {
  const errors = {};

  if (fileName && fileName.trim() === "") {
    errors.fileName = "Valid File Name is Required";
  }

  if (fileAlt && fileAlt.trim() === "") {
    errors.fileAlt = "Valid File alt is required.";
  }

  if (!videoUrl || videoUrl.trim() === "") {
    errors.videoUrl = "Video URL is required.";
  }

  return errors;
};

//validation for property
export const validatePropertyNearby = (formData) => {
  let valid = true;
  const errors = {};
  if (!formData.nearByName.trim()) {
    errors.nearByName = "Nearby Name is required";
    valid = false;
  } else if (formData.nearByName.length > 50) {
    errors.nearByName = "Valid Nearby Name is required";
    valid = false;
  }

  if (!formData.nearByTypes.trim()) {
    errors.nearByTypes = "Nearby Types is required";
    valid = false;
  } else if (formData.nearByTypes.length > 50) {
    errors.nearByTypes = "vallid Nearby Type is required";
    valid = false;
  }

  if (!formData.distanceInKM.trim()) {
    errors.distanceInKM = "Distance in KM is required";
    valid = false;
  } else if (
    isNaN(formData.distanceInKM) ||
    formData.distanceInKM <= 0 ||
    formData.distanceInKM > 100
  ) {
    errors.distanceInKM = "Valid Distance is required";
    valid = false;
  }
  if (!formData.nearByLink.trim()) {
    formData.nearByLink = "#";
  }
  return { valid, errors };
};

//validation for new user
export const validateNewUserForm = (values) => {
  const errors = {};

  if (!values.UserName) {
    errors.UserName = "User name is required.";
  }

  if (!values.UserId) {
    errors.UserId = "User Id is required.";
  }
  if (!values.UserRole) {
    errors.UserRole = "User Role is required.";
  }

  if (!values.EmailId) {
    errors.EmailId = "Email address is required.";
  } else if (!/\S+@\S+\.\S+/.test(values.EmailId)) {
    errors.EmailId = "Email address is invalid.";
  }

  if (!values.ContactNo) {
    errors.ContactNo = "Phone number is required.";
  } else if (!isValidPhoneNumber(values.ContactNo)) {
    errors.ContactNo = "Please enter a valid phone number.";
  }

  if (!values.owner_password) {
    errors.owner_password = "Password is required.";
  } else if (values.owner_password.length < 8) {
    errors.owner_password = "Password must be at least 8 characters.";
  } else if (
    !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/.test(values.owner_password)
  ) {
    errors.owner_password =
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
  }

  if (!values.owner_confirm_password) {
    errors.owner_confirm_password = "Please confirm your password.";
  } else if (values.owner_password !== values.owner_confirm_password) {
    errors.owner_confirm_password = "Passwords do not match.";
  }

  return errors;
};

// validate user password
export const validatePasswordForm = (newPassword, confirmPassword) => {
  const errors = {};
  if (!newPassword) {
    errors.newPassword = "New Password is required";
  } else if (newPassword.length < 8) {
    errors.newPassword = "New Password must be at least 8 characters long";
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/.test(newPassword)) {
    errors.newPassword =
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
  }
  if (!confirmPassword) {
    errors.confirmPassword = "Confirm Password is required";
  } else if (confirmPassword !== newPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

//validate current user - password reset form
export const validatePasswords = (
  currentPassword,
  newPassword,
  confirmPassword
) => {
  const errors = {};

  if (!currentPassword) {
    errors.currentPassword = "Current password is required.";
  }
  if (!newPassword) {
    errors.newPassword = "New password is required.";
  } else if (newPassword.length < 8) {
    errors.newPassword = "Password must be at least 8 characters long.";
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/.test(newPassword)) {
    errors.newPassword =
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
  }
  if (newPassword !== confirmPassword) {
    errors.confirmPassword = "New password and confirm password do not match.";
  }

  return errors;
};
//validate app users


export const validateAppUserForm = (values) => {
  const errors = {};

  if (!values.FirstName) {
    errors.FirstName = "First name is required.";
  }

  if (!values.LastName) {
    errors.LastName = "Last name is required.";
  }

  if (!values.EmailId) {
    errors.EmailId = "Email address is required.";
  } else if (!/\S+@\S+\.\S+/.test(values.EmailId)) {
    errors.EmailId = "Email address is invalid.";
  }

  // ✅ Fixed: formValues → values, added string guard
  if (!values.MobileNo) {
    errors.MobileNo = 'Phone number is required.';
  } else if (typeof values.MobileNo !== 'string' || !isValidPhoneNumber(values.MobileNo)) {
    errors.MobileNo = 'Enter a valid phone number.';
  }

  if (!values.Password) {
    errors.Password = "Password is required.";
  } else if (values.Password.length < 8) {
    errors.Password = "Password must be at least 8 characters.";
  } else if (
    !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/.test(values.Password) // ✅ Fixed: values.owner_password → values.Password
  ) {
    errors.Password = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
  }

  if (!values.Confirm_Password) {
    errors.Confirm_Password = "Please confirm your password.";
  } else if (values.Password !== values.Confirm_Password) {
    errors.Confirm_Password = "Passwords do not match.";
  }

  return errors;
};
//validate blogs form
export const validateBlogData = (formData) => {
  let valid = true;
  const errors = {};

  if (!formData.BlogCategory || !formData.BlogCategory.trim()) {
    errors.BlogCategory = "Blog Category is required";
    valid = false;
  }

  if (!formData.BlogName || !formData.BlogName.trim()) {
    errors.BlogName = "Blog Name is required";
    valid = false;
  }

  if (!formData.BlogUrl || !formData.BlogUrl.trim()) {
    errors.BlogUrl = "Blog URL is required";
    valid = false;
  } else if (!isValidUrl(formData.BlogUrl)) {
    errors.BlogUrl = "Blog URL must be a valid URL";
    valid = false;
  }

  if (!formData.PostedBy || !formData.PostedBy.trim()) {
    errors.PostedBy = "Posted By is required";
    valid = false;
  }
  if (!formData.PostedOn || !formData.PostedOn.trim()) {
    errors.PostedOn = "Posted On date is required";
    valid = false;
  } else if (!isValidPostedOnDate(formData.PostedOn)) {
    errors.PostedOn =
      "Posted On must be a valid date in the format dd-MMM-yyyy";
    valid = false;
  }

  if (!formData.BlogDesc) {
    errors.BlogDesc = "Blog Description is required";
    valid = false;
  }

  if (!formData.BlogTags) {
    errors.BlogTags = "Blog Tags is required";
    valid = false;
  }
  if (!formData.ThumbImagePreview) {
    errors.ThumbImage = "Thumbnail Image is required";
    valid = false;
  }
  if (!formData.BigImagePreview) {
    errors.BigImage = "Big Image is required";
    valid = false;
  }

  return { valid, errors };
};
export const validateCategoryData = (formData) => {
  let valid = true;
  const errors = {};

  if (!formData.categoryName || !formData.categoryName.trim()) {
    errors.CategoryName = "Category Name is required";
    valid = false;
  }

  return { valid, errors };
};

export const validateServicesData = (formData) => {
  let valid = true;
  const errors = {};

  if (!formData.categoryId || !formData.categoryId) {
    errors.categoryId = "CategoryId is required";
    valid = false;
  }

  if (!formData.subCategoryId || !formData.subCategoryId) {
    errors.subCategoryId = "SubCategoryId is required";
    valid = false;
  }

  if (!formData.workTypeName || !formData.workTypeName.trim()) {
    errors.workTypeName = "WorkTypeName is required";
    valid = false;
  }
  if (!formData.serviceTypeName || !formData.serviceTypeName.trim()) {
    errors.serviceTypeName = "ServiceTypeName is required";
    valid = false;
  }
  if (!formData.serviceName || !formData.serviceName.trim()) {
    errors.serviceName = "ServiceName is required";
    valid = false;
  }
  if (!formData.amount || isNaN(formData.amount)) {
    errors.amount = "Amount is required and should be a valid number";
    valid = false;
  }

  if (!formData.shortDesc) {
    errors.shortDesc = "Short Description is required";
    valid = false;
  }
  if (!formData?.serviceDesc?.trim()) {
    errors.serviceDesc = "Service Desc is required";
    valid = false;
  }

  if (!formData.serviceImagePreview) {
    errors.serviceImage = "Service Image is required";
    valid = false;
  }

  return { valid, errors };
};
const isValidUrl = (url) => {
  const urlPattern = new RegExp("^[a-z0-9-]+$", "i");
  return !!urlPattern.test(url);
};

const isValidPostedOnDate = (dateString) => {
  const datePattern = /^\d{2}-[A-Za-z]{3}-\d{4}$/;
  return datePattern.test(dateString);
};

//validate assign properties

export const validateAssignProperties = (data) => {
  const errors = {};

  if (!data.city) {
    errors.city = "City is required";
  }
  if (!data.locationName) {
    errors.locationName = "Location is required";
  }
  if (!data.propertyGuid) {
    errors.propertyGuid = "Property is required";
  }
  if (!data.userGuid) {
    errors.userGuid = "Please assign the property";
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

// validation for onboarding customers
export const validatePersonalDetails = (data) => {
  const errors = {};

  if (!data.businessName) {
    errors.businessName = "BusinessName is required.";
  } else if (data.businessName.length < 1 || data.businessName.length > 50) {
    errors.businessName = "Valid BusinessName is required";
  }

  if (!data.contactName) {
    errors.contactName = "Last Name is required";
  } else if (data.contactName.length < 1 || data.contactName.length > 50) {
    errors.contactName = "Valid Last Name is required";
  }

  if (!data.pwd) {
    errors.pwd = "Password is required.";
  } else if (data.pwd.length < 8) {
    errors.pwd = "Password must be at least 8 characters.";
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/.test(data.pwd)) {
    errors.pwd =
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (
    !data.emailAddress ||
    !emailRegex.test(data.emailAddress) ||
    data.emailAddress.length > 50
  ) {
    errors.emailAddress = "Valid Email Address is required.";
  }

  if (!data.phoneNo) {
    errors.phoneNo = "Phone Number is required";
  } else if (data.phoneNo.length !== 10 || isNaN(data.phoneNo)) {
    errors.phoneNo = "Valid Phone Number is required (10 digits)";
  }

  if (!data.houseNo) {
    errors.houseNo = "House Number is required";
  } else if (data.houseNo.length !== 50 || isNaN(data.houseNo)) {
    errors.houseNo = "Valid House Number is required ";
  }

  if (data.locality && data.locality.length > 50) {
    errors.locality = "Valid locality is required";
  }

  if (!data.city || data.city.length < 1 || data.city.length > 50) {
    errors.city = "Valid City name is required";
  }

  if (!data.state || data.state.length < 1 || data.state.length > 50) {
    errors.state = "Valid State is required";
  }

  if (!data.roadName || data.roadName.length < 1 || data.roadName.length > 50) {
    errors.roadName = "Valid Road Name is required";
  }

  if (!data.pincode || data.pincode.length < 1 || data.pincode.length > 10) {
    errors.pincode = "Valid Pincode is required";
  }

  return errors;
};

// validation for onboarding customers
export const validatePersonalCustomerDetails = (data) => {
  const errors = {};

  if (!data.ownerName) {
    errors.ownerName = "ownerName is required.";
  } else if (data.ownerName.length < 1 || data.ownerName.length > 50) {
    errors.ownerName = "Valid ownerName is required";
  }

  if (!data.pwd) {
    errors.pwd = "Password is required.";
  } else if (data.pwd.length < 8) {
    errors.pwd = "Password must be at least 8 characters.";
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/.test(data.pwd)) {
    errors.pwd =
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (
    !data.emailAddress ||
    !emailRegex.test(data.emailAddress) ||
    data.emailAddress.length > 50
  ) {
    errors.emailAddress = "Valid Email Address is required.";
  }

  if (!data.phoneNo) {
    errors.phoneNo = "Phone Number is required";
  } else if (data.phoneNo.length !== 10 || isNaN(data.phoneNo)) {
    errors.phoneNo = "Valid Phone Number is required (10 digits)";
  }

  if (data.locality && data.locality.length > 50) {
    errors.locality = "Valid locality is required";
  }
  if (!data.houseNo) {
    errors.houseNo = "House Number is required";
  } else if (data.houseNo.length !== 50 || isNaN(data.houseNo)) {
    errors.houseNo = "Valid House Number is required ";
  }

  if (!data.city || data.city.length < 1 || data.city.length > 50) {
    errors.city = "Valid City name is required";
  }

  if (!data.state || data.state.length < 1 || data.state.length > 50) {
    errors.state = "Valid State is required";
  }

  if (!data.roadName || data.roadName.length < 1 || data.roadName.length > 50) {
    errors.roadName = "Valid Road Name is required";
  }

  if (!data.pincode || data.pincode.length < 1 || data.pincode.length > 10) {
    errors.pincode = "Valid Pincode is required";
  }

  return errors;
};
// validation for orders page

export const validateOrderDetails = (data) => {
  const errors = {};

  if (
    !data.userName ||
    data.userName.length === 0 ||
    data.userName.length > 100
  ) {
    errors.userName = "Valid User name is required.";
  }

  if (
    !data.emailAddress ||
    data.emailAddress.length === 0 ||
    data.emailAddress.length > 100
  ) {
    errors.emailAddress = "Valid Email address is required.";
  }

  if (!data.contactNo || !isValidPhoneNumber(data.contactNo)) {
    errors.contactNo = "Valid Contact number is required.";
  }

  if (!data.moveInDate) {
    errors.moveInDate = "Move-in date is required.";
  }

  if (
    !data.stayType ||
    (data.stayType !== "Daily" && data.stayType !== "Monthly")
  ) {
    errors.stayType = "Stay Type is required.";
  }

  if (!data.stayCount || isNaN(data.stayCount) || data.stayCount < 1) {
    errors.stayCount = "No of Days is required.";
  }

  if (!data.noOfGuest || isNaN(data.noOfGuest) || data.noOfGuest < 1) {
    errors.noOfGuest = "Number of guests is required";
  }

  if (!data.flatId) {
    errors.flatId = "Select FLat.";
  }

  if (!data.rentAmount || isNaN(data.rentAmount) || data.rentAmount < 0) {
    errors.rentAmount = "Rent amount is required.";
  }

  if (
    !data.onboardingCharge ||
    isNaN(data.onboardingCharge) ||
    data.onboardingCharge < 0
  ) {
    errors.onboardingCharge = "Onboarding charge is required.";
  }

  if (data.maintenanceCharge < 0) {
    errors.maintenanceCharge = "Maintenance charge is required.";
  }

  if (data.waterBill < 0) {
    errors.waterBill = "Water bill is required.";
  }
  // if(data.rentDiscount < 0 || data.rentDiscount > 1000000){
  //   errors.rentDiscount = "Rent Discount must be between 1-10";
  // }

  if (data.rentDiscount > data.rentAmount || data.rentDiscount < 0) {
    errors.rentDiscount =
      "Rent Discount must be less than Rent Amount and greater than 0";
  }

  if (
    data.securityDiscount > data.securityDeposit ||
    data.securityDiscount < 0
  ) {
    errors.securityDiscount =
      "Security Discount must be less than Rent Amount and greater than 0";
  }

  if (!data.paidAmount || isNaN(data.paidAmount) || data.paidAmount < 0) {
    errors.paidAmount = "Paid amount is required.";
  }

  if (
    data.stayType === "Monthly" &&
    data.stayCount < 6 &&
    data.paymentType === "Full"
  ) {
    if (data.paidAmount > data.constMonthlyFullAmountRent) {
      errors.paidAmount = `Amount should be less than ${data.constMonthlyFullAmountRent}`;
    } else if (data.paidAmount < data.formattedTotal) {
      errors.paidAmount = `Amount should be greater than ${data.formattedTotal}`;
    }
  }

  if (data.payType && !["Token", "Full"].includes(data.payType)) {
    errors.payType = "Payment type must be either 'Token' or 'Full'.";
  }

  return errors;
};

//validate product master

export const validateProduct = (data) => {
  const errors = {};
  let valid = true;

  if (!data.productName) {
    errors.productName = "Product Name is required";
    valid = false;
  } else if (data.productName.length > 50) {
    errors.productName = "Valid Product Name is required";
    valid = false;
  }

  return { valid, errors };
};

//validate vendor form

// validation.js
export const validateVendorForm = (data) => {
  const errors = {};
  let valid = true;

  if (!data.vendorName) {
    errors.vendorName = "Vendor Name is required.";
    valid = false;
  } else if (data.vendorName.length < 0 || data.vendorName.length > 50) {
    errors.vendorName = "Valid Vendor Name is required.";
    valid = false;
  }

  if (!data.city) {
    errors.city = "City is required.";
    valid = false;
  }

  if (!data.contactNo) {
    errors.contactNo = "Phone number is required.";
  } else if (!Number(data.contactNo)) {
    errors.contactNo = "Invalid phone number format.";
  }

  if (!data.emailAddress) {
    errors.emailAddress = "Email Address is required.";
    valid = false;
  } else if (!/\S+@\S+\.\S+/.test(data.emailAddress)) {
    errors.emailAddress = "Email Address is invalid.";
    valid = false;
  }

  if (!data.buildingNo) {
    errors.buildingNo = "Building Number is required.";
    valid = false;
  } else if (data.buildingNo.length < 0 || data.buildingNo.length > 100) {
    errors.buildingNo = "Valid Building Number is required.";
    valid = false;
  }

  if (!data.streetAddress) {
    errors.streetAddress = "Street Address is required.";
    valid = false;
  } else if (data.streetAddress.length < 0 || data.streetAddress.length > 100) {
    errors.streetAddress = "Valid Street Address is required.";
    valid = false;
  }

  if (!data._State) {
    errors._State = "State is required.";
    valid = false;
  } else if (data._State.length < 0 || data._State.length > 50) {
    errors._State = "Valid State is required.";
    valid = false;
  }

  if (!data.pincode) {
    errors.pincode = "Pincode is required.";
    valid = false;
  } else if (!/^\d{6}$/.test(data.pincode)) {
    errors.pincode = "Pincode must be a 6-digit number.";
    valid = false;
  }

  return { valid, errors };
};

//validate assets form fields
export const validateAssetForm = (values) => {
  const errors = {};

  if (!values.productName) {
    errors.productName = "Product Name is required";
  } else if (values.productName.length < 0 || values.productName.length > 100) {
    errors.productName = "Valid Product Name is required";
  }

  if (values.brandName && values.brandName.length > 100) {
    errors.brandName = "Valid Brand Name is required";
  }
  if (!values.remark) {
    errors.remark = "Asset Specification is required";
  }

  if (values.remark && values.remark.length > 255) {
    errors.remark = "Valid Remark is required";
  }

  if (!values.warrantyInMonths) {
    errors.warrantyInMonths = "Warranty is required";
  }

  if (values.vendor && values.vendor.length > 100) {
    errors.vendor = "Valid Vendor name is required";
  }

  if (values.skuCode && values.skuCode.length > 50) {
    errors.skuCode = "Valid SKU Code is required";
  }

  if (values.serielNo && values.serielNo.length > 50) {
    errors.serielNo = "Valid Serial Number is required";
  }

  if (!values.purchasedOn) {
    errors.purchasedOn = "Purchase date is required";
  }

  if (!values.expiryDate) {
    errors.expiryDate = "Expiry date is required";
  }

  if (
    !values.amount ||
    isNaN(values.amount) ||
    values.amount < 0 ||
    values.amount > 10000000
  ) {
    errors.amount = "Valid Amount is required";
  }

  if (values.amount && (values.amount < 0 || values.amount > 10000000)) {
    errors.amount = "Valid Amount is required";
  }

  return errors;
};

//validating assigning assets form fields
export const validateAssignAssetsForm = (formData) => {
  const errors = {};

  if (!formData.flatGuid || formData.flatGuid.length > 50) {
    errors.flatGuid = "Flat is required.";
  }

  if (formData.assetList && formData.assetList.length > 0) {
    const assetErrors = formData.assetList.map((asset, index) => {
      const assetError = {};
      if (!asset.assetGuid || asset.assetGuid.length > 50) {
        assetError.assetGuid = `Asset ${index + 1}: Asset GUID is required.`;
      }
      console.log("asset quantity entered", asset.quantity);
      if (asset.quantity < 1 || asset.quantity > 1000) {
        assetError.quantity = "Valid Quantity is required";
      }
      return Object.keys(assetError).length > 0 ? assetError : null;
    });

    if (assetErrors.some((error) => error !== null)) {
      errors.assetList = assetErrors;
    }
  } else {
    errors.assetList = "At least one asset must be added.";
  }

  return errors;
};

//validation for support form
export const validateSupportForm = (flatGuid, typeOfSupport, description) => {
  const errors = {};

  // if (!flatGuid) {
  //   errors.flatGuid = "Flat is required.";
  // } else if (typeof flatGuid !== "string") {
  //   errors.flatGuid = "Invalid flat identifier.";
  // }

  if (!typeOfSupport) {
    errors.typeOfSupport = "Type of Support is required.";
  } else if (typeof typeOfSupport !== "string") {
    errors.typeOfSupport = "Invalid support type.";
  }

  if (!description) {
    errors.description = "Description is required.";
  } else if (description.length > 255) {
    errors.description = "Valid Description is required.";
  }

  return errors;
};

//validtion for support updation form

export const validateSupportUpdateForm = (selectedProduct, remarks) => {
  const errors = {};
  if (!selectedProduct) {
    errors.ActivityType = "Activity Type is required";
  }

  if (!remarks) {
    errors.remarks = "Remarks are required";
  }

  return errors;
};

//propertyExpenses Validation
export const validatePropertyExpenseForm = (data) => {
  const errors = {};

  if (!data.NatureOfExpense || data.NatureOfExpense.trim() === "") {
    errors.NatureOfExpense = "Nature of Expense is required.";
  }

  if (!data.PropertyGuid || data.PropertyGuid.trim() === "") {
    errors.PropertyGuid = "Property is required.";
  }

  if (data.FlatGuid && data.FlatGuid.trim() === "") {
    errors.FlatGuid = "Flat is invalid.";
  }

  if (!data.ApprovedBy || data.ApprovedBy.trim() === "") {
    errors.ApprovedBy = "Approved By is required.";
  }

  if (!data.Amount || data.Amount <= 0) {
    errors.Amount = "Amount must be a positive number.";
  }

  if (!data.ExpenseDate || isNaN(new Date(data.ExpenseDate).getTime())) {
    errors.ExpenseDate = "Valid Expense Date is required.";
  }

  if (!data.Comments && data.Comments.trim().length > 500) {
    errors.Comments = "Please enter the comment.";
  }

  return errors;
};

export const validatePropertyAuditForm = (data) => {
  const errors = {};

  if (!data.PropertyGuid || data.PropertyGuid.trim() === "") {
    errors.PropertyGuid = "Property is required.";
  }

  if (data.FlatGuid && data.FlatGuid.trim() === "") {
    errors.FlatGuid = "Flat is invalid.";
  }

  if (!data.AuditDate || isNaN(new Date(data.AuditDate).getTime())) {
    errors.AuditDate = "Valid Audit Date is required.";
  }

  if (!data.Comments || data.Comments.length > 500) {
    errors.Comments = "Please enter the comments";
  }

  if (data.Attachments && data.Attachments.length === 0) {
    errors.Attachments = "At least one attachment is required.";
  }
  return errors;
};

export const validatePaymentForm = (formData) => {
  const errors = {};

  if (!formData.paymentId) {
    errors.paymentId = "Payment ID is required.";
  } else if (formData.paymentId.length > 50) {
    errors.paymentId = "Valid Payment ID is required.";
  }

  if (!formData.paidOn) {
    errors.paidOn = "Paid On date is required.";
  } else if (formData.paidOn.length > 50) {
    errors.paidOn = "Valid Paid On date is required.";
  }

  return errors;
};

//profile page validation

export const validateProfileForm = (
  userId,
  userName,
  userRole,
  emailId,
  contactNo
) => {
  const errors = {};

  if (!userId) {
    errors.userId = "User ID is required.";
  }

  if (!userName) {
    errors.userName = "User Name is required.";
  }

  if (!userRole) {
    errors.userRole = "User Role is required.";
  }

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailId || !emailPattern.test(emailId)) {
    errors.emailId = "Valid Email Address is required.";
  }

  if (!contactNo) {
    errors.contactNo = "Contact Number is required.";
  } else if (!isValidPhoneNumber(contactNo)) {
    errors.contactNo = "Please enter a valid phone number.";
  }

  return errors;
};

// Validate user update form
export const validateUserUpdate = (formData) => {
  const errors = {};

  if (!formData.userId) {
    errors.userId = "User ID is required";
  }

  if (!formData.userName) {
    errors.userName = "User Name is required";
  }

  if (!formData.userRole) {
    errors.userRole = "User Role is required";
  }

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!formData.emailId) {
    errors.emailId = "Email is required";
  } else if (!emailRegex.test(formData.emailId)) {
    errors.emailId = "Invalid email address";
  }

  if (!formData.contactNo) {
    errors.contactNo = "Phone number is required";
  } else if (!isValidPhoneNumber(formData.contactNo)) {
    errors.contactNo = "Invalid phone number";
  }

  return errors;
};

//validate app user update form


export const validateAppUserUpdate = (formData) => {
  const errors = {};

  // Match exact keys from your formValues state
  if (!formData.FirstName) {
    errors.FirstName = "First name is required";
  }

  if (!formData.LastName) {
    errors.LastName = "Last name is required";
  }

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!formData.EmailId) {
    errors.EmailId = "Email is required";
  } else if (!emailRegex.test(formData.EmailId)) {
    errors.EmailId = "Invalid email address";
  }

  // Guard: must be a non-empty string before calling isValidPhoneNumber
  if (!formData.MobileNo) {
    errors.MobileNo = "Phone number is required.";
  } else if (typeof formData.MobileNo !== 'string' || !isValidPhoneNumber(formData.MobileNo)) {
    errors.MobileNo = "Please enter a valid phone number.";  // ← was errors.ContactNo (typo!)
  }

  return errors;
};

//validation for property owner update form
export const validatePropertyOwnerUpdate = (data) => {
  const errors = {};

  if (!data.firstName || typeof data.firstName !== "string") {
    errors.firstName = "First name is required.";
  }

  if (!data.lastName || typeof data.lastName !== "string") {
    errors.lastName = "Last name is required.";
  }

  if (!data.contactNo) {
    errors.contactNo = "Contact number is required.";
  } else if (!isValidPhoneNumber(data.contactNo)) {
    errors.contactNo = "Invalid contact number.";
  }

  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!data.email || !emailPattern.test(data.email)) {
    errors.email = "A valid email address is required.";
  }

  return errors;
};

export const validateOwnerDocument = (data) => {
  const errors = {};
  if (!data.documentName) {
    errors.documentName = "Document Name is required.";
  }
  if (!data.attachment) {
    errors.attachment = "Attachment is required.";
  }
  return { valid: Object.keys(errors).length === 0, errors };
};

// validate agreement preview form
export const validateAgreementForm = (formData) => {
  const errors = {};

  if (!formData.securityDeposit || formData.securityDeposit <= 0) {
    errors.securityDeposit = "Security deposit is required.";
  }

  if (!formData.tokenAmount || formData.tokenAmount <= 0) {
    errors.tokenAmount = "Token amount is required.";
  }

  if (!formData.handoverAmount || formData.handoverAmount <= 0) {
    errors.handoverAmount = "Handover amount is required.";
  }

  if (!formData.commenceAmount || formData.commenceAmount <= 0) {
    errors.commenceAmount = "Commence amount is required.";
  }

  if (!formData.agreementDate) {
    errors.agreementDate = "Agreement date is required.";
  }

  if (!formData.commenceDate) {
    errors.commenceDate = "Commence date is required.";
  }

  if (!formData.streetAddress || formData.streetAddress.length > 100) {
    errors.streetAddress = "Street address is required.";
  }

  if (!formData.locality || formData.locality.length > 50) {
    errors.locality = "Locality is required.";
  }

  if (!formData.pincode || formData.pincode.length !== 6) {
    errors.pincode = "Pincode is required.";
  }

  if (!formData.city || formData.city.length > 50) {
    errors.city = "City is required.";
  }

  if (!formData.propertyState || formData.propertyState.length > 50) {
    errors.propertyState = "Property state is required.";
  }

  if (
    !formData.monthlyRent ||
    formData.monthlyRent <= 0 ||
    formData.monthlyRent > 100000000
  ) {
    errors.monthlyRent = "Monthly rent is required.";
  }

  if (
    !formData.totalRent ||
    formData.totalRent <= 0 ||
    formData.totalRent > 100000000
  ) {
    errors.totalRent = "Total rent is required.";
  }

  if (!formData.flatNos || formData.flatNos.length < 1) {
    errors.flatNos = "At least one flat is required.";
  }
  if (!formData.propertyGuid) {
    errors.propertyGuid = "Property is required.";
  }
  if (!formData.noOfMonth) {
    errors.noOfMonth = "No of Months is required.";
  }

  return errors;
};

export const validateExtendStayForm = (values) => {
  const errors = {};

  if (!values.NoOfMonth) {
    errors.NoOfMonth = "No of Months is required.";
  } else if (values.NoOfMonth < 1 || values.NoOfMonth > 11) {
    errors.NoOfMonth = "No of Months must be between 1 and 11.";
  }

  if (!values.rentIncrementPercent) {
    errors.rentIncrementPercent = "Rent Increment Percent is required.";
  } else if (
    values.rentIncrementPercent < 1 ||
    values.rentIncrementPercent > 15
  ) {
    errors.rentIncrementPercent =
      "Rent Increment Percent must be between 1 and 15.";
  }

  return errors;
};

export const validateMoveOutForm = (values) => {
  const errors = {};

  if (!values.moveOutDate) {
    errors.NoOfMonth = "No of Months is required.";
  }

  return errors;
};

export const validateExcelFileUpload = ({ ExcelFile }) => {
  const errors = {};

  if (!ExcelFile) {
    errors.ExcelFile = "Excel file is required.";
  } else if (
    ![
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ].includes(ExcelFile.type)
  ) {
    errors.ExcelFile = "Only .xls and .xlsx files are allowed.";
  }

  return errors;
};

export const validateCategory = (formData) => {
  const errors = {};
  let valid = true;

  if (!formData.categoryName) {
    valid = false;
    errors.categoryName = "Category Name is required.";
  }

  if (!formData.categoryThumb) {
    valid = false;
    errors.categoryThumb = "Category Thumbnail is required.";
  }

  return { valid, errors };
};

export const validateSubCategory = (formData) => {
  const errors = {};
  let valid = true;

  if (!formData.categoryId) {
    valid = false;
    errors.categoryId = "Category Id is required.";
  }
  if (!formData.subCategoryImage) {
    valid = false;
    errors.subCategoryImage = "Sub Category Thumbnail is required.";
  }
  if (!formData.subCategoryName) {
    valid = false;
    errors.subCategoryName = "Sub Category name is required.";
  }

  return { valid, errors };
};

export const validateUpdatePersonalDetails = (data) => {
  const errors = {};

  if (!data.businessName) {
    errors.businessName = "BusinessName is required.";
  } else if (data.businessName.length < 1 || data.businessName.length > 50) {
    errors.businessName = "Valid BusinessName is required";
  }

  if (!data.contactName) {
    errors.contactName = "Last Name is required";
  } else if (data.contactName.length < 1 || data.contactName.length > 50) {
    errors.contactName = "Valid Last Name is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (
    !data.emailAddress ||
    !emailRegex.test(data.emailAddress) ||
    data.emailAddress.length > 50
  ) {
    errors.emailAddress = "Valid Email Address is required.";
  }

  if (!data.phoneNo) {
    errors.phoneNo = "Phone Number is required";
  } else if (data.phoneNo.length !== 10 || isNaN(data.phoneNo)) {
    errors.phoneNo = "Valid Phone Number is required (10 digits)";
  }

  if (data.locality && data.locality.length > 50) {
    errors.locality = "Valid locality is required";
  }
  if (data.houseNo && data.houseNo.length > 50) {
    errors.houseNo = "Valid houseNo is required";
  }

  if (!data.city || data.city.length < 1 || data.city.length > 50) {
    errors.city = "Valid City name is required";
  }

  if (!data.state || data.state.length < 1 || data.state.length > 50) {
    errors.state = "Valid State is required";
  }

  if (!data.roadName || data.roadName.length < 1 || data.roadName.length > 50) {
    errors.roadName = "Valid Road Name is required";
  }

  if (!data.pincode || data.pincode.length < 1 || data.pincode.length > 10) {
    errors.pincode = "Valid Pincode is required";
  }

  return errors;
};

export const validateUpdateCustomerDetails = (data) => {
  const errors = {};

  if (!data.ownerName) {
    errors.ownerName = "ownerName is required.";
  } else if (data.ownerName.length < 1 || data.ownerName.length > 50) {
    errors.ownerName = "Valid ownerName is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (
    !data.emailAddress ||
    !emailRegex.test(data.emailAddress) ||
    data.emailAddress.length > 50
  ) {
    errors.emailAddress = "Valid Email Address is required.";
  }

  if (!data.phoneNo) {
    errors.phoneNo = "Phone Number is required";
  } else if (data.phoneNo.length !== 10 || isNaN(data.phoneNo)) {
    errors.phoneNo = "Valid Phone Number is required (10 digits)";
  }

  if (data.locality && data.locality.length > 50) {
    errors.locality = "Valid locality is required";
  }
  if (!data.houseNo) {
    errors.houseNo = "House Number is required";
  } else if (data.houseNo.length !== 50 || isNaN(data.houseNo)) {
    errors.houseNo = "Valid House Number is required ";
  }
  if (!data.city || data.city.length < 1 || data.city.length > 50) {
    errors.city = "Valid City name is required";
  }

  if (!data.state || data.state.length < 1 || data.state.length > 50) {
    errors.state = "Valid State is required";
  }

  if (!data.roadName || data.roadName.length < 1 || data.roadName.length > 50) {
    errors.roadName = "Valid Road Name is required";
  }

  if (!data.pincode || data.pincode.length < 1 || data.pincode.length > 10) {
    errors.pincode = "Valid Pincode is required";
  }

  return errors;
};

export const validateServices = (formData) => {
  let errors = {};
  let valid = true;

  if (!formData.categoryName) {
    errors.categoryName = "Category Name is required";
    valid = false;
  }

  if (!formData.subCategoryName) {
    errors.subCategoryName = "SubCategory Name  is required";
    valid = false;
  } else if (formData.subCategoryName.length > 50) {
    errors.subCategoryName = "Valid SubCategory Name  is required";
    valid = false;
  }
  if (!formData.serviceTypeName) {
    errors.serviceTypeName = "Service Type name is required";
    valid = false;
  } else if (formData.serviceTypeName.length > 50) {
    errors.serviceTypeName = "Valid Service Type  is required";
    valid = false;
  }

  return { valid, errors };
};

export const validateWorks = (formData) => {
  let errors = {};
  let valid = true;

  if (!formData.categoryName) {
    errors.categoryName = "Category Name is required";
    valid = false;
  }

  if (!formData.subCategoryName) {
    errors.subCategoryName = "Sub Category Name name is required";
    valid = false;
  } else if (formData.subCategoryName.length > 50) {
    errors.subCategoryName = "Valid Sub Category Name  is required";
    valid = false;
  }
  if (!formData.workTypeName) {
    errors.workTypeName = "Work Type Name  is required";
    valid = false;
  } else if (formData.workTypeName.length > 50) {
    errors.workTypeName = "Valid WSork Type Name  is required";
    valid = false;
  }

  return { valid, errors };
};
