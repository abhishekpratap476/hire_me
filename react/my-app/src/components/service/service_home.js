// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
import React, { useState, useEffect } from "react";
import * as echarts from "echarts";
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { getServiceProvider } from '../../services/api';
import Notifications from './notifications';

const ServiceHome = () => {
  const navigate = useNavigate();
  // Add styles for toast animations
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }
      .animate-fade-in-up {
        animation: fadeInUp 0.3s ease-out;
      }
      .animate-fade-out {
        animation: fadeOut 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [serviceProvider, setServiceProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add handleLogout function
  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('serviceProviderId');
    
    // Redirect to login page
    navigate('/login');
  };

  // Check authentication and fetch service provider data
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        // Check if user is authenticated and is a service provider
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');
        const serviceProviderId = localStorage.getItem('serviceProviderId');

        console.log('Auth check:', {
          token: token ? 'Present' : 'Missing',
          userType: userType || 'Missing',
          serviceProviderId: serviceProviderId || 'Missing'
        });

        if (!token || userType !== 'serviceProvider' || !serviceProviderId) {
          console.log('Not authenticated as service provider:', { token, userType, serviceProviderId });
          navigate('/login');
          return;
        }

        // Fetch service provider data using the API service
        console.log('Fetching service provider data for ID:', serviceProviderId);
        const providerData = await getServiceProvider(serviceProviderId);
        
        if (!providerData) {
          throw new Error('No service provider data received');
        }

        console.log('Service provider data:', providerData);
        setServiceProvider(providerData);
        setLoading(false);
      } catch (err) {
        console.error('Error checking auth or fetching data:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });

        // Handle specific error cases
        if (err.response?.status === 401) {
          // Token expired or invalid
          console.log('Token expired or invalid, clearing auth data');
          localStorage.removeItem('token');
          localStorage.removeItem('serviceProviderId');
          localStorage.removeItem('userType');
          navigate('/login');
        } else if (err.response?.status === 404) {
          // Service provider not found
          console.log('Service provider not found, clearing auth data');
          localStorage.removeItem('token');
          localStorage.removeItem('serviceProviderId');
          localStorage.removeItem('userType');
          navigate('/login');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch service provider data');
          setLoading(false);
        }
      }
    };

    checkAuthAndFetchData();
  }, [navigate]);

  const [newTask, setNewTask] = useState({
    clientName: "",
    description: "",
    status: "pending",
    date: new Date().toISOString().split("T")[0],
    payment: 0,
    location: "",
  });

  const tasks = [
    {
      id: 1,
      clientName: "Victoria Bennett",
      description: "Complete house electrical rewiring and install new lighting fixtures",
      status: "pending",
      date: "2025-03-14",
      payment: 450,
      location: "742 Evergreen Terrace, Springfield",
    },
    {
      id: 2,
      clientName: "Christopher Hughes",
      description: "Install new circuit breaker panel and safety switches",
      status: "in-progress",
      date: "2025-03-13",
      payment: 380,
      location: "221B Baker Street, London",
    },
    {
      id: 3,
      clientName: "Sophia Rodriguez",
      description: "Emergency repair of power outage and electrical fault diagnosis",
      status: "completed",
      date: "2025-03-12",
      payment: 290,
      location: "350 Fifth Avenue, New York",
    },
  ];

  const [timeRange, setTimeRange] = useState("weekly");
  const [earningsType, setEarningsType] = useState("gross");

  useEffect(() => {
    const chartElement = document.getElementById("earnings-chart");
    if (chartElement) {
      const chart = echarts.init(chartElement);
      const dailyTransactions = {
        Mon: [
          { time: "09:00", amount: 120, client: "Victoria Bennett", service: "Electrical Repair" },
          { time: "14:30", amount: 200, client: "Christopher Hughes", service: "Wiring Installation" },
        ],
        Tue: [
          { time: "10:15", amount: 180, client: "Sophia Rodriguez", service: "Circuit Inspection" },
          { time: "16:45", amount: 270, client: "James Wilson", service: "Emergency Repair" },
        ],
      };

      const option = {
        animation: false,
        title: {
          text: `${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} ${earningsType.charAt(0).toUpperCase() + earningsType.slice(1)} Earnings`,
          left: "center",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          formatter: function (params) {
            const dayData = dailyTransactions[params[0].name] || [];
            let html = `<div class="font-bold">${params[0].name}: ₹${params[0].value}</div>`;
            html += '<div class="mt-2">';
            dayData.forEach((transaction) => {
              html += `
                <div class="mb-2">
                  <div>${transaction.time} - ${transaction.client}</div>
                  <div class="text-gray-500">${transaction.service}</div>
                  <div class="text-blue-600">₹${transaction.amount}</div>
                </div>
              `;
            });
            html += "</div>";
            return html;
          },
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: { show: true, title: "Save" },
            dataView: { show: true, readOnly: true, title: "Data View" },
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        yAxis: {
          type: "value",
          axisLabel: {
            formatter: "${value}",
          },
        },
        series: [
          {
            data: [320, 450, 380, 290, 400, 350, 250],
            type: "bar",
            color: "#3B82F6",
            emphasis: {
              itemStyle: {
                color: "#2563EB",
              },
            },
            itemStyle: {
              borderRadius: [4, 4, 0, 0],
            },
          },
        ],
      };
      chart.setOption(option);
      chart.on("click", function (params) {
        const dayData = dailyTransactions[params.name] || [];
        const total = dayData.reduce((sum, t) => sum + t.amount, 0);
        alert(
          `${params.name} Transactions:\nTotal: ₹${total}\n\n${dayData
            .map((t) => `${t.time} - ${t.client}\n${t.service}: ₹${t.amount}`)
            .join("\n\n")}`,
        );
      });
      return () => {
        chart.dispose();
      };
    }
  }, [timeRange, earningsType]);

  const Controls = () => (
    <div className="mb-6 flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <span className="text-gray-600">Time Range:</span>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border rounded-lg px-3 py-1 text-sm"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-gray-600">Type:</span>
        <select
          value={earningsType}
          onChange={(e) => setEarningsType(e.target.value)}
          className="border rounded-lg px-3 py-1 text-sm"
        >
          <option value="gross">Gross Earnings</option>
          <option value="net">Net Earnings</option>
        </select>
      </div>
    </div>
  );

  // Profile Section Component
  const ProfileSection = () => {
    if (!serviceProvider) return null;

    return (
      <div className="flex items-center space-x-2 cursor-pointer">
        <img
          src={serviceProvider.image ? `http://localhost:5000${serviceProvider.image}` : "https://public.readdy.ai/ai/img_res/d7366674d207fdf57bb6bf19223ac0e9.jpg"}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = "https://public.readdy.ai/ai/img_res/d7366674d207fdf57bb6bf19223ac0e9.jpg";
          }}
        />
        <span className="text-gray-700">{serviceProvider.name}</span>
      </div>
    );
  };

  // Stats Section Component
  const StatsSection = () => {
    if (!serviceProvider) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">Total Bookings</h3>
            <i className="fas fa-clipboard-list text-blue-600"></i>
          </div>
          <p className="text-3xl font-bold">{serviceProvider.totalBookings || 0}</p>
          <p className="text-sm text-gray-500 mt-2">Active bookings</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">Hourly Rate</h3>
            <i className="fas fa-dollar-sign text-green-600"></i>
          </div>
          <p className="text-3xl font-bold">₹{serviceProvider.price || 0}</p>
          <p className="text-sm text-gray-500 mt-2">Per hour</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">Rating</h3>
            <i className="fas fa-star text-yellow-400"></i>
          </div>
          <p className="text-3xl font-bold">{serviceProvider.rating || 0}</p>
          <p className="text-sm text-gray-500 mt-2">{serviceProvider.reviews?.length || 0} reviews</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">Experience</h3>
            <i className="fas fa-briefcase text-purple-600"></i>
          </div>
          <p className="text-3xl font-bold">{serviceProvider.experience || 0}</p>
          <p className="text-sm text-gray-500 mt-2">Years</p>
        </div>
      </div>
    );
  };

  // Profile Modal Component
  const ProfileModal = () => {
    if (!serviceProvider) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-semibold">Profile Settings</h2>
            <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-gray-600">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <img
                src={serviceProvider.image ? `http://localhost:5000${serviceProvider.image}` : "https://public.readdy.ai/ai/img_res/46bbb4c89ad003e830fc96670f7784ec.jpg"}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = "https://public.readdy.ai/ai/img_res/46bbb4c89ad003e830fc96670f7784ec.jpg";
                }}
              />
              <button className="px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg">
                Change Photo
              </button>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Name</label>
              <input type="text" className="w-full px-4 py-2 border rounded-lg" defaultValue={serviceProvider.name} />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input type="email" className="w-full px-4 py-2 border rounded-lg" defaultValue={serviceProvider.email} />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Phone</label>
              <input type="tel" className="w-full px-4 py-2 border rounded-lg" defaultValue={serviceProvider.phone} />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Category</label>
              <input type="text" className="w-full px-4 py-2 border rounded-lg" defaultValue={serviceProvider.category} />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Experience (years)</label>
              <input type="number" className="w-full px-4 py-2 border rounded-lg" defaultValue={serviceProvider.experience} />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Price per hour (₹)</label>
              <input type="number" className="w-full px-4 py-2 border rounded-lg" defaultValue={serviceProvider.price} />
            </div>
            <button className="w-full py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-8 py-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Service Provider Dashboard</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <img
                  src={serviceProvider.image ? `http://localhost:5000${serviceProvider.image}` : "https://public.readdy.ai/ai/img_res/46bbb4c89ad003e830fc96670f7784ec.jpg"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://public.readdy.ai/ai/img_res/46bbb4c89ad003e830fc96670f7784ec.jpg";
                  }}
                />
                <span>{serviceProvider.name}</span>
              </button>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800"
              >
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600">Total Bookings</h3>
                <i className="fas fa-clipboard-list text-blue-600"></i>
              </div>
              <p className="text-3xl font-bold">{serviceProvider.totalBookings || 0}</p>
              <p className="text-sm text-gray-500 mt-2">Active bookings</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600">Hourly Rate</h3>
                <i className="fas fa-dollar-sign text-green-600"></i>
              </div>
              <p className="text-3xl font-bold">₹{serviceProvider.price || 0}</p>
              <p className="text-sm text-gray-500 mt-2">Per hour</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600">Rating</h3>
                <i className="fas fa-star text-yellow-400"></i>
              </div>
              <p className="text-3xl font-bold">{serviceProvider.rating || 0}</p>
              <p className="text-sm text-gray-500 mt-2">{serviceProvider.reviews?.length || 0} reviews</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600">Experience</h3>
                <i className="fas fa-briefcase text-purple-600"></i>
              </div>
              <p className="text-3xl font-bold">{serviceProvider.experience || 0}</p>
              <p className="text-sm text-gray-500 mt-2">Years</p>
            </div>
          </div>

          {/* Booking Requests Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Booking Requests</h2>
            <Notifications />
          </div>

          {/* Recent Transactions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Transactions</h2>
            {/* ... existing transactions ... */}
          </div>
        </div>
      </div>

      {showProfileModal && <ProfileModal />}
    </div>
  );
};

export default ServiceHome;