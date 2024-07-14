import './App.css';
import React, { useState, useEffect} from 'react';
import { auth } from '../models/services/firebase';
import Authentication from '../views/authentication/authentication';
import Notification from '../controllers/routing/notification';
import Account from '../views/account/account';
import { useUserStore } from '../hooks/user-store';
import ChatList from '../views/chat/chat-list';

function App() {
  const [view, setView] = useState("home");
  
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  useEffect(() => {
    const unSubscribe = auth.onAuthStateChanged((user) => {
      fetchUserInfo(user?.uid);
    });
    return () => {
      unSubscribe();
    }
  }, [fetchUserInfo]);

  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <div className='app-container'>
      
      { currentUser ? (
        <div className='view'>
          {view === "home"  && <button onClick={() => setView("account")}>View Account</button>}
          {view === "account" && <Account setView={ setView }/>}


          {view === "home" && <button onClick={() => setView("chat")}>View Chat</button>}
          {view === "chat" && <ChatList setView={ setView } />}
        </div>
      ) : (
        <Authentication />
      )}

      <Notification />
    </div>
  );
}

export default App;
