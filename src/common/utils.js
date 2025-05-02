import NProgress from 'nprogress';
import 'nprogress/nprogress.css';


export const formatTime = (timestamp) => {
    if (timestamp) {
        const date = new Date(timestamp * 1000); // Convert to milliseconds
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0'); // Add leading zero if necessary
        const period = hours >= 12 ? 'PM' : 'AM'; // Determine AM or PM
        
        // Convert to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // 12 AM or 12 PM
        return `${hours}:${minutes} ${period}`;

    }
    return null
  };

export function formatTimeTo12Hour(timeString) {
    const date = new Date(timeString);

    if (isNaN(date.getTime())) {
        throw new Error("Invalid date string");
    }

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const amPm = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    hours = hours % 12 || 12;

    // Add leading zero to minutes if needed
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${hours}:${formattedMinutes} ${amPm}`;
}

export const capitalizeFirstLetters = (text) => {
    return text?.replace(/\b\w/g, char => char.toUpperCase());
  };

export const config = {
    onUploadProgress : (progressEvent) => {
      const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      NProgress.set(percentage / 100);
    },
  };

