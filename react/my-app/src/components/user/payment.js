import React, { useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import '../../output.css';
import Services from './services';
import { createBooking } from '../../services/api';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Get booking details from location state
  const bookingDetails = location.state || {};
  const { provider, date, time, serviceType, location: serviceLocation, description } = bookingDetails;

  // Calculate total amount (for example: hourly rate * 2 hours minimum)
  const minimumHours = 2;
  const totalAmount = provider ? provider.price * minimumHours : 0;

  const orderDetails = {
    serviceType: provider.profession,
    duration: "4 hours",
    worker: provider.name,
    rating: provider.rating,
    totalAmount: totalAmount,
  };

  const popularBanks = [
    { name: "State Bank of India", code: "SBI", icon: "fa-building-columns" },
    { name: "HDFC Bank", code: "HDFC", icon: "fa-building-columns" },
    { name: "ICICI Bank", code: "ICICI", icon: "fa-building-columns" },
    { name: "Axis Bank", code: "AXIS", icon: "fa-building-columns" },
  ];

  const handlePayment = async () => {
    if (!isTermsAccepted) {
      setShowPaymentModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Get user data from token
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData._id) {
        // Instead of clearing data, try to get user data from the server
        try {
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            // Only clear data and redirect if we can't get user data from server
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userType');
            navigate('/booking-status');
            return;
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setErrorMessage('Unable to verify user data. Please try logging in again.');
          setShowRejectionModal(true);
          return;
        }
      }

      // Validate provider data
      if (!provider || !provider._id) {
        throw new Error('Invalid provider data');
      }

      // Format date and time
      const bookingDate = new Date(date);
      if (isNaN(bookingDate.getTime())) {
        throw new Error('Invalid date format');
      }

      // Get the final user data (either from localStorage or from the server)
      const finalUserData = JSON.parse(localStorage.getItem('user'));

      // Create booking request
      const bookingData = {
        clientId: finalUserData._id,
        serviceProviderId: provider._id,
        serviceType,
        date: bookingDate.toISOString(),
        time,
        location: serviceLocation,
        description,
        totalAmount,
        paymentMethod: selectedMethod,
        status: 'pending'
      };

      console.log('Creating booking with data:', bookingData);

      const response = await createBooking(bookingData);
      
      if (response && response.booking) {
        setShowSuccessModal(true);
        // Redirect to booking status page after 3 seconds
        setTimeout(() => {
          navigate('/booking-status', { 
            state: { 
              bookingId: response.booking._id,
              status: 'pending'
            }
          });
        }, 3000);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Booking error:', error);
      // Show more specific error message to user
      const message = error.response?.data?.message || error.message || 'Failed to create booking';
      setErrorMessage(message);
      setShowRejectionModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // If no provider details are available, redirect back to services
  if (!provider) {
    navigate('/services');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-8 py-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            Secure Payment
          </h1>
          <div className="flex items-center justify-between p-6 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-6">
              <img
                src={provider.image ? `http://localhost:5000${provider.image}` : "https://public.readdy.ai/ai/img_res/d7366674d207fdf57bb6bf19223ac0e9.jpg"}
                alt={provider.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = "https://public.readdy.ai/ai/img_res/d7366674d207fdf57bb6bf19223ac0e9.jpg";
                }}
              />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-800">{provider.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-yellow-500">
                    <i className="fas fa-star"></i>
                    <span className="text-gray-700 font-medium">{provider.rating}</span>
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-600">{provider.experience} experience</span>
                </div>
                <div className="flex flex-col text-gray-600">
                  <span className="flex items-center gap-2">
                    <i className="fas fa-briefcase"></i>
                    {provider.profession} - {serviceType}
                  </span>
                  <span className="flex items-center gap-2">
                    <i className="fas fa-clock"></i>
                    {date} at {time}
                  </span>
                  {serviceLocation && (
                    <span className="flex items-center gap-2">
                      <i className="fas fa-location-dot"></i>
                      {serviceLocation}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Total Amount</p>
              <div className="text-3xl font-bold text-blue-600">
                ₹{totalAmount}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {minimumHours} hours minimum
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {["upi", "card", "netbanking", "wallet", "cod"].map((method) => (
              <button
                key={method}
                onClick={() => setSelectedMethod(method)}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer whitespace-nowrap ${
                  selectedMethod === method
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-200"
                }`}
              >
                <i
                  className={`fas fa-${
                    method === "upi"
                      ? "mobile-alt"
                      : method === "card"
                      ? "credit-card"
                      : method === "netbanking"
                      ? "university"
                      : method === "wallet"
                      ? "wallet"
                      : "money-bill-wave"
                  } text-xl mb-2`}
                ></i>
                <p className="font-medium capitalize">
                  {method === "upi"
                    ? "UPI Payment"
                    : method === "card"
                    ? "Card Payment"
                    : method === "netbanking"
                    ? "Net Banking"
                    : method === "wallet"
                    ? "Digital Wallet"
                    : "Cash on Delivery"}
                </p>
              </button>
            ))}
          </div>

          {/* UPI Payment Section */}
          {selectedMethod === "upi" && (
            <div className="grid grid-cols-2 gap-8">
              <div>
                <img
                  src="https://public.readdy.ai/ai/img_res/071d7418688f6f08814eef6ed83bdbba.jpg"
                  alt="QR Code"
                  className="w-full rounded-lg mb-4"
                />
                <div className="flex gap-4 justify-center">
                  {["Google Pay", "PhonePe", "Paytm"].map((app) => (
                    <button
                      key={app}
                      className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                    >
                      <i className="fab fa-google-pay text-xl"></i>
                      <span className="ml-2">{app}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Enter UPI ID
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@upi"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handlePayment}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Pay ₹{orderDetails.totalAmount}
                </button>
              </div>
            </div>
          )}

          {/* Card Payment Section */}
          {selectedMethod === "card" && (
            <div className="max-w-md">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Name on Card</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">CVV</label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    className="w-full p- 3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={handlePayment}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Pay ₹{orderDetails.totalAmount}
              </button>
            </div>
          )}

          {/* Net Banking Section */}
          {selectedMethod === "netbanking" && (
            <div>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {popularBanks.map((bank) => (
                  <button
                    key={bank.code}
                    onClick={() => setSelectedBank(bank.code)}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer whitespace-nowrap ${
                      selectedBank === bank.code
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-200"
                    }`}
                  >
                    <i className={`fas ${bank.icon} text-xl mb-2`}></i>
                    <p className="font-medium">{bank.name}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={handlePayment}
                className="w-full max-w-md bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Pay ₹{orderDetails.totalAmount}
              </button>
            </div>
          )}

          {/* Digital Wallet Section */}
          {selectedMethod === "wallet" && (
            <div className="grid grid-cols-3 gap-4">
              {["Paytm", "PhonePe", "Amazon Pay", "MobiKwik"].map((wallet) => (
                <button
                  key={wallet}
                  onClick={handlePayment}
                  className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-200 transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className="fas fa-wallet text-xl mb-2"></i>
                  <p className="font-medium">{wallet}</p>
                </button>
              ))}
            </div>
          )}

          {/* Cash on Delivery Section */}
          {selectedMethod === "cod" && (
            <div className="max-w-md">
              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <div className="flex items-center mb-4">
                  <i className="fas fa-info-circle text-blue-600 mr-2"></i>
                  <h3 className="text-lg font-semibold text-blue-800">Cash on Delivery Details</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    You will pay ₹{totalAmount} in cash when the service provider arrives at your location.
                  </p>
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="fas fa-clock mr-2"></i>
                    <span>Payment will be collected after service completion</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    <span>Make sure you have the exact amount ready</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handlePayment}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Confirm Cash on Delivery
              </button>
            </div>
          )}
        </div>

        {/* Security and Terms */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <i className="fas fa-shield-alt text-green-600 text-xl"></i>
              <div>
                <p className="font-medium">100% Secure Payments</p>
                <p className="text-gray-600">
                  All transactions are secure and encrypted
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <img
                src="https://public.readdy.ai/ai/img_res/64c5eedafa3d91da204b127421153b78.jpg"
                alt="Security Badges"
                className="h-8"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isTermsAccepted}
              onChange={(e) => setIsTermsAccepted(e.target.checked)}
              className="w-4 h-4"
            />
            <label className="text-gray-600">
              I agree to the Terms & Conditions and Privacy Policy
            </label>
          </div>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Please Accept Terms</h3>
            <p className="text-gray-600 mb-4">
              Please accept the terms and conditions to proceed with the
              payment.
            </p>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg cursor-pointer whitespace-nowrap"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="text-center">
              <i className="fas fa-check-circle text-green-500 text-4xl mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Booking Request Sent!</h3>
              <p className="text-gray-600 mb-4">
                Your booking request has been sent to {provider.name}. 
                You will be notified once they accept or reject your request.
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="text-center">
              <i className="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Booking Failed</h3>
              <p className="text-gray-600 mb-4">
                {errorMessage}
              </p>
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setErrorMessage('');
                }}
                className="w-full bg-blue-600 text-white py-2 rounded-lg cursor-pointer whitespace-nowrap"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;