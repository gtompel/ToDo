"use client";
import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext<any>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    fetch("/api/users/me").then(res => res.json()).then(data => setUser(data.user || null));
  }, []);
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useCurrentUser() {
  return useContext(UserContext);
} 