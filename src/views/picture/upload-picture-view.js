import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PictureController from "../../controllers/picture-controller";
import { useUserStore } from "../../hooks/user-store";
import Picture, { ScopeEnum } from "../../models/entities/picture";
import "./upload-picture-view.css";

export default function UploadPictureView() {
  const navigate = useNavigate();

  const { currentUser, friendDatas } = useUserStore();

  const [picture, setPicture] = useState({
    file: null,
    url: "",
  });

  const [text, setText] = useState("");
  const [scope, setScope] = useState(ScopeEnum.PUBLIC);
  const [showScopeOption, setShowScopeOption] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [uploaded, setUploaded] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handlePicture = (event) => {
    if (event.target.files[0]) {
      setPicture({
        file: event.target.files[0],
        url: URL.createObjectURL(event.target.files[0]),
      });
    }
  };

  const handleSubmitPicture = async () => {
    const picInstance = new Picture({
      ownerId: currentUser.id,
      text: text,
      scope: scope,
      canSee: [currentUser.id],
    });

    if (scope === ScopeEnum.SPECIFY) {
      picInstance.canSee.push(...selectedFriends);
    } else if (scope === ScopeEnum.PUBLIC) {
      picInstance.canSee.push(...currentUser.friends);
    }

    await PictureController.uploadPicture(picInstance, picture.file)
      .then(() => {
        toast.success("Picture uploaded successfully!");
        handleCancelOption();
        setUploaded(true);
      })
      .catch((error) => {
        toast.error("Failed to upload picture. Please try again!");
      });
  };

  const handleCancelOption = () => {
    const fileInput = document.getElementById("file");
    fileInput.value = "";
    setPicture({
      file: null,
      url: "",
    });
  };

  const handleText = (event) => {
    setText(event.target.value);
  };

  const handleCheckTextInput = () => {
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

  const handleOpenCamera = () => {
    if (picture.file) handleCancelOption();

    setIsCameraOpen(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          const video = videoRef.current;
          video.srcObject = stream;
          video.play();
        })
        .catch((error) => {
          toast.error("Cannot access camera. Please grant permission!");
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
    });
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
      url: canvas.toDataURL("image/png"),
    });
    handleCloseCamera();
  };

  const handleBackToHome = () => {
    if (isCameraOpen) {
      handleCloseCamera();
    }
    navigate("/home", { state: { routing: uploaded ? false : true } });
  };

  return (
    <div className="home min-h-screen flex flex-col items-center bg-gray-100">
      <div className="header-container text-center mb-1">
        <h1 className="app-title">Clone-locket</h1>
        <p className="app-subtitle">Share moments - Happy life</p>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 upload-picture">
        <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-2xl flex flex-col items-center relative body">
          <button onClick={handleBackToHome} className="home-icon-button">
            <div className="home-icon"></div>
          </button>

          <div className="option-picture">
            <div className="button-container">
              <button
                type="button"
                onClick={() => {
                  document.getElementById("file").click();
                  if (isCameraOpen) handleCloseCamera();
                }}
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
                className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xl"
                onClick={isCameraOpen ? handleCloseCamera : handleOpenCamera}
              >
                {isCameraOpen ? "Close Camera" : "Open Camera"}
              </button>
            </div>

            {isCameraOpen && (
              <div className="camera mb-8">
                <video
                  autoPlay
                  playsInline
                  muted
                  ref={videoRef}
                  style={{ transform: "scaleX(-1)" }}
                ></video>
                <canvas ref={canvasRef} aria-disabled className="hidden"></canvas>
                <button
                  type="button"
                  onClick={handleTakePicture}
                  className="bg-blue-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
                >
                  Take Picture
                </button>
              </div>
            )}

            {picture.url && (
              <div className="w-full">
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
                          {friendDatas.map((friend) => (
                            <label key={friend.name} className="block">
                              <input
                                type="checkbox"
                                checked={selectedFriends.includes(friend.id)}
                                onChange={() =>
                                  handleFriendCheckboxChange(friend.id)
                                }
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
                    onBlur={handleCheckTextInput}
                    className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="button-container">
                  <button
                    type="button"
                    onClick={handleSubmitPicture}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelOption}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
