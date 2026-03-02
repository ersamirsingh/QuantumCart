import axios from "axios"

const axiosClient = axios.create({

  baseURL: 'https://quantumcart-a3ww.onrender.com/',

  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }

});


export default axiosClient;

