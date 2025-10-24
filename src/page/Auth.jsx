import { useEffect, useState } from 'react'
import { useAuth } from '../context/authContext'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import logo from '../assets/teh-logo.png'
import googleIcon from '../assets/google.svg'
import Notification from '../partials/Notification'


function Auth() {
  const params = useParams();
  const { session } = useAuth();
    const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const page = params.page;
  const { handleSignIn, handleSignUp, loading } = useAuth();

  const navigate = useNavigate()
  
    
    const handleSignUpPress = () => {
      handleSignUp(email, password);

      navigate("/auth/email-confirmation/" + encodeURIComponent(email));

      };
    
      const handleSignInPress = () => {
        handleSignIn(email, password);
  };

  useEffect(() => {
    if (page !== "login" && page !== "register") {
      return <Navigate to="*" replace />;
    }
   })
  
  if (session !== null) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Notification />
    <div className='pb-10 md:pt-10 flex flex-col  justify-center items-center bg-white md:bg-[#F1F1F1] min-w-full min-h-screen font-sans'>

      <div className='flex flex-col space-y-9 bg-white w-full max-w-sm px-8 py-12 rounded-3xl md:shadow-2xl'>

        {/* Title */}
        <div className='flex flex-col space-y-6'>
          <h1 className='text-4xl font-semibold leading-[1.2] tracking-[-3%] text-black '>
            {page === "login" ? "Selamat Datang Kembali 👋" : "Ayo Mulai Dengan Sumify 😎"}
          </h1>
          <p className='text-sm text-neutral-500'>{page === "login" ? "Masuk dan lanjutkan ngeringkas bareng Sumify ✨" : "Buat akun dan mulai ngeringkas dokumen dengan cepat⚡"}</p> 
        </div>


        <div className='flex flex-col space-y-3'>
          <div className='flex flex-col space-y-6'>
            <div className='flex flex-col space-y-4'>
              <input
                className='px-4 py-3 rounded-lg border border-neutral-300 text-base placeholder:text-neutral-400'
            placeholder="Email"
            id='email'
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />


        {/* Password Input */}


              <input
                className='px-4 py-3 rounded-lg border border-neutral-300 text-base placeholder:text-neutral-400'
            placeholder="Kata Sandi"
            id='password'
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            />



        {/* {page === 'login' && (
         <div>
          <div>
            <a className='text-black text-sm font-medium cursor-pointer hover:underline' href="">Lupa kata sandi anda?</a>
          </div>
          
        </div>
        )} */}
            </div>

          

        {/* Sign Up Button */}
        <button className='transform transition duration-300 ease-in-out text-center cursor-pointer border border-black  text-white hover:text-black bg-black hover:bg-white py-3 text-base font-semibold hover:font-normal rounded-lg' onClick={page === "login" ? handleSignInPress : handleSignUpPress}>
          <p>{loading ? "memproses" : page === "login" ? "Masuk" : "Daftar"}</p>
            </button>
        </div>

          <p className="text-center text-neutral-600">atau</p>
          <GoogleSignIn />

      </div>
        

        {/* Footer */}
        <div className="flex flex-row justify-center">
          {page === "login" ? (
            <div className="flex justify-center gap-2">
              <p>Belum punya akun? </p>
              <button onClick={() => navigate("/auth/register")} className='cursor-pointer hover:underline'>
                <p className='font-semibold'>Daftar</p>
              </button>
            </div>
          ) : (
            <div className="flex justify-center gap-2">
              <p>Sudah punya akun? </p>
              <button onClick={() => navigate("/auth/login")} className='cursor-pointer hover:underline'>
                <p className='font-semibold'>Masuk</p>
              </button>
            </div>
          )}
        </div>

        
      </div>
      <div className="flex justify-center items-center gap-4 mt-10">
          <div className="uppercase">
            <h1>
              Created By
            </h1>
          </div>
          <div>
            <img src={logo} alt="Logo Teh Developer" />
          </div>
        </div>
      </div>
      </>
  )
}

function GoogleSignIn() {
  const { handleGoogleSignIn } = useAuth();

    return(
    <div onClick={handleGoogleSignIn} className='cursor-pointer transform transition duration-300 ease-in-out flex justify-center items-center gap-4 w-full bg-white hover:bg-black py-3 rounded-md border border-black text-black hover:text-white  text-base'>
      <img src={googleIcon} alt="" />
      <p className=''>
        Masuk dengan Google
      </p>
    </div>
    )
}


export default Auth
