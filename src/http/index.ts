import { getJWTToken } from '@/components/AppLocalStorage/AppLocalStorage';
import axios from 'axios';

const apiKey = process.env.NEXT_PUBLIC_API_KEY;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  config => {
    const token = getJWTToken();
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  error => {
    Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error?.response && error?.response?.status === 401) {
      localStorage.clear();
      if (window.location.pathname !== '/') window.location.pathname = '/';
    }
    return Promise.reject(error);
  }
);

export const isUserAddedInGiveAway = (address: string) =>
  api.get<{ message: string; userGiveAwayStatus: boolean }>(
    `/checkUserGiveAwayStatus/${address}`
  );

export const checkGiveAwayTime = () =>
  api.get<{ timestampToStart: string }>('/getGiveAwayStartingTime', {
    headers: {
      'x-api-key': apiKey,
    },
  });

export const verifyUser = () =>
  api.patch('/verifyUser', {
    status: true,
  });
