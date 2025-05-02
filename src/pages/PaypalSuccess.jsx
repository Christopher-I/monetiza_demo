import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { loading as loader } from "../store/authSlice";
import Loading from "../components/Loading";

const PaypalSuccessPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch(); 
    const baseUrl = import.meta.env.VITE_BASE_URL;
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [status, setStatus] = useState(null);
  const [payment, setPayment] = useState()
  const [creator, setCreator] = useState()

  // const dataToSend = { 
  //   type: "paypalSuccess", 
  //   subscription: !!payment.plan_id, 
  //   creator: creator.personal_info.fullname, 
  //   amount: payment.amount, 
  //   creatorObj: creator,
  //   paymentObj: payment,
  // };

  dispatch(loader());
  useEffect(() => {
    dispatch(loader());
    const executePayment = async () => {
      dispatch(loader());
      try {
        const paymentId = searchParams.get("paymentId");
        const payerId = searchParams.get("PayerID");

        const response = await axios.post(`${baseUrl}/api/payment/execute-payment`, {
          paymentId,
          payerId,
        });

        setPayment(() => response?.data.payment)
        setCreator(() => response?.data.creator)

        setStatus(paymentId);
        setIsProcessing(false);
        return { 
          type: "paypalSuccess", 
          subscription: !!response.data.payment.plan_id, 
          creator: response.data.creator.personal_info.fullname, 
          amount: response.data.payment.amount, 
          // creatorObj: response.data.creator,
          // paymentObj: response.data.payment,
        }
        // console.log(response.data, "response.data")
        // navigate("/feed", { state: dataToSend });
      } catch (error) {
        console.error("Error executing payment:", error);
        setIsProcessing(false);
      }
    };

    executePayment().then((dataToSend) => {
      // const dataToSend = { 
      //   type: "paypalSuccess", 
      //   subscription: !!payment?.plan_id, 
      //   creator: creator?.personal_info?.fullname, 
      //   amount: payment?.amount, 
      //   creatorObj: creator,
      //   paymentObj: payment,
      // };

      navigate("/feed", { state: dataToSend });
    });

    // isProcessing && navigate("/feed", { state: dataToSend });
  }, [searchParams]);

  return (
    <Loading />
    // <div className="flex flex-col items-center justify-center min-h-screen bg-green-100 p-6">
    //   {isProcessing ? (
    //     <p className="text-xl font-semibold text-gray-700">Processing your payment...</p>
    //   ) : (
    //     <div className="text-center">
    //       <h2 className="text-2xl font-bold text-green-700">
    //         Payment Successful!
    //       </h2>
    //       <p className="mt-2 text-gray-600">Payment ID: {status}</p>
    //     </div>
    //   )}
    // </div>
  );
};

export default PaypalSuccessPage;
