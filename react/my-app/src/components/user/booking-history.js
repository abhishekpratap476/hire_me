import React, { useState, useEffect } from 'react';
import { getClientBookings } from '../../services/api';
import logo from '../images/mh-logo.jpg';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  // Sample booking data
  const sampleBookings = [
    {
      _id: '1',
      serviceType: 'Electrical Repair',
      serviceProvider: {
        name: 'John Smith',
        rating: 4.8,
        experience: '5 years'
      },
      date: '2024-03-20',
      time: '10:00 AM',
      location: '123 Main Street, City',
      totalAmount: 2500,
      status: 'completed',
      description: 'Complete house electrical rewiring and install new lighting fixtures'
    },
    {
      _id: '2',
      serviceType: 'Plumbing',
      serviceProvider: {
        name: 'Mike Johnson',
        rating: 4.5,
        experience: '3 years'
      },
      date: '2024-03-22',
      time: '2:30 PM',
      location: '456 Park Avenue, City',
      totalAmount: 1800,
      status: 'pending',
      description: 'Fix leaking pipes and install new faucets'
    },
    {
      _id: '3',
      serviceType: 'Carpenter',
      serviceProvider: {
        name: 'David Wilson',
        rating: 4.9,
        experience: '8 years'
      },
      date: '2024-03-25',
      time: '11:00 AM',
      location: '789 Oak Street, City',
      totalAmount: 3500,
      status: 'accepted',
      description: 'Custom wooden cabinet installation'
    },
    {
      _id: '4',
      serviceType: 'Painter',
      serviceProvider: {
        name: 'Sarah Brown',
        rating: 4.7,
        experience: '6 years'
      },
      date: '2024-03-28',
      time: '9:00 AM',
      location: '321 Pine Road, City',
      totalAmount: 4200,
      status: 'rejected',
      rejectionReason: 'Service provider not available on requested date',
      description: 'Interior house painting'
    },
    {
      _id: '5',
      serviceType: 'AC Repair',
      serviceProvider: {
        name: 'Robert Lee',
        rating: 4.6,
        experience: '4 years'
      },
      date: '2024-03-30',
      time: '3:00 PM',
      location: '654 Maple Drive, City',
      totalAmount: 2800,
      status: 'cancelled',
      cancellationReason: 'Client cancelled due to emergency',
      description: 'AC maintenance and repair'
    }
  ];

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // In a real app, you would use the API call
        // const response = await getClientBookings();
        // setBookings(response.bookings);
        
        // For now, we'll use the sample data
        setBookings(sampleBookings);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch bookings');
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

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

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
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
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Booking History</h1>
            <div className="flex space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Bookings</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <li key={booking._id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getStatusColor(booking.status)}`}>
                            <span className="text-sm font-medium capitalize">{booking.status}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">{booking.serviceType}</h3>
                          <div className="mt-1 text-sm text-gray-500">
                            <p>Provider: {booking.serviceProvider.name}</p>
                            <p>Rating: {booking.serviceProvider.rating} ⭐</p>
                            <p>Experience: {booking.serviceProvider.experience}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-blue-600">₹{booking.totalAmount}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(booking.date).toLocaleDateString()} at {booking.time}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Location:</span> {booking.location}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Description:</span> {booking.description}
                      </p>
                      {booking.rejectionReason && (
                        <p className="text-sm text-red-600">
                          <span className="font-medium">Rejection Reason:</span> {booking.rejectionReason}
                        </p>
                      )}
                      {booking.cancellationReason && (
                        <p className="text-sm text-red-600">
                          <span className="font-medium">Cancellation Reason:</span> {booking.cancellationReason}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingHistory; 