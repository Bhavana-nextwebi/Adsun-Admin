import {useState, useEffect} from 'react';
import { fetchPageLevelAccess } from "../services/pageLevelAccessService";
import { useNavigate } from 'react-router-dom';
import { handleErrors } from '../utils/errorHandler';
export const usePageLevelAccess = (pageUrl) => {
    const [pageAccessData, setPageAccessData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAccessData = async () => {
            try {
                const data = await fetchPageLevelAccess(pageUrl);
                if(data){
                    setPageAccessData(data);
                } else{
                    navigate('/404-error-page');
                }
                
            } catch (err) {
                handleErrors(err);
            }
        };

        if (pageUrl) {
            fetchAccessData();
        }
    }, [pageUrl, navigate]);
    return { pageAccessData};
};
