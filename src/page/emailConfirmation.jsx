import React, { useState } from 'react'
import { useAuth } from '../context/authContext';
import { useParams } from 'react-router-dom';

function EmailConfirmation() {
    const params = useParams();
    const { email } = params;
    const { handleResendEmailConfirmation } = useAuth();


  return (
      <div
      >{email}

          <button onClick={() => handleResendEmailConfirmation(email)}>Resend</button>
    </div>
  )
}

export default EmailConfirmation