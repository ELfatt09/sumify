import { supabase } from '../lib/supabase';

export const signUp = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password});
    return error;
  };

export const signIn = async (email, password) => {
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
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
