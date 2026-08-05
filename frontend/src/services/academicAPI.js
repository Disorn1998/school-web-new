import api from '../utils/api';

export const academicAPI = {
  // Years
  getYears: () => api.get('/admin/settings/years'),
  createYear: (data) => api.post('/admin/settings/years', data),
  updateYear: (id, data) => api.put(`/admin/settings/years/${id}`, data),
  deleteYear: (id) => api.delete(`/admin/settings/years/${id}`),

  // Semesters
  getSemesters: () => api.get('/admin/settings/semesters'),
  createSemester: (data) => api.post('/admin/settings/semesters', data),
  updateSemester: (id, data) => api.put(`/admin/settings/semesters/${id}`, data),
  deleteSemester: (id) => api.delete(`/admin/settings/semesters/${id}`),

  // Tuition Fees
  getTuitionFees: () => api.get('/admin/settings/tuition-fees'),
  setTuitionFee: (data) => api.post('/admin/settings/tuition-fees', data),
};
