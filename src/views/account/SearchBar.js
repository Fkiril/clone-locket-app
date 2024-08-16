import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useUserStore } from "../../hooks/user-store";
import UserController from "../../controllers/user-controller";
import { toast } from "react-toastify";

const SearchBar = () => {
  const { currentUser, friendDatas, fetchUserInfo, nearestFetchUserInfo } = useUserStore();
  const userController = currentUser ? new UserController(currentUser) : null;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleReFetch = async () => {
    const now = new Date().getTime();
    if (now - nearestFetchUserInfo > 3000) {
      await fetchUserInfo(currentUser?.uid);
    }
  };

  const handleSearch = async () => {
    await userController.getFriendByEmail(searchQuery).then((result) => {
      if (result) {
        setSearchResult(result);
      } else {
        setIsSearching(false);//khúc này nếu k set thì ví dụ mình search user1 xong lát search tùm lum nó vẫn hiện portal user1
        toast.warning("No user found. Please try again.");
      }
    }).catch((error) => {
      setIsSearching(false);
      toast.error("Failed to search. Please try again.");
    });
  };

  const handleSendFriendRequest = async () => {
    await userController.sendFriendRequestById(searchResult.id).then(() => {
      toast.success("Friend request sent successfully.");
      setSearchResult(null);
      setIsSearching(false);
      setSearchQuery("");
    }).catch((error) => {
      toast.error("Failed to send friend request. Please try again.");
    });
  };

  const handleBlockUser = async () => {
    await userController.blockUser(searchResult.id).then(async () => {
      toast.success("User blocked successfully.");
      setSearchResult(null);
      await handleReFetch();
    }).catch((error) => {
      toast.error("Failed to block user. Please try again.");
    });
  };

  const handleCancelRequest = async () => {
    await userController.cancelFriendRequest(searchResult.id).then(async () => {
      toast.success("Friend request canceled successfully.");
      setSearchResult(null);
      setIsSearching(false);
      setSearchQuery("");
      await handleReFetch();
    }).catch((error) => {
      toast.error("Failed to cancel friend request. Please try again.");
    });
  };

  const handleClickOutside = (event) => {
    const clickElement = event.target;
    if (!(clickElement.closest(".searching-friend .body"))) {
      setIsSearching(false);
      setSearchQuery("");
    }
  };

  const searchingFriendPortal = () => {
    return createPortal(
      <div className="searching-friend fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center" onClick={handleClickOutside}>
        <div className="body bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          {searchResult ? (
            <div className="flex flex-col items-center">
              <img src={searchResult.avatar || "./default_avatar.jpg"} alt="Avatar" className="w-24 h-24 rounded-full mb-4" />
              <p className="text-xl font-semibold mb-2">{searchResult.userName}</p>
              {searchResult.id === currentUser.id ? (
                <p className="text-gray-500">This is your account</p>
              ) : friendDatas?.find((friend) => friend?.id === searchResult.id) ? (
                <>
                  <p className="text-green-500 mb-2">This person is your friend</p>
                  <div className="flex gap-4">
                    <button
                      className="unfriend-button px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-700 transition"
                      onClick={async () => await userController.unfriendById(searchResult.id)}
                    >
                      Unfriend
                    </button>
                    <button className="block-button px-4 py-2 rounded-full bg-yellow-500 text-white hover:bg-yellow-700 transition" onClick={handleBlockUser}>
                      Block
                    </button>
                  </div>
                </>
              ) : searchResult.friendRequests.includes(currentUser.id) ? (
                <>
                  <p className="text-blue-500 mb-2">Friend request sent</p>
                  <div className="flex gap-4">
                    <button
                      className="unfriend-button px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-700 transition"
                      onClick={async () => await userController.cancelFriendRequest(searchResult.id)}
                    >
                      Cancel Request
                    </button>
                    <button className="block-button px-4 py-2 rounded-full bg-yellow-500 text-white hover:bg-yellow-700 transition" onClick={handleBlockUser}>
                      Block
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex gap-4">
                  <button className="add-button px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition" onClick={handleSendFriendRequest}>
                    Add Friend
                  </button>
                  <button className="block-button px-4 py-2 rounded-full bg-yellow-500 text-white hover:bg-yellow-700 transition" onClick={handleBlockUser}>
                    Block
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-red-500">No results found</p>
          )}
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="search-bar">
      <div className="input-container">
        <input
          type="text"
          name="searchQuery"
          className="input"
          placeholder="Search a friend..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setIsSearching(true);
              handleSearch();
            }
          }}
        />
        <span className="icon" onClick={() => { setIsSearching(true); handleSearch(); }}>
          <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path opacity="1" d="M14 5H20" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              <path opacity="1" d="M14 8H17" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M21 11.5C21 16.75 16.75 21 11.5 21C6.25 21 2 16.75 2 11.5C2 6.25 6.25 2 11.5 2" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
              <path opacity="1" d="M22 22L20 20" stroke="#000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"></path>
            </g>
          </svg>
        </span>
      </div>
      {isSearching && searchingFriendPortal()}
    </div>
  );
};

export default SearchBar;
