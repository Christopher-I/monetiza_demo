import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { loading as loader } from "../store/authSlice";

const AddPostComponent = () => {
  const dispatch = useDispatch();
    const baseUrl = import.meta.env.VITE_BASE_URL;
  const [file, setFile] = useState(null); // Stores the selected file
  const [uploading, setUploading] = useState(false); // Indicates upload status
  const [previewURL, setPreviewURL] = useState(""); // Stores the preview URL for display

  const navigate = useNavigate()

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setPreviewURL(URL.createObjectURL(selectedFile)); // Generate a preview URL
  };

  const addPost = async () => {
    if (!file) {
      toast.error("Please select a file to upload!");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      dispatch(loader())
      setUploading(true);
      const response = await axios.post(`${baseUrl}/api/post/status`, formData, {
        // ...config,
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      })
    //   axios.post(`${baseUrl}/api/post/status`, formData, {
    //     headers: {
    //       "Content-Type": "multipart/form-data",
    //       withCredentials: true,
    //     },
    //   });
    //   axios.get(`${baseUrl}/api/post/status`, {
    //     headers: { "Content-Type": "application/json" },
    //     withCredentials: true,
    //     })
      // console.log("Post uploaded successfully:", response.data);
      toast.success("Post uploaded successfully!");
      navigate("/feed")
    } catch (error) {
      console.error("Error uploading post:", error);
      toast.error("Failed to upload post. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative h-screen flex flex-col items-center bg-gray-50 pt-[60px]">
      {/* Header Section */}
      <div className="absolute top-0 w-full flex items-center justify-between px-4 py-3 bg-white shadow-md">
        <h2 className="text-lg font-bold">New Story</h2>
        <button
          onClick={addPost}
          disabled={uploading}
          className={`px-6 py-1 rounded-full text-white font-medium ${
            uploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-orange-600 hover:bg-orange-700"
          }`}
        >
          {uploading ? "Uploading..." : "Post"}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-1 relative">
        {previewURL ? (
          <div className="w-full h-full">
            {/* Render Image or Video */}
            {file?.type.startsWith("image") ? (
              <img
                src={previewURL}
                alt="Preview"
                className="w-full h-full rounded-md shadow-lg object-cover"
              />
            ) : (
              <video
                src={previewURL}
                controls
                className="w-full h-full rounded-md shadow-lg"
              />
            )}
          </div>
        ) : (
          <div className="w-full text-center text-gray-500">
            <p className="text-sm">No file selected</p>
          </div>
        )}

        {/* File Input */}
        {/* <label
          htmlFor="fileInput"
          className="mt-4 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-orange-600"
        >
          Choose a File
        </label> */}
        <input
          id="fileInput"
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="absolute bg-gray-600 w-full h-full opacity-0"
        />
      </div>

      {/* Share Button at the bottom right */}
      <button
        onClick={addPost}
        disabled={uploading}
        className="absolute bottom-6 right-6 px-6 py-2 rounded-xl bg-orange-600 text-white font-bold shadow-lg hover:bg-orange-700"
      >
        Share Now
      </button>
    </div>
  );
};



const AddNewStatus = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const addPost = async () => {
    if (!file) {
      toast.info("Please select a file to upload!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const response = await axios.post("https://your-api-endpoint.com/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // console.log("Post uploaded successfully:", response.data);
      toast.info("Post uploaded successfully!");
    } catch (error) {
      console.error("Error uploading post:", error);
      toast.info("Failed to upload post. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow-md w-full max-w-md">
      <h2 className="text-lg font-bold mb-4">Add a New Post</h2>
      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-indigo-50 file:text-indigo-700
          hover:file:bg-indigo-100"
      />
      {file && (
        <p className="text-sm text-gray-700 mt-2">
          Selected file: <span className="font-medium">{file.name}</span>
        </p>
      )}
      <button
        onClick={addPost}
        disabled={uploading}
        className={`mt-4 px-6 py-2 rounded-md text-white font-medium ${
          uploading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {uploading ? "Uploading..." : "Post"}
      </button>
    </div>
  );
};

export default AddPostComponent;
