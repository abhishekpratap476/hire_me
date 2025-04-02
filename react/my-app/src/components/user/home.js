// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';
import '../../output.css';
import logo from '../images/mh-logo.jpg';
import BookingHistory from './booking-history';

const App: React.FC = () => {
  const [rating] = useState(4.8);
  const [reviews] = useState(15234);

  useEffect(() => {
    const chartDom = document.getElementById('ratingChart');
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      const option = {
        animation: false,
        series: [{
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 5,
          splitNumber: 5,
          radius: '100%',
          itemStyle: {
            color: '#6366f1'
          },
          progress: {
            show: true,
            width: 18
          },
          pointer: {
            show: false
          },
          axisLine: {
            lineStyle: {
              width: 18
            }
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          },
          axisLabel: {
            show: false
          },
          title: {
            show: false
          },
          detail: {
            valueAnimation: true,
            offsetCenter: [0, '0%'],
            fontSize: 24,
            fontWeight: 'bold',
            formatter: '{value}',
            color: 'inherit'
          },
          data: [{
            value: rating
          }]
        }]
      };
      myChart.setOption(option);
    }
  }, [rating]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
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
            <a href="/booking-history" className="text-gray-600 hover:text-indigo-600 cursor-pointer whitespace-nowrap">History</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-16 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to Professional Services</h1>
          <p className="text-xl mb-8">Your One-Stop Solution for All Home Services</p>
          <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors duration-300 !rounded-button cursor-pointer" onClick={() => window.location.href = '/services'}>
            Get Started
          </button>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
        <div className="grid grid-cols-3 gap-8">
          {[
            {
              title: 'Carpentry',
              image: 'https://public.readdy.ai/ai/img_res/22f59ebe8bdb1c462a9cdbd2c4006328.jpg',
              description: 'Expert carpentry services for your home'
            },
            {
              title: 'Cleaning',
              image: 'https://public.readdy.ai/ai/img_res/2b55e8cdac01c128d5174b0fc5481884.jpg',
              description: 'Professional cleaning solutions'
            },
            {
              title: 'Plumbing',
              image: 'https://public.readdy.ai/ai/img_res/f4c91c098df7553e134b8cc85040842d.jpg',
              description: 'Reliable plumbing services'
            },
            {
              title: 'Electrical',
              image: 'https://public.readdy.ai/ai/img_res/4d612943851a58391fbb65b15b5d7f46.jpg',
              description: 'Professional electrical solutions'
            },
            {
              title: 'Painting',
              image: 'https://public.readdy.ai/ai/img_res/950a896d29d58a0b7d6c182828fae6b7.jpg',
              description: 'Quality painting services'
            },
            {
              title: 'Gardening',
              image: 'https://public.readdy.ai/ai/img_res/8af3c6aec98aa004e62bd60597602fbc.jpg',
              description: 'Expert gardening solutions'
            }
          ].map((service, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300">
              <img src={service.image} alt={service.title} className="w-full h-48 object-cover"/>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ratings Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Ratings</h2>
          <div className="flex items-center justify-center space-x-16">
            <div className="text-center">
              <div id="ratingChart" style={{ width: '200px', height: '200px' }}></div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-indigo-600">{rating} / 5.0</div>
                <div className="text-gray-600">{reviews.toLocaleString()} Reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Contact Us</h2>
        <div className="max-w-2xl mx-auto">
          <form className="space-y-6">
            <div>
              <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"/>
            </div>
            <div>
              <input type="email" placeholder="Your Email" className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"/>
            </div>
            <div>
              <textarea placeholder="Your Message" rows={4} className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"></textarea>
            </div>
            <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-300 !rounded-button cursor-pointer">
              Send Message
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">About HireMe</h3>
              <p className="text-gray-400">Your trusted partner for professional home services.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#about" className="text-gray-400 hover:text-white cursor-pointer">About Us</a></li>
                <li><a href="#services" className="text-gray-400 hover:text-white cursor-pointer">Services</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white cursor-pointer">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Info</h3>
              <ul className="space-y-2 text-gray-400">
                <li>123 Service Street</li>
                <li>New York, NY 10001</li>
                <li>+1 234 567 8900</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <i className="fab fa-facebook text-2xl cursor-pointer hover:text-indigo-400"></i>
                <i className="fab fa-twitter text-2xl cursor-pointer hover:text-indigo-400"></i>
                <i className="fab fa-instagram text-2xl cursor-pointer hover:text-indigo-400"></i>
                <i className="fab fa-linkedin text-2xl cursor-pointer hover:text-indigo-400"></i>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 HireMe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

