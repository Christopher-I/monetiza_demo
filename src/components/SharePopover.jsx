import React, { useState } from "react";
import { toast } from "react-toastify";
import chatImg from "../imgs/chat.png";
import copyImg from "../imgs/copy.png";
import shareOutlineImg from "../imgs/share-outline.png";
// import "react-toastify/dist/ReactToastify.css";

// toast.configure();

const SharePopover = ({ shareUrl, sendDirectMessage = () => {} }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success("Link copied to clipboard!");
    });
  };

  const shareViaNative = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Check this out!",
          url: shareUrl,
        })
        .catch((error) => {
          toast.error("Error sharing: " + error.message);
        });
    } else {
      toast.info("Native share is not supported on this device.");
    }
  };

  const sendDM = () => {
    sendDirectMessage("Here's something for you: " + shareUrl);
    toast.success("Message sent via Direct Message!");
  };

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        className="text-gray-600 hover:text-gray-800"
        onClick={() => setIsPopoverOpen(!isPopoverOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.364 5.636a9 9 0 11-12.728 0m12.728 0A9 9 0 015.636 18.364m12.728 0L5.636 5.636"
          />
        </svg>
      </button>

      {/* Popover */}
      {isPopoverOpen && (
        <div className="absolute z-10 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg w-48">
          <button
            onClick={sendDM}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 7.5l-9.75 9.75-9.75-9.75m19.5-3H4.5m0 0L12 12.75M4.5 4.5h16.5"
              />
            </svg>
            Send via Direct Message
          </button>
          <button
            onClick={copyLink}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 15.75l8.25 8.25 8.25-8.25M12 3.75v18.75"
              />
            </svg>
            Copy link
          </button>
          <button
            onClick={shareViaNative}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9l5.25-5.25m0 0l-5.25-5.25m5.25 5.25h-9.75M6 20.25v-4.5m0 0A3.75 3.75 0 119 12m0 3.75v4.5"
              />
            </svg>
            Share via
          </button>
        </div>
      )}
    </div>
  );
};

export const SharePopoverMod = ({ shareUrl, sendDirectMessage = () => {} }) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  
    const copyLink = () => {
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success("Link copied to clipboard!");
      });
    };
  
    const shareViaNative = () => {
      if (navigator.share) {
        navigator
          .share({
            title: "Check this out!",
            url: shareUrl,
          })
          .catch((error) => {
            toast.error("Error sharing: " + error.message);
          });
      } else {
        toast.info("Native share is not supported on this device.");
      }
    };
  
    const sendDM = () => {
      sendDirectMessage("Here's something for you: " + shareUrl);
      // toast.success("Message sent via Direct Message!");
    };
  
    return (
      <div className="bg-[#F1F5F9] border border-gray-300 rounded-lg shadow-lg w-full">
        <div className="border-b border-gray-600 p-4 pl-12">
            <button
                onClick={sendDM}
                className="flex items-center gap-2 px-4 py-2 text-lg font-montserrat font-semibold text-gray-700 hover:bg-gray-100"
            >
                <img loading="lazy" src={chatImg} alt="" className="" />
                Send via Direct Message
            </button>
        </div>
        <div className="flex gap-6 p-12 py-10 pr-4">
            <button
                onClick={copyLink}
                className="flex items-center gap-2 px-4 py-2 text-lg font-montserrat font-semibold text-gray-700 hover:bg-gray-100"
            >
                <img loading="lazy" src={copyImg} alt="" className="h-12 w-12" />
                Copy link
            </button>
            <button
                onClick={shareViaNative}
                className="flex items-center gap-2 px-4 py-2 text-lg font-montserrat font-semibold text-gray-700 hover:bg-gray-100"
            >
                <img loading="lazy" src={shareOutlineImg} alt="" className="h-12 w-12" />
                Share via
            </button>
        </div>
    </div>
    );
  };

export default SharePopover;

// Example Usage
// sendDirectMessage is a function that sends a message via WebSocket
// shareUrl is the URL to be shared
// Add this component in your app and provide required props
