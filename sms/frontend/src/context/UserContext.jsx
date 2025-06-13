import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const navigate = useNavigate();
  // Always initialize from localStorage
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });
  const [userRole, setUserRole] = useState(() => {
    const r = localStorage.getItem('userRole');
    return r || null;
  });

  // Keep user and userRole in sync with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      if (user.role) {
        localStorage.setItem('userRole', user.role);
        if (userRole !== user.role) setUserRole(user.role);
      }
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
    }
  }, [user]);

  useEffect(() => {
    if (userRole) {
      localStorage.setItem('userRole', userRole);
    } else {
      localStorage.removeItem('userRole');
    }
  }, [userRole]);

  // Utility: when logging out, call setUser(null) and setUserRole(null)
  const userId = user?.id || null;

  // Logout and redirect
  const logout = () => {
    setUser(null);
    setUserRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/login', { replace: true });
  };

  return (
    <UserContext.Provider value={{ user, setUser, userRole, setUserRole, userId, logout }}>
      {children}
    </UserContext.Provider>
  );
};