import axios from "axios";
import Cookies from "js-cookie";

axios.defaults.baseURL = process.env.REACT_APP_API_URL;
axios.defaults.headers.post["Content-Type"] = "application/json";

const token = Cookies.get("accessToken");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

const refreshToken = async () => {
  try {
    const storedRefreshToken = Cookies.get("refreshToken");
    if (!storedRefreshToken) throw new Error("No refresh token available");

    const response = await axios.post("/auth/refresh-token", {
      refreshToken: storedRefreshToken,
    });

    const { accessToken, refreshToken } = response.data;
    Cookies.set("accessToken", accessToken, { expires: 1 });
    Cookies.set("refreshToken", refreshToken, { expires: 7 });
    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

    return accessToken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
};

class APIClient {
  get = (url, params) => axios.get(url, { params });

  post = (url, data) => axios.post(url, data);

  put = (url, data) => axios.put(url, data);

  delete = (url, config) => axios.delete(url, { ...config });
}
export const setAuthorization = (token) => {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export { APIClient, refreshToken };
