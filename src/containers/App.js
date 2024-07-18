import './App.css';
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { auth } from '../models/services/firebase';
import Notification from '../controllers/notification';
import { useUserStore } from '../hooks/user-store';
import AuthenticationView from '../views/authentication/authentication-view';
import AccountView from '../views/account/account-view';
import HomeView from '../views/home/home-view';
import UploadPictureView from '../views/picture/upload-picture-view';

function App() {
  
  const { currentUser ,isLoading, fetchUserInfo } = useUserStore();
  useEffect(() => {
    const unSubscribe = auth.onAuthStateChanged((user) => {
      fetchUserInfo(user?.uid);
    });
    return () => {
      unSubscribe();
    }
  }, [fetchUserInfo]);

  if (isLoading) return <div className="loading">Loading...</div>;

  // console.log("User's data: ", currentUser);

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/account' element={<AccountView />} />

        <Route path='/' element={<AuthenticationView />} />

        <Route path="/home" element={<HomeView />} />

        <Route path="/upload-picture" element={<UploadPictureView />} />
      </Routes>
      <Notification />
    </BrowserRouter>
  );
}

export default App;
