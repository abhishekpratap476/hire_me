import React, { useState } from 'react';
import axios from 'axios'; // Import Axios
import * as echarts from 'echarts';
import '../output.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome CSS

const App = () => {
  const [isServiceProvider, setIsServiceProvider] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    // Service provider specific fields
    category: 'plumber', // Default category
    experience: '',
    price: '',
    status: 'Online'
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  const categories = [
    { id: "plumber", name: "Plumber", icon: "fa-wrench" },
    { id: "carpenter", name: "Carpenter", icon: "fa-hammer" },
    { id: "gardener", name: "Gardener", icon: "fa-leaf" },
    { id: "painter", name: "Painter", icon: "fa-paint-roller" },
    { id: "electrician", name: "Electrician", icon: "fa-bolt" },
    { id: "cleaner", name: "Cleaner", icon: "fa-broom" },
  ];

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[!@#$%^&*]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }

    // Service provider specific validation
    if (isServiceProvider) {
      if (!formData.category) newErrors.category = 'Category is required';
      if (!formData.experience) newErrors.experience = 'Experience is required';
      if (!formData.price) newErrors.price = 'Price is required';
      if (!profileImage) newErrors.image = 'Profile image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const formDataToSend = new FormData();

      // Add basic user fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('userType', isServiceProvider ? 'serviceProvider' : 'user');

      // Add service provider specific fields
      if (isServiceProvider) {
        formDataToSend.append('category', formData.category);
        formDataToSend.append('experience', formData.experience);
        formDataToSend.append('price', formData.price);
        formDataToSend.append('status', 'Online');
      }

      // Add profile image if exists
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }

      // Log the data being sent (for debugging)
      const dataToLog = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        userType: isServiceProvider ? 'serviceProvider' : 'user',
        ...(isServiceProvider && {
          category: formData.category,
          experience: formData.experience,
          price: formData.price,
          status: 'Online'
        }),
        hasImage: !!profileImage
      };
      console.log('Sending signup request with data:', dataToLog);

      const response = await axios.post(
        'http://localhost:5000/api/auth/signup',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Signup successful:', response.data);
      setSuccessMessage('Registration successful! Redirecting to login...');
      
      // Clear form
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
        category: 'plumber',
        experience: '',
        price: '',
        status: 'Online'
      });
      setProfileImage(null);
      setImagePreview('');

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);

    } catch (error) {
      console.error('Error during signup:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'An error occurred during registration';
      setErrors({
        submit: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          setErrors({ ...errors, image: 'Image size should be less than 5MB' });
          return;
        }
        if (!file.type.startsWith('image/')) {
          setErrors({ ...errors, image: 'Please upload an image file' });
          return;
        }
        setProfileImage(file);
        setImagePreview(URL.createObjectURL(file));
        setErrors({ ...errors, image: null });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
      if (name === 'password') {
        calculatePasswordStrength(value);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10 pb-20">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-8 mx-4">
        <div className="flex items-center mb-8">
          <i className="fas fa-tools text-3xl text-blue-600 mr-4"></i>
          <h1 className="text-3xl font-bold text-gray-800">HireMe</h1>
        </div>
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              className={`px-6 py-2 rounded-lg transition-all duration-300 ${!isServiceProvider ? 'bg-white shadow-md text-blue-600' : 'text-gray-600'}`}
              onClick={() => setIsServiceProvider(false)}
            >
              Client
            </button>
            <button
              className={`px-6 py-2 rounded-lg transition-all duration-300 ${isServiceProvider ? 'bg-white shadow-md text-blue-600' : 'text-gray-600'}`}
              onClick={() => setIsServiceProvider(true)}
            >
              Service Provider
            </button>
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Create Your Account</h2>
        <p className="text-gray-600 mb-8">
          {isServiceProvider 
            ? 'Offer your services and connect with clients' 
            : 'Hire trusted workers for your tasks in minutes'}
        </p>
        <div id="successMessage" className="hidden bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Account created successfully! Redirecting to login...
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="relative">
              <i className="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className={`w-full pl-10 pr-3 py-3 rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <div className="relative">
              <i className="fas fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className={`w-full pl-10 pr-3 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div>
            <div className="relative">
              <i className="fas fa-phone absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                className={`w-full pl-10 pr-3 py-3 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          {isServiceProvider && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Category</label>
                <div className="grid grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                      className={`p-4 rounded-xl flex flex-col items-center transition-all ${
                        formData.category === category.id
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'bg-white border border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <i className={`fas ${category.icon} text-2xl ${
                        formData.category === category.id ? 'text-blue-500' : 'text-gray-600'
                      }`}></i>
                      <span className={`mt-2 text-sm font-medium ${
                        formData.category === category.id ? 'text-blue-500' : 'text-gray-600'
                      }`}>
                        {category.name}
                      </span>
                    </button>
                  ))}
                </div>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <div className="relative">
                  <i className="fas fa-clock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="number"
                    name="experience"
                    placeholder="Years of Experience"
                    className={`w-full pl-10 pr-3 py-3 rounded-lg border ${errors.experience ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    value={formData.experience}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience}</p>}
              </div>

              <div>
                <div className="relative">
                  <i className="fas fa-dollar-sign absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="number"
                    name="price"
                    placeholder="Hourly Rate (₹)"
                    className={`w-full pl-10 pr-3 py-3 rounded-lg border ${errors.price ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                <div className="mt-1 flex items-center space-x-4">
                  {imagePreview && (
                    <div className="relative w-24 h-24">
                      <img
                        src={imagePreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setProfileImage(null);
                          setImagePreview('');
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="file"
                        name="profileImage"
                        accept="image/*"
                        onChange={handleInputChange}
                        className="hidden"
                        id="profile-image-input"
                      />
                      <label
                        htmlFor="profile-image-input"
                        className={`w-full flex items-center justify-center px-4 py-2 border ${
                          errors.image ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg cursor-pointer hover:bg-gray-50`}
                      >
                        <i className="fas fa-cloud-upload-alt text-gray-400 mr-2"></i>
                        <span className="text-gray-600">
                          {imagePreview ? 'Change Image' : 'Upload Image'}
                        </span>
                      </label>
                    </div>
                    {errors.image && (
                      <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Max file size: 5MB. Supported formats: JPG, PNG, GIF
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="relative">
                  <i className="fas fa-file-alt absolute left-3 top-3 text-gray-400"></i>
                  <textarea
                    name="description"
                    placeholder="Brief description of your services"
                    rows={4}
                    className={`w-full pl-10 pr-3 py-3 rounded-lg border ${errors.description ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
            </>
          )}
          <div>
            <div className="relative">
              <i className="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                className={`w-full pl-10 pr-10 py-3 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            <div className="flex gap-2 mt-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${i < passwordStrength ? 'bg-green-500' : 'bg-gray-200'}`}
                ></div>
              ))}
            </div>
          </div>
          <div>
            <div className="relative">
              <i className="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm Password"
                className={`w-full pl-10 pr-10 py-3 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>
          <div className="flex items-start">
            <input
              type="checkbox"
              name="agreeToTerms"
              id="agreeToTerms"
              className="mt-1"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
            />
            <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-600">
              I agree to the <a href="#" className="text-blue-600 hover:underline">Terms & Conditions</a>
            </label>
          </div>
          {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}
          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <i className="fas fa-spinner fa-spin mr-2"></i>
            ) : null}
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              className="flex items-center justify-center py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-300 !rounded-button"
            >
              <i className="fab fa-google text-red-500 mr-2"></i>
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-300 !rounded-button"
            >
              <i className="fab fa-facebook text-blue-600 mr-2"></i>
              Facebook
            </button>
            <button
              type="button"
              className="flex items-center justify-center py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-300 !rounded-button"
            >
              <i className="fab fa-apple text-gray-800 mr-2"></i>
              Apple </button>
          </div>
        </form>
        <p className="text-center mt-8 text-gray-600">
          Already have an account?{' '}
          <a href="/" className="text-blue-600 hover:underline font-semibold">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default App;