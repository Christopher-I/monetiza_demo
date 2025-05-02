import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentForm from '../components/StripePaymentForm';

// Make sure to replace with the Stripe public key
const stripePromise = loadStripe('pubkey');

function StripePay() {
  return (
    <Elements stripe={stripePromise}>
        <StripePaymentForm />
    </Elements>
  );
}

export default StripePay;
