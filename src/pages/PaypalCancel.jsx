import React from "react";

const PaypalCancelPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-100 p-6">
      <h2 className="text-2xl font-bold text-red-700">Payment Cancelled</h2>
      <p className="mt-2 text-gray-600">
        You have canceled your PayPal payment. Please try again.
      </p>
    </div>
  );
};

// import React from "react";
import { useNavigate } from "react-router-dom";

const CancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-100 p-6">
      <h2 className="text-3xl font-bold text-red-700">Payment Cancelled</h2>
      <p className="mt-4 text-gray-600 text-lg">
        You canceled your PayPal payment. If you want to try again, click the
        button below.
      </p>
      <button
        onClick={() => navigate(-2)}
        className="mt-6 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Go Back to Payment Page
      </button>
    </div>
  );
};

export default CancelPage;


// export default PaypalCancelPage;
