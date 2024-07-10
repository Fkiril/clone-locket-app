import './styles/App.css';
import React, { useState, useEffect} from 'react';
import { auth } from './hooks/firebase';
import Authentication from './components/authentication/authentication';
import Notification from './components/notification/notification';
import Account from './components/account/account';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  return (
    <div className='app-container'>
      { user ? (
        <div>
          {view !== "account" && (
            <button onClick={() => setView("account")}>View Account</button>
          )}
          
          {view === "account" && <Account user={user} setView={setView}/>}
        </div>
      ) : (
        <Authentication />
      )}
      <Notification />
    </div>
  );
}

export default App;
