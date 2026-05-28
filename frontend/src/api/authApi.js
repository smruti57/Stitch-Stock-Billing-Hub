import api from './axios'

/**
 * Auth API
 * Handles login, logout, registration, and session refresh.
 */

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export const register = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password })
  return response.data
}

export const logout = async () => {
  const response = await api.post('/auth/logout')
  return response.data
}

export const refreshToken = async () => {
  const response = await api.post('/auth/refresh')
  return response.data
}

export const getProfile = async () => {
  const response = await api.get('/auth/me')
  return response.data
}
