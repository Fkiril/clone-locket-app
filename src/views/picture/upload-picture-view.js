import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PictureController from "../../controllers/picture-controller";
import { useUserStore } from "../../hooks/user-store";
import Picture, { ScopeEnum } from "../../models/entities/picture";
import cameraIcon from './camera.jpg';
import folderIcon from './folder.jpg';
import "./upload-picture-view.css";

const ICON_STATE = 'icon_state';
const UPLOAD_STATE = 'upload_state';

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
  const [viewState, setViewState] = useState(ICON_STATE);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handlePicture = (event) => {
    if (event.target.files[0]) {
      setPicture({
        file: event.target.files[0],
        url: URL.createObjectURL(event.target.files[0]),
      });
      setViewState(UPLOAD_STATE);
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
    setPicture({
      file: null,
      url: "",
    });
    setText("");
    setScope(ScopeEnum.PUBLIC);
    setShowScopeOption(false);
    setSelectedFriends([]);
    setIsCameraOpen(false);
    setViewState(ICON_STATE);
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
    setViewState(UPLOAD_STATE);
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

    setViewState(ICON_STATE); // Set state back to icon state
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
    <div className="home min-h-screen flex flex-col items-center bg-white-100">
      <div className="header-container">
        <h1 className="app-title">Clone-locket</h1>
        <button onClick={handleBackToHome} className="home-icon-button">
          <div className="home-icon"></div>
        </button>
      </div>
      <p className="app-subtitle text-center">Share moments - Happy life</p>

      <div className="upload-picture-container">
        {viewState === ICON_STATE && (
          <div className="option-picture">
            <div className="button-container flex justify-center items-center space-x-14">
              <div className="flex flex-col items-center">
                <img
                  src={folderIcon}
                  alt="Choose Picture"
                  className="icon-button"
                  onClick={() => {
                    document.getElementById("file").click();
                    if (isCameraOpen) handleCloseCamera();
                  }}
                />
                <p className="text-lg text-center">Choose Picture</p>
                <input
                  type="file"
                  id="file"
                  style={{ display: "none" }}
                  onChange={handlePicture}
                />
              </div>
              <div className="flex flex-col items-center">
                <img
                  src={cameraIcon}
                  alt="Open Camera"
                  className="icon-button"
                  onClick={isCameraOpen ? handleCloseCamera : handleOpenCamera}
                />
                <p className="text-lg text-center">
                  {isCameraOpen ? "Close Camera" : "Open Camera"}
                </p>
              </div>
            </div>
          </div>
        )}

        {viewState === UPLOAD_STATE && (
          <>
            {isCameraOpen && (
              <div className="camera mb-4">
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
                <button
                  type="button"
                  onClick={handleCloseCamera}
                  className="bg-red-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 mt-4 ml-4"
                >
                  Close Camera
                </button>
              </div>
            )}

            {picture.url && (
              <div className="w-full">
                <div className="picture mb-4">
                  <img src={picture.url} alt="" className="w-full rounded-lg" />
                </div>
                <input
                  id="text-input"
                  type="text"
                  maxLength="35"
                  placeholder="Enter text"
                  value={text}
                  onChange={handleText}
                  onBlur={handleCheckTextInput}
                  className="w-full mb-4 p-2 border border-gray-300 rounded-md"
                />

                {/* Scope selection */}
                <div className="scope-selector mb-4">
                  <button
                    onClick={handleShowScopeOption}
                    className="bg-gray-200 px-4 py-2 rounded-md"
                  >
                    {scope === ScopeEnum.PUBLIC
                      ? "Public"
                      : scope === ScopeEnum.PRIVATE
                      ? "Private"
                      
                      ?"Specify"
                     : scope === ScopeEnum.SPECIFY
                     }
                  </button>
                  {showScopeOption && (
                    <div className="scope-options mt-2 p-2 bg-gray-100 rounded-md shadow-lg">
                      <button
                        onClick={() => setScope(ScopeEnum.PUBLIC)}
                        className={`w-full text-left px-4 py-2 ${
                          scope === ScopeEnum.PUBLIC ? "bg-blue-100" : ""
                        }`}
                      >
                        Public
                      </button>
                      <button
                        onClick={() => setScope(ScopeEnum.PRIVATE)}
                        className={`w-full text-left px-4 py-2 ${
                          scope === ScopeEnum.PRIVATE ? "bg-blue-100" : ""
                        }`}
                      >
                        Private
                      </button>
                      <button
                        onClick={() => setScope(ScopeEnum.SPECIFY)}
                        className={`w-full text-left px-4 py-2 ${
                          scope === ScopeEnum.SPECIFY ? "bg-blue-100" : ""
                        }`}
                      >
                        Specify
                      </button>
                    </div>
                  )}
                </div>

                {scope === ScopeEnum.SPECIFY && (
                  <div className="friend-selector mb-4">
                    <div className="bg-gray-200 p-4 rounded-md">
                      <p>Select friends to share with:</p>
                      {friendDatas.map((friend) => (
                        <div key={friend.id} className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            checked={selectedFriends.includes(friend.id)}
                            onChange={() =>
                              handleFriendCheckboxChange(friend.id)
                            }
                            className="mr-2"
                          />
                          <p>{friend.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="button-group">

 <button
                  type="button"
                  onClick={handleSubmitPicture}
                  className="bg-blue-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full mb-2"
                >
                  Submit Picture
                </button>
                <button
                  type="button"
                  onClick={handleCancelOption}
                  className="bg-red-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 w-full mb-2"
                >
                  Cancel
                </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
