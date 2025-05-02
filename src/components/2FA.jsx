


import React, { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { MdCheckCircle } from "react-icons/md";
import { toast } from "react-toastify";
import { auth } from "../common/firebase";
import { multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator, RecaptchaVerifier, signInWithEmailAndPassword, signInWithPhoneNumber } from "firebase/auth";

const TwoFactorAuthentication = () => {
    const { user } = useSelector((state) => state.auth);
    const [activeStep, setActiveStep] = useState(1);
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState(new Array(6).fill(""));

    // const [phoneNumber, setPhoneNumber] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);

    const [verificationId, setVerificationId] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadedUser, setLoadedUser] = useState();
    const [message, setMessage] = useState("");

    const API_BASE_URL = import.meta.env.VITE_BASE_URL;



    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", // undefined
            {
              size: "invisible",
            }
          );
        }
      };

    const sendOTP = async () => {
        setupRecaptcha();
        try {
            const mfaSession = await multiFactor(loadedUser).getSession();
            const phoneInfoOptions = {
              phoneNumber: phoneNumber,
              session: mfaSession,
            };
            const phoneAuthProvider = new PhoneAuthProvider(auth);
            const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, window.recaptchaVerifier);
            setVerificationId(verificationId);
          } catch (error) {
            console.error("Error sending OTP", error);
          }
    };

    const verifyOTP = async () => {
        try {
            const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
            const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
            await multiFactor(loadedUser).enroll(multiFactorAssertion, "My 2FA");
            alert("Phone number verified and 2FA enabled!");
          } catch (error) {
            console.error("Error verifying OTP", error);
          }
    };

    // Step 1: User enters password

    const handlePasswordSubmit = async () => {
        if (!password) {
            toast.info("Password is required.");
            return;
        }

        setLoading(true);
        try {
            // const response = await axios.post(
            //     `${API_BASE_URL}/api/auth/signin`,
            //     { email: user.personal_info.email, password },
            //     { withCredentials: true }
            // );

            const response  = await signInWithEmailAndPassword(auth, user.personal_info.email, password)

            if (response.user) {
                setLoadedUser(response.user)
                setMessage("Password verified successfully.");
                setActiveStep(2); // Move to phone number input
            } else {
                toast.error("Invalid password. Please try again.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid credentials.");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: User enters phone number to enable 2FA

    const handleGenerateOtp = async () => {
        if (!phoneNumber) {
            setMessage("Please enter a phone number.");
            return;
        }

        setLoading(true);

        // try {
        //     await sendOTP()
        //     setMessage("OTP sent successfully!");
        //     setActiveStep(3); // Move to OTP verification step
        //     console.log("Step changed to 3"); // Debugging log
        // } catch (error) {
        //     console.log(error, "error sending OTP")
        // } finally {
        //     setLoading(false);
        // }
        // return;
        try {
            // Call backend to generate OTP
            // const response = await fetch(`${API_BASE_URL}/api/auth/generate-otp`, {
            const response = await fetch(`${API_BASE_URL}/api/auth/enable-2fa`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber }),
                credentials: "include",
            });

            const result = await response.json();
            // console.log("OTP Response:", result); // Log response for debugging

            if (response.ok && result.success) {
                setMessage("OTP sent successfully!");
                setActiveStep(3); // Move to OTP verification step
                // console.log("Step changed to 3"); // Debugging log
            } else {
                setMessage(result.message || "Failed to send OTP. Try again.");
            }
        } catch (error) {
            console.error("Error generating OTP:", error);
            setMessage("Failed to send OTP. Try again.");
        } finally {
            setLoading(false);
        }
    };


    // Step 3: User verifies OTP

    const handleOtpChange = (index, value) => {
        if (!/^[0-9]?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value !== "" && index < otp.length - 1) {
            document.getElementById(`tfa-otp-${index + 1}`).focus();
        }
    };



    const handleVerifyOtp = async () => {
        if (otp.some(digit => digit === "")) {
            toast.info("Please enter the complete OTP.");
            return;
        }
        setLoading(true);
        // try {
        //     await verifyOTP()
        //     setActiveStep(4);
        // } catch (error) {
        //     console.log(error, "error verifying OTP")
        // } finally {
        //     setLoading(false);
        // }
        // return
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/verify-2fa`, {  code: otp.join("") }, { withCredentials: true });
            if (response.data.success) {
                setActiveStep(4);
            } else {
                toast.error("Failed to verify OTP.");
            }
        } catch (error) {
            toast.error("Failed to verify OTP. Try again.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="w-full font-montserrat overflow-y-auto max-h-screen hide-scrollbar">
            <h2 className="text-2xl font-bold my-6 pl-6">Set up 2FA</h2>

            {/* Step 1: Enter Password */}
            {activeStep === 1 && (

                <div className="bg-[#F1F5F9] p-6 rounded-lg mb-6">
                    {/* <div className={`transition-all ${activeStep >= 1 ? "max-h-screen" : "max-h-0 overflow-hidden"}`}> */}
                    <h3 className="text-lg font-medium mb-2">Two-factor authentication</h3>
                    <hr className="border-t-1 border-[#807E7E]" />
                    <p className="text-lg mt-2 text-gray-600 mb-4">To continue, please enter your password.</p>
                    <form className="space-y-4 flex flex-col w-82">
                        <input
                            type="email"
                            value={user.personal_info.email}
                            readOnly
                            className="p-2 border border-gray-300 rounded-md bg-gray-200"
                        />
                        <input
                            type="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handlePasswordSubmit}
                                className="bg-orange-500 text-white py-2 px-6 rounded-lg hover:bg-orange-600 transition"
                            >
                                Continue
                            </button>
                        </div>
                    </form>
                </div>
                // </div>

            )}



            {/* Step 2: Enter Phone Number */}
            {activeStep === 2 && (

                <div className="bg-[#F1F5F9] p-6 rounded-lg mb-6">
                    {/* <div className={`transition-all ${activeStep >= 2 ? "max-h-screen" : "max-h-0 overflow-hidden"}`}> */}
                    <h3 className="text-lg font-medium mb-2">Two-factor authentication</h3>
                    <hr className="border-t-1 border-[#807E7E]" />
                    <p className="text-lg mt-2 text-gray-600 mb-4">
                        We’ll text a verification code to this mobile number whenever you sign in to your account.
                    </p>
                    <form className="space-y-4">
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Enter Phone number"
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleGenerateOtp}
                                className="bg-orange-500 text-white py-2 px-6 rounded-lg hover:bg-orange-600 transition"
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Send Code"}
                            </button>
                        </div>
                    </form>
                </div>
                // </div>
            )}


            {/* Step 3: Enter OTP */}
            {activeStep === 3 && (

                <div className="bg-[#F1F5F9] p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-medium mb-2">Enter Verification Code</h3>
                    <hr className="border-t-1 border-[#807E7E]" />
                    <p className="text-sm text-gray-600 mb-4 mt-2">Enter the authentication code we sent to {phoneNumber}.</p>
                    <form className="space-y-4">

                        <div className="flex space-x-2">
                            {otp.map((digit, i) => (
                                <input key={i} id={`tfa-otp-${i}`} type="text" maxLength="1" value={digit} onChange={(e) => handleOtpChange(i, e.target.value)}
                                    className="w-10 h-10 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-orange-500" />
                            ))}
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleVerifyOtp}
                                className="bg-orange-500 text-white py-2 px-6 rounded-lg hover:bg-orange-600 transition"
                                disabled={loading}
                            >
                                {loading ? "Verifying..." : "Verify"}
                            </button>
                        </div>
                    </form>
                </div>
                // </div>

            )}


            {/* Step 4: 2FA Enabled Successfully */}
            {activeStep === 4 && (

                <div className="bg-[#F1F5F9] p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-medium mb-2">Two-factor authentication</h3>
                    <hr className="border-t-1 border-[#807E7E]" />
                    <div className="text-3xl mb-2 flex flex-col items-center justify-center mt-4">
                        <MdCheckCircle className="text-green-500 text-4xl" />
                        <p className="text-sm text-gray-600 mt-1">Two-step authentication enabled</p>
                    </div>
                </div>
            )}
            <div id="recaptcha-container"></div>
        </div>
    );
};

export default TwoFactorAuthentication;



