import React, { useState } from "react";
import mastercard from "../imgs/mastercard.png";
import paypal from "../imgs/paypal.png";
import visa from "../imgs/visa.png";
import cardImg from "../imgs/cards.png";
import checkMark from "../imgs/check-mark.png";
import checkMarkc from "../imgs/check-mark-c.png";
import dot from "../imgs/dot.png";

const CardItem = ({ card, onRemove, onEdit, onSetDefault }) => {
  const [showOptions, setShowOptions] = useState(false);

  // Use the top-level paymentMethodId
  const paymentMethodId = card.paymentMethodId;

  const toggleOptions = (e) => {
    e.stopPropagation();
    // console.log("toggleOptions called for", paymentMethodId);
    setShowOptions((prev) => !prev);
  };

  return (
    <div className="flex justify-between items-center relative">
      <div
        className={`border rounded-3xl w-[90%] p-4 flex items-center justify-between ${
          card.isDefault ? "border-[var(--main-color)]" : "border-gray-300"
        }`}
      >
        {/* Card icon and details */}
        <div>
          <img
            loading="lazy"
            src={
              card.brand === "visa"
                ? visa
                : card.brand === "mastercard"
                ? mastercard
                : card.brand === "paypal"
                ? paypal
                : cardImg
            }
            className="w-[2.5rem] h-[2.5rem] sm:w-[3.2rem] sm:h-[3.2rem]"
            alt={card.brand}
          />
          <p className="font-afacad text-[20px] xs:text-[22px] sm:text-[25px]">
            Expires
          </p>
        </div>
        <div>
          <p className="font-afacad text-[18px] xs:text-[22px] sm:text-[25px]">
            {`**** **** **** ${card.last4}`}
          </p>
          <p className="font-afacad text-[15px] xs:text-[20px] sm:text-[22px]">
            {`${card.exp_month}/${card.exp_year}`}
          </p>
        </div>
        <div>
          {card.isDefault ? (
            <div className="text-end">
              <img loading="lazy" src={checkMarkc} className="ml-auto" alt="Default" />
              <p className="font-afacad mt-1 text-[15px] xs:text-[20px] sm:text-[22px]">
                Default
              </p>
            </div>
          ) : (
            <img loading="lazy" src={checkMark} alt="Not default" />
          )}
        </div>
      </div>
      <div className="relative">
        <button
          onClick={toggleOptions}
          className="text-gray-500 hover:text-black focus:outline-none"
        >
          <img loading="lazy" src={dot} className="w-[2rem] h-[2rem]" alt="Toggle Options" />
        </button>
        {showOptions && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded shadow z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // console.log("Remove Card clicked:", paymentMethodId);
                onRemove(paymentMethodId);
              }}
              className="font-montserrat block w-full text-left px-4 py-2 text-sm text-[#FF3D00] hover:bg-gray-100 border-b border-gray-300"
            >
              Remove Card
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // console.log("Edit Card clicked:", paymentMethodId);
                onEdit(card);
              }}
              className="font-montserrat block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-300"
            >
              Edit Card
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // console.log("Set as default clicked:", paymentMethodId);
                onSetDefault(paymentMethodId);
              }}
              className="font-montserrat block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Set as default
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardItem;
