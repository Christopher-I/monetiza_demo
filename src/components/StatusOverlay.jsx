import React, { useState, useEffect, useRef } from 'react';

const statusesData = [
  {
    id: 1,
    user: 'John Doe',
    media: 'https://placeimg.com/640/480/tech', // Image URL
    type: 'image', // 'image' or 'video'
    viewed: false,
    caption: "",
    image: "",
    video: "",
    author: "",
    createdAt: "",
  },
  {
    id: 2,
    user: 'Jane Smith',
    media: 'https://www.w3schools.com/html/mov_bbb.mp4', // Video URL
    type: 'video', // 'image' or 'video'
    viewed: false,
  },
  {
    id: 3,
    user: 'John Doe',
    media: 'https://placeimg.com/640/480/nature', // Image URL
    type: 'image',
    viewed: false,
  },
  // Add more statuses
];

const StatusOverlay = ({ selectedStatus = [], onClose = () => {} }) => {
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [internalStatusIndex, setInternalStatusIndex] = useState(0);
  const [timer, setTimer] = useState(null);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    // Mark current status as viewed
    // statusesData[currentStatusIndex].viewed = true;

    // Set the timer based on media type
    // let timery;
    if (selectedStatus[currentStatusIndex].image?.length > 0) {
      // setTimer(setTimeout(nextStatus, 30000)); // 30 seconds for images
      if (currentStatusIndex == (selectedStatus.length - 1)){
        setTimer(setTimeout(onClose, 10000));
        // timery = setTimeout(onClose, 30000)
      } else {
        setTimer(setTimeout(nextStatus, 10000));
        // timery = setTimeout(nextStatus, 30000)
      }
      setDuration(10)
    } else if (selectedStatus[currentStatusIndex].video?.length > 0) {
      // setTimer(setTimeout(nextStatus, 30000)); // 30 seconds for videos
      // if (currentStatusIndex == (selectedStatus.length - 1)){
      //   // setTimer(setTimeout(onClose, 30000));
      //   timery = setTimeout(onClose, 28000)
      // } else {
      //   // setTimer(setTimeout(nextStatus, 30000));
      //   timery = setTimeout(nextStatus, 28000)
      // }
    }

    return () => {
      clearTimeout(timer); // Clear the timer on unmount or status change
    };
  }, [currentStatusIndex]);

  const nextStatus = () => {
    // Move to the next status of the same user
    let nextIndex = currentStatusIndex + 1;
    if (nextIndex >= selectedStatus.length) {
      nextIndex = 0; // Loop back to the first status
    }
    setCurrentStatusIndex(nextIndex);
  };

  const prevStatus = () => {
    // Move to the previous status of the same user
    let prevIndex = currentStatusIndex - 1;
    if (prevIndex < 0) {
      prevIndex = selectedStatus.length - 1; // Loop back to the last status
    }
    setCurrentStatusIndex(prevIndex);
  };

  const handleMetadata = () => {
    if (videoRef.current) {
      let timery;
      // let numString = `${videoRef.current.duration}000`
      let dur = Number(videoRef.current.duration * 1000)
      // console.log(numString, "numString")
      if (currentStatusIndex == (selectedStatus.length - 1)){
        // console.log(dur, "dur")
        // setTimer(setTimeout(onClose, 30000));
        timery = setTimeout(onClose, dur)
      } else {
        // setTimer(setTimeout(nextStatus, 30000));
        timery = setTimeout(nextStatus, dur)
      }
      setDuration(() => videoRef.current.duration);
      if (timery) {
        return clearTimeout(timery);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center">
      {/* Content */}
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <button
          className="absolute top-4 left-4 text-3xl h-12 w-12 text-white font-bold p-2 rounded-full bg-black bg-opacity-50 rotate-45"
          onClick={onClose}
        >
          +
        </button>

        {/* Navigation */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white text-4xl cursor-pointer p-4" onClick={prevStatus}>
          &#10094;
        </div>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white text-4xl cursor-pointer p-4" onClick={nextStatus}>
          &#10095;
        </div>

        {/* status count */}
        <div className="flex w-full px-20 py-4 gap-4">
          {selectedStatus && selectedStatus?.map((item, index) => (
            <div className="bg-gray-300 mt-4 flex-1 h-2 relative rounded-full flex">
              {index < currentStatusIndex && <div className="flex-1 rounded-full bg-white w-full"></div>}
              {/* {index === currentStatusIndex && <div className="flex-1 rounded-full overlay"></div>} */}
              {index === currentStatusIndex && !!duration && <div className="flex-1 rounded-full absolute top-0 left-0 h-full bg-white" style={{ width: "0%", animation: `fillEffect ${duration}s linear forwards`, }}></div>}
            </div>
          ))}
        </div>

        {/* Status Content */}
        <div className="w-full h-full flex items-center justify-center">
          {selectedStatus[currentStatusIndex].image ? (
            <img loading="lazy"
              className="object-contain max-h-full w-4/5"
              src={selectedStatus[currentStatusIndex].image}
              alt={`Status from ${selectedStatus[currentStatusIndex].user}`}
            />
          ) : selectedStatus[currentStatusIndex].video ? (
            <video loading="lazy"
              ref={videoRef}
              onLoadedMetadata={handleMetadata}
              className="max-h-full w-4/5 object-contain"
              // onContextMenu={false}
              controlsList='nodownload'
              autoPlay
            //   loop
              muted
              src={selectedStatus[currentStatusIndex].video}
              onEnded={nextStatus}
            />
          ): null}
        </div>
      </div>
    </div>
  );
};

export default StatusOverlay;
