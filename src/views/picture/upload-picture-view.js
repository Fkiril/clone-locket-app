import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import PictureController from "../../controllers/picture-controller";
import Picture, { ScopeEnum } from "../../models/entities/picture";
import { useUserStore } from "../../hooks/user-store";

export default function UploadPictureView() {
    const { currentUser, friendsData } = useUserStore();

    const [picture, setPicture] = useState({
        file: null,
        url: ""
    });

    const [showScopeOption, setShowScopeOption] = useState(false);
    const [scope, setScope] = useState(ScopeEnum.PUBLIC);

    const [selectedFriends, setSelectedFriends] = useState([]);

    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const handleSetPicture = (event) => {
        if (event.target.files[0]) {
            setPicture({
                file: event.target.files[0],
                url: URL.createObjectURL(event.target.files[0])
            })
        }
    };

    const handleSubmitPicture = async () => {
        const text = document.getElementById("status").value;

        const newPicture = new Picture({
            text: text,
            scope: scope,
            canSee: [currentUser.id]
        });

        if (scope === "specify") {
            newPicture.canSee.push(...selectedFriends);
        } else if (scope === "public") {
            newPicture.canSee.push(...currentUser.friends);
        }
        console.log("newPicture", newPicture);
        await PictureController.uploadPicture(newPicture, picture.file);

        setPicture({
            file: null,
            url: ""
        });
    };

    const handleCancel = () => {
        const fileInput = document.getElementById("file");
        fileInput.value = "";

        setPicture({
            file: null,
            url: ""
        });
    };

    const handleCheckTextInput = () => {
        const textInput = document.getElementById("status");
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
            <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-8">
                <div className="mb-6">
                    <Link to="/home" className="text-blue-500 hover:underline">
                        &larr; Back to Home
                    </Link>
                </div>

                <div className="mb-6">
                    <button
                        type="button"
                        onClick={() => document.getElementById("file").click()}
                        className="bg-blue-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Choose Picture
                        <input
                            type="file"
                            id="file"
                            className="hidden"
                            onChange={handleSetPicture}
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
                        <div className="mb-4">
                            <button
                                type="button"
                                onClick={handleShowScopeOption}
                                className="bg-gray-200 py-2 px-4 rounded-md shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Select Scope
                            </button>
                            {showScopeOption && (
                                <div className="mt-2 p-4 bg-gray-100 rounded-md shadow-md">
                                    <select
                                        onChange={(event) => setScope(event.target.value)}
                                        value={scope}
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value={ScopeEnum.PUBLIC}>Public</option>
                                        <option value={ScopeEnum.PRIVATE}>Private</option>
                                        <option value={ScopeEnum.SPECIFY}>Specify</option>
                                    </select>
                                    {scope === ScopeEnum.SPECIFY && (
                                        <div className="mt-2">
                                            {friendsData.map((friend) => (
                                                <label key={friend.id} className="block text-gray-700">
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

                        <div className="mb-4">
                            <img src={picture.url} alt="Selected" className="w-full h-auto rounded-md shadow-md" />
                        </div>

                        <div className="mb-4">
                            <input
                                id="status"
                                type="text"
                                maxLength="35"
                                placeholder="Add status: "
                                onInput={handleCheckTextInput}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex justify-between">
                            <button
                                type="button"
                                onClick={handleSubmitPicture}
                                className="bg-blue-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Submit
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="bg-red-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
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
