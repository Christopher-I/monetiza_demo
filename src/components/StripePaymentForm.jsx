import { useState } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';

const StripePaymentForm = () => {
  const [amount, setAmount] = useState(5000);  // Default amount (in cents)
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');

  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return; // Make sure Stripe.js has loaded
    }

    setIsProcessing(true);

    try {
      // Request a client secret from the server
      const response = await fetch('/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'usd' }),
      });

      const { clientSecret } = await response.json();

      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (error) {
        setPaymentStatus(`Payment failed: ${error.message}`);
      } else if (paymentIntent.status === 'succeeded') {
        setPaymentStatus('Payment succeeded!');
      }
    } catch (err) {
      setPaymentStatus(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Pay Now</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <CardElement className="p-2 border border-gray-300 rounded" />
        </div>

        <div className="mb-4">
          <button
            type="submit"
            disabled={isProcessing || !stripe}
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </form>

      {paymentStatus && (
        <div className="mt-4 text-center text-lg">
          <p>{paymentStatus}</p>
        </div>
      )}
    </div>
  );
};

export default StripePaymentForm;
