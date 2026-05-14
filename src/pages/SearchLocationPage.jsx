import { GooglePlaceSearch } from '../components/Locations/GooglePlaceSearch';
import { ToastContainer } from 'react-toastify';
export const SearchLocationPage = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
              <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                    <GooglePlaceSearch/>
                </div>
            </div>
            
        </div>
        
    )
}