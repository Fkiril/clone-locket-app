import React, { useState } from "react";
import { auth, fs_db } from "../../hooks/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"; 
import { collection, where, query, doc, setDoc, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";
import "../../styles/authentication.css";

function Authentication(props) {
  const [isLoading, setIsLoading] = useState(false);

  const createAccount = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target);

    const { username, email, password, comfirm_passowrd } = Object.fromEntries(formData);

    // VALIDATE INPUTS
    if (!username || !email || !password || !comfirm_passowrd)
      return toast.warn("Please enter inputs!");

    if (password !== comfirm_passowrd)
      return toast.warn("Passwords do not match!");

    // VALIDATE UNIQUE USERNAME
    const usersRef = collection(fs_db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return toast.warn("Username already exists!");
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(fs_db, "users", res.user.uid), {
        username,
        email,
        id: res.user.uid
      });

      await setDoc(doc(fs_db, "userchats", res.user.uid), {
        chats: [],
      });

      toast.success("Account created! You can login now!");
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="item">
        <h2>Welcome back</h2>
        <form onSubmit={logIn}>
          <input type="text" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <button disabled={isLoading}>{isLoading ? "Loading" : "Sign In"}</button>
        </form>
      </div>

      <div className="separator"></div>

      <div className="item">
        <h2>Create an Account</h2>
        <form onSubmit={createAccount}>
          <input type="text" placeholder="Username" name="username" />
          <input type="text" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <input type="password" placeholder="Confirm Password" name="comfirm_passowrd" />
          <button disabled={isLoading}>{isLoading ? "Loading" : "Sign Up"}</button>
        </form>
      </div>
    </div>
  );
}

export default Authentication;