import axios from "axios";




// const BASE_URL = 'https://resqhavenbackend-production-de5a.up.railway.app'
const BASE_URL = 'https://resqhavenbackend-production-de5a.up.railway.app'

//const BASE_URL = 'http://localhost:5000' 


const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
})

api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export const getRequest = async (endpoint) => {
  const separator = endpoint.includes('?') ? '&' : '?'
  const cacheBustedEndpoint = `${endpoint}${separator}_ts=${Date.now()}`

  const response = await api.get(cacheBustedEndpoint, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0'
    }
  })
  return response.data
}

export const postRequest = async (endpoint, data) => {
  const response = await api.post(endpoint, data)
  return response.data
}

export const putRequest = async (endpoint, data) => {
  const response = await api.put(endpoint, data)
  return response.data
}
