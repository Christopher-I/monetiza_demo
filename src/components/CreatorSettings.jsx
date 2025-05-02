import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from "react-redux";
import { loading as loader } from "../store/authSlice";
import { Link, useNavigate } from 'react-router-dom';

const CreatorSettings = () => {
    const dispatch = useDispatch();
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const { user } = useSelector((state) => state.auth); 
    const navigate = useNavigate();
    const [uploadData, setUploadData] = useState({
        // identity_type: 'passport',
        frequency: user.plans.frequency,
        // amount: '',
        monthly: user.plans.monthly,
        yearly: user.plans.yearly,
        one: user.plans.one,
        agreed: false,
        isPaidChat: user.chatSettings.isPaidChat || false, 
        pricePerText: user.chatSettings.pricePerText || 0, 
    });

    const updateChatSettings = async () => {
        if (!uploadData.agreed) {
            toast.error("You must agree to the terms and conditions.");
            return;
        }

        try {
            const response = await axios.post(
                `${baseUrl}/api/message/chat-settings`,
                {
                    userId: user._id,
                    isPaidChat: uploadData.isPaidChat,
                    pricePerText: uploadData.pricePerText,
                },
                { withCredentials: true }
            );

            const sResponse = await axios.post(
                `${baseUrl}/api/auth/creator/update`,
                uploadData,
                { withCredentials: true }
            );
            // console.log(response.data)

            if (response.data.success) {
                toast.success('Chat settings updated successfully!');
            } else {
                toast.error(response.data.message || 'Failed to update chat settings.');
            }

            if (sResponse.data.success) {
                toast.success('Subscription plan updated successfully!');
            } else {
                toast.error(response.data.message || 'Failed to update subscription plan.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
        }
    };

    const becomeACreator = async () => {
        if (!uploadData.agreed) {
            toast.error("You must agree to the terms and conditions.");
            return;
        }
        if (!uploadData.frequency || !uploadData.amount || !uploadData.identity_type) {
            toast.error("Please fill all required fields.");
            return;
        }

        const formData = new FormData();
        // formData.append("document", file);
        formData.append("frequency", uploadData.frequency);
        formData.append("target", 0);
        formData.append("amount", uploadData.amount);
        formData.append("identity_type", uploadData.identity_type);

        try {
            dispatch(loader()); // Show loading spinner
            const response = await axios.post(`${baseUrl}/api/auth/creator`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });

            if (response.data.success) {
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message || 'Failed to become a creator.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            dispatch(loader(false)); // Hide loading spinner
        }
    };
    
    useEffect(() => {
        if (!user.creatorSettings.isCreator) {
          navigate("/")
        }
    }, []);

    return (
        <div className="max-w-2xl p-8 mx-auto">
            {/*  */}
            <div className="mb-8">
                <h2 className="font-semibold text-xl mb-4">Subscription Set-up</h2>
                <div className="grid grid-cols-1 gap-6">
                <h4 className="font-semibold text-lg">Monthly</h4>
                <select
                    className="border rounded-lg p-3 w-full"
                    defaultValue={user.plans.monthly < 1 ? "Free" : "Premium"}
                    onChange={(e) => setUploadData({ ...uploadData, monthly: e.target.value === "Free" ? 0 : uploadData.monthly })}
                >
                    {/* <option value={""}>Package</option> */}
                    <option value="Free">Free</option>
                    <option value="Premium">Premium</option>
                </select>
                {/* <select
                    className="border rounded-lg p-3 w-full"
                    defaultValue={""}
                    value={uploadData.frequency}
                    onChange={(e) => setUploadData({ ...uploadData, frequency: e.target.value })}
                >
                    <option value={""}>Frequency</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                </select> */}
                <input
                    type="number"
                    placeholder="Amount"
                    className="border rounded-lg p-3 w-full"
                    value={uploadData.monthly}
                    onChange={(e) => setUploadData({ ...uploadData, monthly: e.target.value })}
                />
                </div>

                <div className="grid grid-cols-1 gap-6 mt-4">
                <h4 className="font-semibold text-lg">Yearly</h4>
                <select
                    className="border rounded-lg p-3 w-full"
                    defaultValue={user.plans.yearly < 1 ? "Free" : "Premium"}
                    onChange={(e) => setUploadData({ ...uploadData, yearly: e.target.value === "Free" ? 0 : uploadData.yearly })}
                >
                    {/* <option value={""}>Package</option> */}
                    <option>Free</option>
                    <option>Premium</option>
                </select>
                {/* <select
                    className="border rounded-lg p-3 w-full"
                    defaultValue={""}
                    value={uploadData.frequency}
                    onChange={(e) => setUploadData({ ...uploadData, frequency: e.target.value })}
                >
                    <option value={""}>Frequency</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                </select> */}
                <input
                    type="number"
                    placeholder="Amount"
                    className="border rounded-lg p-3 w-full"
                    value={uploadData.yearly}
                    onChange={(e) => setUploadData({ ...uploadData, yearly: e.target.value })}
                />
                </div>

                <div className="grid grid-cols-1 gap-6 mt-4">
                <h4 className="font-semibold text-lg">One-Time payment</h4>
                <select
                    className="border rounded-lg p-3 w-full"
                    defaultValue={user.plans.yearly < 1 ? "Free" : "Premium"}
                    onChange={(e) => setUploadData({ ...uploadData, one: e.target.value === "Free" ? 0 : uploadData.one })}
                >
                    {/* <option value={""}>Package</option> */}
                    <option>Premium</option>
                    <option>Free</option>
                </select>
                {/* <select
                    className="border rounded-lg p-3 w-full"
                    defaultValue={""}
                    value={uploadData.frequency}
                    onChange={(e) => setUploadData({ ...uploadData, frequency: e.target.value })}
                >
                    <option value={""}>Frequency</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                </select> */}
                <input
                    type="number"
                    placeholder="Amount"
                    className="border rounded-lg p-3 w-full"
                    value={uploadData.one}
                    onChange={(e) => setUploadData({ ...uploadData, one: e.target.value })}
                />
                </div>

                <div className="grid grid-cols-1 gap-6 mt-4">
                <h4 className="font-semibold text-lg">Preferred plan</h4>
                <select
                    className="border rounded-lg p-3 w-full"
                    defaultValue={user.plans.frequency}
                    value={uploadData.frequency}
                    onChange={(e) => setUploadData({ ...uploadData, frequency: e.target.value })}
                >
                    {/* <option value={""}>Frequency</option> */}
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="one">One-Time payment</option>
                </select>
                </div>
            </div>

            {/* Chat Set-up Section */}
            <div className="mb-8">
                <h2 className="font-semibold text-xl mb-4">Chat Set-up</h2>
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <p className="text-gray-600 text-lg mb-2">Chat Plan</p>
                        <select
                            className="border rounded-lg p-3 w-full"
                            value={uploadData.isPaidChat ? 'paid' : 'free'}
                            onChange={(e) => setUploadData({ ...uploadData, isPaidChat: e.target.value === 'paid' })}
                        >
                            <option value="free">Free</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>
                    {uploadData.isPaidChat && (
                        <div>
                            <p className="text-gray-600 text-lg mb-2">Price Per Message</p>
                            <input
                                type="number"
                                placeholder="Enter Price"
                                className="border rounded-lg p-3 w-full"
                                value={uploadData.pricePerText}
                                onChange={(e) => setUploadData({ ...uploadData, pricePerText: e.target.value })}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center space-x-3 mb-8">
                <input
                    type="checkbox"
                    checked={uploadData.agreed}
                    onChange={(e) => setUploadData({ ...uploadData, agreed: e.target.checked })}
                />
                <label>
                    Tick here to confirm that you agree to the{' '}
                    <Link to="/terms-and-conditions" className="text-orange-500 font-semibold hover:underline">
                        Terms and Conditions
                    </Link>
                </label>
            </div>

            {/* Save Settings Button */}
            <div className="flex justify-end">
                <button
                    className="bg-orange-500 text-white px-10 py-3 rounded-full text-lg hover:bg-orange-600 transition duration-300"
                    onClick={updateChatSettings}
                >
                    Save Settings
                </button>
            </div>
        </div>
    );
};

export default CreatorSettings;