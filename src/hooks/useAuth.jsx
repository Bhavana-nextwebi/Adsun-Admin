import { useEffect, useState } from 'react';
import { getToken } from '../utils/tokenHelper'; 

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getToken(); 
    if (token) {
      setIsAuthenticated(true); 
    } else {
      setIsAuthenticated(false); 
    }
  }, []);

  return { isAuthenticated };
};

export default useAuth;

