import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { signUp, signIn, GoogleSignIn, signOut, getSessionData, getUserData, sendEmailConfirmation } from "../services/supabaseAuthService";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();



export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  const handleSignUp = async (email, password) => {
    setLoading(true);
    await signUp(email, password);
    setLoading(false);
  };

  // Yes, the finally block will always get executed, regardless of whether an exception is thrown or not.

  const handleResendEmailConfirmation = async (email) => {
    try {
      setLoading(true);
      const error = await sendEmailConfirmation(email);
      console.error(error);
      if (error) {
        return error;
      }
    } catch (error) {
      return error;
    } finally {
      setLoading(false);
    }
    return null;
  }
  const handleSignIn = async (email, password) => {
    setLoading(true);
      const error = await signIn(email, password);
    setLoading(false);
    if (error) alert(error.message);
  };

  const handleSignOut = async () => {
    const error = await signOut();
    if (error) alert(error.message);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const error = await GoogleSignIn();
    setLoading(false);
    if (error) alert(error.message);
};


  useEffect(() => {
    // Complete any ongoing auth session

    // Get initial session (if exists)
    setLoading(true);
    getSessionData().then(( session ) => {
      console.log("Initial session:", session);
      setSession(session);
    });

    getUserData().then(( user ) => {
      console.log("Initial user data:", user);
      setUserData(user || null);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      console.log("Auth event:", _event, "Session:", newSession);
      setSession(newSession);
    });
    setLoading(false);

    // Also listen to deep links (if app launched via link)
    // const linkingSub = Linking.addEventListener("url", ({ url }) => {
    //   console.log("Linking event, url:", url);
    //   // optionally parse url and set session if tokens present
    //   // similar to parsing logic above
    // });

    // return () => {
    //   subscription.unsubscribe();
    //   linkingSub.remove();
    // };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        handleSignUp,
        handleSignIn,
        handleGoogleSignIn,
        handleSignOut,
        handleResendEmailConfirmation,
        loading,
        userData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};

