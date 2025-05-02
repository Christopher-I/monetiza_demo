// AccountSettings.jsx (as an example of an improved settings page component)
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { loading as loader } from "../store/authSlice";
import axios from "axios";
import ConfirmDeleteAccount from "./ConfirmDeleteAccount";
import {
  FiInfo,
  FiUser,
  FiMail,
  FiPhone,
  FiRefreshCw,
  FiTrash2,
} from "react-icons/fi";

const AccountSettings = () => {
  const dispatch = useDispatch();
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const deleteAccount = async () => {
    try {
      dispatch(loader());
      const response = await axios.delete(`${baseUrl}/api/auth/profile`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      toast.success(response.data.message);
      setConfirmDeleteVisible(false);
    } catch (error) {
      toast.error("Failed to delete account. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Account Information
          </h2>
          <div className="ml-2 bg-blue-100 text-blue-600 p-1 rounded-full">
            <FiInfo className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 p-5 flex items-center">
            <div className="bg-orange-100 p-3 rounded-full mr-4">
              <FiUser className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Username</p>
              <p className="text-lg font-semibold text-gray-800">
                {user.personal_info.username}
              </p>
            </div>
          </div>

          <div className="border-b border-gray-100 p-5 flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <FiMail className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-lg font-semibold text-gray-800">
                {user.personal_info.email}
              </p>
            </div>
          </div>

          <div className="p-5 flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <FiPhone className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone Number</p>
              <p className="text-lg font-semibold text-gray-800">
                {user.personal_info.phoneNumber || "No phone number added"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Account Management
        </h2>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <button
            onClick={() => navigate("/creator/reset")}
            className="w-full p-5 flex items-center justify-between text-left border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <FiRefreshCw className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Reset Creators Page</p>
                <p className="text-sm text-gray-500">
                  Reset your creator profile to default settings
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setConfirmDeleteVisible(true)}
            className="w-full p-5 flex items-center justify-between text-left hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <FiTrash2 className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="font-medium text-red-600">Delete Account</p>
                <p className="text-sm text-gray-500">
                  Permanently delete your account and all data
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {confirmDeleteVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <ConfirmDeleteAccount
            onDelete={deleteAccount}
            onCancel={() => setConfirmDeleteVisible(false)}
          />
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
