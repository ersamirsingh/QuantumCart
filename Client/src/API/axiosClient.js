import axios from "axios"

const axiosClient = axios.create({

  baseURL: 'https://quantumcart-a3ww.onrender.com',
  // baseURL: 'http://localhost:5000',

  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }

});


export default axiosClient;

