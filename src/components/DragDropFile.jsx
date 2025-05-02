import React, { useState } from 'react';

const DragDropFile = ({file, setFile}) => {
  const [dragging, setDragging] = useState(false);
  const [loadedImg, setLoadedImg] = useState()

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const uploadedFile = e.dataTransfer.files[0];
    setFile(() => uploadedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLoadedImg(reader.result);  // Save the image as a base64 string
        // Optionally, you could dispatch this to a Redux store or upload to a server
    };
    reader.readAsDataURL(uploadedFile);
  };

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(() => uploadedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLoadedImg(reader.result);  // Save the image as a base64 string
        // Optionally, you could dispatch this to a Redux store or upload to a server
    };
    reader.readAsDataURL(uploadedFile);
    // console.log(file)
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-6 h-64 ${
        dragging ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        backgroundImage: `url(${file || loadedImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex h-full flex-col items-center justify-center">
        {loadedImg ? null : <p className="text-gray-500">Upload a file or drag and drop</p>}
        <input 
          type="file" 
          className="hidden" 
          id="fileUpload" 
          onChange={handleFileChange}
        />
        <label 
          htmlFor="fileUpload" 
          className="mt-4 px-4 py-2 border rounded-lg cursor-pointer"
        >
          Upload File
        </label>

        {/* {file && (
          <div className="mt-4 text-gray-700">
            <p>{file.name}</p>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default DragDropFile;