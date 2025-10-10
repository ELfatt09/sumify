import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();



export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  const handleSignUp = async (email, password) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password});
    setLoading(false);
    if (error) alert(error.message);
    else alert("Check your email for verification");
  };

  const handleSignIn = async (email, password) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) alert(error.message);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert(error.message);
  };

  const handleGoogleSignIn = async () => {
  try {
    // const redirectUri = AuthSession.makeRedirectUri({
    //   scheme: "todone",
    // });
    // console.log("Redirect URI:", redirectUri);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:5173",
        // skipBrowserRedirect: true,
      },
    });

    if (error) {
      console.error("Supabase signInWithOAuth error:", error);
      alert(error.message);
      return;
    }

//     if (data?.url) {
//       const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
//       console.log("openAuthSession result:", result);

//       if (result.type === "success" && result.url) {
//   const url = result.url;
//   console.log("Result URL:", url);

//   // Pisahkan fragment (setelah '#')
//   const [, fragment] = url.split('#');  // fragment = "access_token=...&refresh_token=...&..."
//   if (fragment) {
//     // Parse fragment ke object
//     const params = fragment.split('&').reduce((acc, part) => {
//       const [key, val] = part.split('=');
//       if (key && val !== undefined) {
//         acc[key] = decodeURIComponent(val);
//       }
//       return acc;
//     });

//     console.log("Parsed fragment params:", params);
//     const access_token = params['access_token'];
//     const refresh_token = params['refresh_token'];

//     if (access_token && refresh_token) {
//       const { data: sessionData, error: sessionError } =
//         await supabase.auth.setSession({ access_token, refresh_token });
//       // lanjut sesuai logika
//     }
//   }
// }

//     }
  } catch (err) {
    console.error("GoogleSignIn error:", err);
    alert(err.message);
  }
};


  useEffect(() => {
    // Complete any ongoing auth session

    // Get initial session (if exists)
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session }}) => {
      console.log("Initial session:", session);
      console.log("Initial user data:", session?.user);
      setUserData(session?.user || null);
      setSession(session);
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

