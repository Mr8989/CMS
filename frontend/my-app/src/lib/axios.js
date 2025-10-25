import axios from "axios"

export const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:8000/',
    withCredentials:true,
    headers:{
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
})
console.log("baseUrl", axiosInstance.defaults.baseURL)
