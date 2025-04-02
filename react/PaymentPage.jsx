import React from 'react';

const PaymentPage = ({ name, profession, rating }) => {
  return (
    <div>
      <h2>Payment Details</h2>
      <p>Name: {name}</p>
      <p>Profession: {profession}</p>
      <p>Rating: {rating}</p>
      {/* ... rest of your payment page content ... */}
    </div>
  );
};

export default PaymentPage;
