import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login';
import Signup from './components/signup';
import Home from './components/user/home';
import Services from './components/user/services';
import Payment from './components/user/payment';
import ServiceHome from './components/service/service_home';
import BookingHistory from './components/user/booking-history';
import BookingStatus from './components/user/booking-status';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Client Routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/booking-history" element={<BookingHistory />} />
        <Route path="/booking-status" element={<BookingStatus />} />

        {/* Service Provider Routes */}
        <Route path="/service_home" element={<ServiceHome />} />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
};

export default App; 