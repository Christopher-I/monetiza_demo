import axios from 'axios';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

const PasswordSettings = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  
  const [currentPassword, setCurrentPassword] = useState()
  const [newPassword, setNewPassword] = useState()
  const [newPassword2, setNewPassword2] = useState()
  const [newPasswordError, setNewPasswordError] = useState()
  let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

  const changePassword = async () => {
    // { currentPassword, newPassword }
    try {
      if (!newPassword || !currentPassword) {
        toast.error("Complete the form!")
        return;
      }
      if (!newPassword2) {
        toast.error("You have to confirm new password")
        return;
      }
      if (newPassword !== newPassword2) {
        toast.error("passwords do not match")
        return;
      }
      const response = await axios.patch(`${baseUrl}/api/auth/password`, { currentPassword, newPassword }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (response) {
        // 
        toast.info(response.data.message)
      }
    } catch (error) {
      toast.error(error.response.data.message || error.message)
      // console.log(error, "error")
    }
  }

  return (
    <div className='font-montserrat'>
      <h2 className="text-xl font-bold my-4 mb-8">Password Change</h2>
      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current Password"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value)
              if (passwordRegex.test(e.target.value)) {
                setNewPasswordError(false)
              } else {
                setNewPasswordError(true)
              }
            }}
            placeholder="New Password"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Confirm New Password</label>
          <input
            type="password"
            value={newPassword2}
            onChange={(e) => setNewPassword2(e.target.value)}
            placeholder="Confirm New Password"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        {newPasswordError && <p className="text-red-500 text-xs text-center">Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters</p>}
        <div className="flex justify-end"><button className="bg-orange-500 text-white px-6 py-1 rounded-md" onClick={changePassword}>Save</button></div>
      </div>
    </div>
  );
};

export default PasswordSettings;