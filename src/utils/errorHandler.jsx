import { toast } from 'react-toastify';

export const handleErrors = (error) => {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data.message;

    switch (status) {
      case 400:
        toast.error("Bad Request: The server couldn't understand the request.");
        break;
      case 401:
        toast.error("Unauthorized: Please log in to access this resource.");     
        break;
      case 403:
        break;
      case 404:
        toast.error("Not Found: The requested resource was not found.");
        break;
      case 500:
        if(message === 'forbidden'){
          break;
        }
        else{
          toast.error(message);
          break;
        }
        
      default:
        toast.error(message);
        break;
    }
  } else if (error.request) {
    toast.error("No response from the server. Please check your internet connection.");
  } else {
    toast.error(error.message || "An error occurred while processing your request.");
  }
};
