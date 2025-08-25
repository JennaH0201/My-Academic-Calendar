import axios from 'axios';

const axiosInstance = axios.create({
  baseURL:' ',  //local
  //baseURL: 'http://3.26.165.163:5001', // live
 
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
