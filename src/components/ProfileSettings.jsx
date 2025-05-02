import React, { useEffect, useState } from 'react';
import coverPhoto from "../imgs/cover-photo.png";
import cameraPhoto from "../imgs/photo-camera 2.png";
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { checkAuthentication } from '../store/authSlice';
import { toast } from 'react-toastify';
import statesOrigin from "../common/states.json"

const ProfileSettings = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const { user, unRead } = useSelector((state) => state.auth);
  const dispatch = useDispatch(); 
  const [profileImage, setProfileImage] = useState()
  const [coverImage, setCoverImage] = useState()
  const [file, setFile] = useState()
  const [coverFile, setCoverFile] = useState()
  const [updates, setUpdates] = useState({})
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [address, setAddress] = useState('');
  const api_token = "_rrkJj3DPDxvlsLQEJ8_9KnZydRBjIXkhIoRDIn-FpvThAVfQ8HDm18jeyzXu4dCxo"

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,flags'); // Get all countries
        const data = await response.data;
        const countryList = data.map((country) => ({
          name: country.name.common,
          flag: country.flags.svg,
          // flag: country.flags.png,
        }));
        setCountries(countryList.sort((a, b) => a.name.localeCompare(b.name))); // Sort alphabetically
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };

    // console.log(user.personal_info, "user.personal_info")

    // axios.get('https://www.universal-tutorial.com/api/getaccesstoken', {
    //   headers: {
    //     Accept: "application/json",
    //     "api-token": api_token,
    //     "user-email": "amusa.tongil@gmail.com"
    //   }
    // }).then((result) => setStateToken(() => result.data.auth_token));

    fetchCountries();
  }, []);

  // Fetch states when a country is selected
  useEffect(() => {
    const fetchStates = async () => {
      // if (!updates["personal_info.country"] && user.personal_info.country) return;
      try {
        const filteredState = updates["personal_info.country"]
        ? statesOrigin.filter((state) => state.country_name === updates["personal_info.country"])
        : user.personal_info.country
        ? statesOrigin.filter((state) => state.country_name === user.personal_info.country)
        : []
        setStates(filteredState);
      } catch (error) {
        console.error('Error fetching states:', error);
        setStates([]);
      }
    };

    fetchStates();
  }, [updates["personal_info.country"], user.personal_info.country]);

    const handleProfileImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setFile(() => file)
          const reader = new FileReader();
          reader.onloadend = () => {
              setProfileImage(reader.result);  // Save the image as a base64 string
              // Optionally, you could dispatch this to a Redux store or upload to a server
          };
          reader.readAsDataURL(file);
      }
  };

    const handleCoverImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setCoverFile(() => file)
          const reader = new FileReader();
          reader.onloadend = () => {
              setCoverImage(reader.result);  // Save the image as a base64 string
              // Optionally, you could dispatch this to a Redux store or upload to a server
          };
          reader.readAsDataURL(file);
      }
  };

  const updateField = (key, value) => {
    setUpdates({...updates, [key]: value})
  }

  const updateProfile = async () => {
    const formData = new FormData();
    try {
      // 
      if(file) {
        formData.append("profile_photo", file)
      }
      if(coverFile) {
        formData.append("cover_photo", coverFile)
        // console.log(coverFile, "coverFile")
      }
      Object.keys(updates).forEach((update) => {
        formData.append(update, updates[update])
      })
      const response = await axios.patch(`${baseUrl}/api/auth/profile`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
  
      if (response) {
        setFile()
        setUpdates({})
        setProfileImage()
        dispatch(checkAuthentication())
            .unwrap()
            .then(() => {
                // 
                toast.info("Successfully updated profile")
            })
            .catch((err) => {
                // 
            });
      }
    } catch (error) {
      toast.error("No changes detected!")
      // console.log(error, "error")
    }
  }

  useEffect(() => {
    // 
    // "personal_info.fullname",
    //         "personal_info.username",
    //         "personal_info.bio",
    //         "personal_info.country",
    //         "personal_info.state",
    //         "personal_info.address",
    //         "personal_info.profile_img",
    //         "personal_info.cover_img",
    //         "social_links.youtube",
    //         "social_links.instagram",
    //         "social_links.facebook",
    //         "social_links.twitter",
    //         "social_links.github",
    //         "social_links.website",
    const spUpdates = {};
    spUpdates["personal_info.fullname"] = user.personal_info.fullname
    spUpdates["personal_info.username"] = user.personal_info.username
    spUpdates["personal_info.bio"] = user.personal_info.bio
    spUpdates["personal_info.address"] = user.personal_info.address
    spUpdates["social_links.youtube"] = user.social_links.youtube
    spUpdates["social_links.instagram"] = user.social_links.instagram
    spUpdates["social_links.facebook"] = user.social_links.facebook
    spUpdates["social_links.twitter"] = user.social_links.twitter
    spUpdates["social_links.github"] = user.social_links.github
    spUpdates["social_links.website"] = user.social_links.website
    setUpdates(() => spUpdates)
  }, [])
  

  return (
    <div className='overflow-y-auto hide-scrollbar max-h-screen pb-[150px] w-full font-montserrat'>
      <h2 className="text-2xl font-bold my-6">Profile</h2>
      <div className=""></div>
      {/* Header Section */}
      {/* coverImage */}
        <div className="relative mb-12">
            <div className="relative w-full h-40">
              <img loading="lazy" 
                src={coverImage || user.personal_info.cover_img || coverPhoto} 
                alt="Cover" 
                className="w-full h-40 object-cover"
              />
              <div className="absolute top-0 left-0 w-full h-full rounded-full flex items-center justify-center z-4"><img src={cameraPhoto} alt="" className="" /></div>
              <input type="file" onChange={handleCoverImageChange} name="" id="" className='absolute w-full h-full rounded-full opacity-0 top-0 left-0 z-5' />
            </div>
            <div className="absolute absolute -bottom-10 left-5 w-20 rounded-full h-20 border-4 border-white">
              <div className="relative w-full h-full">
                <img loading="lazy" 
                  src={profileImage || user.personal_info.profile_img} 
                  alt="Profile" 
                  className="rounded-full w-full h-full"
                />
                <div className="absolute top-0 left-0 w-full h-full rounded-full flex items-center justify-center z-4"><img src={cameraPhoto} alt="" className="" /></div>
                <input type="file" onChange={handleProfileImageChange} name="" id="" className='absolute w-full h-full rounded-full opacity-0 top-0 left-0 z-5' />
              </div>
            </div>
        </div>
      <div className="space-y-4">
        <div>
          <input
            type="text"
            value={updates["personal_info.username"]} // ||user.personal_info.username}
            placeholder="Username"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <input
            type="text"
            onChange={(e) => {updateField("personal_info.fullname", e.target.value)}}
            value={updates["personal_info.fullname"]} // || user.personal_info.fullname}
            placeholder="Display Name"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <textarea
            placeholder="Bio"
            onChange={(e) => {updateField("personal_info.bio", e.target.value)}}
            value={updates["personal_info.bio"]} // || user.personal_info.bio}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows="1"
          ></textarea>
        </div>
        <div>
          <select
            id="country"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={updates["personal_info.country"] || user.personal_info.country}
            onChange={(e) => {updateField("personal_info.country", e.target.value)}}
          >
            <option value="">Select a country</option>
            {countries.map((country, index) => (
              <option key={index} value={country.name} className='flex  gap-2'>
                {/* <img loading='lazy' src={country.flag} alt="" className="h-4 w-4" /> */}
                {/* {country.flag} */}
                {/* <object
                  type="image/svg+xml"
                  data={country.flag}
                  className="w-8 h-8"
                  aria-label="My SVG Icon"
                ></object> */}
                {country.name}
              </option>
            ))}
          </select>
          {/* <input
            type="text"
            onChange={(e) => {updateField("personal_info.fullname", e.target.value)}}
            value={updates["personal_info.fullname"] || user.personal_info.fullname}
            placeholder="Display Name"
            className="w-full p-2 border border-gray-300 rounded-md"
          /> */}
        </div>
        <div>
          <select
            id="state"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={updates["personal_info.state"] || user.personal_info.state}
            onChange={(e) => {updateField("personal_info.state", e.target.value)}}
            disabled={!states.length}
          >
            <option value="">Select a state</option>
            {states.map((state, index) => (
              <option key={index} value={state.name}>
                {state.name}
              </option>
            ))}
          </select>
          {/* <input
            type="text"
            onChange={(e) => {updateField("personal_info.fullname", e.target.value)}}
            value={updates["personal_info.fullname"] || user.personal_info.fullname}
            placeholder="Display Name"
            className="w-full p-2 border border-gray-300 rounded-md"
          /> */}
        </div>
        <div>
          <input
            type="text"
            onChange={(e) => {updateField("personal_info.address", e.target.value)}}
            value={updates["personal_info.address"]} // || user.personal_info.address}
            placeholder="Enter Address"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Website"
            onChange={(e) => {updateField("social_links.website", e.target.value)}}
            value={updates["social_links.website"]} // || user.social_links.website}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Youtube"
            onChange={(e) => {updateField("social_links.youtube", e.target.value)}}
            value={updates["social_links.youtube"]} // || user.social_links.youtube}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Instagram"
            onChange={(e) => {updateField("social_links.instagram", e.target.value)}}
            value={updates["social_links.instagram"]} // || user.social_links.instagram}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Facebook"
            onChange={(e) => {updateField("social_links.facebook", e.target.value)}}
            value={updates["social_links.facebook"]} // || user.social_links.facebook}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Twitter"
            onChange={(e) => {updateField("social_links.twitter", e.target.value)}}
            value={updates["social_links.twitter"]} // || user.social_links.twitter}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Github"
            onChange={(e) => {updateField("social_links.github", e.target.value)}}
            value={updates["social_links.github"]} // || user.social_links.github}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        {/* <div>
          <select className="w-full p-2 border border-gray-300 rounded-md">
            <option>Set Location</option>
            <option>USA</option>
            <option>Canada</option>
          </select>
        </div> */}
        <button className="bg-orange-500 text-white px-4 py-2 mb-10 rounded-md" onClick={updateProfile}>Save</button>
      </div>
    </div>
  );
};

export default ProfileSettings;