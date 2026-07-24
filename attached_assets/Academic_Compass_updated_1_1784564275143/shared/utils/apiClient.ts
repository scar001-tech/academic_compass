import axios, { AxiosInstance } from 'axios'

interface ApiClientConfig {
  baseURL: string
  timeout?: number
}

class ApiClient {
  private client: AxiosInstance

  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor for auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  get(url: string, config = {}) {
    return this.client.get(url, config)
  }

  post(url: string, data = {}, config = {}) {
    return this.client.post(url, data, config)
  }

  put(url: string, data = {}, config = {}) {
    return this.client.put(url, data, config)
  }

  delete(url: string, config = {}) {
    return this.client.delete(url, config)
  }

  patch(url: string, data = {}, config = {}) {
    return this.client.patch(url, data, config)
  }
}

const apiBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const apiClient = new ApiClient({
  baseURL: apiBaseURL,
  timeout: 15000,
})

export default apiClient
