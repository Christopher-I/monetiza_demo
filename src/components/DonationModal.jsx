import React, { useEffect, useState } from 'react';
import ModalWrapper from './ModalWrapper';
import verifiedSVG from "../imgs/Vector.svg";
import mastercardImg from "../imgs/mastercard_2.png";
import visaImg from "../imgs/visa_2.png";
import paypalImg from "../imgs/paypal_2.png";
import bitcoinImg from "../imgs/bitcoin.png";
import express_logoImg from "../imgs/express_logo.png";
import stripeImg from "../imgs/stripe.png";
import { CiCircleCheck } from "react-icons/ci";
import { BsCurrencyDollar } from "react-icons/bs";
import { useSelector, useDispatch } from "react-redux";
import axios from 'axios';
import { toast } from 'react-toastify';
import { loading as loader } from "../store/authSlice";
import { loadStripe } from "@stripe/stripe-js";
import BitcoinPaymentModal from './BitcoinPaymentModal';


const DonationModal = ({ isOpen, onClose, data, onDonationSuccess }) => {
  const dispatch = useDispatch();
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const stripePromise = loadStripe("pk_live_51QhBBw1mznpA8fTXGQBH5Ks9PqhhArGh5k9NGKRHPl4Tf4yYyWUZ3jbhWfYttkveuJjd2uboaE0z963Tsz0tIjwR00uff5Cy4j");
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [bitcoinDetails, setBitcoinDetails] = useState(null);
  const [showBitcoinModal, setShowBitcoinModal] = useState(false);

  const [selectedCard, setSelectedCard] = useState('master');
  const [fetchedCard, setFetchedCard] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const { cards } = useSelector((state) => state.card);
  const COINREMITTER_BASE_URL = "https://coinremitter.com/api/v3/";

  // useEffect(() => {
  //   // 
  //   const handleGetCards = async () => {
  //     // 
  //     try {
  //       // 
  //       const response = await axios.get(`${baseUrl}/api/saveCard/view/saveCard`, {
  //         headers: { "Content-Type": "application/json" },
  //         withCredentials: true,
  //       })

  //       // console.log(response.data, "response.data")
  //       const defaultCards = response.data.savedCards.filter(card => card.isDefault);
  //       setFetchedCard(defaultCards);
  //     } catch (error) {
  //       // console.log(error, "Error getting result")
  //     }
  //   }

  //   handleGetCards()

  //   return () => {
  //     // 
  //   };
  // }, []);

  const handleSubmit = (e) => {
    // e.preventDefault();
    // console.log({ viewer, topic, target });
    // onSuccess({ viewer, topic, target })
    // onClose();
  };

  const handleSendTip = async () => {
    if (selectedCard === "paypal") {
      await handleCreatePaypalPayment();
    } else if (selectedCard === "stripe") {
      await handleCreateStripePayment();
    } else if (selectedCard.includes("mastercard") || selectedCard.includes("visa")) {
      await handleCreateCardPayment();
    } else if (selectedCard === "bitcoin") {
      await handleBitcoinPayment();
    } else {
      toast.info("Payment not supported yet");
    }
  };

  const handleCreatePaypalPayment = async () => {
    if (amount === 0 || amount == "") return toast.error("Set an amount to pay")
    if (!data.authorId) return toast.error("No creator found")
    setLoading(true);
    try {

      const response = await axios.post(`${baseUrl}/api/payment/tips`, {
        postId: data.postId,
        amount,
        userId: user._id,
        creatorId: data.authorId,
        plan_id: "",
        paymentType: "one-time",
      }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      })

      const approvalUrl = response.data.find(
        (link) => link.rel === "approval_url"
      ).href;

      // dispatch(loader())

      window.location.href = approvalUrl;
      // window.location.replace(approvalUrl);

      // const { orderId } = await response.data;

      // Redirect to PayPal for payment approval
      // window.location.href = `https://www.paypal.com/checkoutnow?token=${orderId}`;
      if (response.data.success) {
        toast.success(response.data.message);
        // Call donation update on the backend
        await axios.post(
          `${baseUrl}/api/post/donations/update`,
          { postId: data.postId, amount },
          { withCredentials: true }
        );
        // Trigger the callback to re-fetch donation info
        if (typeof onDonationSuccess === "function") {
          onDonationSuccess();
        }
        onClose();
      } else {
        toast.error("Donation failed: " + response.data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateCardPayment = async () => {
    if (amount === 0 || amount === "") {
      return toast.error("Set an amount to pay");
    }
    if (!data.authorId) {
      return toast.error("No creator found");
    }
    setLoading(true);
    try {
      // Get the default payment method from fetched cards (assuming at least one exists)
      let cardIndex = selectedCard.split("_")[1];
      const paymentMethodId = cards[cardIndex].paymentMethodId;
      // console.log("Using Payment Method ID:", paymentMethodId);
  
      const response = await axios.post(
        `${baseUrl}/api/payment/charge/saved`,
        {
          postId: data.postId,
          amount,
          userId: user._id,
          creatorId: data.authorId,
          plan_id: "",
          paymentType: "one-time",
          paymentMethodId,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
  
      // console.log("Card payment response:", response.data);
      if (response.data.success) {
        toast.success(response.data.message);
        // Call donation update on the backend
        await axios.post(
          `${baseUrl}/api/post/donations/update`,
          { postId: data.postId, amount },
          { withCredentials: true }
        );
        // Trigger the callback to re-fetch donation info
        if (typeof onDonationSuccess === "function") {
          onDonationSuccess();
        }
        onClose();
      } else {
        toast.error("Donation failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Error in handleCreateCardPayment:", error);
      toast.error(error?.response?.data?.message || "Card payment failed");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateStripePayment = async () => {
    if (amount === 0) return toast.error("Set an amount to pay");
    if (!data.authorId) return toast.error("No creator found");

    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/api/payment/tips/stripe`, {
        amount: amount * 100,
        currency: "USD",
        creatorId: data.authorId,
        paymentType: "one-time",
      }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      const { sessionId } = response.data;

      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error(error);
        toast.error("Stripe checkout failed");
      }

      if (response.data.success) {
        toast.success(response.data.message);
        // Call donation update on the backend
        await axios.post(
          `${baseUrl}/api/post/donations/update`,
          { postId: data.postId, amount },
          { withCredentials: true }
        );
        // Trigger the callback to re-fetch donation info
        if (typeof onDonationSuccess === "function") {
          onDonationSuccess();
        }
        onClose();
      } else {
        toast.error("Donation failed: " + response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Stripe payment failed");
    }
    setLoading(false);
  };

  const handleBitcoinPayment = async () => {
    if (!amount || amount <= 0) {
      return toast.error("Set a valid amount to pay");
    }
    if (selectedCard === "bitcoin" && Number(amount) < 20) {
      return toast.error("The minimum Bitcoin donation is $20");
    }

    setLoading(true);

    try {
      // console.log("Initiating Bitcoin payment...");

      const response = await axios.post(
        `${baseUrl}/api/payment/tips/bitcoinPayment`,
        {
          postId: data.postId,
          amount,
          creatorId: data.authorId,
          plan_id: "",
          paymentType: "one-time",
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      // console.log("Backend Response:", response.data);

      if (response?.data?.success) {
        const { address, qr_code_url, amount, paymentId } = response.data;

        setBitcoinDetails({
          address,
          qrCodeUrl: qr_code_url,
          amount,
          paymentId,
        });
        setShowBitcoinModal(true);  // Show Bitcoin modal
      } else {
        console.error("Invalid response data:", response?.data);
        toast.error("Payment failed: Invalid response");
      }
      if (response.data.success) {
        toast.success(response.data.message);
        // Call donation update on the backend
        await axios.post(
          `${baseUrl}/api/post/donations/update`,
          { postId: data.postId, amount },
          { withCredentials: true }
        );
        // Trigger the callback to re-fetch donation info
        if (typeof onDonationSuccess === "function") {
          onDonationSuccess();
        }
        onClose();
      } else {
        toast.error("Donation failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Error initiating Bitcoin payment:", error);
    } finally {
      setLoading(false);
    }
  };




  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="p-4 font-montserrat">
        <div className="text-2xl my-2 font-semibold">Donate</div>
        <div className="flex flex-col items-center mb-6">
          <img src={data.profilePic} alt="" className="rounded-full h-16 w-16 mb-2" />
          <p className="text-sm lg:text-lg font-bold text-gray-800 flex items-center gap-1 lg:gap-2">
            {data.name}{data.verified && <img loading="lazy" src={verifiedSVG} alt="verified" className="h-4 lg:h-7 w-4 lg:w-7" />}
          </p>
          <span className="text-xs lg:text-sm text-gray-500">@{data.username}</span>
        </div>
        <div className="font-semibold mb-1">Choose your preferred payment method</div>
        <div className="grid grid-cols-3 gap-2">
          {[
            // { name: "master", img: mastercardImg },
            // { name: "visa", img: visaImg },
            { name: "paypal", img: paypalImg },
            { name: "bitcoin", img: bitcoinImg },
            // { name: "express", img: express_logoImg },
            // { name: "stripe", img: stripeImg },
          ]
            .map(({ name, img }) => (
              <div key={name} onClick={() => setSelectedCard(name)} className={`flex flex-col justify-between cursor-pointer border ${selectedCard === name ? "border-[#E35F01]" : "border-gray-300"} rounded-md`}>
                <div className="flex justify-between items-center">
                  <img src={img} alt={name} style={{ width: "30px", height: "30px" }} />
                  {selectedCard === name && <div className="pr-3"><CiCircleCheck color='#E35F01' /></div>}
                </div>
                <div className="flex justify-between p-1">
                  <span className="text-xs capitalize">{name}</span>
                </div>
              </div>
            ))}
          {cards?.map(({ brand, last4 }, index) => (
            <div
              key={index}
              onClick={() => setSelectedCard(`${brand}_${index}`)}
              className={`flex flex-col justify-between cursor-pointer border ${selectedCard === `${brand}_${index}` ? "border-[#E35F01]" : "border-gray-300"} rounded-md`}
            >
              <div className="flex justify-between items-center">
                <img
                  src={brand === "mastercard" ? mastercardImg : visaImg}
                  alt={brand}
                  style={{ width: "30px", height: "30px" }}
                />
                {selectedCard === `${brand}_${index}` && (
                  <div className="pr-3">
                    <CiCircleCheck color='#E35F01' />
                  </div>
                )}
              </div>
              <div className="flex justify-between p-1">
                <span className="text-xs capitalize">{brand}</span>
                <span className="text-xs">{last4}</span>
              </div>
            </div>
          ))}



        </div>
        <div className="font-semibold my-4">Donate</div>
        <div className="border border-gray-500 p-2 rounded-md flex items-center">
          <BsCurrencyDollar className='ml-4 h-full' />
          <input placeholder='Amount' value={amount} onChange={(e) => setAmount(e.target.value)} type="number" className="w-full" />
        </div>
        <button onClick={handleSendTip} className="mx-auto w-full bg-orange-500 text-white p-3 py-1 mt-3 rounded-full hover:bg-orange-600">
          {loading ? "Processing..." : "Donate Now"}
        </button>
      </div>
      {showBitcoinModal && bitcoinDetails && (
        <BitcoinPaymentModal
          isOpen={showBitcoinModal}
          onClose={() => setShowBitcoinModal(false)}
          bitcoinDetails={bitcoinDetails}  // Pass bitcoin data
        />
      )}
    </ModalWrapper>

  );
};

export default DonationModal;
