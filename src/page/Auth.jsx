import { useState } from 'react'
import { useAuth } from '../context/authContext'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import ilustration from '../assets/Ilustration.svg'
import logo from '../assets/new-logo.svg'
import { FaGoogle } from "react-icons/fa";

function Auth() {
  const params = useParams();
  const { session } = useAuth();
    const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [page, setPage] = useState(params.page || "login");
  const { handleSignIn, handleSignUp, loading } = useAuth();

  const navigate = useNavigate()
  
    
    const handleSignUpPress = () => {
      handleSignUp(email, password);
      navigate("/auth/email-confirmation/" + encodeURIComponent(email));

      };
    
      const handleSignInPress = () => {
        handleSignIn(email, password);
  };
  
  if (session !== null) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className='md:py-20 md:px-48 flex flex-col justify-center items-center'>
      
      <div className='md:flex hidden justify-center items-center gap-4 bg-white w-fit px-6 py-2 rounded-full absolute z-40 shadow-2xl top-14'>
          <div className='uppercase text-sm'>
              <h1>
                Created By
              </h1>
          </div>
          <div className='w-full max-w-[8rem]'>
            <img src={logo} alt="Logo Teh Developer" />
          </div>
        </div>

      <div className="md:grid grid-cols-2 md:shadow-lg rounded-lg">
          <div className='hidden md:block relative overflow-hidden rounded-l-lg'>
            <img src={ilustration} 
                  alt=""
                  className='absolute inset-0 w-full h-full object-cover' />

            <div className='relative w-full h-full flex flex-col justify-between p-8'>
                <div>
                  <img src="youtube.com" alt="Logo" />
                </div>
                <div className='text-white text-4xl font-semibold'>
                    <h1>Selamat Datang Kembali!</h1>
                </div>
                 <div className="md:flex hidden flex-row justify-center text-md">
          {page === "login" ? (
            <div className='flex justify-center gap-2'>
              <p className="text-white">Belum punya akun? </p>
              <button onClick={() => setPage("signup")}>
                <p className="font-medium underline text-white">Daftar</p>
              </button>
            </div>
          ) : (
            <div className='flex justify-center gap-2'>
              <p className="text-white">Sudah punya akun? </p>
              <button onClick={() => setPage("login")}>
                <p className="font-medium underline text-white">Masuk</p>
              </button>
            </div>
          )}
                </div>
            </div>
          </div>
          <div className="flex-1 bg-white px-6 pt-12 md:py-12 block rounded-r-lg">
        {/* Title */}
        <h1 className="text-4xl md:text-2xl font-bold mb-8">
          {page === "login" ? "Silahkan masuk ke akun" : "Buat akun baru"}
          {"\n"}anda
        </h1>

        {/* Username Input */}
        {page === "signup" && (
        <div className='flex text-lg flex-col mb-2'>
            <label htmlFor="username">
            Nama Pengguna
          </label>
          <input
            className="border px-4 py-2 rounded-lg text-md border-black"
            placeholder="Nama"
            id='username'
            type="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        )}

        {/* Email Input */}
        <div className='flex text-lg flex-col mb-2'>
            <label htmlFor="email">
            Email
          </label>
          <input
            className="border px-4 py-2 rounded-lg text-md border-black"
            placeholder="Email"
            id='email'
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        {/* Password Input */}
        <div className='flex text-lg flex-col mb-2'>
            <label htmlFor="password">
            Password
          </label>
          <input
            className={page === 'signup' ? "border px-4 py-2 rounded-lg text-md border-black mb-8" : "border px-4 py-2 rounded-lg text-md border-black"}
            placeholder="Kata Sandi"
            id='password'
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        {page === 'login' && (
         <div className='space-y-2 md:mb-4 md:pt-0 pt-4 mb-6'>
          <div className='text-gray-600 underline'>
              <a href="">Lupa kata sandi anda?</a>
          </div>
          <div className='text-gray-500'>
            <p>
              Situs ini dilindungi oleh reCAPTCHA. Berlaku Kebijakan Privasi dan Ketentuan Layanan Google.
            </p>
          </div>
        </div>
        )}

        {/* Sign Up Button */}
        <button onClick={page === "login" ? handleSignInPress : handleSignUpPress} className="w-full bg-black py-4 rounded-md items-center">
          <p className="text-white text-base font-semibold">{loading ? "Sedang..." : page === "login" ? "Masuk" : "Daftar"}</p>
        </button>

        <div className='mt-2 mb-28'>
          <p className="text-center text-gray-500 mb-2">Atau lanjutkan dengan:</p>
          <GoogleSignIn />
        </div>

        {/* Footer */}
        <div className="flex md:hidden flex-row justify-center mt-10 mb-16 text-lg">
          {page === "login" ? (
            <div className='flex justify-center gap-2'>
              <p className="text-gray-500">Belum punya akun? </p>
              <button onClick={() => setPage("signup")}>
                <p className="font-bold text-black">Daftar</p>
              </button>
            </div>
          ) : (
            <div className='flex justify-center gap-2'>
              <p className="text-gray-500">Sudah punya akun? </p>
              <button onClick={() => setPage("login")}>
                <p className="font-bold text-black">Masuk</p>
              </button>
            </div>
          )}
        </div>

        <div className='flex md:hidden justify-center items-center gap-4'>
          <div className='uppercase text-sm'>
              <h1>
                Created By
              </h1>
          </div>
          <div className='w-full max-w-[8rem]'>
            <img src={logo} alt="Logo Teh Developer" />
          </div>
        </div>
          </div>
      </div>
   </div>
  )
}

function GoogleSignIn() {
  const { handleGoogleSignIn } = useAuth();

    return(
    <div onClick={handleGoogleSignIn} className='flex justify-center items-center gap-2 w-full bg-black py-4 rounded-md'>
      <FaGoogle color='white' />
      <p className='text-white'>
        Google
      </p>
    </div>
    )
}


export default Auth
