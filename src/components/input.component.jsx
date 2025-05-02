import { useState } from "react";

const InputBox = ({ name, type, id, value, placeholder, icon, onChange = () => {} }) => {
    const [passwordVisible, setPasswordVisible] = useState(false);

    return (
        <div className="relative flex items-center w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-4">
    {/* Left-aligned Icon */}
            <i className={`fi ${icon} text-gray-500 mr-3`}></i>
            
            {/* Input Field */}
            <input
                name={name}
                type={type === "password" ? (passwordVisible ? "text" : "password") : type}
                placeholder={placeholder}
                defaultValue={value}
                id={id}
                onChange={onChange}
                className="w-full border-none bg-transparent focus:outline-none"
            />

            {/* Right-aligned Password Toggle */}
            {type === "password" && (
                <i
                    className={`fi fi-rr-eye${!passwordVisible ? "-crossed" : ""} text-gray-500 cursor-pointer ml-3`}
                    onClick={() => setPasswordVisible((currentVal) => !currentVal)}
                ></i>
            )}
        </div>
    );
};

export default InputBox;
