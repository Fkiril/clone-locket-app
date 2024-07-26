import { useState } from "react";
import { FaCamera } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import PictureController from "../../controllers/picture-controller";
import { useUserStore } from "../../hooks/user-store";
import Picture, { ScopeEnum } from "../../models/entities/picture";

export default function UploadPictureView() {
  const { currentUser, friendsData } = useUserStore();
  const currentPicture = new Picture("", currentUser.id);

  const [optionFile, setoptionFile] = useState(null);
  const [optionFileUrl, setoptionFileUrl] = useState("");

  const [text, setText] = useState("");
  const [scope, setScope] = useState(ScopeEnum.PUBLIC);
  const [showScopeOption, setShowScopeOption] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);

  const handlePicture = (event) => {
    if (event.target.files[0]) {
      setoptionFile(event.target.files[0]);
      setoptionFileUrl(URL.createObjectURL(event.target.files[0]));
    }
  };

  const submitOption = async () => {
    currentPicture.text = text;
    currentPicture.scope = scope;

    currentPicture.canSee = [currentUser.id];
    if (scope === ScopeEnum.SPECIFY) {
      currentPicture.canSee.push(...selectedFriends);
    } else if (scope === ScopeEnum.PUBLIC) {
      currentPicture.canSee.push(...currentUser.friends);
    }

    await PictureController.uploadPicture(currentPicture, optionFile);

    setoptionFile(null);
    setoptionFileUrl("");
  };

  const cancelOption = () => {
    const fileInput = document.getElementById("file");
    fileInput.value = "";

    setoptionFile(null);
    setoptionFileUrl("");
  };

  const handleText = (event) => {
    setText(event.target.value);
  };

  const checkTextInputLength = () => {
    const textInput = document.getElementById("text-input");
    if (textInput.value.length >= 35) {
      toast.warning("Text input can be up to 35 characters!");
    }
  };

  const handleShowScopeOption = () => {
    setShowScopeOption(!showScopeOption);
  };

  const handleFriendCheckboxChange = (friendId) => {
    setSelectedFriends((prevSelected) => {
      if (prevSelected.includes(friendId)) {
        return prevSelected.filter((id) => id !== friendId);
      } else {
        return [...prevSelected, friendId];
      }
    });
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <div className="header mb-4">
        <button onClick={() => document.getElementById("home").click()}>
          <Link id="home" to="/home" className="text-blue-500 underline">
            Home
          </Link>
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <div className="flex flex-col items-center mb-4">
          <FaCamera className="text-5xl text-gray-500 mb-2" />
          <button
            type="button"
            onClick={() => document.getElementById("file").click()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Choose Picture
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={handlePicture}
            />
          </button>
        </div>
        {optionFileUrl && (
          <div className="option-picture">
            <div className="scope-select mb-4">
              <button
                onClick={handleShowScopeOption}
                className="px-3 py-1 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Select Scope
              </button>
              {showScopeOption && (
                <div className="mt-2">
                  <select
                    onChange={(event) => setScope(event.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value={ScopeEnum.PUBLIC}>Public</option>
                    <option value={ScopeEnum.PRIVATE}>Private</option>
                    <option value={ScopeEnum.SPECIFY}>Specify</option>
                  </select>
                  {scope === ScopeEnum.SPECIFY && (
                    <div className="mt-2">
                      {friendsData.map((friend) => (
                        <label key={friend.name} className="block">
                          <input
                            type="checkbox"
                            checked={selectedFriends.includes(friend.id)}
                            onChange={() => handleFriendCheckboxChange(friend.id)}
                            className="mr-2"
                          />
                          {friend.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="picture mb-4">
              <img src={optionFileUrl} alt="" className="w-full rounded-lg" />
              <input
                id="text-input"
                type="text"
                maxLength="35"
                placeholder="Enter text"
                value={text}
                onChange={handleText}
                onInput={checkTextInputLength}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="buttons flex justify-between">
              <button
                type="button"
                onClick={submitOption}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={cancelOption}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
