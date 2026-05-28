import api from './axios'

/**
 * Invoice / Billing API
 */

export const getInvoices = async (params = {}) => {
  const response = await api.get('/invoices', { params })
  return response.data
}

export const getInvoice = async (id) => {
  const response = await api.get(`/invoices/${id}`)
  return response.data
}

export const createInvoice = async (data) => {
  const response = await api.post('/invoices', data)
  return response.data
}

export const updateInvoice = async (id, data) => {
  const response = await api.put(`/invoices/${id}`, data)
  return response.data
}

export const voidInvoice = async (id) => {
  const response = await api.post(`/invoices/${id}/void`)
  return response.data
}

export const getDashboardStats = async () => {
  const response = await api.get('/invoices/stats/dashboard')
  return response.data
}
