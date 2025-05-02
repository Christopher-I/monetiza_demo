import axios from "axios";
import withProtectedRoute from "../hoc/ProtectedRoute";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { loading as loader } from "../store/authSlice";

// eslint-disable-next-line react-refresh/only-export-components
const BeACreator = () => {
  const dispatch = useDispatch();

    const baseUrl = import.meta.env.VITE_BASE_URL;
  const [uploadData, setUploadData] = useState({
    frequency: '',
    // amount: '',
    agreed: false,
    monthly: '',
    yearly: '',
    one: '',
  })
  // { frequency, target, amount, identity_type }


  const becomeACreator = async () => {
    if (!uploadData.agreed) {
      toast.error("You have to agree to the terms and conditions")
      return;
    }
    const formData = new FormData();
    try {
      dispatch(loader())
    //   formData.append("frequency", uploadData.frequency)
    //   formData.append("target", 0)
    //   formData.append("amount", uploadData.amount)
    // setUploadData({...uploadData, target: 0})
    if (!uploadData.frequency || uploadData.monthly === "" || uploadData.yearly === "" || uploadData.one === "" || !uploadData.identity_type) {
          toast.error("You have to fill all fields");
          return;
        }
      const response = await axios.post(`${baseUrl}/api/auth/creator/reset`, uploadData, {
        // {...formData, ...uploadData}, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (response) {
        toast.info(response.data.message)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }


    return (
        <div className={`flex flex-1 w-full overflow-y-auto bg-white`}>
            <div className="max-w-2xl p-8">
      <h1 className="text-2xl font-bold mb-6">Subscription Set-up</h1>
      <p className="text-gray-600 mb-6">Please complete filling out the following fields:</p>

      {/* Subscription Section */}
      <div className="mb-8">
      <div className="grid grid-cols-1 gap-6">
          <h4 className="font-semibold text-lg">Monthly</h4>
          <select
            className="border rounded-lg p-3 w-full"
            defaultValue={""}
            onChange={(e) => setUploadData({ ...uploadData, monthly: e.target.value === "Free" ? 0 : uploadData.monthly })}
          >
            <option value={""}>Package</option>
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
            value={uploadData.monthly}
            onChange={(e) => setUploadData({ ...uploadData, monthly: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 mt-4">
          <h4 className="font-semibold text-lg">Yearly</h4>
          <select
            className="border rounded-lg p-3 w-full"
            defaultValue={""}
            onChange={(e) => setUploadData({ ...uploadData, yearly: e.target.value === "Free" ? 0 : uploadData.yearly })}
          >
            <option value={""}>Package</option>
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
            value={uploadData.yearly}
            onChange={(e) => setUploadData({ ...uploadData, yearly: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 mt-4">
          <h4 className="font-semibold text-lg">One-Time payment</h4>
          <select
            className="border rounded-lg p-3 w-full"
            defaultValue={""}
            onChange={(e) => setUploadData({ ...uploadData, one: e.target.value === "Free" ? 0 : uploadData.one })}
          >
            <option value={""}>Package</option>
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
            defaultValue={""}
            value={uploadData.frequency}
            onChange={(e) => setUploadData({ ...uploadData, frequency: e.target.value })}
          >
            <option value={""}>Frequency</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="one">One-Time payment</option>
          </select>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-center space-x-3 mb-8">
        <input type="checkbox" onChange={(e) => setUploadData({...uploadData, agreed: e.target.value})} />
        <label>
          Tick here to confirm that you agree to the <a href="#" className="text-orange-500">Terms and Conditions</a>
        </label>
      </div>

      {/* Submit Button */}
      <div className="text-right">
        <button className="bg-orange-500 text-white px-6 py-3 rounded-lg text-lg" onClick={becomeACreator}>
          Reset
        </button>
      </div>
    </div>
        </div>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export default withProtectedRoute(BeACreator, 'creator');