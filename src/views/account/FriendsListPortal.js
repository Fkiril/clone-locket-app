import React from "react";
import { createPortal } from "react-dom";
import { useUserStore } from "../../hooks/user-store";
import UserController from "../../controllers/user-controller";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth } from "../../models/services/firebase";

const FriendsListPortal = ({ setIsShowingFriends }) => {
  const navigate = useNavigate();

  const { currentUser, friendDatas, fetchUserInfo } = useUserStore();
  const userController = currentUser? new UserController(currentUser) : null;

  if (!currentUser) {
    toast.warning("You are not logged in. Please log in first.");
    return navigate("/");
  }

  const handleUnfriend = async (friendId) => {
    await userController.unfriendById(friendId).then(async () => {
      toast.success("Unfriended successfully");
      await fetchUserInfo(auth?.currentUser?.uid);
    }).catch((error) => {
      toast.error("Failed to unfriend. Please try again.");
    });
  };

  const handleBlock = async (friendId) => {
    await userController.blockUser(friendId).then(async () => {
      toast.success("Blocked successfully");
      await fetchUserInfo(auth?.currentUser?.uid);
    }).catch((error) => {
      toast.error("Failed to block. Please try again.");
    });
  };

  const handleClickOutside = (event) => {
    const clickElement = event.target;
    if (!(clickElement.closest(".friends-list .body"))) {
      setIsShowingFriends(false);
    }
  };

  return createPortal((
    <div className="friends-list fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center" onClick={handleClickOutside}>
      <div className="body bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Friends List</h2>
        <div className="flex flex-wrap gap-4 justify-center"> 
          {friendDatas?.map((friend) => (
            <div key={friend?.id} className="friend-card bg-gray-100 p-4 rounded-lg flex flex-col items-center w-48 shadow-md">
              <img src={friend?.avatarFileUrl || friend?.avatar || "./default_avatar.jpg"} alt="Avatar" className="w-24 h-24 rounded-full mb-2" />
              <span className="text-lg font-semibold text-black mb-2">{friend?.name}</span>
              <div className="flex gap-2">
                <button
                  className="unfriend-button px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-700 transition"
                  onClick={() => handleUnfriend(friend?.id)}
                >
                  Unfriend
                </button>
                <button
                  className="block-button px-4 py-2 rounded-full bg-yellow-500 text-white hover:bg-yellow-700 transition"
                  onClick={() => handleBlock(friend?.id)}
                >
                  Block
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ), document.body);
};

export default FriendsListPortal;
