import React from 'react'

const DeleteMyPost = ({ handleDeletePost = () => {}, close = () => {} }) => {
  return (
    <>
      <div className="relative z-[21] bg-[#F1F5F9] border border-gray-300 rounded-lg shadow-lg w-full flex flex-col text-center">
        <button className="text-md font-montserrat p-2 w-full text-red-500" onClick={handleDeletePost}>
            Delete post
        </button>
      </div>
      <div onClick={close} className="fixed w-screen z-[20] h-screen top-0 left-0"></div>
    </>
  )
}

export default DeleteMyPost