import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getBookingStatus } from '../../services/api';
import '../../output.css';

const BookingStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingStatus = async () => {
      try {
        const { bookingId } = location.state || {};
        if (!bookingId) {
          throw new Error('No booking ID provided');
        }

        const response = await getBookingStatus(bookingId);
        setBooking(response.booking);
      } catch (error) {
        setError('Failed to fetch booking status');
        console.error('Error fetching booking status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingStatus();
  }, [location.state]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking status...</p>
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
          <button
            onClick={() => navigate('/home')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">No booking found</div>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Booking Status</h1>
            <span className={`px-3 py-1 rounded-full text-sm capitalize ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Service Details</h2>
              <p className="text-gray-600">{booking.serviceType}</p>
              <p className="text-gray-600">Provider: {booking.serviceProvider.name}</p>
              <p className="text-gray-600">Date: {new Date(booking.date).toLocaleDateString()}</p>
              <p className="text-gray-600">Time: {booking.time}</p>
              <p className="text-gray-600">Location: {booking.location}</p>
              <p className="text-gray-600">Amount: ₹{booking.totalAmount}</p>
            </div>

            {booking.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
                <p className="text-gray-600">{booking.description}</p>
              </div>
            )}

            {booking.rejectionReason && (
              <div>
                <h2 className="text-lg font-semibold text-red-800 mb-2">Rejection Reason</h2>
                <p className="text-red-600">{booking.rejectionReason}</p>
              </div>
            )}

            {booking.cancellationReason && (
              <div>
                <h2 className="text-lg font-semibold text-red-800 mb-2">Cancellation Reason</h2>
                <p className="text-red-600">{booking.cancellationReason}</p>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => navigate('/booking-history')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View All Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingStatus; 