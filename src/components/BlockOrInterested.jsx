import React from 'react'

const BlockOrInterested = ({postId, handleNotInterested = () => {}, handleBlockUser = () => {}, close = () => {}}) => {
  return (
    <>
      <div className="relative z-[21] bg-[#F1F5F9] border border-gray-300 rounded-lg shadow-lg w-full flex flex-col text-center">
        <button className="border-b border-gray-600 text-md font-montserrat p-2 w-full" onClick={handleNotInterested}>
            Not interested
        </button>
        <button className="text-md font-montserrat p-2 w-full text-red-500" onClick={handleBlockUser}>
            Block user
        </button>
      </div>
      <div onClick={close} className="fixed w-screen z-[20] h-screen top-0 left-0"></div>
    </>
  )
}

export const Blocked = ({ handleBlockUser = () => {}, handleReportUser = () => {}, close = () => {}}) => {
  return (
    <>
      <div className="relative z-[21] bg-[#F1F5F9] border border-gray-300 rounded-lg shadow-lg w-full flex flex-col text-center">
        <button className="border-b border-gray-600 text-md font-montserrat p-2 w-full" onClick={handleReportUser}>
            Report user
        </button>
        <button className="text-md font-montserrat p-2 w-full text-red-500" onClick={handleBlockUser}>
            Block user
        </button>
      </div>
      <div onClick={close} className="fixed w-screen z-[20] h-screen top-0 left-0"></div>
    </>
  )
}

export default BlockOrInterested