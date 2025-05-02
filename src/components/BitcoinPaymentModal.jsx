import React from 'react';
import ModalWrapper from './ModalWrapper';
import QRCode from "react-qr-code";
import { toast } from 'react-toastify';
import axios from 'axios';

const BitcoinPaymentModal = ({ isOpen, onClose, bitcoinDetails }) => {
    const baseUrl = import.meta.env.VITE_BASE_URL;

  const handleConfirmPayment = async () => {
    try {
      // Call the backend confirmation endpoint.
      // Adjust the base URL as needed (e.g., via an environment variable)
      const response = await axios.post(
        `${baseUrl}/api/payment/bitcoin/confirm`,
        { paymentId: bitcoinDetails.paymentId },
        { withCredentials: true }
      );

      if (response.data.success == true) {
        toast.success(response.data.message);
        onClose()
      }else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error("Error confirming bitcoin payment:", error.response?.data || error.message);
      toast.error("Error confirming bitcoin payment");
    }
  };

  if (!bitcoinDetails) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="p-4 text-center font-montserrat">
        <h3 className="text-2xl font-semibold mb-4">Bitcoin Payment</h3>
        <QRCode value={bitcoinDetails.address} size={200} className="mx-auto mb-4" />
        <div className="mb-2">
          <label className="font-semibold">Bitcoin Address</label>
          <input
            type="text"
            value={bitcoinDetails.address}
            readOnly
            className="w-full p-2 border border-gray-300 rounded-md mt-1"
            onClick={() => navigator.clipboard.writeText(bitcoinDetails.address)}
          />
        </div>
        <div className="mb-2">
          <label className="font-semibold">Amount</label>
          <input
            type="text"
            value={`$${bitcoinDetails.amount}`}
            readOnly
            className="w-full p-2 border border-gray-300 rounded-md mt-1"
          />
        </div>
        <small className="block mb-4 text-gray-600">
          Once payment is sent, click the 'Confirm Payment' button below
        </small>
        <button
          onClick={handleConfirmPayment}
          className="mx-auto w-full bg-orange-500 text-white p-3 py-1 rounded-full hover:bg-orange-600"
        >
          Confirm Payment
        </button>
      </div>
    </ModalWrapper>
  );
};

export default BitcoinPaymentModal;
