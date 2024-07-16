import React, { useState } from "react";
import { Link } from "react-router-dom";
import PictureController from "../../controllers/picture-controller";
import Picture, { ScopeEnum } from "../../models/entities/picture";

export default function UploadPictureView() {
    const [optionPicture, setOptionPicture] = useState(null);
    const [optionPictureUrl, setOptionPictureUrl] = useState("");
    const [canSee, setCanSee] = useState([]);
    const [scope, setScope] = useState(ScopeEnum.PUBLIC);
    const [text, setText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handlePicture = (event) => {
        if (event.target.files[0]) {
            setOptionPicture(event.target.files[0]);
            setOptionPictureUrl(URL.createObjectURL(event.target.files[0]));
        }
    };
    const submitOption = async () => {
        setIsLoading(true);
        await PictureController.uploadPicture(optionPicture, canSee, scope, text);
        setOptionPicture(null);
        setOptionPictureUrl("");
        setIsLoading(false);
    };
    const cancelOption = () => {
        const fileInput = document.getElementById("file");
        fileInput.value = "";
        setOptionPicture(null);
        setOptionPictureUrl("");
    };

    return (
        <div className="upload-picture">
            <div className="header" >
                <button >
                    <Link to="/home">Home</Link>
                </button>
            </div>
            <img src={optionPictureUrl} alt="" />
            <div className="input">
                <button typeof="button" onClick={() => document.getElementById("file").click()}>
                    Choose picture
                    <input
                        type="file"
                        id="file"
                        style={{ display: "none" }}
                        onChange={handlePicture}
                    />
                </button>
                { optionPictureUrl ? (
                    <div>
                        <button typeof="button" onClick={() => submitOption()}>
                            Submit
                        </button>
                        <button typeof="button" onClick={() => cancelOption()}>
                            Cancel option
                        </button>
                    </div>
                ) : null }
            </div>
        </div>
    )
}