import React from 'react'
import { useAuth } from '../context/authContext';
import { Navigate } from 'react-router-dom';

function Authenticated({ children }) {
  const { session, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>; // Or a spinner, or null
  }
  return (
      <>
          {session !== null ? children : <Navigate to="/auth/login" replace />}
        </>
          )
}

export default Authenticated