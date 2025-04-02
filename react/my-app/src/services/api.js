import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
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

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('serviceProviderId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// Service Provider services
export const getServiceProviders = async (category = '') => {
  try {
    console.log('Fetching service providers with category:', category);
    const response = await api.get('/service-providers', {
      params: { category }
    });
    
    if (!response.data) {
      throw new Error('No service providers data received');
    }

    console.log('Service providers data received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching service providers:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const getServiceProvider = async (id) => {
  try {
    console.log('Fetching service provider with ID:', id);
    const response = await api.get(`/service-providers/${id}`);
    
    if (!response.data) {
      throw new Error('No service provider data received');
    }

    console.log('Service provider data received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching service provider:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const updateServiceProvider = async (id, data) => {
  const response = await api.put(`/service-providers/${id}`, data);
  return response.data;
};

export const updateServiceProviderStatus = async (id, status) => {
  const response = await api.patch(`/service-providers/${id}/status`, { status });
  return response.data;
};

export const addReview = async (id, reviewData) => {
  const response = await api.post(`/service-providers/${id}/reviews`, reviewData);
  return response.data;
};

export const updateAvailability = async (id, availability) => {
  const response = await api.put(`/service-providers/${id}/availability`, { availability });
  return response.data;
};

// Booking services
export const createBooking = async (bookingData) => {
  try {
    console.log('Creating booking with data:', bookingData);
    const response = await api.post('/bookings', bookingData);
    console.log('Booking creation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const getBookingStatus = async (bookingId) => {
  try {
    console.log('Fetching booking status for ID:', bookingId);
    const response = await api.get(`/bookings/${bookingId}`);
    console.log('Booking status response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking status:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const getClientBookings = async (page = 1, limit = 10, status = '') => {
  try {
    console.log('Fetching client bookings:', { page, limit, status });
    const response = await api.get('/bookings/client', {
      params: { page, limit, status }
    });
    console.log('Client bookings response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching client bookings:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const getProviderBookings = async (page = 1, limit = 10, status = '') => {
  try {
    console.log('Fetching provider bookings:', { page, limit, status });
    const response = await api.get('/bookings/provider', {
      params: { page, limit, status }
    });
    console.log('Provider bookings response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching provider bookings:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const getProviderRequests = async () => {
  try {
    console.log('Fetching provider requests');
    const response = await api.get('/bookings/provider/requests');
    console.log('Provider requests response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching provider requests:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const acceptBooking = async (bookingId) => {
  try {
    console.log('Accepting booking:', bookingId);
    const response = await api.put(`/bookings/${bookingId}/accept`);
    console.log('Accept booking response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error accepting booking:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const rejectBooking = async (bookingId, reason) => {
  try {
    console.log('Rejecting booking:', bookingId, 'with reason:', reason);
    const response = await api.put(`/bookings/${bookingId}/reject`, { reason });
    console.log('Reject booking response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error rejecting booking:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const completeBooking = async (bookingId) => {
  try {
    console.log('Completing booking:', bookingId);
    const response = await api.put(`/bookings/${bookingId}/complete`);
    console.log('Complete booking response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error completing booking:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const cancelBooking = async (bookingId, reason) => {
  try {
    console.log('Cancelling booking:', bookingId, 'with reason:', reason);
    const response = await api.put(`/bookings/${bookingId}/cancel`, { reason });
    console.log('Cancel booking response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error cancelling booking:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export default api; 