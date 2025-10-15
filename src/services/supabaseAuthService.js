import { Session } from '@google/genai';
import { supabase } from '../lib/supabase';
import { isEmailValid } from '../utils/emailUtils';
import { isPasswordValid } from '../utils/passwordUtils';

export const signUp = async (email, password) => {
  if (!isEmailValid(email)) {
    return new Error("Invalid email format");
  }
  if (!isPasswordValid(password)) {
    return new Error("Password must be at least 6 characters, and contain at least one number");
  }
    const { error } = await supabase.auth.signUp({ email, password});
    return error;
  };

export const signIn = async (email, password) => {    
    if (!isEmailValid(email)) {
      return new Error("Invalid email format");
  }
  if (!isPasswordValid(password)) {
      return new Error("Password must be at least 6 characters, and contain at least one number");
  }
      const result = await supabase.auth.signInWithPassword({ email, password });
      const error = result.error;

    return error;
};


  
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return error;
};
  
export const GoogleSignIn = async () => {
  try {


    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:5173",
      },
    });

    if (error) {
      console.error("Supabase signInWithOAuth error:", error);
      return error
      }
      return error
  } catch (err) {
    console.error("GoogleSignIn error:", err);
    return err;
  }
};

export const getSessionData = async () => {
  try{
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Supabase getSession error:", error);
      return data.session;
    }
    return data.session;
  } catch (err) {
    console.error("getSessionData error:", err);
    return null;
  }
}

export const getUserData = async () => {
  try{
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Supabase getUser error:", error);
      return data.user;
    }
    return data.user;
  } catch (err) {
    console.error("getUserData error:", err);
    return null;
  }
 }

