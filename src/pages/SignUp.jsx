// SignUp.jsx
import axios from "axios";
import Logo from "../imgs/logo.png";
import GoogleIcon from "../imgs/google-icon.png";
import XIcon from "../imgs/x-icon.png";
import AnimationWrapper from "../common/page-animation";
import { Link, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, provider, twitterProvider } from "../common/firebase";
import React, { useState } from "react";

// Enhanced InputBox component with improved styling
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

const SignUp = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    ref_email: "",
    password: "",
    agreeToTerms: false
  });
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const authWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const response = await axios.post(`${baseUrl}/api/auth/google-auth`, { idToken }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (response.data.success) {
        navigate("/feed");
        toast.success("Google login successful");
      } else {
        toast.error(response.data.message || "An error occurred during Google login");
      }
    } catch (error) {
      console.error("Error during Google authentication", error);
      toast.error("An error occurred during Google login");
    } finally {
      setLoading(false);
    }
  };

  const authWithTwitter = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, twitterProvider);
      const idToken = await result.user.getIdToken();
      const accessToken = result._tokenResponse.oauthAccessToken;
      const response = await axios.post(`${baseUrl}/api/auth/twitter-auth`, { idToken, accessToken }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (response.data.success) {
        navigate("/feed");
        toast.success("Twitter login successful");
      } else {
        toast.error(response.data.message || "An error occurred during Twitter login");
      }
    } catch (error) {
      console.error('Error during Twitter authentication:', error);
      toast.error("An error occurred during Twitter login");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      toast.error("Please agree to the Terms and Conditions");
      return;
    }
    
    setLoading(true);
    const serverRoute = `${baseUrl}/api/auth/signup`;

    try {
      const response = await axios.post(serverRoute, {
        fullname: formData.fullname,
        username: formData.username,
        email: formData.email,
        ref_email: formData.ref_email,
        password: formData.password,
      }, {
        headers: { "Content-Type": "application/json" },
      });
      
      toast.success("Signup successful! Redirecting...");

      if (response) {
        const fireUser = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        if (!fireUser) throw new Error(`${fireUser}, firebase data failed`);
      }

      // Navigate to OTP page with email
      navigate("/otp-confirmation", { state: { email: formData.email } });
    } catch (error) {
      const errorMessage = error.response?.data?.error || "An error occurred during signup.";
      toast.error(errorMessage);
      console.error("Signup Error:", error);
    } finally {
      setLoading(false);
    }
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
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Create Account</h2>
            
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
                <span className="px-6 py-1 bg-white text-sm text-gray-500 font-medium">or sign up with email</span>
              </div>
            </div>
            
            {/* Sign Up Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <InputBox
                  name="fullname"
                  type="text"
                  placeholder="Full Name"
                  icon="fi-rr-user"
                  value={formData.fullname}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <InputBox
                  name="username"
                  type="text"
                  placeholder="Username"
                  icon="fi-rr-user"
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <InputBox
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  icon="fi-br-envelope"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <InputBox
                  name="ref_email"
                  type="email"
                  placeholder="Referral Email (Optional)"
                  icon="fi-rr-user"
                  value={formData.ref_email}
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
              
              <div className="flex items-start mt-2">
                <div className="flex items-center h-5">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
                    By creating an account, you agree to our{" "}
                    <Link to="/terms-and-conditions" className="text-orange-600 hover:text-orange-500">
                      Terms and Conditions
                    </Link>
                  </label>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full py-3 px-6 mt-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex justify-center items-center text-base"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <span>Sign Up</span>
                )}
              </button>
            </form>
            
            <p className="mt-6 text-center text-base text-gray-600">
              Already have an account?{' '}
              <Link to="/signin" className="font-medium text-orange-600 hover:text-orange-500 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
        
        {/* Right side - Branding */}
        <div className="hidden lg:flex bg-gradient-to-br from-orange-400 to-orange-600 text-white justify-center items-center">
          <div className="max-w-xl px-12 flex flex-col justify-center items-center py-8">
            <img src={Logo} alt="Monetiza+" className="w-48 mb-10" />
            
            <h1 className="text-4xl font-bold mb-6 text-center tracking-tight">
              Welcome to<br/>
              <span className="text-white">Monetiza+</span>
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

export default SignUp;