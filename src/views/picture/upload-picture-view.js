import React, { useState, useRef } from "react";
// import { FaCamera } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import PictureController from "../../controllers/picture-controller";
import { useUserStore } from "../../hooks/user-store";
import Picture, { ScopeEnum } from "../../models/entities/picture";

export default function UploadPictureView() {
  const { currentUser, friendsData } = useUserStore();

  const [picture, setPicture] = useState({
    file: null,
    url: ""
  });

  const [text, setText] = useState("");
  const [scope, setScope] = useState(ScopeEnum.PUBLIC);
  const [selectedFriends, setSelectedFriends] = useState([]);

  const [isScopeListOpen, setIsScopeListOpen] = useState(false);

  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handlePicture = (event) => {
    if (event.target.files[0]) {
      setPicture({
        file: event.target.files[0],
        url: URL.createObjectURL(event.target.files[0])
      })
    }
  };

  const handleSubmitPicture = async () => {
    const picInstance = new Picture({
      text: text,
      scope: scope,
      canSee: [currentUser.id],
      ownerId: currentUser.id
    });

    if (scope === ScopeEnum.SPECIFY) {
      picInstance.canSee.push(...selectedFriends);
    } else if (scope === ScopeEnum.PUBLIC) {
      picInstance.canSee.push(...currentUser.friends);
    }

    await PictureController.uploadPicture(picInstance, picture.file);

    setPicture({
      file: null,
      url: ""
    });
    setText("");
    setScope(ScopeEnum.PUBLIC);
    setIsScopeListOpen(false);
    setSelectedFriends([]);
  };

  const handleCancelPicture = () => {
    const fileInput = document.getElementById("file");
    fileInput.value = "";

    setPicture({
      file: null,
      url: ""
    });
  };

  const handleText = (event) => {
    setText(event.target.value);
  };

  const hanldeCheckTextInput = () => {
    const textInput = document.getElementById("text-input");
    if (textInput.value.length >= 35) {
      toast.warning("Text input can be up to 35 characters!");
    }
  };

  const handleScopeList = () => {
    setIsScopeListOpen(!isScopeListOpen);
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

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleOpenCamera = () => {
      setIsCameraOpen(true);
      setPicture({
          file: null,
          url: ""
      })

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices
              .getUserMedia({ video: true })
              .then((stream) => {
                  const video = videoRef.current;
                  video.srcObject = stream;
                  video.play();
              })
              .catch((error) => {
                  toast.error("Can not access camera. Please gain permission!");
                  console.error("Error accessing camera:", error);
              });
      }
  };

  const handleCloseCamera = () => {
      setIsCameraOpen(false);
      const video = videoRef.current;
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => {
          track.stop();
      })
  };

  const handleTakePicture = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.save();
      context.scale(-1, 1);
      context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      context.restore();

      const blob = await new Promise((resolve) => {
          canvas.toBlob(resolve, "image/png");
      });

      setPicture({
          file: blob,
          url: canvas.toDataURL("image/png")
      });

      handleCloseCamera();
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-xl relative">
        <Link to="/home">
          <button className="absolute top-4 right-4 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">
            Back to Home
          </button>
        </Link>
        <div className="flex flex-col items-center mb-8">
          {/* <FaCamera className="text-9xl text-gray-500 mb-4" /> */}
          <button
            type="button"
            onClick={() => document.getElementById("file").click()}
            className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xl"
          >
            Choose Picture
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={handlePicture}
            />
          </button>
          <button
              type="button"
              className="bg-blue-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={isCameraOpen? handleCloseCamera : handleOpenCamera}
          >
              {isCameraOpen? "Close Camera": "Open Camera"}
          </button>
        </div>

        {isCameraOpen && (
            <div className="camera">
                <video autoPlay playsInline muted ref={videoRef} style={{transform: "scaleX(-1)"}}></video>
                <canvas ref={canvasRef} aria-disabled className="hidden"></canvas>
                <button
                    type="button"
                    onClick={handleTakePicture}
                    className="bg-blue-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Take Picture
                </button>
            </div>
        )}
                
        {picture.url && (
          <div>
            <div className="scope-select mb-4">
              <button
                onClick={handleScopeList}
                className="px-3 py-1 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Select Scope
              </button>
              {isScopeListOpen && (
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
              <img src={picture.url} alt="" className="w-full rounded-lg" />
              <input
                id="text-input"
                type="text"
                maxLength="35"
                placeholder="Enter text"
                value={text}
                onChange={handleText}
                onInput={hanldeCheckTextInput}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="buttons flex justify-between">
              <button
                type="button"
                onClick={handleSubmitPicture}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={handleCancelPicture}
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
