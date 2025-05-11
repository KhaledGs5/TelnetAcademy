import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCookie } from './components/Cookies';
import api from './api';

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserFromCookie = async () => {
      const userCookie = getCookie("User");
      console.log(userCookie);
      if (userCookie) {
        try {
          const response = await api.get(`/api/users/${userCookie}`);
          console.log(response.data);
          setUser(response.data);
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      }
    };

    fetchUserFromCookie();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

