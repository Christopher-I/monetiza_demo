import React, { useState, useEffect } from 'react';
import withProtectedRoute from "../hoc/ProtectedRoute";
import WYSIWYGEditor from '../components/WYSIWYGEditor';
import DragDropFile from '../components/DragDropFile';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { loading as loader } from "../store/authSlice";

const ContentForm = () => {
  const dispatch = useDispatch();
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [category, setCategory] = useState("");
  const [caption, setCaption] = useState();
  const [image, setImage] = useState();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const navigate = useNavigate();

  const { id } = useParams();

  function stripHtmlTags(input) {
    var doc = new DOMParser().parseFromString(input, 'text/html');
    return doc.body.textContent || "";
  }

  const handleAddTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();

      const trimmedTag = tagInput.trim();
      if (trimmedTag && !tags.includes(trimmedTag)) {
        setTags([...tags, trimmedTag]);
      }

      setTagInput(""); // Clear input
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const draftPost = async () => {
    // { caption, publishDate, category, tags }
    if (!date || !time) {
      toast.error("Please fill out both date and time fields.");
      return;
    }

    const formData = new FormData();
    try {
      dispatch(loader())
      formData.append("tags", tags)
      formData.append("category", category)
      formData.append("publishDate", `${date}T${time}:00Z`)
      formData.append("caption", stripHtmlTags(caption) === "undefined" ? "" : stripHtmlTags(caption))
      formData.append("image", image)
      const response = await axios.patch(`${baseUrl}/api/post/draft/${id}`, formData, {
        // {...formData, ...uploadData}, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (response) {
        toast.info(response.data.message)
        navigate("/content");
      }
    } catch (error) {
      toast.error(error.response.data.message || error.message)
    }
  }

  useEffect(() => {
    // first
    axios.get(`${baseUrl}/api/post/post/${id}`, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    }).then((result) => {
      // 
      setTags(result.data.post.tags)
      setCategory(result.data.post.category)
      setCaption(result.data.post.caption != undefined ? result.data.post.caption: "")
      setImage(result.data.post.image || result.data.post.video)
      setDate(new Date(result.data.post.publishedAt).toISOString().split("T")[0])
      setTime(`${new Date(result.data.post.publishedAt).getHours().toString().padStart(2, '0')}:${new Date(result.data.post.publishedAt).getMinutes().toString().padStart(2, '0')}`)
    }).catch((error) => {
      // 
    })
  
    return () => {
      // second
    }
  }, [])
  

  return (
    <div className="flex-1 bg-white px-8 rounded-lg shadow-md flex lg:grid flex-col lg:grid-cols-3 gap-4 overflow-y-auto max-h-screen pb-0">
    {/* <div className="flex-1 bg-white px-8 rounded-lg shadow-md grid grid-cols-3 gap-4"> */}
      
      {/* Left Section */}
      <div className="col-span-2 flex-1 space-y-4 lg:border-r border-gray-400 pr-4 pt-8">
      {/* <div className="col-span-2 space-y-4 border-r border-gray-400 pr-4 pt-8"> */}
        {/* heading */}
        <div className="space-y-1">
            <h1 className="text-xl font-bold">Content Management</h1>
            <p className="text-gray-500 text-lg">Organize and schedule your content</p>
        </div>

        {/* Language and Audience */}
        {/* <div className="flex space-x-4 justify-end">
          <select className="border p-2 rounded-lg w-26">
            <option>English</option>
            <option>Spanish</option>
          </select>
          <select className="border p-2 rounded-lg w-26">
            <option>Globally</option>
            <option>Regionally</option>
          </select>
        </div> */}

        {/* Post Section */}
        <div className="space-y-2">
          <h2 className="font-semibold text-gray-500 text-lg">Post</h2>
          <WYSIWYGEditor content={caption} setContent={setCaption} />
        </div>

        {/* Image Upload Section */}
        <div className="space-y-4">
          <h2 className="font-semibold">Image</h2>
          <DragDropFile file={image} setFile={setImage} />
          {/* <input 
            type="text" 
            placeholder="Caption" 
            className="w-full p-3 border rounded-lg"
          /> */}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex flex-col space-y-6 pt-8">
        <button className="bg-orange-500 self-end text-white px-6 py-3 rounded-lg w-24" onClick={draftPost}>
          Update
        </button>

        {/* Post Date */}
        <div className='flex flex-col'>
          <label className="text-gray-700">Post Date</label>
          <input type="date" className="border p-3 rounded-lg w-3/4 mt-2" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        {/* Post Time */}
        <div className='flex flex-col'>
          <label className="text-gray-700">Post Time</label>
          <input type="time" className="border p-3 rounded-lg w-3/4 mt-2" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>

        {/* Category */}
        {/* <div className='flex flex-col'>
          <label className="text-gray-700">Category</label>
          <select className="border p-3 rounded-lg w-3/4 mt-2" onChange={(e) => setCategory(e.target.value)}>
            <option>Technology</option>
            <option>Health</option>
            <option>Lifestyle</option>
          </select>
        </div> */}

        {/* Tags */}
        {/* <div className="flex flex-col w-3/4"> */}
          {/* Input Label */}
          {/* <label className="text-gray-700 mb-2">Tags</label> */}

          {/* Input for Tags */}
          {/* <input
            type="text"
            className="border p-3 rounded-lg w-full mt-2"
            placeholder="Add tags (Press Enter or Comma)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
          /> */}

          {/* Display Tags */}
          {/* <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <div
                key={index}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2"
              >
                <span>{tag}</span>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveTag(tag)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div> */}
        {/* </div> */}
      </div>
    </div>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export default withProtectedRoute(ContentForm, 'content');