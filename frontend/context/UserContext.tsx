// context/UserContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
  currentYear: number | null;
  setCurrentYear: (year: number) => void;
  currentWeek: number | null;
  setCurrentWeek: (week: number) => void;
  refreshCurrentData: () => Promise<void>; // Add method to manually refresh
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentYear, setCurrentYearState] = useState<number | null>(null);
  const [currentWeek, setCurrentWeekState] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = sessionStorage.getItem('user');
    
    console.log('UserProvider mounted - storedUser:', storedUser);
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserState(parsedUser);
        console.log('User restored from session:', parsedUser);
        
        // Always fetch current year/week from backend on mount to ensure it's up to date
        fetchCurrentYearWeek();
      } catch (error) {
        console.error('Error parsing stored user:', error);
        sessionStorage.removeItem('user');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentYearWeek = async () => {
    try {
      console.log('Fetching current year/week from backend...');
      const adminResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/getCurrentWeekCurrentYear`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        console.log('Admin data fetched:', adminData);
        
        if (adminData.current_year) {
          console.log('Setting current year from fetch:', adminData.current_year);
          setCurrentYear(adminData.current_year);
        }
        if (adminData.current_week) {
          console.log('Setting current week from fetch:', adminData.current_week);
          setCurrentWeek(adminData.current_week);
        }
      } else {
        console.error('Failed to fetch current year/week');
      }
    } catch (error) {
      console.error('Error fetching current year/week:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setUser = (userData: User) => {
    console.log('Setting user:', userData);
    setUserState(userData);
    sessionStorage.setItem('user', JSON.stringify(userData));
    
    // Fetch current year/week whenever a new user is set (login/signup)
    fetchCurrentYearWeek();
  };

  const setCurrentYear = (year: number) => {
    console.log('Setting current year:', year);
    setCurrentYearState(year);
    sessionStorage.setItem('currentYear', year.toString());
  };
  
  const setCurrentWeek = (week: number) => {
    console.log('Setting current week:', week);
    setCurrentWeekState(week);
    sessionStorage.setItem('currentWeek', week.toString());
  };

  const logout = () => {
    setUserState(null);
    setCurrentYearState(null);
    setCurrentWeekState(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('currentYear');
    sessionStorage.removeItem('currentWeek');
    localStorage.removeItem('authToken');
    router.push('/'); // Redirect to root page (auth page)
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      logout, 
      isLoading, 
      currentYear, 
      currentWeek, 
      setCurrentYear, 
      setCurrentWeek,
      refreshCurrentData: fetchCurrentYearWeek
    }}>
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