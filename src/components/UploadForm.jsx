import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { loading as loader } from "../store/authSlice";

// Components
import DragDropFile from "./DragDropFile";

// Icons
import {
  FiCheckCircle,
  FiDollarSign,
  FiClock,
  FiCalendar,
  FiInfo,
  FiAlertCircle,
  FiUser,
  FiCreditCard,
  FiFileText,
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
} from "react-icons/fi";

const UploadForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Form state
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadData, setUploadData] = useState({
    identity_type: "passport",
    frequency: "",
    monthly: "",
    yearly: "",
    one: "",
    agreed: false,
  });

  // Form validation state
  const [errors, setErrors] = useState({});
  const [formComplete, setFormComplete] = useState(false);

  // Check if form is complete
  useEffect(() => {
    const requiredFields = {
      identity_type: true,
      frequency: true,
      monthly: uploadData.monthly !== "",
      yearly: uploadData.yearly !== "",
      one: uploadData.one !== "",
      agreed: uploadData.agreed,
      file: !!file,
    };

    const newErrors = {};
    let isValid = true;

    Object.entries(requiredFields).forEach(([field, required]) => {
      if (required && !uploadData[field] && field !== "file") {
        newErrors[field] = true;
        isValid = false;
      }

      if (field === "file" && required && !file) {
        newErrors.file = true;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setFormComplete(isValid);
  }, [uploadData, file]);

  // Handle form field changes
  const handleChange = (field, value) => {
    setUploadData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle form submission
  const becomeACreator = async () => {
    if (!formComplete) {
      // Highlight all missing fields
      const newErrors = {};
      if (!file) newErrors.file = true;
      if (!uploadData.frequency) newErrors.frequency = true;
      if (uploadData.monthly === "") newErrors.monthly = true;
      if (uploadData.yearly === "") newErrors.yearly = true;
      if (uploadData.one === "") newErrors.one = true;
      if (!uploadData.agreed) newErrors.agreed = true;

      setErrors(newErrors);

      toast.error("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();

    try {
      dispatch(loader());
      formData.append("document", file);
      formData.append("frequency", uploadData.frequency);
      formData.append("monthly", uploadData.monthly);
      formData.append("yearly", uploadData.yearly);
      formData.append("one", uploadData.one);
      formData.append("identity_type", uploadData.identity_type);

      const response = await axios.post(
        `${baseUrl}/api/auth/creator`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (response) {
        toast.success("Your application has been submitted successfully!");
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Go to next step
  const nextStep = () => {
    if (currentStep === 1 && !file) {
      setErrors({ ...errors, file: true });
      toast.error("Please upload your identity document");
      return;
    }

    setCurrentStep((prev) => prev + 1);
    window.scrollTo(0, 0);
  };

  // Go to previous step
  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  // Render progress indicator
  const renderProgress = () => {
    return (
      <div className="mb-10">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className="flex flex-col items-center relative"
              onClick={() => step < currentStep && setCurrentStep(step)}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  currentStep > step
                    ? "bg-green-500 text-white"
                    : currentStep === step
                    ? "bg-orange-500 text-white ring-4 ring-orange-100"
                    : "bg-gray-100 text-gray-400"
                } ${
                  step < currentStep ? "cursor-pointer hover:bg-green-600" : ""
                }`}
              >
                {currentStep > step ? (
                  <FiCheckCircle className="w-6 h-6" />
                ) : (
                  <span className="text-lg font-semibold">{step}</span>
                )}
              </div>
              <span
                className={`mt-2 text-sm font-medium ${
                  currentStep >= step ? "text-gray-800" : "text-gray-400"
                }`}
              >
                {step === 1 && "Identity"}
                {step === 2 && "Pricing"}
                {step === 3 && "Review"}
              </span>
            </div>
          ))}
        </div>
        <div className="max-w-md mx-auto mt-4 relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  // Render identity verification step
  const renderIdentityStep = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-4">
              <FiUser className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Identity Verification
            </h2>
          </div>

          <p className="text-gray-600 mb-8 text-lg">
            To become a creator, we need to verify your identity. Please select
            your ID type and upload a clear image of your document.
          </p>

          <div className="mb-8">
            <label className="block text-base font-semibold text-gray-700 mb-3">
              Select ID Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { value: "passport", label: "Passport", icon: "🛂" },
                { value: "national_id", label: "National ID", icon: "🪪" },
                {
                  value: "driver_license",
                  label: "Driver License",
                  icon: "🚗",
                },
              ].map((option) => (
                <div
                  key={option.value}
                  className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all hover:bg-orange-50 ${
                    uploadData.identity_type === option.value
                      ? "border-orange-500 bg-orange-50 shadow-sm"
                      : "border-gray-200 hover:border-orange-200"
                  }`}
                  onClick={() => handleChange("identity_type", option.value)}
                >
                  <div className="flex flex-col items-center text-center">
                    <span className="text-3xl mb-3">{option.icon}</span>
                    <span
                      className={`text-base ${
                        uploadData.identity_type === option.value
                          ? "font-semibold text-orange-600"
                          : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </span>
                  </div>

                  {uploadData.identity_type === option.value && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <FiCheck className="text-white w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div
            className={`mb-8 ${
              errors.file ? "ring-2 ring-red-300 rounded-xl" : ""
            }`}
          >
            <label className="block text-base font-semibold text-gray-700 mb-3">
              Upload Your Document
            </label>
            <DragDropFile
              setFile={setFile}
              existingFile={file}
              allowedTypes={[
                "image/jpeg",
                "image/png",
                "image/jpg",
                "application/pdf",
              ]}
            />

            {errors.file && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <FiAlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                Please upload your identity document
              </p>
            )}
          </div>

          <div className="flex items-start p-5 my-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500 shadow-sm">
            <div className="flex-shrink-0 text-blue-600 mr-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>

            <div>
              <h3 className="font-semibold text-blue-800 text-lg flex items-center">
                Important Information
                <span className="ml-2 bg-blue-200 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">
                  Required
                </span>
              </h3>
              <p className="mt-2 text-blue-700 leading-relaxed">
                Your document should be clearly visible, uncropped, and include
                all information. We protect your data with industry-standard
                encryption and your information is only used for verification
                purposes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={nextStep}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            Continue to Pricing
            <FiArrowRight className="w-5 h-5 ml-1" />
          </motion.button>
        </div>
      </motion.div>
    );
  };

  // Render subscription setup step
  const renderSubscriptionStep = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-4">
              <FiCreditCard className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Subscription Pricing
            </h2>
          </div>

          <p className="text-gray-600 mb-8 text-lg">
            Set up your subscription tiers to monetize your content. Create
            competitive pricing options for your fans.
          </p>

          {/* Pricing tiers */}
          <div className="space-y-8">
            {/* Monthly plan */}
            <div
              className={`rounded-xl overflow-hidden bg-white shadow-md transition-shadow ${
                errors.monthly ? "ring-2 ring-red-300" : "hover:shadow-lg"
              }`}
            >
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-5">
                <div className="flex items-center">
                  <FiCalendar className="w-6 h-6 mr-3" />
                  <div>
                    <h3 className="font-bold text-lg">Monthly Subscription</h3>
                    <p className="text-sm text-orange-100">
                      Recurring monthly billing for your subscribers
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-x border-b border-gray-200 rounded-b-xl">
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Type
                  </label>
                  <div className="flex gap-4">
                    {["Premium", "Free"].map((option) => (
                      <div
                        key={option}
                        onClick={() => {
                          if (option === "Free") {
                            handleChange("monthly", "0");
                          } else if (option === "Premium") {
                            handleChange(
                              "monthly",
                              uploadData.monthly || "9.99"
                            );
                          }
                        }}
                        className={`w-1/2 border-2 rounded-lg p-3 cursor-pointer text-center transition-all ${
                          (option === "Free" && uploadData.monthly === "0") ||
                          (option === "Premium" &&
                            uploadData.monthly !== "0" &&
                            uploadData.monthly !== "")
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-orange-200 hover:bg-orange-50"
                        }`}
                      >
                        <span
                          className={`font-medium ${
                            (option === "Free" && uploadData.monthly === "0") ||
                            (option === "Premium" &&
                              uploadData.monthly !== "0" &&
                              uploadData.monthly !== "")
                              ? "text-orange-600"
                              : "text-gray-700"
                          }`}
                        >
                          {option}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (USD)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiDollarSign className="text-gray-500" />
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="9.99"
                      className={`w-full pl-8 py-3 px-4 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        uploadData.monthly === "0"
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : "bg-white"
                      } ${
                        errors.monthly ? "border-red-300" : "border-gray-200"
                      }`}
                      value={uploadData.monthly}
                      onChange={(e) => handleChange("monthly", e.target.value)}
                      disabled={uploadData.monthly === "0"}
                    />
                  </div>

                  {errors.monthly && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <FiAlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                      Please set a price for the monthly plan
                    </p>
                  )}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <FiInfo className="w-4 h-4 mr-2 text-blue-500" />
                  {uploadData.monthly === "0" ? (
                    <span>
                      Subscribers will get free monthly access to your content
                    </span>
                  ) : uploadData.monthly ? (
                    <span>
                      Subscribers will pay ${uploadData.monthly} every month
                    </span>
                  ) : (
                    <span>Please select a package type</span>
                  )}
                </div>
              </div>
            </div>

            {/* Yearly plan */}
            <div
              className={`rounded-xl overflow-hidden bg-white shadow-md transition-shadow ${
                errors.yearly ? "ring-2 ring-red-300" : "hover:shadow-lg"
              }`}
            >
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-5">
                <div className="flex items-center">
                  <FiCalendar className="w-6 h-6 mr-3" />
                  <div>
                    <h3 className="font-bold text-lg">Annual Subscription</h3>
                    <p className="text-sm text-green-100">
                      Recurring yearly billing with better value
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-x border-b border-gray-200 rounded-b-xl">
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Type
                  </label>
                  <div className="flex gap-4">
                    {["Premium", "Free"].map((option) => (
                      <div
                        key={option}
                        onClick={() => {
                          if (option === "Free") {
                            handleChange("yearly", "0");
                          } else if (option === "Premium") {
                            handleChange(
                              "yearly",
                              uploadData.yearly || "99.99"
                            );
                          }
                        }}
                        className={`w-1/2 border-2 rounded-lg p-3 cursor-pointer text-center transition-all ${
                          (option === "Free" && uploadData.yearly === "0") ||
                          (option === "Premium" &&
                            uploadData.yearly !== "0" &&
                            uploadData.yearly !== "")
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-green-200 hover:bg-green-50"
                        }`}
                      >
                        <span
                          className={`font-medium ${
                            (option === "Free" && uploadData.yearly === "0") ||
                            (option === "Premium" &&
                              uploadData.yearly !== "0" &&
                              uploadData.yearly !== "")
                              ? "text-green-600"
                              : "text-gray-700"
                          }`}
                        >
                          {option}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (USD)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiDollarSign className="text-gray-500" />
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="99.99"
                      className={`w-full pl-8 py-3 px-4 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        uploadData.yearly === "0"
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : "bg-white"
                      } ${
                        errors.yearly ? "border-red-300" : "border-gray-200"
                      }`}
                      value={uploadData.yearly}
                      onChange={(e) => handleChange("yearly", e.target.value)}
                      disabled={uploadData.yearly === "0"}
                    />
                  </div>

                  {errors.yearly && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <FiAlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                      Please set a price for the yearly plan
                    </p>
                  )}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <FiInfo className="w-4 h-4 mr-2 text-blue-500" />
                  {uploadData.yearly === "0" ? (
                    <span>
                      Subscribers will get free yearly access to your content
                    </span>
                  ) : uploadData.yearly ? (
                    <span>
                      Subscribers will pay ${uploadData.yearly} per year
                      (savings compared to monthly)
                    </span>
                  ) : (
                    <span>Please select a package type</span>
                  )}
                </div>
              </div>
            </div>

            {/* One-time plan */}
            <div
              className={`rounded-xl overflow-hidden bg-white shadow-md transition-shadow ${
                errors.one ? "ring-2 ring-red-300" : "hover:shadow-lg"
              }`}
            >
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-5">
                <div className="flex items-center">
                  <FiClock className="w-6 h-6 mr-3" />
                  <div>
                    <h3 className="font-bold text-lg">Lifetime Access</h3>
                    <p className="text-sm text-purple-100">
                      One-time payment for permanent access
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-x border-b border-gray-200 rounded-b-xl">
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Type
                  </label>
                  <div className="flex gap-4">
                    {["Premium", "Free"].map((option) => (
                      <div
                        key={option}
                        onClick={() => {
                          if (option === "Free") {
                            handleChange("one", "0");
                          } else if (option === "Premium") {
                            handleChange("one", uploadData.one || "199.99");
                          }
                        }}
                        className={`w-1/2 border-2 rounded-lg p-3 cursor-pointer text-center transition-all ${
                          (option === "Free" && uploadData.one === "0") ||
                          (option === "Premium" &&
                            uploadData.one !== "0" &&
                            uploadData.one !== "")
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-purple-200 hover:bg-purple-50"
                        }`}
                      >
                        <span
                          className={`font-medium ${
                            (option === "Free" && uploadData.one === "0") ||
                            (option === "Premium" &&
                              uploadData.one !== "0" &&
                              uploadData.one !== "")
                              ? "text-purple-600"
                              : "text-gray-700"
                          }`}
                        >
                          {option}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (USD)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiDollarSign className="text-gray-500" />
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="199.99"
                      className={`w-full pl-8 py-3 px-4 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        uploadData.one === "0"
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : "bg-white"
                      } ${errors.one ? "border-red-300" : "border-gray-200"}`}
                      value={uploadData.one}
                      onChange={(e) => handleChange("one", e.target.value)}
                      disabled={uploadData.one === "0"}
                    />
                  </div>

                  {errors.one && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <FiAlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                      Please set a price for the one-time plan
                    </p>
                  )}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <FiInfo className="w-4 h-4 mr-2 text-blue-500" />
                  {uploadData.one === "0" ? (
                    <span>
                      Subscribers will get free lifetime access to your content
                    </span>
                  ) : uploadData.one ? (
                    <span>
                      Subscribers pay ${uploadData.one} once for permanent
                      access
                    </span>
                  ) : (
                    <span>Please select a package type</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preferred plan */}
          <div
            className={`mt-8 p-6 border border-gray-200 rounded-xl ${
              errors.frequency ? "ring-2 ring-red-300" : ""
            }`}
          >
            <h3 className="font-semibold text-lg text-gray-800 mb-3">
              Default Subscription Plan
            </h3>
            <p className="text-gray-600 mb-5">
              Which plan would you like to show as the recommended option to
              your subscribers?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { value: "monthly", label: "Monthly Plan", color: "orange" },
                { value: "yearly", label: "Yearly Plan", color: "green" },
                { value: "one", label: "Lifetime Access", color: "purple" },
              ].map((option) => {
                const colorClasses = {
                  orange: {
                    active: "bg-orange-500 border-orange-500",
                    bg: "bg-orange-50",
                    text: "text-orange-600",
                    hover: "hover:border-orange-300 hover:bg-orange-50",
                  },
                  green: {
                    active: "bg-green-500 border-green-500",
                    bg: "bg-green-50",
                    text: "text-green-600",
                    hover: "hover:border-green-300 hover:bg-green-50",
                  },
                  purple: {
                    active: "bg-purple-500 border-purple-500",
                    bg: "bg-purple-50",
                    text: "text-purple-600",
                    hover: "hover:border-purple-300 hover:bg-purple-50",
                  },
                };

                return (
                  <div
                    key={option.value}
                    className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      uploadData.frequency === option.value
                        ? `${colorClasses[option.color].bg} border-${
                            option.color
                          }-500`
                        : `border-gray-200 ${colorClasses[option.color].hover}`
                    }`}
                    onClick={() => handleChange("frequency", option.value)}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 mr-3 rounded-full border-2 flex items-center justify-center ${
                          uploadData.frequency === option.value
                            ? colorClasses[option.color].active
                            : "border-gray-400"
                        }`}
                      >
                        {uploadData.frequency === option.value && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span
                        className={`text-base font-medium ${
                          uploadData.frequency === option.value
                            ? colorClasses[option.color].text
                            : "text-gray-700"
                        }`}
                      >
                        {option.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {errors.frequency && (
              <p className="mt-3 text-sm text-red-600 flex items-center">
                <FiAlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                Please select a default subscription plan
              </p>
            )}
          </div>

          <div className="bg-yellow-50 rounded-xl p-5 mt-8 text-sm text-yellow-800 flex items-start">
            <FiInfo className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-yellow-500" />
            <div>
              <p className="font-medium mb-1">Pricing Tips</p>
              <p>
                Setting competitive pricing can help you attract more
                subscribers. Consider offering a yearly discount of 15-20%
                compared to monthly payments to incentivize longer commitments.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={prevStep}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <FiArrowLeft className="w-5 h-5 mr-1" />
            Back to Identity
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={nextStep}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            Continue to Review
            <FiArrowRight className="w-5 h-5 ml-1" />
          </motion.button>
        </div>
      </motion.div>
    );
  };

  // Render review step
  const renderReviewStep = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-4">
              <FiFileText className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Review Your Application
            </h2>
          </div>

          <p className="text-gray-600 mb-8 text-lg">
            Please review all your information below before submitting your
            creator application.
          </p>

          <div className="space-y-6">
            {/* Identity section */}
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center mb-4">
                <FiUser className="w-5 h-5 text-orange-500 mr-2" />
                <h3 className="font-semibold text-lg text-gray-800">
                  Identity Details
                </h3>
              </div>

              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="font-medium">Document Type:</span>
                  <span className="capitalize text-gray-800">
                    {uploadData.identity_type.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Document File:</span>
                  <span
                    className={`${file ? "text-gray-800" : "text-red-500"}`}
                  >
                    {file ? file.name : "No file uploaded"}
                  </span>
                </div>
              </div>
            </div>

            {/* Subscription pricing section */}
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center mb-4">
                <FiDollarSign className="w-5 h-5 text-orange-500 mr-2" />
                <h3 className="font-semibold text-lg text-gray-800">
                  Subscription Plans
                </h3>
              </div>

              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="font-medium">Monthly Price:</span>
                  <span
                    className={`${
                      uploadData.monthly ? "text-gray-800" : "text-red-500"
                    }`}
                  >
                    {uploadData.monthly === "0"
                      ? "Free"
                      : uploadData.monthly
                      ? `$${uploadData.monthly}`
                      : "Not set"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="font-medium">Yearly Price:</span>
                  <span
                    className={`${
                      uploadData.yearly ? "text-gray-800" : "text-red-500"
                    }`}
                  >
                    {uploadData.yearly === "0"
                      ? "Free"
                      : uploadData.yearly
                      ? `$${uploadData.yearly}`
                      : "Not set"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="font-medium">Lifetime Price:</span>
                  <span
                    className={`${
                      uploadData.one ? "text-gray-800" : "text-red-500"
                    }`}
                  >
                    {uploadData.one === "0"
                      ? "Free"
                      : uploadData.one
                      ? `$${uploadData.one}`
                      : "Not set"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Default Plan:</span>
                  <span
                    className={`capitalize ${
                      uploadData.frequency ? "text-gray-800" : "text-red-500"
                    }`}
                  >
                    {uploadData.frequency === "one"
                      ? "Lifetime Access"
                      : uploadData.frequency === "yearly"
                      ? "Annual Subscription"
                      : uploadData.frequency === "monthly"
                      ? "Monthly Subscription"
                      : "Not selected"}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms agreement */}
            <div
              className={`flex items-start space-x-3 p-5 rounded-xl transition-colors ${
                errors.agreed
                  ? "bg-red-50 border-2 border-red-300"
                  : uploadData.agreed
                  ? "bg-green-50 border border-green-100"
                  : "bg-gray-50 border border-gray-100"
              }`}
            >
              <div className="mt-1">
                <input
                  type="checkbox"
                  id="terms-checkbox"
                  className={`h-5 w-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 ${
                    errors.agreed ? "border-red-500" : ""
                  }`}
                  checked={uploadData.agreed}
                  onChange={(e) => handleChange("agreed", e.target.checked)}
                />
              </div>
              <div>
                <label
                  htmlFor="terms-checkbox"
                  className={`text-base ${
                    errors.agreed
                      ? "text-red-700"
                      : uploadData.agreed
                      ? "text-green-700"
                      : "text-gray-700"
                  }`}
                >
                  I confirm that all information provided is accurate and
                  complete
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  By checking this box, I agree to the
                  <Link
                    to="/terms-and-conditions"
                    className="text-orange-500 font-medium hover:underline mx-1"
                  >
                    Terms and Conditions
                  </Link>
                  and understand that my application will be reviewed according
                  to the platform's guidelines.
                </p>
              </div>
            </div>

            {errors.agreed && (
              <p className="text-sm text-red-600 flex items-center">
                <FiAlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                You must agree to the terms and conditions to continue
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={prevStep}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <FiArrowLeft className="w-5 h-5 mr-1" />
            Back to Pricing
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={becomeACreator}
            disabled={isSubmitting || !formComplete}
            className={`px-8 py-3 font-medium rounded-xl shadow-sm transition-all flex items-center gap-2 ${
              isSubmitting || !formComplete
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting Application...
              </>
            ) : (
              <>
                Submit Application
                <FiCheck className="w-5 h-5 ml-1" />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Become a Creator
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Join our creator community and start monetizing your content with
          subscription plans tailored to your audience.
        </p>
      </div>

      {renderProgress()}

      <AnimatePresence mode="wait">
        {currentStep === 1 && renderIdentityStep()}
        {currentStep === 2 && renderSubscriptionStep()}
        {currentStep === 3 && renderReviewStep()}
      </AnimatePresence>
    </div>
  );
};

export default UploadForm;
