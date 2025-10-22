import React from 'react'
import { useNotification } from '../context/notificationContext';

function Notification() {
    const { isThereNotification, notificationMessage, notificationType, setNotification } = useNotification();


    
    return (
    <>
        { isThereNotification && (
                <div className={`z-50 fixed ${notificationType === 'success' ? 'bg-green-200' : 'bg-red-200'} shadow-md rounded-lg border ${notificationType === 'success' ? 'border-green-500' : 'border-red-500'} p-5 mx-10 mt-5`}>{notificationMessage}</div>
        )
            }
    </>
  )
}

export default Notification