import axios from 'axios'

const bggAxiosInstance = axios.create({
    withCredentials: false,
    baseURL: import.meta.env.VITE_BGG_API_URL
  })

  export default bggAxiosInstance