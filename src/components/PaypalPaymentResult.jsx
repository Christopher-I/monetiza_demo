import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const PaypalPaymentResult = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const token = searchParams.get('token');

  useEffect(() => {
    if (paymentId) {
      fetch(`/api/payment/success?token=${token}&paymentId=${paymentId}`)
        .then(response => response.json())
        .then(data => {
          // console.log('Payment success:', data);
        })
        .catch(error => {
          console.error('Payment failed:', error);
        });
    }
  }, [paymentId, token]);

  return <div>Processing your payment...</div>;
};

export default PaypalPaymentResult;
