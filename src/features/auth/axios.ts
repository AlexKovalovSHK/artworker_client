import axios from 'axios';
import { store } from '../../app/store';
import { getUrl } from '../../utils/config';

const BASE_URL = getUrl()

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();

    // <-- ТОКЕН БЕРЕМ ОТСЮДА!!!
    const token = state.auth.token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
