import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../output.css';

const BookingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookingRequests();
  }, []);

  const fetchBookingRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/bookings/provider/requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch booking requests');
      }

      const data = await response.json();
      setRequests(data.requests);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (bookingId, action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} booking request`);
      }

      // Refresh the requests list
      fetchBookingRequests();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-center">
          <i className="fas fa-exclamation-circle text-4xl mb-4"></i>
          <p className="text-xl">{error}</p>
          <button
            onClick={fetchBookingRequests}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Booking Requests</h1>
        
        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <i className="fas fa-inbox text-gray-400 text-4xl mb-4"></i>
            <p className="text-gray-600">No pending booking requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {request.serviceType}
                    </h3>
                    <p className="text-gray-600">
                      <i className="fas fa-calendar-alt mr-2"></i>
                      {new Date(request.date).toLocaleDateString()} at {request.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600">
                      ₹{request.totalAmount}
                    </p>
                    <p className="text-sm text-gray-500">
                      {request.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        src={request.client.image || "https://public.readdy.ai/ai/img_res/d7366674d207fdf57bb6bf19223ac0e9.jpg"}
                        alt={request.client.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <p className="font-medium">{request.client.name}</p>
                        <p className="text-sm text-gray-500">{request.location}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleRequest(request._id, 'accept')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRequest(request._id, 'reject')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingRequests; 