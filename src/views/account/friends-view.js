import React from 'react';
import { useUserStore } from '../../hooks/user-store';
import defaultAvatar from '../../../public/default_avatar.jpg';
import './friends-view.css';

const FriendsView = () => {
  const { friendsData, isLoading } = useUserStore();

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="friends-view p-4 max-w-4xl mx-auto bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-3xl font-semibold mb-6 text-center">Friends List</h2>
      {friendsData.length === 0 ? (
        <p className="text-center text-gray-600">You have no friends yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {friendsData.map(friend => (
            <div key={friend.id} className="friend-card bg-gray-100 p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
              <img
                src={friend.avatar || defaultAvatar}
                alt={friend.name}
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-medium text-center">{friend.name}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendsView;
