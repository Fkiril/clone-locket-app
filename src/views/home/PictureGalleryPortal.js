import "./PictureGalleryPortal.css";
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { timestampToString } from "../../models/utils/date-method";
import PictureController from "../../controllers/picture-controller";
import { toast } from "react-toastify";
import { useUserStore } from "../../hooks/user-store";

export default function PictureGalleryPortal({ friendId, onClose }) {
    const { currentUser, friendDatas, pictureDatas } = useUserStore();

    const [selectedFriendPictures, setSelectedFriendPictures] = useState(
        pictureDatas.filter(pic => pic.ownerId === friendId)
    );
    const [pictureToDelete, setPictureToDelete] = useState(null);
    const [enlargedPicture, setEnlargedPicture] = useState(null); // New state for enlarged picture

    const handleClickOutside = (event) => {
        if (event.target.classList.contains('picture-gallery-portal')) {
            onClose();
        }
    };

    const handleDeletePicture = (pictureId) => {
        setPictureToDelete(pictureId);
    };

    const handleConfirmDelete = async () => {
        try {
            await PictureController.deletePicture(pictureToDelete);
            setSelectedFriendPictures(prevPictures => prevPictures.filter(pic => pic.id !== pictureToDelete));
            setPictureToDelete(null);
            toast.success("Picture deleted successfully.");
        } catch (error) {
            console.log("Error deleting picture: ", error);
            toast.error("Failed to delete picture. Please try again.");
        }
    };

    const handleCancelDelete = () => {
        setPictureToDelete(null);
    };

    const handleEnlargePicture = (pictureUrl) => {
        setEnlargedPicture(pictureUrl);
    };

    const handleCloseEnlargedPicture = () => {
        setEnlargedPicture(null);
    };

    const confirmDeletePortal = () => {
        return createPortal(
            <div className="confirm-delete-portal fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-60">
                <div className="confirm-container bg-white p-6 rounded-lg shadow-lg">
                    <p>Are you sure you want to delete this picture?</p>
                    <div className="flex justify-end space-x-4 mt-4">
                        <button onClick={handleConfirmDelete} className="confirm-button bg-red-500 text-white px-4 py-2 rounded">Delete</button>
                        <button onClick={handleCancelDelete} className="cancel-button bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    const enlargedPicturePortal = () => {
        return createPortal(
            <div className="enlarged-picture-portal fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-70" onClick={handleCloseEnlargedPicture}>
                <img src={enlargedPicture} alt="Enlarged Gallery Picture" className="enlarged-picture max-w-full max-h-full"/>
            </div>,
            document.body
        );
    };

    return createPortal(
        <div className="picture-gallery-portal fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50" onClick={handleClickOutside}>
            <div className="gallery-container bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full overflow-y-auto max-h-[80vh]">
                <div className="gallery-header fixed top-0 left-0 w-full bg-white shadow-lg p-4 z-10">
                    <h2 className="gallery-title text-xl font-bold">
                        {friendDatas.find(friend => friend.id === friendId)?.name || 'Your'}'s Gallery 
                    </h2>
                    <button onClick={onClose} className="close-button bg-red-500 text-white px-4 py-2 rounded">Close</button>
                </div>
                <div className="picture-list mt-16 grid grid-cols-2 gap-4">
                    {selectedFriendPictures.map(picture => (
                        <div key={picture.id} className="picture-item relative">
                            <div className="relative">
                                <img src={picture.fileUrl || picture.url} alt="Gallery Picture" 
                                    className="w-full h-auto object-cover aspect-square rounded-md cursor-pointer"
                                    onClick={() => handleEnlargePicture(picture.fileUrl || picture.url)} 
                                />
                                <span className="absolute top-2 right-2 text-xs text-gray-700 bg-gray-300 p-1 rounded-bl-md">
                                    {timestampToString(picture.uploadTime)}
                                </span>
                            </div>
                            <div className="caption bg-gray-200 text-center p-2 mt-2">
                                <p>{picture.text}</p>
                            </div>
                            {currentUser?.id === picture.ownerId && (
                                <button 
                                    onClick={() => handleDeletePicture(picture.id)} 
                                    className="delete-button bg-red-500 text-white px-4 py-2 rounded mt-2 w-full"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {pictureToDelete && confirmDeletePortal()}
            {enlargedPicture && enlargedPicturePortal()}
        </div>,
        document.body
    );
}
