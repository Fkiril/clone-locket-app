import './App.css';
import React, { lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

import Notification from './notification';
import StateTracking from './state-tracking';
const AuthenticationView = lazy(() => import('../views/authentication/authentication-view'));
const HomeView = lazy(() => import('../views/home/home-view'));
const AccountView = lazy(() => import('../views/account/account-view'));
const UploadPictureView = lazy(() => import('../views/picture/upload-picture-view'));
const ChatView = lazy(() => import('../views/chat/chat-view'));
const ConversationView = lazy(() => import('../views/chat/conversation-view'));

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
