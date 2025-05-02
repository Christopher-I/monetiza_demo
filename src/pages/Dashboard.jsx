import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import withProtectedRoute from '../hoc/ProtectedRoute';
import axios from 'axios';
import { useSelector, useDispatch } from "react-redux";
import { loading as loader } from "../store/authSlice";

const COLORS = ['#10b981', '#f97316', '#3b82f6'];

const dummyMonthlyData = [
  { month: 'Jan', revenue: 450 },
  { month: 'Feb', revenue: 800 },
  { month: 'Mar', revenue: 1200 },
  { month: 'Apr', revenue: 1800 },
  { month: 'May', revenue: 1500 },
  { month: 'Jun', revenue: 1300 },
  { month: 'Jul', revenue: 1700 },
  { month: 'Aug', revenue: 1400 },
  { month: 'Sep', revenue: 1000 },
  { month: 'Oct', revenue: 800 },
  { month: 'Nov', revenue: 600 },
  { month: 'Dec', revenue: 450 },
];

const dummyTopSubscribers = [
  { fullname: 'John Doe', username: 'johndoe', avatar: 'https://via.placeholder.com/40' },
  { fullname: 'Jane Smith', username: 'janesmith', avatar: 'https://via.placeholder.com/40' },
  { fullname: 'Alex Johnson', username: 'alexj', avatar: 'https://via.placeholder.com/40' },
];

const dummyTopCountries = [
  { country: 'USA', value: 500 },
  { country: 'UK', value: 300 },
  { country: 'Canada', value: 200 },
];

const MetricCard = ({ label, value }) => (
  <div className="bg-white p-4 rounded-lg border border-black shadow text-center">
    <p className="text-sm text-gray-500">{label}</p>
    <h3 className="text-xl font-semibold mt-1">{value}</h3>
  </div>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const [dataSet, setDataSet] = useState({
    lifeTimeRevenue: 25000,
    averageSubscription: 24.99,
    totalSubscribers: 528,
    monthlyData: dummyMonthlyData,
    topSubscribers: dummyTopSubscribers,
    topCountries: dummyTopCountries,
  });

  useEffect(() => {
    axios.get(`${baseUrl}/api/auth/dashboard`, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    }).then(result => setDataSet({
      ...result.data,
      monthlyData: result.data.monthlyData?.length ? result.data.monthlyData : dummyMonthlyData,
      topSubscribers: result.data.topSubscribers?.length ? result.data.topSubscribers : dummyTopSubscribers,
      topCountries: result.data.topCountries?.length ? result.data.topCountries : dummyTopCountries,
    })).catch(() => {
      // fallback to dummy data on error
    });
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 w-full h-screen overflow-y-auto bg-gray-50">
      <div className="text-2xl font-bold text-gray-800">Overview Dashboard</div>
      <p className="text-sm text-gray-500">Monitor your performance and trends</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard label="Lifetime Revenue" value={`$${dataSet.lifeTimeRevenue}`} />
        <MetricCard label="Avg. Subscription" value={`$${dataSet.averageSubscription}`} />
        <MetricCard label="Total Subscribers" value={dataSet.totalSubscribers} />
      </div>

      <div className="bg-white p-6 rounded-xl shadow border w-full">
        <h2 className="text-lg font-semibold mb-4">Revenue (Monthly)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={dataSet.monthlyData}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(val) => `$${val}`} />
            <Tooltip formatter={(val) => `$${val}`} />
            <CartesianGrid strokeDasharray="3 3" />
            <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#colorRev)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-lg font-semibold mb-4">Top Subscribers</h2>
          <ul className="space-y-4">
            {dataSet.topSubscribers.map((sub, i) => (
              <li key={i} className="flex items-center gap-4">
                <img src={sub.avatar} alt={sub.fullname} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-medium">{sub.fullname}</p>
                  <p className="text-sm text-gray-500">@{sub.username}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-lg font-semibold mb-4">Top Countries</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dataSet.topCountries}
                dataKey="value"
                nameKey="country"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#10b981"
                label
              >
                {dataSet.topCountries.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => `$${val}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default withProtectedRoute(Dashboard, 'dashboard');