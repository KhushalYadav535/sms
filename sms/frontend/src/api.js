const API_URL = import.meta.env.VITE_API_URL || 'https://sms-w12c.onrender.com/api';

export const getToken = () => localStorage.getItem('token');

const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // If unauthorized, clear everything and redirect
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    throw new Error(data.error || data.message || 'Something went wrong');
  }
  
  return data;
};

const authFetch = (url, options = {}) => {
  const token = getToken();
  if (!token) {
    window.location.href = '/login';
    return Promise.reject(new Error('No authentication token'));
  }

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  }).then(handleResponse);
};

// Auth
export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Members
export const fetchMembers = () => authFetch(`${API_URL}/members`);
export const fetchMemberById = (id) => authFetch(`${API_URL}/members/${id}`);
export const addMember = (data) => authFetch(`${API_URL}/members`, { method: 'POST', body: JSON.stringify(data) });
export const updateMember = (id, data) => authFetch(`${API_URL}/members/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteMember = (id) => authFetch(`${API_URL}/members/${id}`, { method: 'DELETE' });

// Accounting
export const fetchAccounting = () => authFetch(`${API_URL}/accounting`);
export const fetchAccountingStats = () => authFetch(`${API_URL}/accounting/stats`);
export const addAccounting = (data) => authFetch(`${API_URL}/accounting`, { method: 'POST', body: JSON.stringify(data) });
export const deleteAccounting = (id) => authFetch(`${API_URL}/accounting/${id}`, { method: 'DELETE' });

// Notices
export const fetchNotices = () => authFetch(`${API_URL}/notices`);
export const addNotice = (data) => authFetch(`${API_URL}/notices`, { method: 'POST', body: JSON.stringify(data) });
export const deleteNotice = (id) => authFetch(`${API_URL}/notices/${id}`, { method: 'DELETE' });

// Complaints
export const fetchComplaints = () => authFetch(`${API_URL}/complaints`);
export const addComplaint = (data) => authFetch(`${API_URL}/complaints`, { method: 'POST', body: JSON.stringify(data) });
export const updateComplaintStatus = (id, status) => authFetch(`${API_URL}/complaints/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
export const deleteComplaint = (id) => authFetch(`${API_URL}/complaints/${id}`, { method: 'DELETE' });

// Reports
export const fetchReports = () => authFetch(`${API_URL}/reports`);
export const addReport = (data) => authFetch(`${API_URL}/reports`, { method: 'POST', body: JSON.stringify(data) });
export const deleteReport = (id) => authFetch(`${API_URL}/reports/${id}`, { method: 'DELETE' });

// Events
export const fetchEvents = () => authFetch(`${API_URL}/events`);
export const addEvent = (data) => authFetch(`${API_URL}/events`, { method: 'POST', body: JSON.stringify(data) });
export const deleteEvent = (id) => authFetch(`${API_URL}/events/${id}`, { method: 'DELETE' });

// Settings
export const fetchSettings = () => authFetch(`${API_URL}/settings`);
export const updateSettings = (data) => authFetch(`${API_URL}/settings`, { method: 'POST', body: JSON.stringify(data) });

// User Profile
export const fetchUserProfile = () => authFetch(`${API_URL}/users/profile`);
export const updateUserProfile = (data) => authFetch(`${API_URL}/users/profile`, { method: 'PUT', body: JSON.stringify(data) });
export const changeUserPassword = (data) => authFetch(`${API_URL}/users/change-password`, { method: 'POST', body: JSON.stringify(data) });

// Dashboard Stats
export const fetchUserDashboardStats = () => authFetch(`${API_URL}/users/dashboard`);
export const fetchAdminDashboardStats = () => authFetch(`${API_URL}/users/admin/dashboard`);
