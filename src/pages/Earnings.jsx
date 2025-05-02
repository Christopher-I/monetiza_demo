import React, { useEffect, useMemo, useState } from "react";
import withProtectedRoute from "../hoc/ProtectedRoute";
import axios from "axios";
import { useSelector } from "react-redux";
import { capitalizeFirstLetters } from "../common/utils";
import { usePagination, useTable } from "react-table";
import { FiCreditCard } from "react-icons/fi";
import { CiCircleCheck } from "react-icons/ci";
import paypalImg from "../imgs/paypal_2.png";
import payoneerImg from "../imgs/payoneer.png";
import bankImg from "../imgs/bank.png";
import back from "../imgs/back.png";
import { toast } from "react-toastify";

const Earnings = () => {
  const { user, unRead } = useSelector((state) => state.auth);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const [dataSet, setDataSet] = useState([])
  const [data, setData] = useState([])
  const [earningsVisible, setEarningsVisible] = useState(false)
    const [selectedCard, setSelectedCard] = useState('bank');
  const [transactions, setTransactions] = useState([])
  const [passedData, setPassedData] = useState({});
  const [wallet, setWallet] = useState(0)
  const [filter, setFilter] = useState({
    date: "",
    contentType: "",
    paymentStatus: "",
  });

//   const dataPreview = {
//     orderID: "hwhwhw",
//     subscriptionID: "jbkjbkj",
//     transactionHash: "jnjnjh",
//     paymentIntentID: "kbjhbjhbjkh",
//     chargeID: "bhbjhbj",
//     confirmations: 0,
//     amount: 50,
//     status: "successful", // Payment status
//     plan_id: "bkhbjhbj",
//     subscriber: {
//         type: "hbhbjhb"
//     }, // Payer details (generic)
//     paymentType: "subscription",
//     userId: {
//       personal_info: {
//         username: "jhbjhbjhbj",
//         profile_img: "jhbjhbjhbj",
//         fullname: "jhbjhbjhbj",
//         isVerified: "jhbjhbjhbj",
//       }
//     }, // Who paid
//     creatorId: {
//       wallet: {
//         balance: 0
//       }
//     }, // Who got paid
//     metadata: {
//         ip: " vbvvhgvhg", // User's IP address
//         userAgent: "jhgvjhvjgvjg", // Browser/Device info
//     },

// }

  // const transactions = [
  //   { name: "Christine Kludge", type: "Live", status: "Paid", amount: 15 },
  //   { name: "Samantha Jane", type: "Contents", status: "Renewed", amount: 25 },
  //   { name: "John Klein", type: "Contents", status: "Renewed", amount: 25 },
  //   { name: "Daniel Mac", type: "Live", status: "Paid", amount: 10 },
  //   {
  //     orderID: "hwhwhw",
  //     subscriptionID: "jbkjbkj",
  //     transactionHash: "jnjnjh",
  //     paymentIntentID: "kbjhbjhbjkh",
  //     chargeID: "bhbjhbj",
  //     confirmations: 0,
  //     amount: 50,
  //     status: "successful", // Payment status
  //     plan_id: "bkhbjhbj",
  //     subscriber: {
  //         type: "hbhbjhb"
  //     }, // Payer details (generic)
  //     paymentType: "subscription",
  //     userId: {
  //       personal_info: {
  //         username: "jhbjhbjhbj",
  //         profile_img: "jhbjhbjhbj",
  //         fullname: "jhbjhbjhbj",
  //         isVerified: "jhbjhbjhbj",
  //       }
  //     }, // Who paid
  //     creatorId: {
  //       wallet: {
  //         balance: 0
  //       }
  //     }, // Who got paid
  //     metadata: {
  //         ip: " vbvvhgvhg", // User's IP address
  //         userAgent: "jhgvjhvjgvjg", // Browser/Device info
  //     },
  
  // }
  // ];

  // const filteredTransactions = transactions.filter((transaction) => {
  //   return (
  //     (!filter.date || transaction.date === filter.date) &&
  //     (!filter.contentType || transaction.type === filter.contentType) &&
  //     (!filter.paymentStatus || transaction.status === filter.paymentStatus)
  //   );
  // });

  const applyFilters = () => {
    let filteredData = transactions;

    if (filter.paymentStatus) {
      filteredData = filteredData.filter((item) =>
        item.status === filter.paymentStatus
      );
    }

    if (filter.contentType) {
      filteredData = filteredData.filter(
        (item) => filter.contentType == item.type
      );
    }

    if (filter.date) {
      const searchDate = new Date(filter.date)
      filteredData = filteredData.filter(
        (item) => {
          // console.log(item, "item")
          // 
          const transactionDate = new Date(item.createdAt)
          // console.log(transactionDate, "transactionDate")
          return searchDate.getFullYear() === transactionDate.getFullYear() &&
          searchDate.getMonth() === transactionDate.getMonth() &&
          searchDate.getDate() === transactionDate.getDate()
        }
      );
      // const filteredDataPL = filteredData.map(
      //   (item) => {
      //     console.log(item, "item")
      //     // 
      //     const transactionDate = new Date(item.createdAt)
      //     console.log(transactionDate, "transactionDate")
      //     return searchDate.getFullYear() === transactionDate.getFullYear() &&
      //     searchDate.getMonth() === transactionDate.getMonth() &&
      //     searchDate.getDate() === transactionDate.getDate()
      //   }
      // );
    }

    setData(filteredData);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }

  useEffect(() => {
    // first
    axios.get(`${baseUrl}/api/post/earnings`, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    }).then(result => {
      setDataSet(result.data.payments);
      setWallet(result.data.wallet)
    });
  
    return () => {
      // second
    }
  }, [])

  // Table Columns
const columns = useMemo(
  () => [
    {
      Header: 'Subscriber’s Name',
      accessor: 'userId',
      Cell: (data) => (
      //   <span className={``}>{data && (String(data).split("<p>")[0]).split("</p>")[0]}</span>
          <div className="border-b p-2 flex gap-1">
            <img loading="lazy" src={data.row.original.userId.personal_info.profile_img} alt="" className="h-10 w-10 rounded-full" />
            <div className="flex flex-col">
              <span className="font-semibold">{capitalizeFirstLetters(data.row.original.userId.personal_info.fullname)}</span>
              <span className="text-sm text-gray-400">@{data.row.original.userId.personal_info.username}</span>
            </div>
          </div>
      ),
    },
    {
      Header: 'Content Type',
      accessor: 'type',
      // Cell: (data) => {
      //   console.log(data, "content type")
      //   return(
      // //   <span className={``}>{(data.row.original.image) ? "Media" : "Text"}</span>
      // )},
    },
    {
      Header: 'Payment Status',
      accessor: 'status',
      Cell: (data) => (
        <span className={`${data.row.original.status !== "successful" ? "text-red-400" : "text-green-400"}`}>{data.row.original.status}</span>
      ),
    },
    {
      Header: 'Amount',
      accessor: 'amount',
      // Cell: ({row}) => (
      //   <select className="p-2 border rounded-md bg-white cursor-pointer border border-black" onClick={() => new Date(row.original.publishedAt) > Date.now() && navigate(`/content/${row.original._id}`)}>
      //       {new Date(row.original.publishedAt) > Date.now() ? (
      //         <option>Edit</option>
      //       ) : (
      //         <option disabled>____</option>
      //       )}
      //       {/* <option>Edit</option> */}
      //       {/* <option>Delete</option> */}
      //   </select>
      // ),
    },
  ],
  []
);

  const tableInstance = useTable(
    {
      columns,
      data,
      initialState: { pageSize: 10 },
      // initialState: { pageSize: 20 },
    },
    usePagination
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    state: { pageIndex },
  } = tableInstance;

  useEffect(() => {
    // first
    // console.log(dataSet, "dataSet")
    const preTransactions = dataSet.reverse()?.map((data) => {
      // console.log(data.postId, "data.postId")
      // console.log(data, "data")
      return {
        name: data.userId.personal_info.fullname,
        type: data.type,
        status: data.status,
        amount: data.amount,
        createdAt: data.createdAt,
        userId: data.userId,
      }
    })

    // const filteredTransactions = preTransactions.filter((transaction) => {
    //   const searchDate = new Date(filter.date)
    //   const transactionDate = new Date(transaction.createdAt)
    //   return (
    //     (!filter.date || (searchDate.getFullYear() === transactionDate.getFullYear() &&
    //                       searchDate.getMonth() === transactionDate.getMonth() &&
    //                       searchDate.getDate() === transactionDate.getDate())) &&
    //     (!filter.contentType || transaction.type === filter.contentType) &&
    //     (!filter.paymentStatus || transaction.status === filter.paymentStatus)
    //   );
    // });

    setTransactions(() => preTransactions)
    setData(() => preTransactions)
  }, [dataSet])

  const handleWithdraw = async () => {
    // passedData
    try {
      // 
      await axios.post(`${baseUrl}/api/post/earnings`, {...passedData, method: selectedCard}, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }).then(result => {
        toast.success("Withdrawal request successful")
      });
    } catch (error) {
      toast.error("Withdrawal request failed")
    }
  }

  useEffect(() => {
    setPassedData((prev) => {return { amount: prev.amount || 0}})
  }, [selectedCard]);

  return (
    <div className="flex-1 bg-white p-6 overflow-y-auto hide-scrollbar max-h-screen overflow-y-auto">
      {earningsVisible && <img onClick={() => setEarningsVisible(false)} loading="lazy" src={back} alt="back" className="w-4 cursor-pointer mb-2" />}
      <h1 className="text-xl font-bold mb-4">Earnings</h1>
      <p className="text-gray-500 mb-8">
        Detailed transaction tracking and withdrawal{/*  --  earnings.userId.personal_info.fullname */}
      </p>

      {/* Wallet and Withdrawal */}
      {!earningsVisible && <div className="bg-white p-6 rounded shadow mb-6">
        {/* <div className="flex flex-col mb-4 gap-2">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Wallet</h2>
              <p className="text-orange-500 text-2xl">${wallet}</p>
            </div>
            <div className="">
              <input
                type="number"
                placeholder="$ 0.00"
                className="border rounded px-2 py-1"
              />
            </div>
          </div>
          <div className="flex w-full flex-col lg:flex-row space-x-2 space-y-2 lg:space-y-0">
            
            <select className="border rounded px-2 py-1 h-10 flex-1">
              <option>Bank</option>
              {/* <option>Visa</option> */}
              {/* <option>Paypal</option>
            </select>
            <input
              type="text"
              placeholder="Account name"
              className="border rounded px-2 py-1 h-10 flex-1"
            />
            <input
              type="text"
              placeholder="Account number"
              className="border rounded px-2 py-1 h-10 flex-1"
            />
          </div>
            <button className="bg-orange-500 text-white px-4 py-2 rounded self-end">
              Withdraw
            </button>
        </div> */}
        {/* wallet card */}
        <div className="rounded-xl border border-gray-500 w-[388px] h-[188px] shadow-md">
          <div className="border-b border-gray-400 w-full px-4 flex justify-between items-center h-[50px]">
            <span className="font-semibold text-[1.25rem]">Wallet</span>
            <FiCreditCard size={24} />
          </div>
          <div className="p-4 space-y-3">
            <p className="text-gray-400">Withdrawable balance</p>
            <p className="text-orange-500 font-bold text-3xl">${wallet}</p>
          </div>
        </div>

        {/* amount */}
        <div className="mt-6 flex flex-col gap-2">
          <label htmlFor="amount" className="font-semibold">Amount</label>
          <input
            id="amount"
            type="number"
            value={passedData?.amount || ""}
            onChange={(e) => setPassedData({...passedData, amount: e.target.value})}
            placeholder="$ 0.00"
            className="border border-gray-600 rounded px-2 py-1 w-[388px] shadow-lg"
          />
        </div>

        {/* withdraw to */}
        <div className="mt-8 max-w-[645px] w-full flex flex-col gap-8">
          <div className="">
            <p className="text-lg">Withdraw to:</p>
            <div className="flex gap-8">
              <div onClick={() => setSelectedCard("bank")} className={`flex flex-col flex-1 py-1 justify-between cursor-pointer border ${selectedCard == "bank" ? "border-[#E35F01]" : "border-gray-300"} rounded-md`}>
                <div className="flex justify-between items-center">
                    <img src={bankImg} alt="ml-2" />
                    {selectedCard == "bank" && <div className="pr-3"><CiCircleCheck color='#E35F01' /></div> }
                </div>
                <div className="flex justify-between p-1">
                    <span className="text-xs">Bank</span>
                    {/* <span className="text-xs">5765</span> */}
                </div>
              </div>

              <div onClick={() => setSelectedCard("payoneer")} className={`flex flex-col flex-1 py-1 justify-between cursor-pointer border ${selectedCard == "payoneer" ? "border-[#E35F01]" : "border-gray-300"} rounded-md`}>
                <div className="flex justify-between items-center">
                    <img src={payoneerImg} alt="ml-2" />
                    {selectedCard == "payoneer" && <div className="pr-3"><CiCircleCheck color='#E35F01' /></div> }
                </div>
                <div className="flex justify-between p-1">
                    <span className="text-xs">Payoneer</span>
                    {/* <span className="text-xs">5765</span> */}
                </div>
              </div>

              <div onClick={() => setSelectedCard("paypal")} className={`flex flex-col flex-1 py-1 justify-between cursor-pointer border ${selectedCard == "paypal" ? "border-[#E35F01]" : "border-gray-300"} rounded-md`}>
                <div className="flex justify-between items-center">
                    <img src={paypalImg} alt="ml-2" />
                    {selectedCard == "paypal" && <div className="pr-3"><CiCircleCheck color='#E35F01' /></div> }
                </div>
                <div className="flex justify-between p-1">
                    <span className="text-xs">Paypal</span>
                    {/* <span className="text-xs">5765</span> */}
                </div>
              </div>
            </div>
          </div>
          <div className="">
            {
              selectedCard === "bank" ? (<div className="flex flex-col gap-2">
                <div className="flex flex-col lg:flex-row gap-10">
                  <div className="mt-6 flex flex-col gap-2 flex-1">
                    <label htmlFor="accountName" className="font-semibold">Bank holder name</label>
                    <input
                      id="accountName"
                      type="text"
                      value={passedData?.accountName || ""}
                      onChange={(e) => setPassedData({...passedData, accountName: e.target.value})}
                      placeholder="Christine Kludge"
                      className="border border-gray-600 rounded px-2 py-1 w-full shadow-lg"
                    />
                  </div>
                  
                  <div className="mt-6 flex flex-col gap-2 flex-1">
                    <label htmlFor="accountNumber" className="font-semibold">Account number</label>
                    <input
                      id="accountNumber"
                      type="text"
                      value={passedData?.accountNumber || ""}
                      onChange={(e) => setPassedData({...passedData, accountNumber: e.target.value})}
                      placeholder="5556-5427-8990"
                      className="border border-gray-600 rounded px-2 py-1 w-full shadow-lg"
                    />
                  </div>

                  <div className="mt-6 flex flex-col gap-2 flex-1">
                    <label htmlFor="bankName" className="font-semibold">Bank name</label>
                    <input
                      id="bankName"
                      type="text"
                      value={passedData?.bankName || ""}
                      onChange={(e) => setPassedData({...passedData, bankName: e.target.value})}
                      placeholder="Mercury"
                      className="border border-gray-600 rounded px-2 py-1 w-full shadow-lg"
                    />
                  </div>
                </div>

                
                
                <div className="flex flex-col lg:flex-row gap-10">
                  <div className="mt-6 flex flex-col gap-2 flex-1">
                    <label htmlFor="routingNumber" className="font-semibold">Routing Number</label>
                    <input
                      id="routingNumber"
                      type="text"
                      value={passedData?.routingNumber || ""}
                      onChange={(e) => setPassedData({...passedData, routingNumber: e.target.value})}
                      placeholder="345-897-876"
                      className="border border-gray-600 rounded px-2 py-1 w-full shadow-lg"
                    />
                  </div>
                  
                  <div className="mt-6 flex flex-col gap-2 flex-1">
                    <label htmlFor="accountNumber" className="font-semibold">Swift Code</label>
                    <input
                      id="swiftCode"
                      type="text"
                      value={passedData?.swiftCode || ""}
                      onChange={(e) => setPassedData({...passedData, swiftCode: e.target.value})}
                      placeholder="9378-4893-767"
                      className="border border-gray-600 rounded px-2 py-1 w-full shadow-lg"
                    />
                  </div>
                </div>
              </div>) : 
              selectedCard === "payoneer" ? (<div className="flex flex-col gap-2">
                <div className="flex flex-col lg:flex-row gap-10">
                  <div className="mt-6 flex flex-col gap-2 flex-1">
                    <label htmlFor="accountName" className="font-semibold">Payoneer holder name</label>
                    <input
                      id="accountName"
                      type="text"
                      value={passedData?.accountName || ""}
                      onChange={(e) => setPassedData({...passedData, accountName: e.target.value})}
                      placeholder="Christine Kludge"
                      className="border border-gray-600 rounded px-2 py-1 w-full shadow-lg"
                    />
                  </div>
                  
                  <div className="mt-6 flex flex-col gap-2 flex-1">
                    <label htmlFor="accountNumber" className="font-semibold">Email Address</label>
                    <input
                      id="accountNumber"
                      type="email"
                      value={passedData?.email || ""}
                      onChange={(e) => setPassedData({...passedData, email: e.target.value})}
                      placeholder="exmple@gmail.com"
                      className="border border-gray-600 rounded px-2 py-1 w-full shadow-lg"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col lg:flex-row gap-10">
                  <div className="mt-6 flex flex-col gap-2 flex-1">
                    <label htmlFor="payoneerId" className="font-semibold">Payoneer ID</label>
                    <input
                      id="payoneerId"
                      type="text"
                      value={passedData?.accountNumber || ""}
                      onChange={(e) => setPassedData({...passedData, accountNumber: e.target.value})}
                      placeholder="345-897-876"
                      className="border border-gray-600 rounded px-2 py-1 w-full shadow-lg"
                    />
                  </div>
                  
                  <div className="mt-6 flex flex-col gap-2 flex-1">
                    
                  </div>
                </div>
              </div>) : 
              selectedCard === "paypal" ? (<div className="flex flex-col gap-2">
                <div className="flex flex-col lg:flex-row gap-10">
                  <div className="mt-6 flex flex-col gap-2 flex-1">
                    <label htmlFor="accountName" className="font-semibold">Paypal holder name</label>
                    <input
                      id="accountName"
                      type="text"
                      value={passedData?.accountName || ""}
                      onChange={(e) => setPassedData({...passedData, accountName: e.target.value})}
                      placeholder="Christine Kludge"
                      className="border border-gray-600 rounded px-2 py-1 w-full shadow-lg"
                    />
                  </div>
                  
                  <div className="mt-6 flex flex-col gap-2 flex-1">
                    <label htmlFor="accountNumber" className="font-semibold">Email Address</label>
                    <input
                      id="accountNumber"
                      type="email"
                      value={passedData?.email || ""}
                      onChange={(e) => setPassedData({...passedData, email: e.target.value})}
                      placeholder="exmple@gmail.com"
                      className="border border-gray-600 rounded px-2 py-1 w-full shadow-lg"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col lg:flex-row gap-10">
                  <div className="mt-6 flex flex-col gap-2 flex-1">
                    <label htmlFor="paypalId" className="font-semibold">Paypal ID</label>
                    <input
                      id="paypalId"
                      type="text"
                      value={passedData?.accountNumber || ""}
                      onChange={(e) => setPassedData({...passedData, accountNumber: e.target.value})}
                      placeholder="345-897-876"
                      className="border border-gray-600 rounded px-2 py-1 w-full shadow-lg"
                    />
                  </div>
                  
                  <div className="mt-6 flex flex-col gap-2 flex-1">
                    
                  </div>
                </div>
              </div>) : 
              null
            }
          </div>
          <div className="w-full">
            <button className="bg-orange-500 text-white px-4 py-2 rounded w-full" onClick={handleWithdraw}>
              Withdraw
            </button>
          </div>
        </div>
        <button onClick={() => {scrollToTop(); setEarningsVisible(true);}} className="text-orange-500 mt-6 text-[1.3rem]">{"See detailed transaction tracking>>>>>"}</button>
      </div>}

      {earningsVisible && <>
        {/* Filters */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex flex-wrap space-x-4">
          <input 
            type="date" 
            className="border rounded px-2 py-1"
            onChange={(e) => setFilter({ ...filter, date: e.target.value })}
          />
            {/* <select
              className="border rounded px-2 py-1"
              onChange={(e) => setFilter({ ...filter, date: e.target.value })}
            >
              <option value="">Select Date</option>
              <option value="14th Dec, 2024">14th Dec, 2024</option>
            </select> */}
            <select
              className="border rounded px-2 py-1"
              onChange={(e) =>
                setFilter({ ...filter, contentType: e.target.value })
              }
            >
              <option value="">Content Type</option>
              <option value="Live">Live</option>
              <option value="Content">Content</option>
            </select>
            <select
              className="border rounded px-2 py-1"
              onChange={(e) =>
                setFilter({ ...filter, paymentStatus: e.target.value })
              }
            >
              <option value="">Payment Status</option>
              <option value="successful">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <button onClick={applyFilters} className="bg-gray-500 text-white px-4 py-2 rounded">
              Filter
            </button>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white p-4 rounded shadow">
          {/* <table className="w-full text-left">
            <thead className="bg-[#E35F0180]">
              <tr>
                <th className="border-b p-2">Subscriber’s Name</th>
                <th className="border-b p-2">Content Type</th>
                <th className="border-b p-2">Payment Status</th>
                <th className="border-b p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((transaction, index) => (
                <tr key={index}>
                  <td className="border-b p-2 flex gap-1">
                    <img loading="lazy" src={transaction.userId.personal_info.profile_img} alt="" className="h-10 w-10 rounded-full" />
                    <div className="flex flex-col">
                      <span className="font-semibold">{capitalizeFirstLetters(transaction.userId.personal_info.fullname)}</span>
                      <span className="text-sm text-gray-400">@{transaction.userId.personal_info.username}</span>
                    </div>
                  </td>
                  <td className="border-b p-2">{transaction.type}</td>
                  <td className="border-b p-2 text-green-500">
                    {transaction.status}
                  </td>
                  <td className="border-b p-2">${transaction.amount}</td>
                </tr>
              ))}
            </tbody>
          </table> */}
                {/* Table Section */}
        <div className="rounded-lg p-4">
          <table
            {...getTableProps()}
            className="w-full text-left"
          >
            <thead>
              {headerGroups.map((headerGroup, index) => (
                <tr {...headerGroup.getHeaderGroupProps()} key={index.toString()}>
                  {headerGroup.headers.map((column, index) => (
                    <th
                      {...column.getHeaderProps()}
                      key={index.toString()}
                      className="p-3 bg-[#E35F0180]"
                    >
                      {column.render('Header')}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody {...getTableBodyProps()}>
              {page.map((row, index) => {
                prepareRow(row);
                return (
                  <tr
                    {...row.getRowProps()}
                    key={index.toString()}
                    className="hover:bg-gray-50"
                  >
                    {row.cells.map((cell, index) => (
                      <td {...cell.getCellProps()} key={index.toString()} className="p-3">
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
              className="p-2 border rounded-md bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>

            <span>
              Page{' '}
              <strong>
                {pageIndex + 1} of {pageOptions.length}
              </strong>
            </span>

            <button
              onClick={() => nextPage()}
              disabled={!canNextPage}
              className="p-2 border rounded-md bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
        </div>
      </>}
    </div>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export default withProtectedRoute(Earnings, 'earnings');