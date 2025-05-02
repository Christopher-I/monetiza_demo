import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_live_51QhBBw1mznpA8fTXGQBH5Ks9PqhhArGh5k9NGKRHPl4Tf4yYyWUZ3jbhWfYttkveuJjd2uboaE0z963Tsz0tIjwR00uff5Cy4j");

const PaymentModal = ({ isOpen, onClose, activeChat, baseUrl }) => {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [amount, setAmount] = useState("");


    const handlePayment = async () => {
        if (!selectedPaymentMethod) {
            toast.info("Please select a payment method.");
            return;
        }

        if (!amount || isNaN(amount) || amount <= 0) {
            toast.info("Please enter a valid amount.");
            return;
        }

        if (selectedPaymentMethod === "PayPal") {
            try {
                const response = await axios.post(
                    `${baseUrl}/api/payment/tips`,
                    {
                        receiverId: activeChat._id,
                        amount: parseFloat(amount),
                        // isChat: true,
                        creatorId: activeChat._id,
                        plan_id: "",
                        isChat: activeChat ? true : false,
                        paymentType: "one-time",
                        metadata: { chatId: activeChat._id }
                    },
                    { withCredentials: true }
                );

                if (response.status === 200) {
                    const paymentUrl = response.data[1];
                    window.location.href = paymentUrl;
                } else {
                    toast.error("Payment initialization failed. Please try again.");
                }
            } catch (error) {
                console.error("Error initializing payment:", error);
                toast.error("Payment initialization failed. Please try again.");
            }
        } else if (selectedPaymentMethod === "Stripe") {
            try {
                const response = await axios.post(
                    `${baseUrl}/api/payment/tips/stripe`,
                    {
                        amount: parseFloat(amount) * 100, // Convert to cents
                        currency: "USD",
                        receiverId: activeChat._id,
                        paymentType: "one-time",
                    },
                    { withCredentials: true }
                );

                const { sessionId } = response.data;
                const stripe = await stripePromise;
                const { error } = await stripe.redirectToCheckout({ sessionId });

                if (error) {
                    console.error(error);
                    toast.error("Stripe checkout failed");
                }
            } catch (error) {
                console.error("Error initializing Stripe payment:", error);
                toast.error("Stripe payment failed. Please try again.");
            }
        } else if (selectedPaymentMethod === "Bitcoin") {
            if (!amount || amount <= 0) {
                return toast.error("Set a valid amount to pay");
            }

            setLoading(true);

            try {
                // console.log("Initiating Bitcoin payment...");

                const response = await axios.post(
                    `${baseUrl}/api/payment/tips/bitcoinPayment`,
                    {
                        amount,
                        buyer_email: user.personal_info.email,
                        buyer_name: user.personal_info.fullname,
                    },
                    {
                        headers: { "Content-Type": "application/json" },
                        withCredentials: true,
                    }
                );

                // console.log("Backend Response:", response.data);

                if (response?.data?.invoiceUrl) {
                    // console.log("Redirecting to:", response.data.invoiceUrl);
                    window.location.href = response.data.invoiceUrl;
                } else {
                    console.error("Missing invoice URL in response:", response?.data);
                    toast.error("Payment failed: No invoice URL provided");
                }
            } catch (error) {
                console.error("Error initiating Bitcoin payment:", error);
            } finally {
                setLoading(false);
            }
        } else {
            toast.error("Payment method not supported yet.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#F1F5F9] py-6 px-16 rounded-lg shadow-lg w-[30%] md:w-[50%]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Unlock Content</h2>
                    <button onClick={onClose} className="text-gray-500 text-4xl">&times;</button>
                </div>
                <div className="flex flex-col items-center">
                    <img
                        src={activeChat.personal_info.profile_img}
                        alt={activeChat.personal_info.fullname}
                        className="w-16 h-16 rounded-full object-cover mb-4"
                    />
                    <h3 className="font-bold text-md">{activeChat.personal_info.fullname}</h3>
                    <p className="text-sm text-gray-600">@{activeChat.personal_info.username}</p>
                </div>
                <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Choose your preferred payment method:</p>
                    <div className="grid grid-cols-3 gap-4">
                        <button
                            className={`p-2 rounded-md border flex flex-col items-center ${selectedPaymentMethod === "PayPal" ? "border-orange-500" : "border-gray-300"}`}
                            onClick={() => setSelectedPaymentMethod("PayPal")}
                        >
                            <img src="./paypal.png" alt="PayPal" className="w-8 h-8 mb-2" />
                            <span className="text-sm font-medium">PayPal</span>
                        </button>
                        <button
                            className={`p-2 rounded-md border flex flex-col items-center ${selectedPaymentMethod === "Stripe" ? "border-orange-500" : "border-gray-300"}`}
                            onClick={() => setSelectedPaymentMethod("Stripe")}
                        >
                            <img src="./stripe.png" alt="Stripe" className="w-8 h-8 mb-2" />
                            <span className="text-sm font-medium">Stripe</span>
                        </button>
                    </div>
                    <p className="text-sm font-medium mt-4">Content amount:</p>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-[#F1F5F9] transparent p-2 border border-gray-300 rounded-md mb-4"
                        placeholder="Amount"
                        min="1"
                    />
                </div>
                <div className="mt-6">
                    <button
                        onClick={handlePayment}
                        className="w-full py-2 bg-orange-500 text-white text-sm font-semibold rounded-full hover:bg-orange-600 transition duration-300"
                    >
                        Pay Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
