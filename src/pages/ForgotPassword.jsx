import React, { useState } from 'react';
import AnimationWrapper from '../common/page-animation';
import toast, { Toaster } from 'react-hot-toast';
import InputBox from '../components/input.component';
import Logo from "../imgs/logo.png";
import { FaArrowLeft } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import ClipLoader from "react-spinners/ClipLoader";  // Import Spinner
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();



        setLoading(true);

        try {
            const response = await axios.post(`${baseUrl}/api/auth/forgotten-password`, { email }, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.data.success) {
                toast.success("Reset link sent! Check your email.");
                setEmail('');
            } else {
                toast.error(response.data.message || "Something went wrong.");
            }
        } catch (error) {
            console.error("Forgot Password Error:", error);
            toast.error(error.response?.data?.message || "Failed to send reset link.");
        } finally {
            setLoading(false);
        }
    };



    return (
        <>
            <AnimationWrapper>
                <div className="flex flex-col lg:flex-row w-full max-w-full overflow-hidden">
                    <Toaster />
                    {/* Form Section */}


                    <div className="signup-form w-full lg:w-[55%] px-6 lg:px-12">
                        <button onClick={() => navigate(-1)}>
                            <FaArrowLeft className='text-3xl font-small' />
                        </button>

                        <div className="mt-4">
                            <form id="formElement" className="space-y-4 " onSubmit={handleSubmit}>
                                <div>
                                    <h1 className='text-2xl text-[#E35F01] font-bold'>Forgot Password</h1>
                                    <p className='text-xs mb-2'>No worries, we’ll send you reset instructions</p>
                                </div>
                                <div>
                                    <InputBox
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="Enter Email Address"
                                        icon="fi-br-envelope"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}

                                    />
                                </div>
                                <div className="flex">
                                    <p className='bg-[#E35F0133] px-6 py-2 rounded-md' >We’ll send a ‘reset password’ link to the email associated with this account.</p>
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="mt-5 text-xl btn-bg-active text-white py-3 px-12 w-full rounded-full shadow-lg font-futura"
                                    >
                                        {loading ? (
                                            <ClipLoader color="#ffffff" size={20} /> // Adjust size and color as needed
                                        ) : (
                                            "Send me a link"
                                        )}
                                    </button>

                                </div>
                            </form>


                        </div>
                    </div>

                    <div className="text-center signup-cta flex flex-col justify-center items-center w-full lg:w-1/2 mt-1 lg:mt-0 hidden lg:flex">
                        <img loading="lazy" src={Logo} alt="logo" className="w-48 sm:w-64 lg:w-64" />
                        <h1 className="font-futura mt-4 text-balance text-5xl sm:text-7xl font-semibold tracking-tight text-black">
                            Welcome to
                            <br />
                            <span className="text-colored">Monetiza+</span>
                        </h1>
                        <p className="mt-8 text-pretty text-base sm:text-2xl font-medium text-black">
                            A place where your{" "}
                            <span className="text-colored">creativity</span> turns into
                            <br />
                            <span className="text-colored">money</span>.
                        </p>
                    </div>
                </div>
            </AnimationWrapper>
        </>
    );
};

export default ForgotPassword;