import React, { useState } from 'react'
import { useAuth } from '../context/authContext';
import { Navigate, useParams } from 'react-router-dom';

function EmailConfirmation() {
    const params = useParams();
  const { email } = params;
  const [isResendSuccess, setIsResendSuccess] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const { handleResendEmailConfirmation, session } = useAuth();
  
  const handleResendEmailConfirmationPress = async () => {
    const error = await handleResendEmailConfirmation(email);
    console.log(error);
    if (error !== null) {
      setIsResendSuccess(false);
      setResendMessage('Email gagal dikirim ulang. Silahkan coba lagi.');
    } else {
          setIsResendSuccess(true);
    setResendMessage('Email berhasil dikirim ulang.');
    }

  };
    
    if (session !== null) {
      return <Navigate to="/" replace />;
    }


  return (
    <div className='py-10 flex flex-col  justify-center items-center bg-[#F1F1F1] min-w-full min-h-screen font-sans'>
      <div className='flex flex-col space-y-9 bg-white w-full max-w-sm px-8 py-12 rounded-3xl shadow-2xl'>
        <div className='flex flex-col space-y-5'>
                  <h1 className='text-4xl font-semibold leading-[1.2] tracking-[-3%] text-black '>
          Cek inbox kamu dulu 📫
        </h1>
        <p className='text-sm font-semibold text-neutral-600'>
          Kami sudah kirim link verifikasi ke <span className='font-bold text-black'>{email}</span>. Buka email itu untuk aktifkan akun Sumify.
        </p>
        </div>
        <div className='flex flex-col space-y-4 text-sm text-neutral-600'>
          <p><span className='text-neutral-800'>Belum menerima email?</span> Coba cek folder Spam atau isi form di bawah untuk kirim ulang.</p>
          <p className={`text-xs ${isResendSuccess ? 'text-green-500' : 'text-red-500'}`}>{ resendMessage }</p>
                  <button
          className='cursor-pointer transform transition duration-300 ease-in-out flex justify-center items-center gap-4 w-full bg-white hover:bg-black py-3 rounded-md border border-black text-black hover:text-white  text-base'
          onClick={() => handleResendEmailConfirmationPress()}>
          Kirim Ulang
        </button>
        </div>


      </div>
      </div>
  )
}

export default EmailConfirmation