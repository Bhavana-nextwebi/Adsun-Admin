import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from '../../Interceptors/axiosInstance';
import Cookies from 'js-cookie';

const headers = {
  'accept': '*/*',
  'Authorization': `Bearer ${Cookies.get('accessToken')}`,
};

const logheaders = {
  'accept': '*/*',
  'Content-Type': 'application/json',
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ username, password, keepLogged }, { rejectWithValue }) => {
    try {
      const loginData = { username, password, keepLogged };
      const response = await axiosInstance.post("/auth/login", loginData, {logheaders});

      Cookies.set("accessToken", response.data.accessToken, { expires: 1 });
      Cookies.set("refreshToken", response.data.refreshToken, { expires: 7 });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
    try {
      await axiosInstance.post("/auth/logout", {headers});
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
    } catch (error) {
     console.log(error);
    }
  });
