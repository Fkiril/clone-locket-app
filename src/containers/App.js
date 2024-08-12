import './App.css';
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

import AuthenticationView from '../views/authentication/authentication-view';
import AccountView from '../views/account/account-view';
import HomeView from '../views/home/home-view';
import UploadPictureView from '../views/picture/upload-picture-view';
import ChatView from '../views/chat/chat-view';
import ConversationView from '../views/chat/conversation-view';
import Notification from './notification';
import StateTracking from './state-tracking';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path='/' element={<AuthenticationView />} />

        <Route path="/home" element={<HomeView />} />

        <Route path='/account' element={<AccountView />} />

        <Route path="/upload-picture" element={<UploadPictureView />} />

        <Route path="/chat" element={<ChatView />} />

        <Route path="/conversation/:conversationId" element={<ConversationView />} />

        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
      <StateTracking />
      <Notification />
    </HashRouter>
  );
}

export default App;
