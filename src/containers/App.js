import './App.css';
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { auth } from '../models/services/firebase';
import { useUserStore } from '../hooks/user-store';

import Notification from '../controllers/notification';
import AuthenticationView from '../views/authentication/authentication-view';
import AccountView from '../views/account/account-view';
import HomeView from '../views/home/home-view';
import UploadPictureView from '../views/picture/upload-picture-view';
import ChatView from '../views/chat/chat-view';
import ConversationView from '../views/chat/conversation-view';

function App() {
  const { currentUser, fetchUserInfo, isLoading } = useUserStore();

  useEffect(() => {
    const unSubscribe = auth.onAuthStateChanged((user) => {
      console.log("App.js: useEffect() for fetchUserInfo:", currentUser);
      fetchUserInfo(user?.uid);
    });
    return () => {
      unSubscribe();
    }
  }, [fetchUserInfo, auth]);

  if(isLoading) return <div>Loading...</div>;

  // console.log("User's data: ", currentUser);

  return (
    <HashRouter>
      <Routes>
        <Route path='/' element={<AuthenticationView />} />

        <Route path="/home" element={<HomeView />} />

        <Route path='/account' element={<AccountView />} />

        <Route path="/upload-picture" element={<UploadPictureView />} />

        <Route path="/chat" element={<ChatView />} />

        <Route path="/conversation/:conversationId" element={<ConversationView />} />
      </Routes>
      <Notification />
    </HashRouter>
  );
}

export default App;
