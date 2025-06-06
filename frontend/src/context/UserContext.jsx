import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Try to load user from localStorage
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    if (userData && token) {
      setUser(JSON.parse(userData));
      setUserRole(role);
    } else {
      // Clear everything if no token
      setUser(null);
      setUserRole(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
    }
  }, []);

  // Save user to localStorage on change
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      if (user.role) {
        localStorage.setItem('userRole', user.role);
        setUserRole(user.role);
      }
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      setUserRole(null);
    }
  }, [user]);

  const userId = user?.id || null;

  return (
    <UserContext.Provider value={{ user, setUser, userRole, setUserRole, userId }}>
      {children}
    </UserContext.Provider>
  );
};