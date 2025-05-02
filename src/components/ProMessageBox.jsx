import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Picker } from "emoji-mart";
// import "emoji-mart/css/emoji-mart.css";

// ProMessageBox Component
const ProMessageBox = () => {
  // State variables to manage user inputs
  const [action, setAction] = useState(null); // Tracks the selected action
  const [text, setText] = useState(""); // Text input
  const [selectedFile, setSelectedFile] = useState(null); // File upload (image/video)
  const [audioBlob, setAudioBlob] = useState(null); // Audio recording (blob format)
  const [eventDate, setEventDate] = useState(null); // Event scheduling date
  const [emoji, setEmoji] = useState(null); // Selected emoji

  // MediaRecorder setup (for audio recording)
  const [isRecording, setIsRecording] = useState(false); // Recording status
  const [mediaRecorder, setMediaRecorder] = useState(null); // MediaRecorder instance
  const [audioChunks, setAudioChunks] = useState([]); // Stores audio data chunks

  // Reference to audio player for preview
  const audioPlayerRef = useRef(null);

  // Handling button clicks (for different actions like uploading file, scheduling, etc.)
  const handleButtonClick = (label) => {
    setAction(label); // Set the action based on the button clicked
  };

  // Handling text input
  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  // Handling file selection (image, video, or generic files)
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(URL.createObjectURL(file)); // Store the file for preview
    }
  };

  // Handling audio recording with MediaRecorder
  const handleStartRecording = async() => {
    // Request audio recording permissions from the user
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const recorder = new MediaRecorder(stream); // Create a new MediaRecorder instance
        setMediaRecorder(recorder);

        recorder.ondataavailable = (e) => {
          setAudioChunks((prevChunks) => [...prevChunks, e.data]); // Append audio chunks
        };

        recorder.onstop = () => {
          const blob = new Blob(audioChunks, { type: "audio/mp3" }); // Combine chunks into a blob
          setAudioBlob(URL.createObjectURL(blob)); // Set the blob for playback preview
          setIsRecording(false); // Update state to indicate recording is stopped
        };

        recorder.start(); // Start recording
        setIsRecording(true); // Update state to indicate recording is in progress
      })
      .catch((err) => {
        console.error("Error accessing microphone: ", err);
        alert("Unable to access microphone. Please check your device settings.");
      });
  };

  const handleStopRecording = async() => {
    try {
        await mediaRecorder?.stop(); // Stop the recording when the user finishes
        setIsRecording(false); // Update state to indicate recording is stopped
    } catch (error) {
        // console.log("stop recording error")
    }
  };

  // Handling emoji selection
  const handleEmojiSelect = (emoji) => {
    setEmoji(emoji.native); // Store selected emoji for preview
  };

  // Handling event date selection
  const handleDateChange = (date) => {
    setEventDate(date); // Store selected event date
  };

  // Rendering the UI based on selected action (File upload, Audio recording, Emoji, etc.)
  const renderAction = () => {
    switch (action) {
      case "Image":
      case "Video":
        return (
          <input
            type="file"
            accept={`${action === "Image" ? "image/*" : "video/*"}`}
            onChange={handleFileChange}
          />
        );
      case "Audio":
        return (
          <>
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className="bg-blue-500 text-white p-2 rounded"
            >
              {isRecording ? "Stop Recording" : "Start Recording"}
            </button>
          </>
        );
      case "Event":
        return <DatePicker selected={eventDate} onChange={handleDateChange} />;
      case "Emoji":
        return <Picker onSelect={handleEmojiSelect} />;
      default:
        return null;
    }
  };

  // Rendering the post preview (text, file, audio, emoji, event)
  const renderPreview = () => {
    return (
      <div className="post-preview mt-8 border rounded-lg p-4">
        <h3 className="font-semibold text-lg">Post Preview</h3>
        {/* Displaying the text */}
        <div className="text-preview mt-2">{text}</div>

        {/* Displaying the file (image/video) */}
        {selectedFile && (
          <div className="file-preview mt-4">
            {action === "Image" ? (
              <img loading="lazy" src={selectedFile} alt="Preview" className="max-w-full" />
            ) : action === "Video" ? (
              <video loading="lazy" controls className="max-w-full">
                <source src={selectedFile} type="video/mp4" />
              </video>
            ) : null}
          </div>
        )}

        {/* Displaying the audio */}
        {audioBlob && (
          <div className="audio-preview mt-4">
            <audio controls ref={audioPlayerRef}>
              <source src={audioBlob} type="audio/mp3" />
            </audio>
          </div>
        )}

        {/* Displaying the event date */}
        {eventDate && (
          <div className="event-preview mt-4">
            <p>Event scheduled for: {eventDate.toString()}</p>
          </div>
        )}

        {/* Displaying the emoji */}
        {emoji && (
          <div className="emoji-preview mt-4">
            <p>Selected Emoji: {emoji}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="message-box">
      <div className="buttons flex justify-center items-center flex-wrap space-x-4 p-8">
        {/* Button for Image */}
        <button
          onClick={() => handleButtonClick("Image")}
          className="bg-gray-200 p-4 rounded-lg hover:bg-gray-300"
        >
          <img loading="lazy" src="image-icon.png" alt="Image" className="w-12 h-12" />
          <p>Image</p>
        </button>
        {/* Button for Video */}
        <button
          onClick={() => handleButtonClick("Video")}
          className="bg-gray-200 p-4 rounded-lg hover:bg-gray-300"
        >
          <img loading="lazy" src="video-icon.png" alt="Video" className="w-12 h-12" />
          <p>Video</p>
        </button>
        {/* Button for Audio */}
        <button
          onClick={() => handleButtonClick("Audio")}
          className="bg-gray-200 p-4 rounded-lg hover:bg-gray-300"
        >
          <img loading="lazy" src="audio-icon.png" alt="Audio" className="w-12 h-12" />
          <p>Audio</p>
        </button>
        {/* Button for Emoji */}
        <button
          onClick={() => handleButtonClick("Emoji")}
          className="bg-gray-200 p-4 rounded-lg hover:bg-gray-300"
        >
          <img loading="lazy" src="emoji-icon.png" alt="Emoji" className="w-12 h-12" />
          <p>Emoji</p>
        </button>
        {/* Button for Event */}
        <button
          onClick={() => handleButtonClick("Event")}
          className="bg-gray-200 p-4 rounded-lg hover:bg-gray-300"
        >
          <img loading="lazy" src="date-icon.png" alt="Event" className="w-12 h-12" />
          <p>Event</p>
        </button>
      </div>

      {/* Text Input */}
      <div className="content p-4">
        <textarea
          className="border rounded-lg p-2 w-full"
          placeholder="Write your message here..."
          value={text}
          onChange={handleTextChange}
        ></textarea>

        {/* Render the action content (file upload, audio recording, emoji picker, etc.) */}
        <div className="action-content mt-4">{renderAction()}</div>

        {/* Render the preview of the post */}
        {renderPreview()}
      </div>
    </div>
  );
};

export default ProMessageBox;
