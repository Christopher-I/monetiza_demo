import React, { useEffect, useState } from 'react';
import ModalWrapper from './ModalWrapper';
import verifiedSVG from "../imgs/Vector.svg";
import mastercardImg from "../imgs/mastercard_2.png";
import visaImg from "../imgs/visa_2.png";
import { CiCircleCheck } from "react-icons/ci";
import { BsCurrencyDollar } from "react-icons/bs";
import { useSelector, useDispatch } from "react-redux";
import axios from 'axios';
import { toast } from 'react-toastify';
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from 'react-router-dom';

const ChatSubscribeModal = ({ isOpen, onClose, data }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL;
//   const stripePromise = loadStripe("pk_test_51MQ519EtI0uhUfhilMzObu3MIE2kbpyP2JPl4kaTbxF0bv9c2D5OxJGpp85tmzXoCCyy7ZqRPJXY1qubBdTEifjZ00PdTkgKDf");

  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [fetchedCard, setFetchedCard] = useState([]);
//   const [fetchedPlans, setFetchedPlans] = useState([]);
//   const [frequency, setFrequency] = useState("");

  const { user } = useSelector((state) => state.auth);
  const { cards } = useSelector((state) => state.card);

  // useEffect(() => {
  //   const fetchCards = async () => {
  //     try {
  //       const response = await axios.get(`${baseUrl}/api/saveCard/view/saveCard`, {
  //         headers: { "Content-Type": "application/json" },
  //         withCredentials: true,
  //       });
  //       setFetchedCard(response.data.savedCards || []);
  //     } catch (error) {
  //       console.error("Error fetching cards:", error);
  //     }
  //   };
  //   fetchCards();
  // }, []);


  // useEffect(() => {
  //   if (fetchedCard.length > 0) {
  //     setSelectedCard(`${fetchedCard[0].brand}_0`);
  //   }
  // }, [fetchedCard]);


  useEffect(() => {
    if (cards.length > 0) {
      setSelectedCard(`${cards[0].brand}_0`);
    }
  }, [cards]);

  const handleSubscribe = async () => {
    if (!selectedCard) return toast.error("Please select a card to proceed");
    if (!data.authorId) return toast.error("No creator found");
    // if (!frequency) return toast.error("Please select a subscription plan");

    setLoading(true);
    try {
      let cardIndex = selectedCard.split("_")[1];
      // const paymentMethodId = fetchedCard[cardIndex]?.paymentMethodId;
      const paymentMethodId = cards[cardIndex]?.paymentMethodId;

      const response = await axios.post(`${baseUrl}/api/payment/chat-subscribe/saved`, {
        creatorId: data.authorId,
        // plan_id: data?.subDetails._id,
        paymentMethodId,
        // frequency,
      }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      setLoading(false);
      toast.success(response.data.message);
    } catch (error) {
      setLoading(false);
      toast.error(error?.response?.data?.message || "An error occurred");
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="p-4 font-montserrat">
        <div className="text-2xl my-2 font-semibold">Subscribe to Chat</div>
        <div className="flex flex-col items-center mb-6">
          <img src={data.profilePic} alt="" className="rounded-full h-16 w-16 mb-2" />
          <p className="text-sm lg:text-lg font-bold text-gray-800 flex items-center gap-1 lg:gap-2">
            {data.name}{data.verified && <img loading="lazy" src={verifiedSVG} alt="verified" className="h-4 lg:h-7 w-4 lg:w-7" />}
          </p>
          <span className="text-xs lg:text-sm text-gray-500">@{data.username}</span>
        </div>
        <div className="font-semibold mb-1">Choose your preferred payment method</div>
        <div className="grid grid-cols-3 gap-2">
          {cards?.map(({ brand, last4 }, index) => (
            <div key={index} onClick={() => setSelectedCard(`${brand}_${index}`)} className={`flex flex-col justify-between cursor-pointer border ${selectedCard === `${brand}_${index}` ? "border-[#E35F01]" : "border-gray-300"} rounded-md`}>
              <div className="flex justify-between items-center">
                <img src={brand === "mastercard" ? mastercardImg : visaImg} alt={brand} className="w-8 h-8" />
                {selectedCard === `${brand}_${index}` && <CiCircleCheck color='#E35F01' />}
              </div>
              <div className="flex justify-between p-1">
                <span className="text-xs capitalize">{brand}</span>
                <span className="text-xs">{last4}</span>
              </div>
            </div>
          ))}
          {cards.length === 0 && (
            <div onClick={() => navigate("/my-cards")} className="flex flex-col justify-center cursor-pointer border border-gray-300 rounded-md p-4 text-center">
              <span className="text-sm">Add a Payment Method</span>
            </div>
          )}
        </div>
        {/* <div className="font-semibold my-4">Plan</div>
        <select className="border border-gray-500 p-2 rounded-md w-full" onChange={(e) => setFrequency(e.target.value)}>
          <option value="" disabled selected>Select a plan</option>
          {fetchedPlans.map((plan, index) => (
            <option key={index} value={plan}>{plan === "one" ? "One-Time Payment" : plan}</option>
          ))}
        </select>
        <div className="font-semibold my-4">Amount</div>
        <div className="border border-gray-500 p-2 rounded-md flex items-center">
          <BsCurrencyDollar className='ml-4' />
          <span className="ml-2">
            {data?.subDetails && frequency && data?.subDetails[frequency] ? data.subDetails[frequency].amount : "-"}
          </span>
        </div> */}
        <button onClick={handleSubscribe} disabled={loading} className={`mx-auto w-full p-3 py-1 mt-10 rounded-full ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600 text-white"}`}>
          {loading ? "Processing..." : <span className='ml-1'>Chat Now ${data.subDetails}</span>}
        </button>
      </div>
    </ModalWrapper>
  );
};

export const MediaSubscribeModal = ({ isOpen, onClose, data }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL;
//   const stripePromise = loadStripe("pk_test_51MQ519EtI0uhUfhilMzObu3MIE2kbpyP2JPl4kaTbxF0bv9c2D5OxJGpp85tmzXoCCyy7ZqRPJXY1qubBdTEifjZ00PdTkgKDf");

  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [fetchedCard, setFetchedCard] = useState([]);
//   const [fetchedPlans, setFetchedPlans] = useState([]);
//   const [frequency, setFrequency] = useState("");

  const { user } = useSelector((state) => state.auth);
  const { cards } = useSelector((state) => state.card);

  // useEffect(() => {
  //   const fetchCards = async () => {
  //     try {
  //       const response = await axios.get(`${baseUrl}/api/saveCard/view/saveCard`, {
  //         headers: { "Content-Type": "application/json" },
  //         withCredentials: true,
  //       });
  //       setFetchedCard(response.data.savedCards || []);
  //     } catch (error) {
  //       console.error("Error fetching cards:", error);
  //     }
  //   };
  //   fetchCards();
  // }, []);


  // useEffect(() => {
  //   if (fetchedCard.length > 0) {
  //     setSelectedCard(`${fetchedCard[0].brand}_0`);
  //   }
  // }, [fetchedCard]);

  useEffect(() => {
    if (cards.length > 0) {
      setSelectedCard(`${cards[0].brand}_0`);
    }
  }, [cards]);

  const handleSubscribe = async () => {
    if (!selectedCard) return toast.error("Please select a card to proceed");
    if (!data.messageId) return toast.error("No creator found");
    // if (!frequency) return toast.error("Please select a subscription plan");

    setLoading(true);
    try {
      let cardIndex = selectedCard.split("_")[1];
      // const paymentMethodId = fetchedCard[cardIndex]?.paymentMethodId;
      const paymentMethodId = cards[cardIndex]?.paymentMethodId;

      const response = await axios.post(`${baseUrl}/api/payment/media-charge/saved`, {
        messageId: data.messageId,
        creatorId: data.authorId,
        // plan_id: data?.subDetails._id,
        paymentMethodId,
        // frequency,
      }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      setLoading(false);
      toast.success(response.data.message);
    } catch (error) {
      setLoading(false);
      toast.error(error?.response?.data?.message || "An error occurred");
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="p-4 font-montserrat">
        <div className="text-2xl my-2 font-semibold">Subscribe to view media</div>
        <div className="flex flex-col items-center mb-6">
          <img src={data.profilePic} alt="" className="rounded-full h-16 w-16 mb-2" />
          <p className="text-sm lg:text-lg font-bold text-gray-800 flex items-center gap-1 lg:gap-2">
            {data.name}{data.verified && <img loading="lazy" src={verifiedSVG} alt="verified" className="h-4 lg:h-7 w-4 lg:w-7" />}
          </p>
          <span className="text-xs lg:text-sm text-gray-500">@{data.username}</span>
        </div>
        <div className="font-semibold mb-1">Choose your preferred payment method</div>
        <div className="grid grid-cols-3 gap-2">
          {cards?.map(({ brand, last4 }, index) => (
            <div key={index} onClick={() => setSelectedCard(`${brand}_${index}`)} className={`flex flex-col justify-between cursor-pointer border ${selectedCard === `${brand}_${index}` ? "border-[#E35F01]" : "border-gray-300"} rounded-md`}>
              <div className="flex justify-between items-center">
                <img src={brand === "mastercard" ? mastercardImg : visaImg} alt={brand} className="w-8 h-8" />
                {selectedCard === `${brand}_${index}` && <CiCircleCheck color='#E35F01' />}
              </div>
              <div className="flex justify-between p-1">
                <span className="text-xs capitalize">{brand}</span>
                <span className="text-xs">{last4}</span>
              </div>
            </div>
          ))}
          {cards.length === 0 && (
            <div onClick={() => navigate("/my-cards")} className="flex flex-col justify-center cursor-pointer border border-gray-300 rounded-md p-4 text-center">
              <span className="text-sm">Add a Payment Method</span>
            </div>
          )}
        </div>
        {/* <div className="font-semibold my-4">Plan</div>
        <select className="border border-gray-500 p-2 rounded-md w-full" onChange={(e) => setFrequency(e.target.value)}>
          <option value="" disabled selected>Select a plan</option>
          {fetchedPlans.map((plan, index) => (
            <option key={index} value={plan}>{plan === "one" ? "One-Time Payment" : plan}</option>
          ))}
        </select>
        <div className="font-semibold my-4">Amount</div>
        <div className="border border-gray-500 p-2 rounded-md flex items-center">
          <BsCurrencyDollar className='ml-4' />
          <span className="ml-2">
            {data?.subDetails && frequency && data?.subDetails[frequency] ? data.subDetails[frequency].amount : "-"}
          </span>
        </div> */}
        <button onClick={handleSubscribe} disabled={loading} className={`mx-auto w-full p-3 py-1 mt-10 rounded-full ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600 text-white"}`}>
          {loading ? "Processing..." : <span className='ml-1'>Chat Now ${data.subDetails}</span>}
        </button>
      </div>
    </ModalWrapper>
  );
};

export default ChatSubscribeModal;
