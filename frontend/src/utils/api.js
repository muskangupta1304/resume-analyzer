import axios from 'axios';

// Create central Axios instance
const API_URL = import.meta.env.VITE_API_URL || '';
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT Authorization Token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to clear tokens and redirect to login on 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Session expired or user deleted. Clearing credentials.');
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const resumeAPI = {
  upload: (formData) => api.post('/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  }),
  getAll: () => api.get('/resume'),
  getById: (id) => api.get(`/resume/${id}`),
  update: (id, data) => api.put(`/resume/${id}`, data),
  create: (data) => api.post('/resume', data),
};

export const analysisAPI = {
  analyze: (resumeId) => api.post(`/analysis/${resumeId}`),
  getAll: () => api.get('/analysis'),
  getById: (id) => api.get(`/analysis/${id}`),
  rewriteBullet: (data) => api.post('/analysis/rewrite-bullet', data),
  skillGap: (resumeId, jobDescription) => api.post(`/analysis/${resumeId}/skill-gap`, { jobDescription }),
  getInterviewQuestions: (data) => api.post('/analysis/interview/questions', data),
  gradeInterviewAnswer: (data) => api.post('/analysis/interview/feedback', data),
  generateCoverLetter: (data) => api.post('/analysis/cover-letter', data),
  chat: (data) => api.post('/analysis/chat', data),
  getDynamicRecommendations: (data) => api.post('/analysis/recommendations', data),
};

export const jobAPI = {
  getAll: () => api.get('/job'),
};

export default api;
