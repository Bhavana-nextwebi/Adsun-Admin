import Cookies from 'js-cookie';

export const setTokens = (accessToken, refreshToken) => {
  if (accessToken) {
    Cookies.set('accessToken', accessToken, { expires: 1 }); 
  }
  if (refreshToken) {
    Cookies.set('refreshToken', refreshToken, { expires: 7 }); 
  }
};

export const getAccessToken = () => {
  return Cookies.get('accessToken');
};

export const getRefreshToken = () => {
  return Cookies.get('refreshToken');
};

export const removeTokens = () => {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  const tokenPayload = JSON.parse(atob(token.split('.')[1]));
  const expirationTime = tokenPayload.exp * 1000; 
  return Date.now() >= expirationTime;
};

export const isAuthenticated = () => {
  const accessToken = getAccessToken();
  return accessToken && !isTokenExpired(accessToken);
};

export const getToken = (type = 'access') => {
  if (type === 'access') {
    return getAccessToken();
  }
  if (type === 'refresh') {
    return getRefreshToken();
  }
  return null;
};
