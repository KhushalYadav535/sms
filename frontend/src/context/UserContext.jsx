import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  // For demo: toggle between 'admin' and 'user'
  const [userRole, setUserRole] = useState("admin");
  // You can add more user info here (name, email, etc.)

  return (
    <UserContext.Provider value={{ userRole, setUserRole }}>
      {children}
    </UserContext.Provider>
  );
}; 