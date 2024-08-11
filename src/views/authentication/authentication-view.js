import "./authentication-view.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth } from "../../models/services/firebase";
import { useUserStore } from "../../hooks/user-store";
import { useInternetConnection } from "../../hooks/internet-connection";
import { checkPassword } from "../../models/utils/check-password";
import AuthenticationController from "../../controllers/authentication-controller";
import { createPortal } from "react-dom";

export default function AuthenticationView() {
  const navigate = useNavigate();

  const { currentUser, fetchUserInfo } = useUserStore();
  const { connectionState } = useInternetConnection();

  const [isLoading, setIsLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    if (auth?.currentUser && currentUser) {
      setIsLoading(false);
      navigate("/home");
    }
  }, [currentUser, navigate]);

  const handleLogIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    await AuthenticationController.logIn(email, password)
      .then(() => {
        toast.success("Login successful!");
      })
      .catch((error) => {
        toast.error("Invalid email or password. Please try again.");
        setIsLoading(false);
      });
  };

  const handleCreateAccount = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.target);
    const { userName, email, password, confirmPassword } = Object.fromEntries(formData);

    if (!userName || !email || !password || !confirmPassword) {
      toast.warning("All fields are required!");
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|edu\.vn)$/;
    if (emailRegex.test(email) === false) {
      toast.warning("Invalid email address!");
      setIsLoading(false);
      return;
    }

    if (checkPassword(password) === false) {
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.warning("Password does not match!");
      setIsLoading(false);
      return;
    }

    await AuthenticationController.createAccountWithEmailAndPassword(userName, email, password)
      .then(() => {
        toast.success("Create account successful!");
        event.target.reset();
        setShowLogin(true);
      })
      .catch((error) => {
        toast.error("Failed to create account. Please try again.");
      });

    setIsLoading(false);
  };

  const handleGoogleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    await AuthenticationController.signInWithGoogle().then(async (result) => {
      if (result.isNewUser) {
        await fetchUserInfo(result.user.uid);
      }
      toast.success("Login with Google successful!");
    }).catch((error) => {
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error("Failed to login with Google. Please try again.");
      }
    }).finally(() => {
      setIsLoading(false);
    });
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleSendResetPasswordEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const email = document.getElementsByName("reset-password-email")[0].value;

    if (!email) {
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|edu\.vn)$/;
    if (emailRegex.test(email) === false) {
      toast.warning("Invalid email address!");
      setIsLoading(false);
      return;
    }

    await AuthenticationController.sendPasswordResetEmail(email).then((result) => {
      if (!result) return;
      toast.success("Reset password email sent. Please check your email!");
      setShowForgotPassword(false);
    }).catch((error) => {
      toast.error("Failed to send reset password email. Please try again.");
    }).finally(() => {
      setIsLoading(false);
    });
  };

  const disconnectionPortal = () => {
    return createPortal(
      <div className="disconnection-portal">
        <p className="disconnection-text">Your connection has been interrupted. Please check your connection!</p>
        <div className="disconnection-circle"></div>
      </div>,
      document.body
    )
  }

  return (
    <div className="authentication min-h-screen flex items-center justify-center bg-gray-100">
      {!connectionState && disconnectionPortal()}
      <div className="header-container text-center mb-8">
        <h1 className="app-title">Clone-locket</h1>
        <p className="app-subtitle">Clone-locket - Connect and share with your friends and family</p>
      </div>
      <div className="flex flex-col items-center">
        <div className="flex justify-center mb-5">
          <button
            onClick={() => {
              setShowLogin(true);
              setShowForgotPassword(false);
            }}
            className={`px-4 py-2 mx-2 ${showLogin && !showForgotPassword ? "font-bold" : ""}`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setShowLogin(false);
              setShowForgotPassword(false);
            }}
            className={`px-4 py-2 mx-2 ${!showLogin && !showForgotPassword ? "font-bold" : ""}`}
          >
            Sign up
          </button>
        </div>

        {showForgotPassword ? (
          <div className="w-96 mb-5">
            <form className="flex flex-col">
              <p>Enter your email and we will send you a password reset link!</p>
              <input type="text" placeholder="Email" name="reset-password-email" required className="mb-3 p-2 border rounded" />
              <button disabled={isLoading} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                onClick={handleSendResetPasswordEmail}
              >
                {isLoading ? "Loading" : "Send"}
              </button>
            </form>
            <div className="flex justify-between mt-4 w-full">
              <button disabled={isLoading} onClick={handleGoogleLogin} className="text-blue-500 hover:underline">
                Login with Google
              </button>
            </div>
          </div>
        ) : showLogin ? (
          <div className="w-96 mb-5">
            <form disabled={isLoading} onSubmit={handleLogIn} className="flex flex-col">
              <input type="text" placeholder="Email" name="email" required className="mb-3 p-2 border rounded" />
              <input type="password" placeholder="Password" name="password" required className="mb-3 p-2 border rounded" />
              <button disabled={isLoading} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700">
                {isLoading ? "Loading" : "Login"}
              </button>
            </form>
            <div className="flex justify-between mt-4 w-full">
            
              <button disabled={isLoading} onClick={handleGoogleLogin} className="text-blue-500 hover:underline">
                Login with Google
              </button>
              <button disabled={isLoading} onClick={handleForgotPassword} className="text-blue-500 hover:underline">
                Forgot Password?
              </button>
            </div>
          </div>
        ) : (
          <div className="w-96 mb-5">
            <form disabled={isLoading} onSubmit={handleCreateAccount} className="flex flex-col">
              <input type="text" placeholder="Username" name="userName" required className="mb-3 p-2 border rounded" />
              <input type="text" placeholder="Email" name="email" required className="mb-3 p-2 border rounded" />
              <input type="password" placeholder="Password" name="password" required className="mb-3 p-2 border rounded" />
              <input type="password" placeholder="Confirm Password" name="confirmPassword" required className="mb-3 p-2 border rounded" />
              <button disabled={isLoading} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700">
                {isLoading ? "Loading" : "Sign up"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
