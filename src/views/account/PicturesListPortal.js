import React from "react";
import { createPortal } from "react-dom";
import { useUserStore } from "../../hooks/user-store";

const PicturesListPortal = ({ setIsShowingPictures }) => {
  const { currentUser, pictureDatas } = useUserStore();

  const handleClickOutside = (event) => {
    const clickElement = event.target;
    if (!(clickElement.closest(".pictures-list .body"))) {
      setIsShowingPictures(false);
    }
  };

  return createPortal((
    <div className="pictures-list fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center" onClick={handleClickOutside}>
      <div className="body bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Pictures</h2>
        <div className="grid grid-cols-2 gap-4">
          {pictureDatas?.map((picture) => (
            <div key={picture?.id} className="picture-card bg-gray-100 p-4 rounded-lg flex flex-col items-center shadow-md">
              <img src={picture?.url} alt="Picture" className="w-full h-32 object-cover rounded-lg mb-2"/>
              <span className="text-lg font-semibold text-black text-center">{picture?.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ), document.body);
};

export default PicturesListPortal;
