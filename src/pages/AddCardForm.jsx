import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import withProtectedRoute from "../hoc/ProtectedRoute";
import card from "../imgs/cards.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

 //const stripePromise = loadStripe("pk_test_51RFrVwI19RYg9sHRt8K2bzMeFrv5m6BEnHTAuhKVqhHNUq1pcHk2LhG6BLGfnqJIJfgeiH1eui63trYc2xIT671t00erDUOlHK");
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function AddCardForm() {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    email: "",
    cardName: "",
    billingAddress: "",
    city: "",
    zipCode: "",
  });

  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // Function to check if card exists based on last4
  const checkCardExists = async (last4, exp_month, exp_year, cvv) => {
    try {
      const response = await axios.post(
        `${baseUrl}/api/saveCard/checkCard`,
        { last4, exp_month, exp_year, cvv },
        { withCredentials: true }
      );
      return response.data.cardExists;
    } catch (error) {
      console.error("Error checking card existence:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const cardElement = elements.getElement(CardElement);

    try {
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          email: cardDetails.email,
          name: cardDetails.cardName,
          address: {
            line1: cardDetails.billingAddress,
            city: cardDetails.city,
            postal_code: cardDetails.zipCode,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      const { last4, exp_month, exp_year, cvv } = paymentMethod.card;

      const cardExists = await checkCardExists(last4, exp_month, exp_year, cvv); // Add CVV logic if needed

      if (cardExists) {
        toast.info("Card already added.");
        setIsLoading(false);
        return;
      }

      const response = await axios.post(
        `${baseUrl}/api/saveCard/saveCard`,
        {
          paymentMethodId: paymentMethod.id,
          email: cardDetails.email,
          billingAddress: cardDetails.billingAddress,
          city: cardDetails.city,
          zipCode: cardDetails.zipCode,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Card details saved successfully!");
        setTimeout(() => navigate("/my-cards"), 1000);
      } else {
        setErrorMessage("Failed to save card details.");
      }
    } catch (error) {
      setErrorMessage("An error occurred while saving card details.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="w-full h-screen justify-center overflow-y-scroll bg-[var(--bg-color)] pb-[50px]">
      <form className="p-6 rounded-md w-full m-auto max-w-[800px]" onSubmit={handleSubmit}>
        <div className="flex items-center my-4">
          <h2 className="font-montserrat text-[24px] font-semibold">Add Card</h2>
          <span className="ml-5">
            <img loading="lazy" src={card} className="w-[2.3rem] h-[2.3rem]" alt="Cards" />
          </span>
        </div>

        {errorMessage && (
          <div className="text-red-500 text-center mb-4">
            <p>{errorMessage}</p>
          </div>
        )}

        <div className="mb-4">
          <label className="block font-montserrat text-[24px] mb-2">Billing Details</label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="billingAddress"
              value={cardDetails.billingAddress}
              placeholder="Enter Address"
              onChange={handleInputChange}
              className="w-full border bg-[var(--bg-color)] border-gray-300 rounded-md px-4 h-12 mb-3"
            />
            <input
              type="text"
              name="city"
              value={cardDetails.city}
              placeholder="Enter City"
              onChange={handleInputChange}
              className="w-full border bg-[var(--bg-color)] border-gray-300 rounded-md px-4 h-12 mb-3"
            />
          </div>
          <input
            type="text"
            name="zipCode"
            value={cardDetails.zipCode}
            placeholder="Enter Zip/Postal Code"
            onChange={handleInputChange}
            className="w-full border bg-[var(--bg-color)] border-gray-300 rounded-md px-4 h-12 mb-3"
          />
        </div>

        <label className="block font-montserrat text-[24px] mb-2 mt-7">Card Details</label>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="email"
            name="email"
            value={cardDetails.email}
            placeholder="Enter Email"
            className="w-full bg-[var(--bg-color)] border border-gray-300 rounded-md px-4 h-12 mb-3"
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="cardName"
            value={cardDetails.cardName}
            placeholder="Name on the card"
            className="w-full bg-[var(--bg-color)] border border-gray-300 rounded-md px-4 h-12 mb-3"
            onChange={handleInputChange}
          />
        </div>

        <div className="mb-4">
          <CardElement className="border border-gray-300 rounded-md px-4 py-2" />
        </div>

        <div className="flex mb-5">
          <button
            type="submit"
            className="font-montserrat bg-[var(--main-color)] text-white p-2 px-6 rounded-xl"
            disabled={isLoading || !stripe || !elements}
          >
            {isLoading ? "Saving..." : "Verify"}
          </button>
        </div>
      </form>

      {/* <ToastContainer /> */}
    </div>
  );
}

const AddCardWithStripe = () => (
  <Elements stripe={stripePromise}>
    <AddCardForm />
  </Elements>
);

export default withProtectedRoute(AddCardWithStripe);



// import { useState } from "react";
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import withProtectedRoute from "../hoc/ProtectedRoute";
// import card from "../imgs/cards.png";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const stripePromise = loadStripe("pk_test_51MQ519EtI0uhUfhilMzObu3MIE2kbpyP2JPl4kaTbxF0bv9c2D5OxJGpp85tmzXoCCyy7ZqRPJXY1qubBdTEifjZ00PdTkgKDf");

// function AddCardForm() {
//   const baseUrl = import.meta.env.VITE_BASE_URL;
//   const [errorMessage, setErrorMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [cardDetails, setCardDetails] = useState({
//     email: "",
//     cardName: "",
//     billingAddress: "",
//     city: "",
//     zipCode: "",
//   });

//   const stripe = useStripe();
//   const elements = useElements();
//   const navigate = useNavigate();

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setCardDetails((prevDetails) => ({
//       ...prevDetails,
//       [name]: value,
//     }));
//   };

//   // Function to check if card exists based on last4
//   const checkCardExists = async (last4, exp_month, exp_year, cvv) => {
//     try {
//       const response = await axios.post(
//         `${baseUrl}/api/saveCard/checkCard`,
//         { last4, exp_month, exp_year, cvv },
//         { withCredentials: true }
//       );
//       return response.data.cardExists;
//     } catch (error) {
//       console.error("Error checking card existence:", error);
//       return false;
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!stripe || !elements) {
//       return;
//     }

//     setIsLoading(true);
//     setErrorMessage("");

//     const cardElement = elements.getElement(CardElement);

//     try {
//       const { paymentMethod, error } = await stripe.createPaymentMethod({
//         type: "card",
//         card: cardElement,
//         billing_details: {
//           email: cardDetails.email,
//           name: cardDetails.cardName,
//           address: {
//             line1: cardDetails.billingAddress,
//             city: cardDetails.city,
//             postal_code: cardDetails.zipCode,
//           },
//         },
//       });

//       if (error) {
//         setErrorMessage(error.message);
//         setIsLoading(false);
//         return;
//       }

//       const { last4, exp_month, exp_year, cvv } = paymentMethod.card;

//       const cardExists = await checkCardExists(last4, exp_month, exp_year, cvv); // Add CVV logic if needed

//       if (cardExists) {
//         toast.info("Card already added.");
//         setIsLoading(false);
//         return;
//       }

//       const response = await axios.post(
//         `${baseUrl}/api/saveCard/saveCard`,
//         {
//           paymentMethodId: paymentMethod.id,
//           email: cardDetails.email,
//           billingAddress: cardDetails.billingAddress,
//           city: cardDetails.city,
//           zipCode: cardDetails.zipCode,
//         },
//         { withCredentials: true }
//       );

//       if (response.data.success) {
//         toast.success("Card details saved successfully!");
//         setTimeout(() => navigate("/my-cards"), 1000);
//       } else {
//         setErrorMessage("Failed to save card details.");
//       }
//     } catch (error) {
//       setErrorMessage("An error occurred while saving card details.");
//     } finally {
//       setIsLoading(false);
//     }
//   };


//   return (
//     <div className="w-full h-screen justify-center overflow-y-scroll bg-[var(--bg-color)] pb-[50px]">
//       <form className="p-6 rounded-md w-full m-auto max-w-[800px]" onSubmit={handleSubmit}>
//         <div className="flex items-center my-4">
//           <h2 className="font-montserrat text-[24px] font-semibold">Add Card</h2>
//           <span className="ml-5">
//             <img loading="lazy" src={card} className="w-[2.3rem] h-[2.3rem]" alt="Cards" />
//           </span>
//         </div>

//         {errorMessage && (
//           <div className="text-red-500 text-center mb-4">
//             <p>{errorMessage}</p>
//           </div>
//         )}

//         <div className="mb-4">
//           <label className="block font-montserrat text-[24px] mb-2">Billing Details</label>
//           <div className="grid grid-cols-2 gap-4">
//             <input
//               type="text"
//               name="billingAddress"
//               value={cardDetails.billingAddress}
//               placeholder="Enter Address"
//               onChange={handleInputChange}
//               className="w-full border bg-[var(--bg-color)] border-gray-300 rounded-md px-4 h-12 mb-3"
//             />
//             <input
//               type="text"
//               name="city"
//               value={cardDetails.city}
//               placeholder="Enter City"
//               onChange={handleInputChange}
//               className="w-full border bg-[var(--bg-color)] border-gray-300 rounded-md px-4 h-12 mb-3"
//             />
//           </div>
//           <input
//             type="text"
//             name="zipCode"
//             value={cardDetails.zipCode}
//             placeholder="Enter Zip/Postal Code"
//             onChange={handleInputChange}
//             className="w-full border bg-[var(--bg-color)] border-gray-300 rounded-md px-4 h-12 mb-3"
//           />
//         </div>

//         <label className="block font-montserrat text-[24px] mb-2 mt-7">Card Details</label>
//         <div className="grid grid-cols-2 gap-4 mb-4">
//           <input
//             type="email"
//             name="email"
//             value={cardDetails.email}
//             placeholder="Enter Email"
//             className="w-full bg-[var(--bg-color)] border border-gray-300 rounded-md px-4 h-12 mb-3"
//             onChange={handleInputChange}
//           />
//           <input
//             type="text"
//             name="cardName"
//             value={cardDetails.cardName}
//             placeholder="Name on the card"
//             className="w-full bg-[var(--bg-color)] border border-gray-300 rounded-md px-4 h-12 mb-3"
//             onChange={handleInputChange}
//           />
//         </div>

//         <div className="mb-4">
//           <CardElement className="border border-gray-300 rounded-md px-4 py-2" />
//         </div>

//         <div className="flex mb-5">
//           <button
//             type="submit"
//             className="font-montserrat bg-[var(--main-color)] text-white p-2 px-6 rounded-xl"
//             disabled={isLoading || !stripe || !elements}
//           >
//             {isLoading ? "Saving..." : "Verify"}
//           </button>
//         </div>
//       </form>

//       {/* <ToastContainer /> */}
//     </div>
//   );
// }

// const AddCardWithStripe = () => (
//   <Elements stripe={stripePromise}>
//     <AddCardForm />
//   </Elements>
// );

// export default withProtectedRoute(AddCardWithStripe);