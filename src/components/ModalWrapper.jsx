import React from 'react';

const ModalWrapper = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-[-16px] left-0 h-screen w-screen flex items-center justify-center bg-black bg-opacity-10 z-[61]">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[450px] relative">
        <button
          className="absolute top-4 left-4 text-xl"
          onClick={onClose}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

export default ModalWrapper;