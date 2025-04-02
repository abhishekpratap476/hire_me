import React, { useState, useEffect } from 'react';
import { getProviderRequests, acceptBooking, rejectBooking } from '../../services/api';

const Notifications = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await getProviderRequests();
      setRequests(response.requests);
    } catch (error) {
      setError('Failed to fetch booking requests');
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId) => {
    try {
      await acceptBooking(bookingId);
      // Refresh requests after accepting
      fetchRequests();
    } catch (error) {
      setError('Failed to accept booking');
      console.error('Error accepting booking:', error);
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await rejectBooking(bookingId);
      // Refresh requests after rejecting
      fetchRequests();
    } catch (error) {
      setError('Failed to reject booking');
      console.error('Error rejecting booking:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Booking Requests</h2>
      {requests.length === 0 ? (
        <p className="text-gray-500">No pending booking requests</p>
      ) : (
        requests.map((request) => (
          <div key={request._id} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{request.serviceType}</h3>
                <p className="text-gray-600">Client: {request.client.name}</p>
                <p className="text-gray-600">Date: {new Date(request.date).toLocaleDateString()}</p>
                <p className="text-gray-600">Time: {request.time}</p>
                <p className="text-gray-600">Location: {request.location}</p>
                <p className="text-gray-600">Amount: ₹{request.totalAmount}</p>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                Pending
              </span>
            </div>
            {request.description && (
              <p className="text-gray-600 mb-4">{request.description}</p>
            )}
            <div className="flex gap-4">
              <button
                onClick={() => handleAccept(request._id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Accept
              </button>
              <button
                onClick={() => handleReject(request._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Notifications; 