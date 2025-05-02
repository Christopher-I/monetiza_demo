import React from 'react';
import { Link } from 'react-router-dom';

// Components
import ModalWrapper from './ModalWrapper';

// Utils
import { capitalizeFirstLetters } from '../common/utils';

// Icons
import { FiCheck, FiArrowLeft } from 'react-icons/fi';

const TipsSuccessModal = ({ isOpen, onClose, data }) => {
  // Early return if no data
  if (!data || !isOpen) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden max-w-md w-full animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white relative">
          <h2 className="text-xl font-bold text-center">Tip Successful!</h2>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 flex flex-col items-center">
          {/* Success animation */}
          <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4 mb-6 animate-scale-in">
            <FiCheck className="text-green-500 dark:text-green-400 w-10 h-10" />
          </div>
          
          {/* Amount */}
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
              ${data.amount}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tipped successfully
            </p>
          </div>
          
          {/* Recipient info */}
          <div className="flex items-center gap-3 mb-6">
            {data.profilePic && (
              <img 
                src={data.profilePic} 
                alt={data.name || 'Creator'} 
                className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
              />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {capitalizeFirstLetters(data.creator || data.name || 'Creator')}
              </p>
              {data.username && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  @{data.username}
                </p>
              )}
            </div>
          </div>
          
          {/* Message */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 w-full mb-6">
            <p className="text-center text-gray-700 dark:text-gray-300">
              Thank you for supporting this creator! Your generosity helps them continue creating great content.
            </p>
          </div>
          
          {/* Transaction ID if available */}
          {data.transactionId && (
            <div className="text-xs text-gray-400 dark:text-gray-500 mb-6">
              Transaction ID: {data.transactionId}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium transition-colors flex-1"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to feed
            </button>
            
            {data.authorId && (
              <Link 
                to={`/user/${data.authorId}`}
                className="py-2 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium text-center transition-colors flex-1"
                onClick={() => onClose()}
              >
                Visit profile
              </Link>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

// Add these animations to your global CSS or tailwind config
// @keyframes fadeIn {
//   from { opacity: 0; }
//   to { opacity: 1; }
// }
// @keyframes scaleIn {
//   from { transform: scale(0.8); opacity: 0; }
//   to { transform: scale(1); opacity: 1; }
// }
// .animate-fade-in { animation: fadeIn 0.3s ease-out; }
// .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

export default TipsSuccessModal;