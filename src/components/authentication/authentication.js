import React, { useState } from "react";
import { auth, fs_db } from "../../hooks/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"; 
import { collection, where, query, doc, setDoc, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";
import "./authentication.css";

function Authentication(props) {
  const [isLoading, setIsLoading] = useState(false);

  const createAccount = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target);

    const { userName, email, password, comfirmPassword } = Object.fromEntries(formData);

    // VALIDATE INPUTS
    if (!userName || !email || !password || !comfirmPassword)
      return toast.warn("Please enter inputs!");

    if (password !== comfirmPassword)
      return toast.warn("Passwords do not match!");

    // VALIDATE UNIQUE USERNAME
    const usersRef = collection(fs_db, "users");
    const q = query(usersRef, where("userName", "==", userName));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return toast.warn("Username already exists!");
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(fs_db, "users", res.user.uid), {
        userName,
        email,
        id: res.user.uid
      });

      toast.success("Account created! You can login now!");
    } catch (err) {
      console.log(err);
      toast.error(err.message);
      setIsLoading(false);
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
          <input type="text" placeholder="Username" name="userName" />
          <input type="text" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <input type="password" placeholder="Confirm Password" name="comfirmPassword" />
          <button disabled={isLoading}>{isLoading ? "Loading" : "Sign Up"}</button>
        </form>
      </div>
    </div>
  );
}

export default Authentication;