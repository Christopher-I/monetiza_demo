import axios from "axios";
import React, { useState } from "react";

const PaypalPaymentButton = ({ amount, userId, creatorId, plan_id, paymentType }) => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [loading, setLoading] = useState(false);

  const handleCreatePayment = async () => {
    setLoading(true);
    try {
      // const response = await fetch('/api/payment/create-payment', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     amount,
      //     userId,
      //     creatorId,
      //     plan_id,
      //     paymentType,
      //     metadata: {
      //       ip: 'user-ip',
      //       userAgent: 'browser-info',
      //     },
      //   }),
      // });

      const response = await axios.post(`${baseUrl}/api/payment/tips`, {
        amount,
        userId,
        creatorId,
        plan_id,
        paymentType,
      },{
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      })

      const approvalUrl = response.data.find(
        (link) => link.rel === "approval_url"
      ).href;

      window.location.href = approvalUrl;
      // window.location.replace(approvalUrl);

      // const { orderId } = await response.data;

      // Redirect to PayPal for payment approval
      // window.location.href = `https://www.paypal.com/checkoutnow?token=${orderId}`;
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleCreatePayment}
        disabled={loading}
      >
        {loading ? "Processing..." : "Pay with PayPal"}
      </button>
    </div>
  );
};

export default PaypalPaymentButton;
