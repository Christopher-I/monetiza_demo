import React from 'react'
import chatImg from "../imgs/chat.png";
import copyImg from "../imgs/copy.png";
import shareOutlineImg from "../imgs/share-outline.png";

const ConfirmDeleteAccount = ({ onCancel = () => {}, onDelete = () => {}, }) => {
  return (
    <div className="bg-[#F1F5F9] border border-gray-300 rounded-lg shadow-lg w-full">
        <div className="border-b border-gray-600 p-4 pb-8 flex flex-col items-center gap-2">
            <h3 className='text-3xl font-bold'>Delete Account</h3>
            <p className='text-lg w-1/2 text-center'>Are you sure you want to delete this account?</p>
        </div>
        <div className="flex mb-6">
            <button
                onClick={onCancel}
                className="flex-1 items-center gap-2 px-4 py-4 text-lg font-montserrat font-semibold text-gray-700 hover:bg-gray-100"
            >
                Cancel
            </button>
            <button
                onClick={onDelete}
                className="flex-1 border-l border-gray-600 items-center gap-2 px-4 py-4 text-red-600 text-lg font-montserrat font-semibold text-gray-700 hover:bg-gray-100"
            >
                Delete
            </button>
        </div>
    </div>
  )
}

export default ConfirmDeleteAccount
