import './app.css';
import React, { useState, useEffect} from 'react';
import { auth } from '../hooks/firebase';
import Authentication from '../components/authentication/authentication';
import Notification from '../components/notification/notification';
import Account from '../components/account/account';
import { useUserStore } from '../hooks/user-store';

function App() {
  const [view, setView] = useState("home");
  
  // const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  // useEffect(() => {
  //   const unSubscribe = auth.onAuthStateChanged((user) => {
  //     fetchUserInfo(user?.uid);
  //   });
  //   return () => {
  //     unSubscribe();
  //   }
  // }, [fetchUserInfo]);

  // if (isLoading) return <div className="loading">Loading...</div>;

  const [currentUser, setUser] = useState(null);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);


  return (
    <div className='app-container'>
      
      { currentUser ? (
        <div>
          {view !== "account" && (
            <button onClick={() => setView("account")}>View Account</button>
          )}
          
          {view === "account" && <Account user={currentUser} setView={setView}/>}
        </div>
      ) : (
        <Authentication />
      )}

      <Notification />
    </div>
  );
}

export default App;
