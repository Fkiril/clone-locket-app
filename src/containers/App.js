import './App.css';
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { fs_db } from '../models/services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import Notification from '../controllers/notification';
import { useUserStore } from '../hooks/user-store';
import AuthenticationView from '../views/authentication/authentication-view';
import AccountView from '../views/account/account-view';
import HomeView from '../views/home/home-view';
import UploadPictureView from '../views/picture/upload-picture-view';

function App() {
  const { currentUser, auth, fetchUserInfo, isLoading } = useUserStore();

  useEffect(() => {
    const unSubscribe = auth.onAuthStateChanged((user) => {
      fetchUserInfo(user?.uid);
    });
    console.log("App.js: useEffect() for fetchUserInfo:", currentUser);
    return () => {
      unSubscribe();
    }
  }, [fetchUserInfo, auth]);

  useEffect(() => {
    if(currentUser) {
      console.log("App.js: useEffect() for onSnapshot: ", currentUser);
      const userRef = doc(fs_db, "users", currentUser.id);

      const unSubscribe = onSnapshot(userRef, { includeMetadataChanges: false }, () => {
          console.log("Refetch user's data!");
          fetchUserInfo(currentUser.id);
      });

      return () => unSubscribe();
    }
  }, []);

  // useEffect(() => {
  //   const unsubscribeAuth = auth.onAuthStateChanged((user) => {
  //     fetchUserInfo(user?.uid);
  //   });

  //   const unsubscribeSnapshot = currentUser ? onSnapshot(doc(fs_db, "users", currentUser.id), { includeMetadataChanges: false }, () => {
  //     fetchUserInfo(currentUser.id);
  //   }) : null;

  //   return () => {
  //     unsubscribeAuth();
  //     unsubscribeSnapshot();
  //   }
  // }, [auth, currentUser, fetchUserInfo]);


  if(isLoading) return <div>Loading...</div>;

  console.log("User's data: ", currentUser);

  return (
    <HashRouter>
      <Routes>
        <Route path='/' element={<AuthenticationView />} />

        <Route path='/account' element={<AccountView />} />

        <Route path="/home" element={<HomeView />} />

        <Route path="/upload-picture" element={<UploadPictureView />} />
      </Routes>
      <Notification />
    </HashRouter>
  );
}

export default App;
