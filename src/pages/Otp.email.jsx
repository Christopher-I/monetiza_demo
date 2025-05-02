import Logo from "../imgs/logo.png";
import { useState, useEffect } from 'react';
import AnimationWrapper from "../common/page-animation";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const OtpConfirmation = () => {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const [activeIndex, setActiveIndex] = useState(0);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const serverRoute = `${baseUrl}/api/auth/verify-email`;

    useEffect(() => {
        if (!email) {
            // Redirect to signup if email is not present
            navigate("/signup");
        }
    }, [email, navigate]);

    // Mask the email
    const maskedEmail = email?.replace(/(.).+(.+@.+)/, "$1*********$2");

    const handleInputChange = (e, index) => {
        const value = e.target.value;
        if (value.length === 1 && index < 5) {
            // Move focus to the next input
            document.getElementById(`otp-${index + 1}`).focus();
        } else if (value.length === 0 && index > 0) {
            // Move focus to the previous input on backspace
            document.getElementById(`otp-${index - 1}`).focus();
        }
        const updatedOtp = [...otp];
        updatedOtp[index] = value;
        setOtp(updatedOtp);
    };

    const handleFocus = (index) => {
        setActiveIndex(index);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const otpCode = otp.join('');

        try {
            const response = await axios.post(serverRoute, { code: otpCode });
            if (response.data.success) {
                navigate("/signin");
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            console.log(error)
            setError('Error verifying OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (cooldown > 0) {
            setError(`Please wait ${cooldown} seconds before requesting a new OTP.`);
            return;
        }

        try {
            setLoading(true);
            setError('');
            const response = await axios.post(`${baseUrl}/api/auth/change-verification-token`, { email });
            if (response.data.success) {
                setCooldown(30); 
                setError('A new OTP has been sent to your email.');
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            console.log(error);
            setError('Error resending OTP');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    return (
        <AnimationWrapper>
            <div className="flex w-full flex-col lg:flex-row">
                {/* Left Form Section */}
                <div className="text-center otp-cta flex flex-col justify-center items-center w-full lg:w-1/2 lg:mt-0 hidden lg:flex">
                    <img loading="lazy" src={Logo} alt="logo" className="w-48 sm:w-64 lg:w-64" />
                    <h1 className="font-montserrat mt-4 text-balance text-5xl sm:text-7xl font-semibold tracking-tight text-black">
                        Monetiza+
                    </h1>
                    <p className="mt-8 text-pretty text-base sm:text-2xl font-medium text-black">
                        a place where your <span className="text-colored">creativity </span> turns into <span className="text-colored">money</span>.
                    </p>
                </div>
                <div className="otp-form w-full lg:w-[55%] px-6 lg:px-12">
                    <div className="mt-10">
                        <div className="text-center">
                            <h1 className="font-montserrat text-4xl font-bold my-6">OTP Confirmation</h1>
                            <p className="font-montserrat mt-4 text-lg text-black">
                                Enter the 6-digit code sent to {maskedEmail}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 mt-10">
                            <div className="flex gap-x-2 justify-center">
                                {[0, 1, 2, 3, 4, 5].map((index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        name={`otp-${index}`}
                                        type="text"
                                        maxLength={1}
                                        className={`text-center text-xl w-12 h-12 border-2 ${activeIndex === index ? "text-colored border-colored" : "border-gray-300"
                                            } rounded-md focus:outline-none`}
                                        value={otp[index]}
                                        onKeyDown={(e) => {
                                            if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
                                                e.preventDefault();
                                            }
                                        }}
                                        onChange={(e) => handleInputChange(e, index)}
                                        onFocus={() => handleFocus(index)}
                                    />
                                ))}
                            </div>

                            {error && <p className="text-red-500 text-center mt-4">{error}</p>}

                            <div>
                                <button
                                    type="submit"
                                    className={`font-montserrant mt-5 text-xl btn-bg-active text-white py-3 px-12 w-full rounded-full shadow-lg futura-bd ${loading ? "opacity-50" : ""}`}
                                    disabled={loading}>
                                    {loading ? 'Verifying...' : 'Next'}
                                </button>
                            </div>
                        </form>

                        <div className="text-center mt-6">
                            <p className="font-montserrant text-md text-black">
                                Didn't receive OTP?{" "}
                                <button
                                    onClick={handleResendOtp}
                                    disabled={cooldown > 0 || loading}
                                    className="font-montserrant font-bold text-colored hover:underline">
                                    {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AnimationWrapper>
    );
};

export default OtpConfirmation;
