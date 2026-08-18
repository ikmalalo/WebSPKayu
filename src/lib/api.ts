import axios from 'axios'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/*
 * Otomatis kirim JWT ke semua request.
 */
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        'spk_token'
      )

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`
    }

    return config
  }
)

/*
 * Kalau token sudah tidak valid,
 * hapus session.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401
    ) {
      localStorage.removeItem(
        'spk_token'
      )
    }

    return Promise.reject(error)
  }
)

export default api