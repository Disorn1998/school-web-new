import api from '../utils/api';

export const financeAPI = {
  // Admin Invoices
  getAllInvoices: () => api.get('/invoices'),
  generateInvoices: (data) => api.post('/invoices/generate', data),
  generateCustomInvoices: (data) => api.post('/invoices/custom', data),
  
  // Admin Payments
  approvePayment: (id) => api.post(`/payments/${id}/approve`),

  // Admin Discounts
  getDiscounts: () => api.get('/admin/discounts'),
  addDiscount: (data) => api.post('/admin/discounts', data),
  deleteDiscount: (id) => api.delete(`/admin/discounts/${id}`),

  // Invoice Management
  editInvoice: (id, data) => api.put(`/admin/invoices/${id}`, data),
  deleteInvoice: (id) => api.delete(`/admin/invoices/${id}`),

  // Reports
  getPaymentReports: (params) => api.get('/admin/reports/payments', { params }),

  // Reminders
  getReminderMessages: () => api.get('/admin/reminders/messages'),
  addReminderMessage: (data) => api.post('/admin/reminders/messages', data),
  updateReminderMessage: (id, data) => api.put(`/admin/reminders/messages/${id}`, data),
  deleteReminderMessage: (id) => api.delete(`/admin/reminders/messages/${id}`),

  getReminderSchedules: () => api.get('/admin/reminders/schedules'),
  saveReminderSchedule: (data) => api.post('/admin/reminders/schedules', data),
  updateReminderSchedule: (id, data) => api.put(`/admin/reminders/schedules/${id}`, data),
  deleteReminderSchedule: (id) => api.delete(`/admin/reminders/schedules/${id}`),

  triggerReminders: () => api.post('/admin/reminders/trigger'),

  // Student Portal
  getMyInvoices: (studentId) => api.get(`/student/invoices${studentId ? `?student_id=${studentId}` : ''}`),
  uploadPaymentSlip: (data) => api.post('/payments/upload', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};
