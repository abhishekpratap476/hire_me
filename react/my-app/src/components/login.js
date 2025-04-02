import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../output.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'user',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', { email: formData.email, userType: formData.userType });
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      console.log('Login response:', response.data);

      if (response.data.token) {
        // Store authentication data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userType', response.data.userType);
        
        // Store service provider specific data if applicable
        if (formData.userType === 'serviceProvider' && response.data.serviceProvider) {
          localStorage.setItem('serviceProviderId', response.data.serviceProvider.id);
          console.log('Stored service provider data:', {
            id: response.data.serviceProvider.id,
            name: response.data.serviceProvider.name,
            category: response.data.serviceProvider.category
          });

          // Verify service provider data exists in database
          try {
            const providerResponse = await axios.get(`http://localhost:5000/api/service-providers/${response.data.serviceProvider.id}`);
            console.log('Service provider verification:', providerResponse.data);
            
            if (!providerResponse.data) {
              throw new Error('Service provider data not found');
            }
          } catch (verifyError) {
            console.error('Service provider verification failed:', verifyError);
            localStorage.removeItem('token');
            localStorage.removeItem('userType');
            localStorage.removeItem('serviceProviderId');
            setError('Service provider data verification failed. Please try again.');
            return;
          }
        }

        // Set success message
        setSuccessMessage('Login successful! Redirecting...');

        // Navigate based on user type
        if (formData.userType === 'serviceProvider') {
          console.log('Redirecting to service home page...');
          navigate('/service_home');
        } else {
          navigate('/home');
        }
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="flex items-center justify-center">
          <i className="fas fa-tools text-3xl text-blue-600 mr-4"></i>
          <h1 className="text-3xl font-bold text-gray-800">HireMe</h1>
        </div>
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              type="button"
              className={`px-6 py-2 rounded-lg transition-all duration-300 ${formData.userType === 'user' ? 'bg-white shadow-md text-blue-600' : 'text-gray-600'}`}
              onClick={() => setFormData(prev => ({ ...prev, userType: 'user' }))}
            >
              Client
            </button>
            <button
              type="button"
              className={`px-6 py-2 rounded-lg transition-all duration-300 ${formData.userType === 'serviceProvider' ? 'bg-white shadow-md text-blue-600' : 'text-gray-600'}`}
              onClick={() => setFormData(prev => ({ ...prev, userType: 'serviceProvider' }))}
            >
              Service Provider
            </button>
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-center text-gray-800">Sign in to your account</h2>
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <div className="relative">
                <i className="fas fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  className={`w-full pl-10 pr-3 py-3 rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <div>
              <div className="relative">
                <i className="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  className={`w-full pl-10 pr-10 py-3 rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-600 hover:underline font-semibold">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;