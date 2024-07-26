import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import PictureController from "../../controllers/picture-controller";
import Picture, { ScopeEnum } from "../../models/entities/picture";
import { useUserStore } from "../../hooks/user-store";

export default function UploadPictureView() {
    const { currentUser, friendsData } = useUserStore();
    const currentPicture = new Picture("", currentUser.id);

    const [optionFile, setOptionFile] = useState(null);
    const [optionFileUrl, setOptionFileUrl] = useState("");
    const [text, setText] = useState("");
    const [scope, setScope] = useState(ScopeEnum.PUBLIC);
    const [showScopeOption, setShowScopeOption] = useState(false);
    const [selectedFriends, setSelectedFriends] = useState([]);

    const handlePicture = (event) => {
        if (event.target.files[0]) {
            setOptionFile(event.target.files[0]);
            setOptionFileUrl(URL.createObjectURL(event.target.files[0]));
        }
    };

    const submitOption = async () => {
        currentPicture.text = text;
        currentPicture.scope = scope;

        currentPicture.canSee = [currentUser.id];
        if (scope === "specify") {
            currentPicture.canSee.push(...selectedFriends);
        } else if (scope === "public") {
            currentPicture.canSee.push(...currentUser.friends);
        }

        await PictureController.uploadPicture(currentPicture, optionFile);

        setOptionFile(null);
        setOptionFileUrl("");
    };

    const cancelOption = () => {
        const fileInput = document.getElementById("file");
        fileInput.value = "";

        setOptionFile(null);
        setOptionFileUrl("");
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
                            onChange={handlePicture}
                        />
                    </button>
                </div>

                {optionFileUrl && (
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
                            <img src={optionFileUrl} alt="Selected" className="w-full h-auto rounded-md shadow-md" />
                        </div>

                        <div className="mb-4">
                            <input
                                id="text-input"
                                type="text"
                                maxLength="35"
                                placeholder="Enter text"
                                value={text}
                                onChange={handleText}
                                onInput={checkTextInputLength}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex justify-between">
                            <button
                                type="button"
                                onClick={submitOption}
                                className="bg-blue-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Submit
                            </button>
                            <button
                                type="button"
                                onClick={cancelOption}
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
