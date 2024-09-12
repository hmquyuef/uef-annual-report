import axios, { AxiosInstance } from 'axios';

const apiClient: AxiosInstance = axios.create({
    baseURL: 'https://api-annual.uef.edu.vn/',
    // baseURL: 'http://192.168.98.60:8081/',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// apiClient.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem('token');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

export default apiClient;