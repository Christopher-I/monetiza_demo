import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import EmojiPicker from "emoji-picker-react";
import { loading as loader } from "../store/authSlice";

// Icons
import { FiImage, FiVideo, FiFile, FiMic, FiDollarSign, FiSmile, FiLock, FiMessageCircle } from "react-icons/fi";
import { CgSpinner } from "react-icons/cg";

const MessageBox = ({ refetchAllPosts }) => {
  const dispatch = useDispatch();
  const baseUrl = import.meta.env.VITE_BASE_URL;
  
  // Text state
  const [text, setText] = useState("");
  
  // Media states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState(null);
  
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isPrivatePost, setIsPrivatePost] = useState(false);
  const [isPaidPost, setIsPaidPost] = useState(false);
  const [price, setPrice] = useState(0);
  const [tempPrice, setTempPrice] = useState("");
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [donationTarget, setDonationTarget] = useState("");
  const [showDonationModal, setShowDonationModal] = useState(false);
  
  // Refs
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  
  // Handle emoji picker clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        emojiButtonRef.current !== event.target
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  // Handle file selection
  const handleFileSelect = (type) => {
    fileInputRef.current.accept = type === "image" 
      ? "image/*" 
      : type === "video" 
        ? "video/*" 
        : "image/*,video/*,audio/*,application/pdf";
        
    fileInputRef.current.click();
    setFileType(type);
  };
  
  const handleFileChange = (event) => {
    const file = event.target?.files[0];
    if (!file) return;
    
    setUploadFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAudioBlob(null);
    setAudioFile(null);
  };
  
  // Audio recording functions
  const handleVoiceRecording = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      
      // Set up audio context for visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      // Start recording
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        setAudioBlob(URL.createObjectURL(blob));
        setAudioFile(blob);
        setUploadFile(blob);
        setPreviewUrl(null);
      };
      
      mediaRecorderRef.current = recorder;
      recorder.start();
      
      // Start visualizing
      visualizeAudio(analyser);
    } catch (err) {
      toast.error("Unable to access microphone");
      console.error(err);
    }
  };
  
  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    cancelAnimationFrame(animationRef.current);
    setIsRecording(false);
  };
  
  const visualizeAudio = (analyser) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const canvasCtx = canvas.getContext("2d");
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      analyser.getByteFrequencyData(dataArray);
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      
      dataArray.forEach(item => {
        const barHeight = item / 2;
        canvasCtx.fillStyle = `rgb(${Math.min(barHeight + 100, 255)}, 100, 50)`;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      });
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
  };
  
  // Toggle functions
  const toggleEmojiPicker = () => setShowEmojiPicker(prev => !prev);
  
  const togglePrivatePost = () => setIsPrivatePost(prev => !prev);
  
  const togglePaidPost = () => {
    if (!isPaidPost) {
      setShowPriceModal(true);
    } else {
      setIsPaidPost(false);
      setPrice(0);
    }
  };
  
  // Handle emoji selection
  const addEmoji = (emoji) => {
    setText(prev => prev + emoji.emoji);
    setShowEmojiPicker(false);
  };
  
  // Handle setting price for paid posts
  const handleSetPrice = () => {
    const numPrice = Number(tempPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    
    setPrice(numPrice);
    setIsPaidPost(true);
    setShowPriceModal(false);
  };
  
  // Handle setting donation target
  const handleSetDonation = () => {
    const numTarget = Number(donationTarget);
    if (isNaN(numTarget) || numTarget <= 0) {
      toast.error("Please enter a valid donation target");
      return;
    }
    
    setShowDonationModal(false);
  };
  
  // Submit post
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate post content
    if (!text && !uploadFile && !audioFile) {
      toast.error("Your post is empty");
      return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append("caption", text);
    formData.append("image", audioFile || uploadFile);
    formData.append("isPrivate", isPrivatePost);
    formData.append("isPaidPost", isPaidPost);
    formData.append("price", isPaidPost ? price : 0);
    formData.append("donationTarget", donationTarget || 0);
    
    try {
      setIsSubmitting(true);
      dispatch(loader());
      
      const response = await axios.post(`${baseUrl}/api/post/addpost`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      
      if (response) {
        // Reset state after successful post
        setText("");
        setSelectedFile(null);
        setUploadFile(null);
        setPreviewUrl(null);
        setAudioBlob(null);
        setAudioFile(null);
        setIsPrivatePost(false);
        setIsPaidPost(false);
        setPrice(0);
        setDonationTarget("");
        
        // Refetch posts
        refetchAllPosts();
        toast.success("Post published successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to publish post");
      console.error("Post error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (audioBlob) URL.revokeObjectURL(audioBlob);
    };
  }, [previewUrl, audioBlob]);
  
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-all focus-within:shadow-md">
      <form className="p-4" onSubmit={handleSubmit}>
        {/* Text input */}
        <textarea
          className="w-full bg-transparent border-none resize-none focus:ring-0 text-gray-800 dark:text-gray-200 min-h-[80px] placeholder-gray-500"
          placeholder="Write the content of your post here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isSubmitting}
        />
        
        {/* File preview */}
        {previewUrl && (
          <div className="mt-3 relative group">
            {fileType === "image" ? (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="max-h-[300px] w-auto rounded-lg border border-gray-200 dark:border-gray-700" 
              />
            ) : fileType === "video" ? (
              <video 
                controls 
                className="max-h-[300px] w-auto rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <source src={previewUrl} />
                Your browser does not support video playback.
              </video>
            ) : (
              <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <FiFile className="mr-2 text-gray-600 dark:text-gray-300" />
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {uploadFile?.name || "File selected"}
                </span>
              </div>
            )}
            
            <button 
              type="button"
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
                setUploadFile(null);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Audio preview */}
        {audioBlob && (
          <div className="mt-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg relative group">
            <audio ref={audioRef} controls className="w-full">
              <source src={audioBlob} type="audio/wav" />
              Your browser does not support audio playback.
            </audio>
            
            <button 
              type="button"
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => {
                URL.revokeObjectURL(audioBlob);
                setAudioBlob(null);
                setAudioFile(null);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Post settings badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          {isPaidPost && (
            <div className="inline-flex items-center px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs font-medium rounded-full">
              <FiDollarSign className="mr-1" />
              <span>Paid content: ${price}</span>
              <button 
                type="button" 
                className="ml-1 text-orange-600 dark:text-orange-400 hover:text-orange-800"
                onClick={() => {
                  setIsPaidPost(false);
                  setPrice(0);
                }}
              >
                &times;
              </button>
            </div>
          )}
          
          {donationTarget > 0 && (
            <div className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
              <FiDollarSign className="mr-1" />
              <span>Donation goal: ${donationTarget}</span>
              <button 
                type="button" 
                className="ml-1 text-green-600 dark:text-green-400 hover:text-green-800"
                onClick={() => setDonationTarget("")}
              >
                &times;
              </button>
            </div>
          )}
          
          {isPrivatePost && (
            <div className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-medium rounded-full">
              <FiLock className="mr-1" />
              <span>Private post</span>
            </div>
          )}
        </div>
        
        {/* Audio recording visualizer */}
        {isRecording && (
          <div className="mt-4 bg-gray-800 rounded-lg p-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white flex items-center">
                <span className="h-2 w-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                Recording audio...
              </span>
              <button 
                type="button"
                className="text-xs text-white bg-red-500 px-2 py-1 rounded"
                onClick={stopRecording}
              >
                Stop
              </button>
            </div>
            <canvas
              ref={canvasRef}
              width="400"
              height="60"
              className="w-full rounded-lg"
            />
          </div>
        )}
        
        {/* Action toolbar */}
        <div className="flex flex-wrap items-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2 flex-grow">
            {/* Media upload buttons */}
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="Add image"
              onClick={() => handleFileSelect("image")}
              disabled={isSubmitting}
            >
              <FiImage className="w-5 h-5" />
            </button>
            
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="Add video"
              onClick={() => handleFileSelect("video")}
              disabled={isSubmitting}
            >
              <FiVideo className="w-5 h-5" />
            </button>
            
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="Upload file"
              onClick={() => handleFileSelect("file")}
              disabled={isSubmitting}
            >
              <FiFile className="w-5 h-5" />
            </button>
            
            <button
              type="button"
              className={`p-2 ${isRecording ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700'} rounded-full transition-colors`}
              title={isRecording ? "Stop recording" : "Record audio"}
              onClick={handleVoiceRecording}
              disabled={isSubmitting}
            >
              <FiMic className="w-5 h-5" />
            </button>
            
            {/* Feature buttons */}
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-full transition-colors relative"
              title="Set donation goal"
              onClick={() => setShowDonationModal(true)}
              disabled={isSubmitting}
            >
              <FiDollarSign className="w-5 h-5" />
            </button>
            
            <button
              type="button"
              ref={emojiButtonRef}
              className={`p-2 ${showEmojiPicker ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700'} rounded-full transition-colors relative`}
              title="Add emoji"
              onClick={toggleEmojiPicker}
              disabled={isSubmitting}
            >
              <FiSmile className="w-5 h-5" />
            </button>
            
            <button
              type="button"
              className={`p-2 ${isPaidPost ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700'} rounded-full transition-colors`}
              title={isPaidPost ? "Remove paid content" : "Set as paid content"}
              onClick={togglePaidPost}
              disabled={isSubmitting}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 17h.01M17 7h.01M17 17h.01M3 3h18v18H3V3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 114 0 2 2 0 01-4 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5a2 2 0 114 0 2 2 0 01-4 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15a2 2 0 114 0 2 2 0 01-4 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15a2 2 0 114 0 2 2 0 01-4 0z" />
              </svg>
            </button>
            
            <button
              type="button"
              className={`p-2 ${isPrivatePost ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700'} rounded-full transition-colors`}
              title={isPrivatePost ? "Make public" : "Make private"}
              onClick={togglePrivatePost}
              disabled={isSubmitting}
            >
              <FiMessageCircle className={`w-5 h-5 ${isPrivatePost ? 'hidden' : 'block'}`} />
              <FiLock className={`w-5 h-5 ${isPrivatePost ? 'block' : 'hidden'}`} />
            </button>
          </div>
          
          {/* Post button */}
          <button
            type="submit"
            className="ml-auto px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isSubmitting || (!text && !uploadFile && !audioFile)}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <CgSpinner className="w-4 h-4 mr-2 animate-spin" />
                Posting...
              </span>
            ) : (
              "Post"
            )}
          </button>
        </div>
      </form>
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept="image/*"
      />
      
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute z-50 mt-2"
          style={{ top: emojiButtonRef.current?.getBoundingClientRect().bottom + window.scrollY + 'px', left: emojiButtonRef.current?.getBoundingClientRect().left + 'px' }}
        >
          <EmojiPicker onEmojiClick={addEmoji} previewConfig={{ showPreview: false }} />
        </div>
      )}
      
      {/* Price Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowPriceModal(false)}>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Set a price for your content</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price ($)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter price"
                value={tempPrice}
                onChange={(e) => setTempPrice(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setShowPriceModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                onClick={handleSetPrice}
              >
                Set Price
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Donation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowDonationModal(false)}>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Set a donation goal</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target amount ($)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter target amount"
                value={donationTarget}
                onChange={(e) => setDonationTarget(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setShowDonationModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                onClick={handleSetDonation}
              >
                Set Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBox;