// Signin.jsx
import axios from "axios";
import Logo from "../imgs/logo.png";
import GoogleIcon from "../imgs/google-icon.png";
import XIcon from "../imgs/x-icon.png";
import { Toaster, toast } from "react-hot-toast";
import AnimationWrapper from "../common/page-animation";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signin } from "../store/authSlice";
import { signInWithPopup } from "firebase/auth";
import { auth, provider, twitterProvider } from "../common/firebase";
import React, { useState } from "react";

// InputBox component with improved styling
const InputBox = ({ name, type, placeholder, icon, value, onChange }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
        <i className={`${icon} text-gray-400`}></i>
      </div>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full py-3 pl-12 pr-4 text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
        placeholder={placeholder}
        required
      />
    </div>
  );
};

// SocialButton component with enhanced styling
const SocialButton = ({ icon, text, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex justify-center items-center gap-x-3 py-3 px-6 w-full rounded-full border border-gray-200 hover:bg-gray-50 transition-all duration-200 shadow-sm text-gray-700 font-medium"
    >
      <img loading="lazy" src={icon} alt={`${text} icon`} width={22} height={22} />
      <span className="text-base">{text}</span>
    </button>
  );
};

const Signin = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(1);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const { loading, error } = useSelector((state) => state.auth);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const authWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const response = await axios.post(`${baseUrl}/api/auth/google-auth`, { idToken }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success("Welcome back!");
        navigate("/feed");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error during Google authentication", error);
      toast.error("This email is already registered with email and password");
    }
  };

  const authWithTwitter = async () => {
    try {
      const result = await signInWithPopup(auth, twitterProvider);
      const idToken = await result.user.getIdToken();
      const accessToken = result._tokenResponse.oauthAccessToken;
      
      const response = await axios.post(`${baseUrl}/api/auth/twitter-auth`, 
        { idToken, accessToken },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Welcome back!");
        navigate("/feed");
      } else {
        toast.error(response.data.message || "An error occurred during login");
      }
    } catch (error) {
      console.error('Error during Twitter authentication:', error);
      toast.error("An error occurred during login");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    dispatch(signin(formData))
      .unwrap()
      .then(() => {
        toast.success("Welcome back!");
        navigate("/feed");
      })
      .catch((err) => {
        const parsedErr = err?.includes("{") ? JSON.parse(err) : { message: err };
        toast.error(parsedErr?.messaged || parsedErr.message || "Sign-in failed");
        
        if (parsedErr?.messaged) {
          setActiveStep(2);
        }
      });
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    dispatch(signin({
      ...JSON.parse(error?.includes("{") && error || "{}"), 
      code: otp.join("")
    }))
      .unwrap()
      .then(() => {
        toast.success("Welcome back!");
        navigate("/feed");
      })
      .catch((err) => {
        toast.error(err || "Verification failed");
      });
  };

  return (
    <AnimationWrapper>
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        <Toaster 
          position="top-center" 
          toastOptions={{ 
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
              padding: '16px',
              borderRadius: '10px',
            }
          }} 
        />
        
        {/* Left side - Form */}
        <div className="py-8 px-6 md:px-10 lg:px-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full py-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Welcome Back</h2>
            
            {activeStep === 1 && (
              <>
                {/* Social Login */}
                <div className="mb-6 space-y-3">
                  <SocialButton 
                    icon={GoogleIcon} 
                    text="Continue with Google" 
                    onClick={authWithGoogle}
                  />
                  <SocialButton 
                    icon={XIcon} 
                    text="Continue with X" 
                    onClick={authWithTwitter}
                  />
                </div>
                
                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-6 py-1 bg-white text-sm text-gray-500 font-medium">or continue with email</span>
                  </div>
                </div>
                
                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <InputBox
                      name="email"
                      type="email"
                      placeholder="Email address"
                      icon="fi-br-envelope"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <InputBox
                      name="password"
                      type="password"
                      placeholder="Password"
                      icon="fi-rs-key"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Link to="/forgot-password" className="text-sm font-medium text-orange-600 hover:text-orange-500 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  
                  {error && !error.includes("{") && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl mt-2">
                      {error}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    className="w-full py-3 px-6 mt-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex justify-center items-center text-base"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Signing In...</span>
                      </div>
                    ) : (
                      <span>Sign In</span>
                    )}
                  </button>
                </form>
                
                <p className="mt-8 text-center text-base text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/signup" className="font-medium text-orange-600 hover:text-orange-500 transition-colors">
                    Sign Up
                  </Link>
                </p>
              </>
            )}
            
            {/* OTP Verification Screen */}
            {activeStep === 2 && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Verification Required</h3>
                <div className="w-full h-px bg-gray-200 mb-6"></div>
                
                <p className="text-base text-gray-600 mb-6">
                  Enter the verification code we sent to {error?.includes("{") && JSON.parse(error)?.phoneNumber}.
                </p>
                
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="flex justify-center space-x-3">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`tfa-otp-${i}`}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => {
                          if (!/^[0-9]?$/.test(e.target.value)) return;
                          
                          const newOtp = [...otp];
                          newOtp[i] = e.target.value;
                          setOtp(newOtp);
                          
                          if (e.target.value !== "" && i < otp.length - 1) {
                            document.getElementById(`tfa-otp-${i + 1}`).focus();
                          }
                        }}
                        className="w-12 h-12 text-center text-xl border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                      />
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Back to sign in
                    </button>
                    
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                      disabled={loading}
                    >
                      {loading ? "Verifying..." : "Verify"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
        
        {/* Right side - Branding */}
        <div className="hidden lg:flex bg-gradient-to-br from-orange-400 to-orange-600 text-white justify-center items-center">
          <div className="max-w-xl px-12 flex flex-col justify-center items-center py-8">
            <img src={Logo} alt="Monetiza+" className="w-48 mb-10" />
            
            <h1 className="text-4xl font-bold mb-6 text-center tracking-tight">
              Welcome back, Creator
            </h1>
            
            <p className="text-xl text-center mb-10">
              A place where your <span className="font-semibold">creativity</span> turns into <span className="font-semibold">money</span>
            </p>
            
            {/* Content Preview Card */}
            <div className="w-full max-w-md bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-xl mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full"></div>
                <div>
                  <div className="h-4 w-32 bg-white/20 rounded-full"></div>
                  <div className="h-3 w-24 bg-white/20 rounded-full mt-2"></div>
                </div>
              </div>
              <div className="h-40 w-full bg-white/20 rounded-xl mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                  <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>
                  <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>
                    </svg>
                  </div>
                </div>
                <div className="h-8 w-20 bg-white/20 rounded-full"></div>
              </div>
            </div>
            
            <p className="text-center text-white/70 text-sm">
              Join thousands of creators already earning on Monetiza+
            </p>
          </div>
        </div>
      </div>
    </AnimationWrapper>
  );
};

export default Signin;