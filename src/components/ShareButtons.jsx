import React from 'react';

export function ShareButton({ url, title, text }) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Check this out!',
          text: text || 'Here’s something interesting:',
          url: url,
        });
        // console.log('Content shared successfully!');
      } catch (error) {
        console.error('Error sharing content:', error);
      }
    } else {
      alert('Web Share API is not supported in your browser.');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="p-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
    >
      Share
    </button>
  );
}

export default ShareButton;
