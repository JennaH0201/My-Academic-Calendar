import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://54.252.171.212:5001', // local
 
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
