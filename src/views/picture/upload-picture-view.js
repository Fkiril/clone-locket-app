import "./upload-picture-view.css";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import PictureController from "../../controllers/picture-controller";
import Picture, { ScopeEnum } from "../../models/entities/picture";
import { useUserStore } from "../../hooks/user-store";

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
        if (scope === "specify") {
            currentPicture.canSee.push(...selectedFriends);
        }
        else if (scope === "public") {
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
    }
    const checkTextInputLength = () => {
        const textInput = document.getElementById("text-input");
        if (textInput.value.length >= 35) {
            toast.warning("Text input can be up to 35 characters!");
        }
    }

    const handleShowScopeOption = () => {
        setShowScopeOption(!showScopeOption);
    }

    const handleFriendCheckboxChange = (friendId) => {
        setSelectedFriends((prevSelected) => {
            if (prevSelected.includes(friendId)) {
                return prevSelected.filter((id) => id !== friendId);
            } else {
                return [...prevSelected, friendId];
            }
        });
    };

    // console.log("friendsData", friendsData);

    return (
        <div className="upload-picture">
            <div className="header" >
                <button onClick={() => document.getElementById("home").click()}>
                    <Link id="home" to="/home">Home</Link>
                </button>
            </div>
            <div className="body">
                <button typeof="button" onClick={() => document.getElementById("file").click()}>
                    Choose picture
                    <input
                        type="file"
                        id="file"
                        style={{ display: "none" }}
                        onChange={handlePicture}
                    />
                </button>
                { optionFileUrl ? (
                    <div className="option-picture">
                        <div className="scope-select">
                            <button onClick={handleShowScopeOption}>Select Scope</button>
                            {showScopeOption && (
                                <div>
                                    <select onChange={(event) => setScope(event.target.value)}>
                                        <option value={ScopeEnum.PUBLIC}>Public</option>
                                        <option value={ScopeEnum.PRIVATE}>Private</option>
                                        <option value={ScopeEnum.SPECIFY}>Specify</option>
                                    </select>
                                    {scope === "specify" && (
                                        <div>
                                            {friendsData.map((friend) => (
                                                <label key={friend.name}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFriends.includes(friend.id)}
                                                    onChange={() => handleFriendCheckboxChange(friend.id)}
                                                />
                                                {friend.name}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="picture">
                            <img src={optionFileUrl} alt="" />
                            <input
                                id="text-input"
                                type="text"
                                maxLength="35"
                                placeholder="Enter text"
                                value={text}
                                onChange={handleText}
                                onInput={checkTextInputLength}
                            />
                        </div>
                        <div className="buttons">
                            <button typeof="button" onClick={() => submitOption()}>
                                Submit
                            </button>
                            <button typeof="button" onClick={() => cancelOption()}>
                                Cancel option
                            </button>
                        </div>
                    </div>
                ) : null }
            </div>
        </div>
    )
}