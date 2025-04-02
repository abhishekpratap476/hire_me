import React, { useState, useEffect } from "react";
import * as echarts from "echarts";
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
// Import required modules
import SwiperCore, { Pagination, Autoplay } from 'swiper';
import '../../output.css';
import logo from '../images/mh-logo.jpg';
import { useNavigate } from 'react-router-dom';
import { getServiceProviders } from '../../services/api';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Services = () => {
  const [selectedCategory, setSelectedCategory] = useState("plumber");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [showServiceTypes, setShowServiceTypes] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState("");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [serviceProviders, setServiceProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Move fetchData outside useEffect
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch service providers based on selected category
      const data = await getServiceProviders(selectedCategory);
      console.log('Fetched service providers:', data);
      
      if (Array.isArray(data)) {
        // Filter out any invalid providers
        const validProviders = data.filter(provider => 
          provider && 
          provider._id && 
          provider.name && 
          provider.category
        );
        
        if (validProviders.length === 0) {
          console.log('No valid service providers found');
          setServiceProviders([]);
        } else {
          console.log('Valid service providers:', validProviders);
          setServiceProviders(validProviders);
        }
      } else {
        console.error('Invalid data format received:', data);
        setError('Invalid data format received from server');
        setServiceProviders([]);
      }
    } catch (error) {
      console.error('Error fetching service providers:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Failed to fetch service providers';
      setError(errorMessage);
      setServiceProviders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const categories = [
    { id: "plumber", name: "Plumber", icon: "fa-wrench" },
    { id: "carpenter", name: "Carpenter", icon: "fa-hammer" },
    { id: "gardener", name: "Gardener", icon: "fa-leaf" },
    { id: "painter", name: "Painter", icon: "fa-paint-roller" },
    { id: "electrician", name: "Electrician", icon: "fa-bolt" },
    { id: "cleaner", name: "Cleaner", icon: "fa-broom" },
  ];

  // Group providers by their category
  const groupedProviders = serviceProviders.reduce((acc, provider) => {
    if (!provider || !provider.category) {
      console.warn('Invalid provider data:', provider);
      return acc;
    }
    
    const category = provider.category.toLowerCase();
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(provider);
    return acc;
  }, {});

  const handleBooking = (provider) => {
    setSelectedProvider(provider);
    setShowTimeSlots(true);
  };

  const handleTimeSlotSelect = (time) => {
    setSelectedTime(time);
    setShowServiceTypes(true);
  };

  const handleServiceTypeSelect = (type) => {
    setSelectedServiceType(type);
    // Navigate to payment page with booking details
    navigate('/payment', {
      state: {
        provider: selectedProvider,
        date: selectedDate,
        time: selectedTime,
        serviceType: type,
        location,
        description
      }
    });
  };

  const serviceTypes = {
    carpenter: [
      "Furniture Repair",
      "Custom Furniture Making",
      "Cabinet Installation",
      "Door Installation",
      "Wooden Floor Installation",
      "General Woodwork",
    ],
    plumber: [
      "Pipe Repair",
      "Fixture Installation",
      "Drain Cleaning",
      "Water Heater Service",
    ],
    gardener: [
      "Lawn Maintenance",
      "Plant Care",
      "Landscape Design",
      "Tree Trimming",
    ],
    painter: [
      "Interior Painting",
      "Exterior Painting",
      "Wallpaper Installation",
      "Wood Staining",
    ],
    electrician: [
      "Wiring Installation",
      "Electrical Repair",
      "Light Fixture Installation",
      "Safety Inspection",
    ],
    cleaner: [
      "Deep Cleaning",
      "Regular Maintenance",
      "Window Cleaning",
      "Carpet Cleaning",
    ],
  };

  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">Error</p>
          <p>{error}</p>
          <p className="text-sm mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="fixed top-0 w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src={logo} 
                 alt="HireMe Logo" 
                 className="h-10 w-10 object-contain"/>
            <span className="text-2xl font-bold text-indigo-600">HireMe</span>
          </div>
          <div className="flex items-center space-x-8">
            <a href="/home" className="text-gray-600 hover:text-indigo-600 cursor-pointer whitespace-nowrap">Home</a>
            <a href="/services" className="text-gray-600 hover:text-indigo-600 cursor-pointer whitespace-nowrap">Service</a>
            <a href="#profile" className="text-gray-600 hover:text-indigo-600 cursor-pointer whitespace-nowrap">Profile</a>
            <a href="#history" className="text-gray-600 hover:text-indigo-600 cursor-pointer whitespace-nowrap">History</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 max-w-7xl mx-auto">
        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Service Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-6 rounded-xl flex flex-col items-center transition-all ${
                  selectedCategory === category.id
                    ? "bg-blue-50 border-2 border-blue-500"
                    : "bg-white border border-gray-200 hover:border-blue-200"
                }`}
              >
                <i
                  className={`fas ${category.icon} text-2xl ${
                    selectedCategory === category.id
                      ? "text-blue-500"
                      : "text-gray-600"
                  }`}
                ></i>
                <span
                  className={`mt-2 text-sm font-medium ${
                    selectedCategory === category.id
                      ? "text-blue-500"
                      : "text-gray-600"
                  }`}
                >
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Service Providers Sections */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => fetchData()}
              className="mt-2 text-blue-500 hover:text-blue-600"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map(category => {
              const providers = groupedProviders[category.id] || [];
              
              if (selectedCategory && category.id !== selectedCategory) {
                return null;
              }

              if (providers.length === 0 && category.id === selectedCategory) {
                return (
                  <div key={category.id} className="bg-white rounded-xl p-8 text-center">
                    <i className={`fas ${category.icon} text-4xl text-gray-400 mb-4`}></i>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      No {category.name}s Available
                    </h3>
                    <p className="text-gray-600">
                      We couldn't find any {category.name.toLowerCase()}s in your area.
                      Please check back later or try a different service category.
                    </p>
                  </div>
                );
              }

              if (providers.length === 0) {
                return null;
              }

              return (
                <div key={category.id} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center mb-6">
                    <i className={`fas ${category.icon} text-2xl text-blue-500 mr-3`}></i>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {category.name} Services
                    </h3>
                    <span className="ml-4 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                      {providers.length} available
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {providers.map((provider) => (
                      <div
                        key={provider._id}
                        className="border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row">
                          <div className="relative w-full sm:w-64 h-48 sm:h-full">
                            <img
                              src={provider.image ? `http://localhost:5000${provider.image}` : "https://public.readdy.ai/ai/img_res/d7366674d207fdf57bb6bf19223ac0e9.jpg"}
                              alt={provider.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null; // Prevent infinite loop
                                e.target.src = "https://public.readdy.ai/ai/img_res/d7366674d207fdf57bb6bf19223ac0e9.jpg";
                              }}
                            />
                            <span
                              className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs ${
                                provider.status === "Online"
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-500 text-white"
                              }`}
                            >
                              {provider.status}
                            </span>
                          </div>
                          <div className="flex-1 p-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-800">
                                  {provider.name}
                                </h3>
                                <div className="flex items-center mt-1">
                                  <i className={`fas ${category.icon} text-blue-500 mr-2`}></i>
                                  <p className="text-md text-gray-600">
                                    {provider.category}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xl font-semibold text-gray-800">
                                ₹{provider.price}/hr
                              </span>
                            </div>
                            <div className="mt-4 flex items-center">
                              <span className="text-yellow-400 flex items-center">
                                <i className="fas fa-star"></i>
                                <span className="ml-1 text-gray-700 text-lg">
                                  {provider.rating || 0}
                                </span>
                              </span>
                              <span className="mx-3 text-gray-300">|</span>
                              <span className="text-gray-600">
                                {provider.experience} years experience
                              </span>
                            </div>
                            <div className="mt-6">
                              <button
                                onClick={() => handleBooking(provider)}
                                className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-lg font-medium"
                              >
                                Book Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Time Slots Modal */}
        {showTimeSlots && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Select Time Slot</h3>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeSlotSelect(time)}
                    className="p-2 border rounded hover:bg-blue-50"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Service Types Modal */}
        {showServiceTypes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Select Service Type</h3>
              <div className="space-y-2">
                {serviceTypes[selectedCategory].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleServiceTypeSelect(type)}
                    className="w-full p-2 border rounded hover:bg-blue-50 text-left"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Services;