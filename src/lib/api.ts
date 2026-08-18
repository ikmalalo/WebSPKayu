import axios from 'axios'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'

const api =
  axios.create({
    baseURL: API_URL,

    headers: {
      'Content-Type':
        'application/json',
    },
  })

// ============================================================
// REQUEST INTERCEPTOR
// Otomatis kirim JWT ke backend
// ============================================================

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        'spk_token'
      )

    if (token) {
      config.headers =
        config.headers || {}

      config.headers.Authorization =
        `Bearer ${token}`
    }

    return config
  },
  (error) =>
    Promise.reject(error)
)

// ============================================================
// RESPONSE INTERCEPTOR
// Jika token sudah tidak valid,
// hapus session.
// ============================================================

api.interceptors.response.use(
  (response) =>
    response,

  (error) => {
    if (
      error.response?.status ===
      401
    ) {
      const requestUrl =
        String(
          error.config?.url ||
            ''
        )

      // Jangan hapus token ketika
      // request login/register gagal.
      const isAuthRequest =
        requestUrl.includes(
          '/auth/login'
        ) ||
        requestUrl.includes(
          '/auth/register'
        )

      if (!isAuthRequest) {
        localStorage.removeItem(
          'spk_token'
        )
      }
    }

    return Promise.reject(
      error
    )
  }
)

export default api