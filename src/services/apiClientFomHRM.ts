import axios, { AxiosInstance } from 'axios';

const apiClientFomHRM: AxiosInstance = axios.create({
    baseURL: 'https://portal.uef.edu.vn/',
    headers: {
        'Content-Type': 'application/json',
        'token': '276dbp1'
    },
});

export default apiClientFomHRM;