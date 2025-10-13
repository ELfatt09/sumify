import { useState } from 'react'
import { useAuth } from '../context/authContext'
import { useParams } from 'react-router-dom'
import { Navigate } from 'react-router-dom';

function Auth() {
  const params = useParams();
  const { session } = useAuth();
    const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [page, setPage] = useState(params.page || "login");
    const { handleSignIn, handleSignUp, handleSignOut, loading } = useAuth();
    
    const handleSignUpPress = () => {
        handleSignUp(email, password);
      };
    
      const handleSignInPress = () => {
        handleSignIn(email, password);
  };
  
  if (session !== null) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex-1 bg-white px-6 pt-20">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-16">
        {page === "login" ? "Masuk ke akun Anda" : "Buat akun baru"}
        {"\n"}anda
      </h1>

      {/* Username Input */}
      {page === "signup" && (
        <input
          className="border-b text-xl border-gray-300 mb-10 py-2"
          placeholder="Nama pengguna"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
      )}

      {/* Email Input */}
      <input
        className="border-b text-xl border-gray-300 mb-10 py-2"
        placeholder="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      {/* Password Input */}
      <input
        className="border-b text-xl border-gray-300 mb-16 py-2"
        placeholder="Kata sandi"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      {/* Sign Up Button */}
      <button onClick={page === "login" ? handleSignInPress : handleSignUpPress} className="mb-5 bg-black py-4 rounded-xl items-center">
        <p className="text-white text-base font-semibold">{loading ? "Sedang..." : page === "login" ? "Masuk" : "Daftar"}</p>
      </button>

      {/* Footer */}
      <div className="flex-row justify-center mt-10 text-lg">
        {page === "login" ? (
          <>
            <p className="text-gray-700">Belum punya akun? </p>
            <button onClick={() => setPage("signup")}>
              <p className="font-bold text-black">Daftar</p>
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-500">Sudah punya akun? </p>
            <button onClick={() => setPage("login")}>
              <p className="font-bold text-black">Masuk</p>
            </button>
          </>
        )}
      </div>
      <div className="mt-16">
        <p className="text-center text-gray-500 mb-2">Atau lanjutkan dengan:</p>
        <GoogleSignIn />
          </div>
          <button onClick={handleSignOut} className="mt-10 bg-red-600 py-2 px-4 rounded-xl items-center"></button>
    </div>
  )
}

function GoogleSignIn() {
  const { handleGoogleSignIn } = useAuth();

    return(
    <div onClick={handleGoogleSignIn}>
      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22Logo%29.svg/1200px-Google_%22Logo.svg.png" alt="Google Logo" style={{ width: 48, height: 48, alignSelf: 'center', marginTop: 20 }} />
        </div>
    )
}


export default Auth