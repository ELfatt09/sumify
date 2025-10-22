import { useContext, createContext, useState } from "react";

const notificationContext = createContext();

export const NotificationProvider = ({children}) => {
    const [isThereNotification, setIsThereNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('');

    const setNotification = async (type, message) => {
        setNotificationMessage(message);
        setNotificationType(type);
        setIsThereNotification(true);
        setTimeout(() => {
            setIsThereNotification(false);
            setNotificationMessage('');
            setNotificationType('');
        }, 3000);
    }

    return (
        <notificationContext.Provider value={{setNotification, isThereNotification, notificationMessage, notificationType}}>
            {children}
        </notificationContext.Provider>
    )
}

export const useNotification = () => useContext(notificationContext);