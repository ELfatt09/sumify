import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Auth from './page/Auth'
import UploadPDF from './page/UploadPDF'
import { AuthProvider } from './context/authContext'
import { supabase } from './lib/supabase'
import { useEffect, useState } from 'react'
import Authenticated from './middlewares/Authenticated'
import EmailConfirmation from './page/emailConfirmation'
import { NotificationProvider } from './context/notificationContext'

function App() {
const [user, setUser] = useState(null);
  useEffect(() => {
  // Listen ke perubahan sesi
  const { data: subscription } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    }
  );

  // Cek apakah ada session di localStorage (Supabase simpan otomatis)
  supabase.auth.getSession().then(({ data }) => {
    setUser(data.session?.user ?? null);
  });

  return () => subscription.subscription.unsubscribe();
}, []);
  return (
    <NotificationProvider>
    <AuthProvider>



    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Authenticated><UploadPDF /></Authenticated>} />
          <Route path="/auth/:page" element={<Auth />} />
          <Route path="/auth/email-confirmation/:email" element={<EmailConfirmation/>} />
      </Routes>
        </BrowserRouter>
      </AuthProvider>
      </NotificationProvider>
  )
}

export default App

