import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCookie } from './components/Cookies';
import api from './api';

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const fetchUserFromCookie = async () => {
        const userCookie = getCookie("User");
        console.log("Cookie inside delayed effect:", userCookie);
        if (userCookie) {
          try {
            const response = await api.get(`/api/users/${userCookie}`);
            setUser(response.data);
            console.log("User fetched from cookie:", response.data);
          } catch (error) {
            console.error("Error fetching user:", error);
          }
        }
      };
      fetchUserFromCookie();
    }, 50); 

    return () => clearTimeout(timeout);
  }, []);


  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

