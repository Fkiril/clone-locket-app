import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useUserStore } from "../../hooks/user-store";
import UserController from "../../controllers/user-controller";

const SearchBar = () => {
  const { currentUser, friendDatas } = useUserStore();
  const userController = currentUser ? new UserController(currentUser) : null;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (userController) {
      const result = await userController.getFriendByEmail(searchQuery);
      setSearchResult(result);
    }
  };

  const handleSendFriendRequest = async () => {
    await userController.sendFriendRequestById(searchResult.id);
    setSearchResult(null);
  };

  const handleBlockUser = async () => {
    if (userController) {
      await userController.blockUser(searchResult.id);
      setSearchResult(null);
    }
  };

  const handleClickOutside = (event) => {
    const clickElement = event.target;
    if (!(clickElement.closest(".searching-friend .body"))) {
      setIsSearching(false);
    }
  };

  const searchingFriendPortal = () => {
    return createPortal(
      <div className="searching-friend fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center" onClick={handleClickOutside}>
        <div className="body bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          {searchResult ? (
            <div className="flex flex-col items-center">
              <img src={searchResult.avatar} alt="Avatar" className="w-24 h-24 rounded-full mb-4" />
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
      <div className="input-container mb-4">
        <input
          type="text"
          name="searchQuery"
          className="input"
          placeholder="search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span className="icon" onClick={() => { setIsSearching(true); handleSearch(); }}>
          <svg width="19px" height="19px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path opacity="1" d="M14 5H20" stroke="#000" stroke-width="1.5" stroke-linecap="round" strokeLinejoin="round"></path>
              <path opacity="1" d="M14 8H17" stroke="#000" stroke-width="1.5" stroke-linecap="round" strokeLinejoin="round"></path>
              <path d="M21 11.5C21 16.75 16.75 21 11.5 21C6.25 21 2 16.75 2 11.5C2 6.25 6.25 2 11.5 2" stroke="#000" stroke-width="2.5" stroke-linecap="round" strokeLinejoin="round"></path>
              <path opacity="1" d="M22 22L20 20" stroke="#000" stroke-width="3.5" stroke-linecap="round" strokeLinejoin="round"></path>
            </g>
          </svg>
        </span>
      </div>
      {isSearching && searchingFriendPortal()}
    </div>
  );
};

export default SearchBar;
