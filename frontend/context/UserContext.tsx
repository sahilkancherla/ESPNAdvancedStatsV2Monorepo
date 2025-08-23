// context/UserContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  username: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = sessionStorage.getItem('user');
    console.log('UserProvider mounted - storedUser:', storedUser);
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserState(parsedUser);
        console.log('User restored from session:', parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        sessionStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const setUser = (userData: User) => {
    console.log('Setting user:', userData);
    setUserState(userData);
    sessionStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUserState(null);
    sessionStorage.removeItem('user');
    localStorage.removeItem('authToken');
    router.push('/'); // Redirect to root page (auth page)
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}