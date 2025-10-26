import React from 'react'
import { useNotification } from '../context/notificationContext';

function Notification() {
    const { isThereNotification, notificationMessage, notificationType, setNotification } = useNotification();


    
    return (
    <>
        { isThereNotification && (
          <div className={`z-50 fixed bg-white shadow-md rounded-lg border-2 ${notificationType === 'success' ? 'border-green-300' : 'border-red-300'} p-3 mx-10 mt-5 right-5`}>{ notificationType === 'success' ? '✅ ' : '❌ ' }{notificationMessage}</div>
        )
            }
    </>
  )
}

export default Notification