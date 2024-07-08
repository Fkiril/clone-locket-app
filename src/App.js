import './styles/App.css';
import React, { useState, useEffect} from 'react';
import { auth } from './data/firebase';
import { HashRouter, Routes, Route, Navigate} from 'react-router-dom';
import NotFoundView from './views/not-found-view';
import HomeView from './views/home-view';
import AuthenticationView from './views/authentication-view';
import ChatView from './views/chat-view';
import Nav from './components/nav';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  return (
    <HashRouter>
      <Nav></Nav> 

      <Routes>
        <Route 
          path="/authentication"
          element={<AuthenticationView user={user} />}>
        </Route>

        <Route 
          path="/"
          element={<HomeView user_name="KiriL" />}>
        </Route>

        <Route 
          path="/chat"
          element={<ChatView user={user}/>}>
        </Route>

        <Route 
          path="*" 
          element={<NotFoundView />}>
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
